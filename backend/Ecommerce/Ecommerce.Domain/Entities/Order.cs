using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enum;


namespace Ecommerce.Domain.Entities
{
    public class Order:BaseEntity
    {
        public string OrderNumber { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public PaymentMethod PaymentMethod { get; set; }

        public decimal Subtotal { get; set; }

        public decimal ShippingAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public ICollection<OrderItem> Items { get; set; }
            = new List<OrderItem>();

        public ICollection<OrderAddress> Addresses { get; set; }
            = new List<OrderAddress>();

        public ICollection<Payment> Payments { get; set; }
            = new List<Payment>();

        public ICollection<OrderStatusHistory> StatusHistory { get; set; }
            = new List<OrderStatusHistory>();
    }
}
