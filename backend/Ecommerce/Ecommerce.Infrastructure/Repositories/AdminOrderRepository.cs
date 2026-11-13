
using Ecommerce.Application.DTOs.Orders;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enum;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories
{
    public class AdminOrderRepository : IAdminOrderRepository
    {
        private readonly EcommerceDbContext _context;

        public AdminOrderRepository(EcommerceDbContext context)
        {
            _context = context;
        }

        // Get all orders
        public async Task<(List<AdminOrderDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            OrderStatus? status,
            string? search,
            CancellationToken cancellationToken = default)
        {
            var query =
                from order in _context.Orders.AsNoTracking()
                join user in _context.Users.AsNoTracking()
                    on order.UserId equals user.Id
                select new { order, user };

            if (status.HasValue)
            {
                query = query.Where(x => x.order.Status == status.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(x =>
                    x.order.OrderNumber.Contains(search) ||
                    x.user.FirstName.Contains(search) ||
                    x.user.LastName.Contains(search) ||
                    (x.user.Email != null &&
                     x.user.Email.Contains(search)));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.order.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AdminOrderDto
                {
                    Id = x.order.Id,
                    OrderNumber = x.order.OrderNumber,

                    CustomerName =
                        x.user.FirstName + " " + x.user.LastName,

                    CustomerEmail = x.user.Email ?? string.Empty,
                    CustomerPhone = x.user.PhoneNumber ?? string.Empty,

                    Status = x.order.Status.ToString(),
                    PaymentStatus = x.order.PaymentStatus.ToString(),
                    PaymentMethod = x.order.PaymentMethod.ToString(),

                    Subtotal = x.order.Subtotal,
                    ShippingAmount = x.order.ShippingAmount,
                    DiscountAmount = x.order.DiscountAmount,
                    TaxAmount = x.order.TaxAmount,
                    TotalAmount = x.order.TotalAmount,

                    CreatedAt = x.order.CreatedAt,

                    ItemsCount = x.order.Items.Count
                })
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        // Get order details
        public async Task<AdminOrderDto?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(x => x.Items)
                .Include(x => x.Addresses)
                .Include(x => x.Payments)
                .Include(x => x.StatusHistory)
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (order == null)
                return null;

            var user = await _context.Users
                .AsNoTracking()
                .Where(x => x.Id == order.UserId)
                .Select(x => new
                {
                    x.FirstName,
                    x.LastName,
                    x.Email,
                    x.PhoneNumber
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return null;

            return new AdminOrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,

                CustomerName = user.FirstName + " " + user.LastName,
                CustomerEmail = user.Email ?? string.Empty,
                CustomerPhone = user.PhoneNumber ?? string.Empty,

                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                PaymentMethod = order.PaymentMethod.ToString(),

                Subtotal = order.Subtotal,
                ShippingAmount = order.ShippingAmount,
                DiscountAmount = order.DiscountAmount,
                TaxAmount = order.TaxAmount,
                TotalAmount = order.TotalAmount,

                CreatedAt = order.CreatedAt,

                ItemsCount = order.Items.Count,

                Items = order.Items.Select(x =>
                    new AdminOrderDto.OrderProductDto
                    {
                        ProductVariantId = x.ProductVariantId,
                        ProductName = x.ProductName,
                        SKU = x.SKU,
                        UnitPrice = x.UnitPrice,
                        Quantity = x.Quantity,
                        TotalPrice = x.TotalPrice
                    }).ToList(),

                Addresses = order.Addresses.Select(x =>
                    new AdminOrderDto.OrderAddressDto
                    {
                        Type = x.Type.ToString(),
                        FullName = x.FullName,
                        PhoneNumber = x.PhoneNumber,
                        AddressLine1 = x.AddressLine1,
                        AddressLine2 = x.AddressLine2,
                        City = x.City,
                        State = x.State,
                        PostalCode = x.PostalCode,
                        Country = x.Country
                    }).ToList(),

                Payments = order.Payments.Select(x =>
                    new AdminOrderDto.OrderPaymentDto
                    {
                        Provider = x.Provider,
                        Method = x.Method.ToString(),
                        TransactionId = x.TransactionId,
                        Amount = x.Amount,
                        Currency = x.Currency,
                        Status = x.Status.ToString(),
                        PaidAt = x.PaidAt
                    }).ToList(),

                StatusHistory = order.StatusHistory
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new AdminOrderDto.OrderHistoryDto
                    {
                        Status = x.Status.ToString(),
                        Note = x.Note,
                        CreatedAt = x.CreatedAt
                    }).ToList()
            };
        }

        // Update order status

        public async Task<bool> UpdateStatusAsync(
            int id,
            UpdateAdminOrderStatusDto request,
            CancellationToken cancellationToken = default)
        {
            if (!Enum.IsDefined(typeof(OrderStatus), request.Status))
                return false;

            var order = await _context.Orders
                .Include(x => x.Payments)
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (order == null)
                return false;

            if (order.Status == request.Status)
                return true;

            var now = DateTime.UtcNow;

            order.Status = request.Status;

            // COD payment is marked Paid only when the order is delivered.
            if (order.PaymentMethod == PaymentMethod.CashOnDelivery &&
                request.Status == OrderStatus.Delivered)
            {
                order.PaymentStatus = PaymentStatus.Paid;

                var codPayment = order.Payments
                    .FirstOrDefault(x =>
                        x.Method == PaymentMethod.CashOnDelivery);

                if (codPayment != null)
                {
                    codPayment.Status = PaymentStatus.Paid;
                    codPayment.PaidAt = now;
                }
            }

            _context.OrderStatusHistory.Add(new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = request.Status,
                Note = request.Note,
                CreatedAt = now
            });

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }


        // Dashboard summary
        public async Task<AdminOrderSummaryDto> GetSummaryAsync(
            CancellationToken cancellationToken = default)
        {
            var orders = _context.Orders.AsNoTracking();

            return new AdminOrderSummaryDto
            {
                TotalOrders = await orders.CountAsync(cancellationToken),

                PendingOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Pending,
                    cancellationToken),

                ProcessingOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Processing,
                    cancellationToken),

                ShippedOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Shipped,
                    cancellationToken),

                DeliveredOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Delivered,
                    cancellationToken),

                CancelledOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Cancelled,
                    cancellationToken),

                TotalRevenue = await orders
                    .Where(x => x.PaymentStatus == PaymentStatus.Paid)
                    .SumAsync(
                        x => (decimal?)x.TotalAmount,
                        cancellationToken) ?? 0
            };
        }
    }
}
