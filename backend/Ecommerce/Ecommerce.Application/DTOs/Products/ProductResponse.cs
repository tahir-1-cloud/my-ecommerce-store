using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Products
{
    public class ProductResponse
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Brand { get; set; }

        public bool IsActive { get; set; }

        public bool IsFeatured { get; set; }

        public List<int> CategoryIds { get; set; } = [];

        public List<ProductCategoryResponse> Categories { get; set; } = [];

        public List<ProductVariantResponse> Variants { get; set; } = [];

        public List<ProductImageResponse> Images { get; set; } = [];
    }

    public class ProductCategoryResponse
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;
    }

    public class ProductVariantResponse
    {
        public int Id { get; set; }

        public string SKU { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal? CompareAtPrice { get; set; }

        public int StockQuantity { get; set; }

        public bool IsActive { get; set; }
    }

    public class ProductImageResponse
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public string? AltText { get; set; }

        public int SortOrder { get; set; }

        public bool IsPrimary { get; set; }
    }
}
