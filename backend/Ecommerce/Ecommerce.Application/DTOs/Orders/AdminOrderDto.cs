
namespace Ecommerce.Application.DTOs.Orders
{
    public class AdminOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;

        public decimal Subtotal { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; }

        public int ItemsCount { get; set; }

        public List<OrderProductDto> Items { get; set; } = new();
        public List<OrderAddressDto> Addresses { get; set; } = new();
        public List<OrderPaymentDto> Payments { get; set; } = new();
        public List<OrderHistoryDto> StatusHistory { get; set; } = new();

        public class OrderProductDto
        {
            public int ProductVariantId { get; set; }
            public string ProductName { get; set; } = string.Empty;
            public string SKU { get; set; } = string.Empty;
            public decimal UnitPrice { get; set; }
            public int Quantity { get; set; }
            public decimal TotalPrice { get; set; }
        }

        public class OrderAddressDto
        {
            public string Type { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string AddressLine1 { get; set; } = string.Empty;
            public string? AddressLine2 { get; set; }
            public string City { get; set; } = string.Empty;
            public string? State { get; set; }
            public string? PostalCode { get; set; }
            public string Country { get; set; } = string.Empty;
        }

        public class OrderPaymentDto
        {
            public string Provider { get; set; } = string.Empty;
            public string Method { get; set; } = string.Empty;
            public string? TransactionId { get; set; }
            public decimal Amount { get; set; }
            public string Currency { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public DateTime? PaidAt { get; set; }
        }

        public class OrderHistoryDto
        {
            public string Status { get; set; } = string.Empty;
            public string? Note { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
