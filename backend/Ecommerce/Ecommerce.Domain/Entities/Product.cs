using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities
{
    public class Product:BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Brand { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; }

        public ICollection<ProductVariant> Variants { get; set; }
            = new List<ProductVariant>();

        public ICollection<ProductImage> Images { get; set; }
            = new List<ProductImage>();

        public ICollection<ProductCategory> ProductCategories { get; set; }
            = new List<ProductCategory>();
    }
}
