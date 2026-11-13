using Ecommerce.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Checkout
{
    public class CheckoutRequest
    {
        // Cart or BuyNow
        public string Mode { get; set; } = "Cart";

        // Required for BuyNow only
        public int? ProductVariantId { get; set; }

        public int Quantity { get; set; } = 1;


        // Sirf guest user ke liye required
        public RegisterRequest? GuestAccount { get; set; }
        public AddressRequest ShippingAddress { get; set; } = new();

        // Null means same as shipping address
        public AddressRequest? BillingAddress { get; set; }

        public List<GuestCartItemRequest>? GuestCartItems { get; set; }

        public bool SaveAddress { get; set; }
    }
    public class AddressRequest
    {
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
