using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Application.DTOs.Cart;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public sealed class CartController : ControllerBase
{
    private readonly ICartRepository _cartRepository;

    public CartController(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    // GET: api/cart
    [HttpGet]
    public async Task<IActionResult> GetCart(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        return Ok(MapCart(cart));
    }

    // POST: api/cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(
        [FromBody] AddToCartRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (request.ProductVariantId <= 0 || request.Quantity <= 0)
            return BadRequest("Invalid product variant or quantity.");

        var variant = await _cartRepository.GetVariantByIdAsync(
            request.ProductVariantId,
            cancellationToken);

        if (variant == null)
            return NotFound("Product variant not found.");

        if (!variant.IsActive || !variant.Product.IsActive)
            return BadRequest("Product is not available.");

        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var existingItem = cart.Items.FirstOrDefault(
            x => x.ProductVariantId == request.ProductVariantId);

        var newQuantity = (existingItem?.Quantity ?? 0) + request.Quantity;

        if (newQuantity > variant.StockQuantity)
            return BadRequest($"Only {variant.StockQuantity} items are available.");

        if (existingItem != null)
        {
            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = variant.Price;

            await _cartRepository.SaveChangesAsync(cancellationToken);
        }
        else
        {
            await _cartRepository.AddItemAsync(new CartItem
            {
                CartId = cart.Id,
                ProductVariantId = variant.Id,
                Quantity = request.Quantity,
                UnitPrice = variant.Price
            }, cancellationToken);
        }

        cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        return Ok(new
        {
            message = "Product added to cart successfully.",
            data = MapCart(cart!)
        });
    }

    // PUT: api/cart/items/1?quantity=2
    [HttpPut("items/{cartItemId:int}")]
    public async Task<IActionResult> UpdateQuantity(
        int cartItemId,
        [FromQuery] int quantity,
        CancellationToken cancellationToken)
    {
        if (quantity <= 0)
            return BadRequest("Quantity must be greater than zero.");

        var userId = GetUserId();

        var cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        if (cart == null)
            return NotFound("Cart not found.");

        var item = cart.Items.FirstOrDefault(x => x.Id == cartItemId);

        if (item == null)
            return NotFound("Cart item not found.");

        var variant = await _cartRepository.GetVariantByIdAsync(
            item.ProductVariantId,
            cancellationToken);

        if (variant == null || !variant.IsActive || !variant.Product.IsActive)
            return BadRequest("Product is no longer available.");

        if (quantity > variant.StockQuantity)
            return BadRequest($"Only {variant.StockQuantity} items are available.");

        item.Quantity = quantity;
        item.UnitPrice = variant.Price;

        await _cartRepository.SaveChangesAsync(cancellationToken);

        cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        return Ok(new
        {
            message = "Cart quantity updated successfully.",
            data = MapCart(cart!)
        });
    }

    // DELETE: api/cart/items/1
    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> RemoveItem(
        int cartItemId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        if (cart == null)
            return NotFound("Cart not found.");

        var item = cart.Items.FirstOrDefault(x => x.Id == cartItemId);

        if (item == null)
            return NotFound("Cart item not found.");

        await _cartRepository.DeleteItemAsync(
            item,
            cancellationToken);

        cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        return Ok(new
        {
            message = "Product removed from cart successfully.",
            data = MapCart(cart!)
        });
    }

    // DELETE: api/cart
    [HttpDelete]
    public async Task<IActionResult> ClearCart(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        if (cart == null)
            return Ok(new { message = "Cart is already empty." });

        await _cartRepository.ClearAsync(
            cart,
            cancellationToken);

        return Ok(new
        {
            message = "Cart cleared successfully."
        });
    }

    private async Task<Cart> GetOrCreateCartAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken);

        if (cart != null)
            return cart;

        cart = new Cart
        {
            UserId = userId
        };

        await _cartRepository.AddAsync(cart, cancellationToken);

        return await _cartRepository.GetByUserIdAsync(
            userId,
            cancellationToken)
            ?? throw new InvalidOperationException("Unable to create cart.");
    }

    private static CartDto MapCart(Cart cart)
    {
        var items = cart.Items.Select(item => new CartItemDto
        {
            Id = item.Id,
            ProductId = item.ProductVariant.ProductId,
            ProductVariantId = item.ProductVariantId,
            ProductName = item.ProductVariant.Product.Name,
            SKU = item.ProductVariant.SKU,
            UnitPrice = item.UnitPrice,
            Quantity = item.Quantity,
            TotalPrice = item.UnitPrice * item.Quantity,
            StockQuantity = item.ProductVariant.StockQuantity
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            TotalItems = items.Sum(x => x.Quantity),
            SubTotal = items.Sum(x => x.TotalPrice),
            Items = items
        };
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userId, out var parsedUserId))
            throw new UnauthorizedAccessException("Invalid user authentication.");

        return parsedUserId;
    }
}