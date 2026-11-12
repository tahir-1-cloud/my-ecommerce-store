namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerOrderTrackingDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CurrentStatus { get; set; } = string.Empty;

        public List<OrderTrackingHistoryDto> History { get; set; } = new();
    }

    public class OrderTrackingHistoryDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}