using Ecommerce.Application.DTOs.Customer;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enum;
using Ecommerce.Infrastructure.Data;
using Ecommerce.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly EcommerceDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CustomerRepository(EcommerceDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // DASHBOARD
        public async Task<CustomerDashboardDto?> GetDashboardAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
                return null;

            var orders = _context.Orders
                .AsNoTracking()
                .Where(x => x.UserId == userId);

            var result = new CustomerDashboardDto
            {
                CustomerName = $"{user.FirstName} {user.LastName}".Trim(),

                TotalOrders = await orders.CountAsync(cancellationToken),

                PendingOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Pending,
                    cancellationToken),

                ProcessingOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Processing,
                    cancellationToken),

                DeliveredOrders = await orders.CountAsync(
                    x => x.Status == OrderStatus.Delivered,
                    cancellationToken),

                TotalSpent = await orders
                    .Where(x => x.PaymentStatus == PaymentStatus.Paid)
                    .SumAsync(x => (decimal?)x.TotalAmount, cancellationToken) ?? 0,

                RecentOrders = await orders
                    .OrderByDescending(x => x.CreatedAt)
                    .Take(5)
                    .Select(x => new CustomerDashboardDto.RecentOrderDto
                    {
                        Id = x.Id,
                        OrderNumber = x.OrderNumber,
                        Status = x.Status.ToString(),
                        PaymentStatus = x.PaymentStatus.ToString(),
                        PaymentMethod = x.PaymentMethod.ToString(),
                        TotalAmount = x.TotalAmount,
                        CreatedAt = x.CreatedAt,
                        ItemsCount = x.Items.Sum(i => i.Quantity)
                    })
                    .ToListAsync(cancellationToken)
            };

            return result;
        }

        // GET ALL ADDRESSES
        public async Task<List<CustomerAddressDto>> GetAddressesAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.IsDefault)
                .ThenByDescending(x => x.Id)
                .Select(x => new CustomerAddressDto
                {
                    Id = x.Id,
                    Type = x.Type.ToString(),
                    FullName = x.FullName,
                    PhoneNumber = x.PhoneNumber,
                    AddressLine1 = x.AddressLine1,
                    AddressLine2 = x.AddressLine2,
                    City = x.City,
                    State = x.State,
                    PostalCode = x.PostalCode,
                    Country = x.Country,
                    IsDefault = x.IsDefault
                })
                .ToListAsync(cancellationToken);
        }

        // GET ADDRESS BY ID
        public async Task<CustomerAddressDto?> GetAddressByIdAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .AsNoTracking()
                .Where(x => x.Id == addressId && x.UserId == userId)
                .Select(x => new CustomerAddressDto
                {
                    Id = x.Id,
                    Type = x.Type.ToString(),
                    FullName = x.FullName,
                    PhoneNumber = x.PhoneNumber,
                    AddressLine1 = x.AddressLine1,
                    AddressLine2 = x.AddressLine2,
                    City = x.City,
                    State = x.State,
                    PostalCode = x.PostalCode,
                    Country = x.Country,
                    IsDefault = x.IsDefault
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        // CREATE ADDRESS
        public async Task<CustomerAddressDto> CreateAddressAsync(
            Guid userId,
            CustomerAddressRequest request,
            CancellationToken cancellationToken = default)
        {
            if (!Enum.TryParse<AddressType>(
                request.Type, true, out var addressType)
                || !Enum.IsDefined(typeof(AddressType), addressType))
            {
                throw new ArgumentException("Invalid address type.");
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync(cancellationToken);

            if (request.IsDefault)
            {
                await _context.CustomerAddresses
                    .Where(x => x.UserId == userId && x.Type == addressType)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(x => x.IsDefault, false),
                        cancellationToken);
            }

            var address = new CustomerAddress
            {
                UserId = userId,
                Type = addressType,
                FullName = request.FullName.Trim(),
                PhoneNumber = request.PhoneNumber.Trim(),
                AddressLine1 = request.AddressLine1.Trim(),
                AddressLine2 = request.AddressLine2?.Trim(),
                City = request.City.Trim(),
                State = request.State?.Trim(),
                PostalCode = request.PostalCode?.Trim(),
                Country = request.Country.Trim(),
                IsDefault = request.IsDefault
            };

            _context.CustomerAddresses.Add(address);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return MapAddress(address);
        }

        // UPDATE ADDRESS
        public async Task<CustomerAddressDto?> UpdateAddressAsync(
            Guid userId,
            int addressId,
            CustomerAddressRequest request,
            CancellationToken cancellationToken = default)
        {
            if (!Enum.TryParse<AddressType>(
                request.Type, true, out var addressType)
                || !Enum.IsDefined(typeof(AddressType), addressType))
            {
                throw new ArgumentException("Invalid address type.");
            }

            var address = await _context.CustomerAddresses
                .FirstOrDefaultAsync(
                    x => x.Id == addressId && x.UserId == userId,
                    cancellationToken);

            if (address == null)
                return null;

            await using var transaction =
                await _context.Database.BeginTransactionAsync(cancellationToken);

            if (request.IsDefault)
            {
                await _context.CustomerAddresses
                    .Where(x =>
                        x.UserId == userId &&
                        x.Type == addressType &&
                        x.Id != addressId)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(x => x.IsDefault, false),
                        cancellationToken);
            }

            address.Type = addressType;
            address.FullName = request.FullName.Trim();
            address.PhoneNumber = request.PhoneNumber.Trim();
            address.AddressLine1 = request.AddressLine1.Trim();
            address.AddressLine2 = request.AddressLine2?.Trim();
            address.City = request.City.Trim();
            address.State = request.State?.Trim();
            address.PostalCode = request.PostalCode?.Trim();
            address.Country = request.Country.Trim();
            address.IsDefault = request.IsDefault;

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return MapAddress(address);
        }

        // DELETE ADDRESS
        public async Task<bool> DeleteAddressAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default)
        {
            var address = await _context.CustomerAddresses
                .FirstOrDefaultAsync(
                    x => x.Id == addressId && x.UserId == userId,
                    cancellationToken);

            if (address == null)
                return false;

            _context.CustomerAddresses.Remove(address);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        // SET DEFAULT ADDRESS
        public async Task<bool> SetDefaultAddressAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default)
        {
            var address = await _context.CustomerAddresses
                .FirstOrDefaultAsync(
                    x => x.Id == addressId && x.UserId == userId,
                    cancellationToken);

            if (address == null)
                return false;

            await using var transaction =
                await _context.Database.BeginTransactionAsync(cancellationToken);

            await _context.CustomerAddresses
                .Where(x =>
                    x.UserId == userId &&
                    x.Type == address.Type)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(x => x.IsDefault, false),
                    cancellationToken);

            address.IsDefault = true;

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return true;
        }

        // GET PAGINATED ORDERS
        public async Task<CustomerOrdersResponseDto> GetOrdersAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Orders
                .AsNoTracking()
                .Where(x => x.UserId == userId);

            var totalCount = await query.CountAsync(cancellationToken);

            var orders = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new CustomerOrderDto
                {
                    Id = x.Id,
                    OrderNumber = x.OrderNumber,
                    Status = x.Status.ToString(),
                    PaymentStatus = x.PaymentStatus.ToString(),
                    PaymentMethod = x.PaymentMethod.ToString(),
                    Subtotal = x.Subtotal,
                    ShippingAmount = x.ShippingAmount,
                    DiscountAmount = x.DiscountAmount,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    CreatedAt = x.CreatedAt,
                    ItemsCount = x.Items.Sum(i => i.Quantity)
                })
                .ToListAsync(cancellationToken);

            return new CustomerOrdersResponseDto
            {
                Orders = orders,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        // ORDER DETAILS
        public async Task<CustomerOrderDetailsDto?> GetOrderDetailsAsync(
            Guid userId,
            int orderId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Where(x => x.Id == orderId && x.UserId == userId)
                .Select(x => new CustomerOrderDetailsDto
                {
                    Id = x.Id,
                    OrderNumber = x.OrderNumber,
                    Status = x.Status.ToString(),
                    PaymentStatus = x.PaymentStatus.ToString(),
                    PaymentMethod = x.PaymentMethod.ToString(),
                    Subtotal = x.Subtotal,
                    ShippingAmount = x.ShippingAmount,
                    DiscountAmount = x.DiscountAmount,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    CreatedAt = x.CreatedAt,

                    Items = x.Items.Select(i => new CustomerOrderItemDto
                    {
                        Id = i.Id,
                        ProductVariantId = i.ProductVariantId,
                        ProductName = i.ProductName,
                        SKU = i.SKU,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList(),

                    Addresses = x.Addresses.Select(a =>
                        new CustomerOrderAddressDto
                        {
                            Type = a.Type.ToString(),
                            FullName = a.FullName,
                            PhoneNumber = a.PhoneNumber,
                            AddressLine1 = a.AddressLine1,
                            AddressLine2 = a.AddressLine2,
                            City = a.City,
                            State = a.State,
                            PostalCode = a.PostalCode,
                            Country = a.Country
                        }).ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        // ORDER TRACKING
        public async Task<CustomerOrderTrackingDto?> GetOrderTrackingAsync(
            Guid userId,
            int orderId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Where(x => x.Id == orderId && x.UserId == userId)
                .Select(x => new CustomerOrderTrackingDto
                {
                    OrderId = x.Id,
                    OrderNumber = x.OrderNumber,
                    CurrentStatus = x.Status.ToString(),

                    History = x.StatusHistory
                        .OrderBy(h => h.CreatedAt)
                        .Select(h => new OrderTrackingHistoryDto
                        {
                            Status = h.Status.ToString(),
                            Note = h.Note,
                            CreatedAt = h.CreatedAt
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        // GET CUSTOMER PROFILE
        public async Task<CustomerProfileDto?> GetProfileAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(x => x.Id == userId)
                .Select(x => new CustomerProfileDto
                {
                    Id = x.Id,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Email = x.Email ?? string.Empty,
                    PhoneNumber = x.PhoneNumber
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        // UPDATE CUSTOMER PROFILE
        public async Task<CustomerProfileDto?> UpdateProfileAsync(
            Guid userId,
            UpdateCustomerProfileDto request,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
                return null;

            var email = request.Email.Trim();

            // Check if another user already uses this email.
            var emailExists = await _context.Users
                .AnyAsync(
                    x => x.Id != userId && x.NormalizedEmail == email.ToUpper(),
                    cancellationToken);

            if (emailExists)
                throw new InvalidOperationException(
                    "This email address is already registered.");

            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
                ? null
                : request.PhoneNumber.Trim();

            // Use Identity's email update method so NormalizedEmail
            // and EmailConfirmed are handled consistently.
            var emailResult = await _userManager.SetEmailAsync(user, email);

            if (!emailResult.Succeeded)
            {
                throw new InvalidOperationException(
                    string.Join(", ", emailResult.Errors.Select(x => x.Description)));
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new CustomerProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber
            };
        }

        private static CustomerAddressDto MapAddress(CustomerAddress address)
        {
            return new CustomerAddressDto
            {
                Id = address.Id,
                Type = address.Type.ToString(),
                FullName = address.FullName,
                PhoneNumber = address.PhoneNumber,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
                IsDefault = address.IsDefault
            };
        }
    }
}