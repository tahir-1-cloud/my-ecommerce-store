using Ecommerce.Domain.Common;


namespace Ecommerce.Domain.Entities
{
    public class OrderItem: BaseEntity
    {
        public int OrderId { get; set; }

        public int ProductVariantId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        public decimal TotalPrice { get; set; }

        public Order Order { get; set; } = null!;

        public ProductVariant ProductVariant { get; set; } = null!;
    }
}
