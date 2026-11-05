using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories;

public sealed class CartRepository : ICartRepository
{
    private readonly EcommerceDbContext _context;

    public CartRepository(EcommerceDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdAsync(Guid userId,CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(x => x.Items)
                .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.UserId == userId,
                cancellationToken);
    }

    public async Task<ProductVariant?> GetVariantByIdAsync(int variantId,CancellationToken cancellationToken = default)
    {
        return await _context.ProductVariants
            .Include(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.Id == variantId,
                cancellationToken);
    }

    public async Task AddAsync(Cart cart,CancellationToken cancellationToken = default)
    {
        await _context.Carts.AddAsync(
            cart,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddItemAsync(CartItem item,CancellationToken cancellationToken = default)
    {
        await _context.CartItems.AddAsync(
            item,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteItemAsync(CartItem item,CancellationToken cancellationToken = default)
    {
        _context.CartItems.Remove(item);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearAsync(Cart cart,CancellationToken cancellationToken = default)
    {
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync(cancellationToken);
    }
}