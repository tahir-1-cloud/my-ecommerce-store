using Ecommerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync(
         CancellationToken cancellationToken = default);

        Task<Category?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default);

        Task<bool> ExistsBySlugAsync(
            string slug,
            int? excludeId = null,
            CancellationToken cancellationToken = default);

        Task<bool> HasProductsAsync(
            int id,
            CancellationToken cancellationToken = default);

        Task AddAsync(
            Category category,
            CancellationToken cancellationToken = default);

        Task SaveChangesAsync(
            CancellationToken cancellationToken = default);

        Task DeleteAsync(
            Category category,
            CancellationToken cancellationToken = default);

    }
}
