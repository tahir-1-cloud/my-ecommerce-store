using Ecommerce.Domain.Common;


namespace Ecommerce.Domain.Entities
{
    public class Category:BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<ProductCategory> ProductCategories { get; set; }
            = new List<ProductCategory>();

    }
}
