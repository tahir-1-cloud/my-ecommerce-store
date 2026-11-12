
namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerDashboardDto
    {
        public string CustomerName { get; set; } = string.Empty;

        public int TotalOrders { get; set; }

        public int PendingOrders { get; set; }

        public int ProcessingOrders { get; set; }

        public int DeliveredOrders { get; set; }

        public decimal TotalSpent { get; set; }

        public List<RecentOrderDto> RecentOrders { get; set; } = new();

        public class RecentOrderDto
        {
            public int Id { get; set; }

            public string OrderNumber { get; set; } = string.Empty;

            public string Status { get; set; } = string.Empty;

            public string PaymentStatus { get; set; } = string.Empty;

            public string PaymentMethod { get; set; } = string.Empty;

            public decimal TotalAmount { get; set; }

            public DateTime CreatedAt { get; set; }

            public int ItemsCount { get; set; }
        }
    }
}
