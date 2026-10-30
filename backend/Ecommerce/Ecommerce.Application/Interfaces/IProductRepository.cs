using Ecommerce.Domain.Entities;


namespace Ecommerce.Application.Interfaces
{
    public interface IProductRepository
    {
        Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<Product?> GetByIdAsync(int id,CancellationToken cancellationToken = default);

        Task<bool> ExistsBySlugAsync(string slug,int? excludeProductId = null,CancellationToken cancellationToken = default);

        Task<bool> CategoriesExistAsync(IEnumerable<int> categoryIds,
            CancellationToken cancellationToken = default);

        Task<bool> HasDuplicateSkusAsync( IEnumerable<string> skus,int? excludeProductId = null,
                  CancellationToken cancellationToken = default);

        Task AddAsync(Product product,CancellationToken cancellationToken = default);

        Task UpdateAsync(Product product,CancellationToken cancellationToken = default);

        Task DeleteAsync(Product product,CancellationToken cancellationToken = default);

    }
}
