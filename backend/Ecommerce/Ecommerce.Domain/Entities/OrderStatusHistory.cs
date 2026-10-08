using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enum;

namespace Ecommerce.Domain.Entities
{
    public class OrderStatusHistory : BaseEntity
    {
        public int OrderId { get; set; }

        public OrderStatus Status { get; set; }

        public string? Note { get; set; }

        public Order Order { get; set; } = null!;
    }
}
