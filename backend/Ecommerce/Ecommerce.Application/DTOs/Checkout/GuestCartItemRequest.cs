using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Checkout
{
    public class GuestCartItemRequest
    {
        public int ProductVariantId { get; set; }

        public int Quantity { get; set; }
    }
}
