using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities
{
    public class ProductVariant: BaseEntity
    {
        public int ProductId { get; set; }

        public string SKU { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal? CompareAtPrice { get; set; }

        public int StockQuantity { get; set; }

        public bool IsActive { get; set; } = true;

        public Product Product { get; set; } = null!;

        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}
