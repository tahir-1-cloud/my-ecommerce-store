namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerOrderDetailsDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;

        public decimal Subtotal { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<CustomerOrderItemDto> Items { get; set; } = new();
        public List<CustomerOrderAddressDto> Addresses { get; set; } = new();
    }

    public class CustomerOrderItemDto
    {
        public int Id { get; set; }
        public int ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CustomerOrderAddressDto
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
}