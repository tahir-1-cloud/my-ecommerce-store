using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Application.DTOs.Products
{
    public class ProductRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(5000)]
        public string? Description { get; set; }

        [StringLength(150)]
        public string? Brand { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; }

        public List<int> CategoryIds { get; set; } = [];

        public List<ProductVariantRequest> Variants { get; set; } = [];

        public List<IFormFile> Images { get; set; } = [];
    }

    public class ProductVariantRequest
    {
        [Required]
        [StringLength(100)]
        public string SKU { get; set; } = string.Empty;

        [Range(typeof(decimal), "0.01", "999999999")]
        public decimal Price { get; set; }

        [Range(typeof(decimal), "0", "999999999")]
        public decimal? CompareAtPrice { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
