
using Ecommerce.Application.DTOs.Customer;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Enum;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly EcommerceDbContext _context;

        public CustomerRepository(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<CustomerDashboardDto?> GetDashboardAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            // Get customer information
            var customer = await _context.Users
                .AsNoTracking()
                .Where(x => x.Id == userId)
                .Select(x => new
                {
                    x.FirstName,
                    x.LastName
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (customer == null)
                return null;

            // Get only authenticated customer's orders
            var orders = _context.Orders
                .AsNoTracking()
                .Where(x => x.UserId == userId);

            // Dashboard statistics
            var totalOrders = await orders.CountAsync(
                cancellationToken);

            var pendingOrders = await orders.CountAsync(
                x => x.Status == OrderStatus.Pending,
                cancellationToken);

            var processingOrders = await orders.CountAsync(
                x => x.Status == OrderStatus.Processing,
                cancellationToken);

            var deliveredOrders = await orders.CountAsync(
                x => x.Status == OrderStatus.Delivered,
                cancellationToken);

            // Total spent from paid orders only
            var totalSpent = await orders
                .Where(x => x.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(
                    x => (decimal?)x.TotalAmount,
                    cancellationToken) ?? 0m;

            // Get latest 5 orders
            var recentOrders = await orders
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
                    ItemsCount = x.Items.Count
                })
                .ToListAsync(cancellationToken);

            return new CustomerDashboardDto
            {
                CustomerName = (
                    customer.FirstName + " " + customer.LastName
                ).Trim(),

                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                ProcessingOrders = processingOrders,
                DeliveredOrders = deliveredOrders,
                TotalSpent = totalSpent,
                RecentOrders = recentOrders
            };
        }
    }
}
