using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerAddressDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;

        public bool IsDefault { get; set; }
    }
}
