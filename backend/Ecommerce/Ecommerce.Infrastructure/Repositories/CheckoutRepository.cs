
using Ecommerce.Application.DTOs.Checkout;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enum;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;

public class CheckoutRepository : ICheckoutRepository
{
    private readonly EcommerceDbContext _context;

    public CheckoutRepository(EcommerceDbContext context)
    {
        _context = context;
    }

    public async Task<CheckoutResponse> GetCheckoutPreviewAsync(
        Guid? userId,
        string mode,
        int? productVariantId,
        int quantity,
        CancellationToken cancellationToken = default)
    {
        var items = await GetCheckoutItemsAsync(
            userId,
            mode,
            productVariantId,
            quantity,
            false,
            cancellationToken);

        var response = new CheckoutResponse();

        foreach (var item in items)
        {
            var variant = item.Variant;

            if (item.Quantity <= 0)
                throw new InvalidOperationException(
                    "Quantity must be greater than zero.");

            if (!variant.IsActive || !variant.Product.IsActive)
                throw new InvalidOperationException(
                    $"Product {variant.Product.Name} is not available.");

            if (variant.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for {variant.Product.Name}.");

            var unitPrice = variant.Price;
            var totalPrice = unitPrice * item.Quantity;

            response.Items.Add(new CheckoutItemResponse
            {
                ProductId = variant.ProductId,
                ProductVariantId = variant.Id,
                ProductName = variant.Product.Name,
                SKU = variant.SKU,
                ImageUrl = variant.Product.Images
                    .OrderByDescending(x => x.IsPrimary)
                    .ThenBy(x => x.SortOrder)
                    .Select(x => x.ImageUrl)
                    .FirstOrDefault(),
                UnitPrice = unitPrice,
                Quantity = item.Quantity,
                TotalPrice = totalPrice,
                AvailableStock = variant.StockQuantity
            });
        }

        response.Subtotal = response.Items.Sum(x => x.TotalPrice);
        response.ShippingAmount = 0;
        response.DiscountAmount = 0;
        response.TaxAmount = 0;

        response.TotalAmount =
            response.Subtotal +
            response.ShippingAmount +
            response.TaxAmount -
            response.DiscountAmount;

        return response;
    }

    public async Task<Order> CreateCodOrderAsync(
        Guid userId,
        CheckoutRequest request,
        bool isGuest,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);

        try
        {
            var items = await GetCheckoutItemsAsync(
                userId,
                request.Mode,
                request.ProductVariantId,
                request.Quantity,
                true,
                cancellationToken,
                isGuest ? request.GuestCartItems : null);

            if (items.Count == 0)
                throw new InvalidOperationException(
                    "No items available for checkout.");

            var orderItems = new List<OrderItem>();

            foreach (var item in items)
            {
                var variant = item.Variant;

                if (item.Quantity <= 0)
                    throw new InvalidOperationException(
                        "Invalid product quantity.");

                if (!variant.IsActive || !variant.Product.IsActive)
                    throw new InvalidOperationException(
                        $"{variant.Product.Name} is no longer available.");

                if (variant.StockQuantity < item.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for {variant.Product.Name}.");

                var unitPrice = variant.Price;
                var totalPrice = unitPrice * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.Name,
                    SKU = variant.SKU,
                    UnitPrice = unitPrice,
                    Quantity = item.Quantity,
                    TotalPrice = totalPrice
                });

                variant.StockQuantity -= item.Quantity;
            }

            var subtotal = orderItems.Sum(x => x.TotalPrice);

            var shippingAmount = 0m;
            var discountAmount = 0m;
            var taxAmount = 0m;

            var totalAmount =
                subtotal + shippingAmount + taxAmount - discountAmount;

            var shipping = request.ShippingAddress;
            var billing = request.BillingAddress ?? shipping;

            var order = new Order
            {
                UserId = userId,

                OrderNumber = $"ORD-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid():N}"[..18].ToUpper(),

                Status = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                PaymentMethod = PaymentMethod.CashOnDelivery,

                Subtotal = subtotal,
                ShippingAmount = shippingAmount,
                DiscountAmount = discountAmount,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,

                Items = orderItems,

                Addresses = new List<OrderAddress>
                {
                    new OrderAddress
                    {
                        Type = AddressType.Shipping,
                        FullName = shipping.FullName,
                        PhoneNumber = shipping.PhoneNumber,
                        AddressLine1 = shipping.AddressLine1,
                        AddressLine2 = shipping.AddressLine2,
                        City = shipping.City,
                        State = shipping.State,
                        PostalCode = shipping.PostalCode,
                        Country = shipping.Country
                    },
                    new OrderAddress
                    {
                        Type = AddressType.Billing,
                        FullName = billing.FullName,
                        PhoneNumber = billing.PhoneNumber,
                        AddressLine1 = billing.AddressLine1,
                        AddressLine2 = billing.AddressLine2,
                        City = billing.City,
                        State = billing.State,
                        PostalCode = billing.PostalCode,
                        Country = billing.Country
                    }
                },

                Payments = new List<Payment>
                {
                    new Payment
                    {
                        Provider = "CashOnDelivery",
                        Method = PaymentMethod.CashOnDelivery,
                        Amount = totalAmount,
                        Currency = "USD",
                        Status = PaymentStatus.Pending
                    }
                },

                StatusHistory = new List<OrderStatusHistory>
                {
                    new OrderStatusHistory
                    {
                        Status = OrderStatus.Pending,
                        Note = "Order placed."
                    }
                }
            };

            _context.Orders.Add(order);

            if (request.SaveAddress)
            {
                _context.CustomerAddresses.Add(new CustomerAddress
                {
                    UserId = userId,
                    FullName = shipping.FullName,
                    PhoneNumber = shipping.PhoneNumber,
                    AddressLine1 = shipping.AddressLine1,
                    AddressLine2 = shipping.AddressLine2,
                    City = shipping.City,
                    State = shipping.State,
                    PostalCode = shipping.PostalCode,
                    Country = shipping.Country,
                    IsDefault = false
                });
            }

            // Only clear database cart for logged-in Cart checkout.
            if (!isGuest &&
                request.Mode.Equals(
                    "Cart",
                    StringComparison.OrdinalIgnoreCase))
            {
                var cart = await _context.Carts
                    .Include(x => x.Items)
                    .FirstOrDefaultAsync(
                        x => x.UserId == userId,
                        cancellationToken);

                if (cart != null)
                {
                    _context.CartItems.RemoveRange(
                        cart.Items.ToList());
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return order;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<List<(ProductVariant Variant, int Quantity)>>
        GetCheckoutItemsAsync(
            Guid? userId,
            string mode,
            int? productVariantId,
            int quantity,
            bool tracking,
            CancellationToken cancellationToken,
            List<GuestCartItemRequest>? guestCartItems = null)
    {
        // BUY NOW: Guest and logged-in users both use this branch.
        if (mode.Equals("BuyNow", StringComparison.OrdinalIgnoreCase))
        {
            if (!productVariantId.HasValue ||
                productVariantId.Value <= 0)
            {
                throw new InvalidOperationException(
                    "A valid product variant is required.");
            }

            if (quantity <= 0)
                throw new InvalidOperationException(
                    "Quantity must be greater than zero.");

            IQueryable<ProductVariant> query =
                _context.ProductVariants
                    .Include(x => x.Product)
                        .ThenInclude(x => x.Images);

            if (!tracking)
                query = query.AsNoTracking();

            var variant = await query.FirstOrDefaultAsync(
                x => x.Id == productVariantId.Value,
                cancellationToken);

            if (variant == null)
                throw new InvalidOperationException(
                    "Product variant not found.");

            return new List<(ProductVariant, int)>
            {
                (variant, quantity)
            };
        }

        // CART CHECKOUT
        if (mode.Equals("Cart", StringComparison.OrdinalIgnoreCase))
        {
            // GUEST CART: Items come from frontend localStorage.
            if (guestCartItems != null)
            {
                if (guestCartItems.Count == 0)
                    throw new InvalidOperationException(
                        "Your cart is empty.");

                if (guestCartItems.Any(x =>
                    x.ProductVariantId <= 0 || x.Quantity <= 0))
                {
                    throw new InvalidOperationException(
                        "Invalid cart items.");
                }

                var groupedItems = guestCartItems
                    .GroupBy(x => x.ProductVariantId)
                    .Select(x => new
                    {
                        ProductVariantId = x.Key,
                        Quantity = x.Sum(i => i.Quantity)
                    })
                    .ToList();

                var variantIds = groupedItems
                    .Select(x => x.ProductVariantId)
                    .ToList();

                IQueryable<ProductVariant> query =
                    _context.ProductVariants
                        .Include(x => x.Product)
                            .ThenInclude(x => x.Images);

                if (!tracking)
                    query = query.AsNoTracking();

                var variants = await query
                    .Where(x => variantIds.Contains(x.Id))
                    .ToListAsync(cancellationToken);

                if (variants.Count != groupedItems.Count)
                    throw new InvalidOperationException(
                        "One or more products were not found.");

                return groupedItems.Select(item =>
                {
                    var variant = variants.First(
                        x => x.Id == item.ProductVariantId);

                    return (variant, item.Quantity);
                }).ToList();
            }

            // LOGGED-IN CART: Items come from database.
            if (!userId.HasValue)
                throw new InvalidOperationException(
                    "Cart items are required for guest checkout.");

            IQueryable<Cart> cartQuery = _context.Carts
                .Include(x => x.Items)
                    .ThenInclude(x => x.ProductVariant)
                        .ThenInclude(x => x.Product)
                            .ThenInclude(x => x.Images);

            if (!tracking)
                cartQuery = cartQuery.AsNoTracking();

            var cart = await cartQuery.FirstOrDefaultAsync(
                x => x.UserId == userId.Value,
                cancellationToken);

            if (cart == null || cart.Items.Count == 0)
                throw new InvalidOperationException(
                    "Your cart is empty.");

            return cart.Items
                .Select(x => (x.ProductVariant, x.Quantity))
                .ToList();
        }

        throw new InvalidOperationException(
            "Invalid checkout mode. Use Cart or BuyNow.");
    }
}
