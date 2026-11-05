using Ecommerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetByUserIdAsync(
           Guid userId,
           CancellationToken cancellationToken = default);

        Task<ProductVariant?> GetVariantByIdAsync(
            int variantId,
            CancellationToken cancellationToken = default);

        Task AddAsync(
         Cart cart,
         CancellationToken cancellationToken = default);

        Task AddItemAsync(
            CartItem item,
            CancellationToken cancellationToken = default);

        Task SaveChangesAsync(
         CancellationToken cancellationToken = default);

        Task DeleteItemAsync(
            CartItem item,
            CancellationToken cancellationToken = default);

        Task ClearAsync( Cart cart,
            CancellationToken cancellationToken = default);
    }
}
