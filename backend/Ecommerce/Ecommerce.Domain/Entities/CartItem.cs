using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities
{
    public class CartItem: BaseEntity
    {
        public int CartId { get; set; }

        public int ProductVariantId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public Cart Cart { get; set; } = null!;

        public ProductVariant ProductVariant { get; set; } = null!;
    }
}
