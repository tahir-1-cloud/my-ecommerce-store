using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Checkout
{
    public class CheckoutPreviewRequest
    {
        public string Mode { get; set; } = "Cart";
        public int? ProductVariantId { get; set; }
        public int Quantity { get; set; } = 1;
        public List<GuestCartItemRequest> GuestCartItems { get; set; } = new();
    }
}
