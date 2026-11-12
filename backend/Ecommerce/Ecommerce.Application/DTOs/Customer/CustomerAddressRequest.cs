using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerAddressRequest
    {
        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string AddressLine1 { get; set; } = string.Empty;

        public string? AddressLine2 { get; set; }

        [Required]
        public string City { get; set; } = string.Empty;

        public string? State { get; set; }

        public string? PostalCode { get; set; }

        [Required]
        public string Country { get; set; } = string.Empty;

        public bool IsDefault { get; set; }
    }
}
