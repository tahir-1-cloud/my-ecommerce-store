using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Checkout
{
    public class CheckoutResponse
    {
        public List<CheckoutItemResponse> Items { get; set; } = new();

        public decimal Subtotal { get; set; }

        public decimal ShippingAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }
    }
    public class CheckoutItemResponse
    {
        public int ProductId { get; set; }

        public int ProductVariantId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        public decimal TotalPrice { get; set; }

        public int AvailableStock { get; set; }
    }
}
