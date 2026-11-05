using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Cart
{
    public class CartDto
    {
        public int Id { get; set; }
        public int TotalItems { get; set; }
        public decimal SubTotal { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}
