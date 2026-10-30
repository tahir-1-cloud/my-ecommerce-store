using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Infrastructure.Repositories
{
    public class ProductRepository:IProductRepository
    {
        private readonly EcommerceDbContext _context;

        public ProductRepository(EcommerceDbContext context )
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductCategories)
                    .ThenInclude(pc => pc.Category)
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .OrderBy(p => p.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Product?> GetByIdAsync(int id,CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .Include(p => p.ProductCategories)
                    .ThenInclude(pc => pc.Category)
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(
                    p => p.Id == id,
                    cancellationToken);
        }

        public async Task<bool> ExistsBySlugAsync( string slug,int? excludeProductId = null,
                                                   CancellationToken cancellationToken = default)
        {
            return await _context.Products.AnyAsync(
                p => p.Slug == slug &&
                     (!excludeProductId.HasValue ||
                      p.Id != excludeProductId.Value),
                cancellationToken);
        }

        public async Task<bool> CategoriesExistAsync(IEnumerable<int> categoryIds,CancellationToken cancellationToken = default)
        {
            var ids = categoryIds.Distinct().ToList();

            if (ids.Count == 0)
                return true;

            var count = await _context.Categories
                .CountAsync(c => ids.Contains(c.Id), cancellationToken);

            return count == ids.Count;
        }

        public async Task<bool> HasDuplicateSkusAsync(IEnumerable<string> skus,int? excludeProductId = null,
                                                     CancellationToken cancellationToken = default)
        {
            var normalizedSkus = skus
                .Select(s => s.Trim().ToUpper())
                .Distinct()
                .ToList();

            if (normalizedSkus.Count == 0)
                return false;

            return await _context.ProductVariants.AnyAsync(
                v => normalizedSkus.Contains(v.SKU.ToUpper()) &&
                     (!excludeProductId.HasValue ||
                      v.ProductId != excludeProductId.Value),
                cancellationToken);
        }

        public async Task AddAsync(Product product,CancellationToken cancellationToken = default)
        {
            await _context.Products.AddAsync(product, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(Product product,CancellationToken cancellationToken = default)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Product product, CancellationToken cancellationToken = default)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
