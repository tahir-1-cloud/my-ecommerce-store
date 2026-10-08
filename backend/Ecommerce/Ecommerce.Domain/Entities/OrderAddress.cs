using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enum;

namespace Ecommerce.Domain.Entities
{
    public class OrderAddress: BaseEntity
    {
        public int OrderId { get; set; }

        public AddressType Type { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string AddressLine1 { get; set; } = string.Empty;

        public string? AddressLine2 { get; set; }

        public string City { get; set; } = string.Empty;

        public string? State { get; set; }

        public string? PostalCode { get; set; }

        public string Country { get; set; } = string.Empty;

        public Order Order { get; set; } = null!;
    }
}
