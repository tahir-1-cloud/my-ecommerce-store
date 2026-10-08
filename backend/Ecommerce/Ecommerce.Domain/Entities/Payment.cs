using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enum;

namespace Ecommerce.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public int OrderId { get; set; }

        public string Provider { get; set; } = string.Empty;

        public PaymentMethod Method { get; set; }

        public string? TransactionId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "USD";

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime? PaidAt { get; set; }

        public Order Order { get; set; } = null!;
    }
}
