using System.Text.RegularExpressions;
using Ecommerce.Application.DTOs.Products;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly ICloudinaryImageService _imageService;

    public ProductsController(
        IProductRepository productRepository,
        ICloudinaryImageService imageService)
    {
        _productRepository = productRepository;
        _imageService = imageService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync(
            cancellationToken);

        return Ok(products.Select(MapToResponse));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id,CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        return Ok(MapToResponse(product));
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [AllowAnonymous]
    public async Task<IActionResult> Create(
        [FromForm] ProductRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = ValidateRequest(request);

        if (validationError is not null)
            return BadRequest(new { message = validationError });

        var categoryIds = request.CategoryIds.Distinct().ToList();

        if (!await _productRepository.CategoriesExistAsync(
                categoryIds, cancellationToken))
        {
            return BadRequest(new
            {
                message = "One or more selected categories do not exist."
            });
        }

        var skus = request.Variants.Select(v => v.SKU.Trim()).ToList();

        if (skus.Distinct(StringComparer.OrdinalIgnoreCase).Count()
            != skus.Count)
        {
            return Conflict(new
            {
                message = "Duplicate SKUs are not allowed in the same product."
            });
        }

        if (await _productRepository.HasDuplicateSkusAsync(
                skus, cancellationToken: cancellationToken))
        {
            return Conflict(new
            {
                message = "One or more SKUs already exist."
            });
        }

        var slug = await GenerateUniqueSlugAsync(
            request.Name, null, cancellationToken);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            Brand = request.Brand?.Trim(),
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured
        };

        foreach (var categoryId in categoryIds)
        {
            product.ProductCategories.Add(new ProductCategory
            {
                CategoryId = categoryId
            });
        }

        foreach (var variantRequest in request.Variants)
        {
            product.Variants.Add(new ProductVariant
            {
                SKU = variantRequest.SKU.Trim(),
                Price = variantRequest.Price,
                CompareAtPrice = variantRequest.CompareAtPrice,
                StockQuantity = variantRequest.StockQuantity,
                IsActive = variantRequest.IsActive
            });
        }

        foreach (var image in request.Images)
        {
            var imageUrl = await _imageService.UploadAsync(
                image, cancellationToken);

            product.Images.Add(new ProductImage
            {
                ImageUrl = imageUrl,
                AltText = request.Name.Trim(),
                SortOrder = product.Images.Count,
                IsPrimary = product.Images.Count == 0
            });
        }

        var variantCount = product.Variants.Count;

        if (variantCount == 0)
        {
            return BadRequest(new
            {
                message = "No variants received.",
                receivedVariantCount = variantCount
            });
        }
        await _productRepository.AddAsync(
            product, cancellationToken);

        var createdProduct = await _productRepository.GetByIdAsync(
            product.Id, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            MapToResponse(createdProduct!));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(int id,[FromForm] ProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(
            id, cancellationToken);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        var validationError = ValidateRequest(request);

        if (validationError is not null)
            return BadRequest(new { message = validationError });

        var categoryIds = request.CategoryIds.Distinct().ToList();

        if (!await _productRepository.CategoriesExistAsync(
                categoryIds, cancellationToken))
        {
            return BadRequest(new
            {
                message = "One or more selected categories do not exist."
            });
        }

        var skus = request.Variants.Select(v => v.SKU.Trim()).ToList();

        if (skus.Distinct(StringComparer.OrdinalIgnoreCase).Count()
            != skus.Count)
        {
            return Conflict(new
            {
                message = "Duplicate SKUs are not allowed in the same product."
            });
        }

        if (await _productRepository.HasDuplicateSkusAsync(
                skus, id, cancellationToken))
        {
            return Conflict(new
            {
                message = "One or more SKUs already exist."
            });
        }

        product.Name = request.Name.Trim();
        product.Slug = await GenerateUniqueSlugAsync(
            request.Name, id, cancellationToken);
        product.Description = request.Description?.Trim();
        product.Brand = request.Brand?.Trim();
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;

        // Replace product category assignments.
        product.ProductCategories.Clear();

        foreach (var categoryId in categoryIds)
        {
            product.ProductCategories.Add(new ProductCategory
            {
                ProductId = id,
                CategoryId = categoryId
            });
        }

        // Update existing variants by SKU and add new variants.
        // Existing variants not submitted are preserved to protect
        // historical cart/order references.
        foreach (var variantRequest in request.Variants)
        {
            var existingVariant = product.Variants.FirstOrDefault(
                v => v.SKU.Equals(
                    variantRequest.SKU.Trim(),
                    StringComparison.OrdinalIgnoreCase));

            if (existingVariant is not null)
            {
                existingVariant.Price = variantRequest.Price;
                existingVariant.CompareAtPrice =
                    variantRequest.CompareAtPrice;
                existingVariant.StockQuantity =
                    variantRequest.StockQuantity;
                existingVariant.IsActive = variantRequest.IsActive;
            }
            else
            {
                product.Variants.Add(new ProductVariant
                {
                    ProductId = id,
                    SKU = variantRequest.SKU.Trim(),
                    Price = variantRequest.Price,
                    CompareAtPrice = variantRequest.CompareAtPrice,
                    StockQuantity = variantRequest.StockQuantity,
                    IsActive = variantRequest.IsActive
                });
            }
        }

        // New images are appended. Existing images are preserved
        // when no new files are submitted.
        foreach (var image in request.Images)
        {
            var imageUrl = await _imageService.UploadAsync(
                image, cancellationToken);

            product.Images.Add(new ProductImage
            {
                ProductId = id,
                ImageUrl = imageUrl,
                AltText = product.Name,
                SortOrder = product.Images.Count,
                IsPrimary = product.Images.Count == 0
            });
        }

        await _productRepository.UpdateAsync(
            product, cancellationToken);

        var updatedProduct = await _productRepository.GetByIdAsync(
            id, cancellationToken);

        return Ok(MapToResponse(updatedProduct!));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(
            id, cancellationToken);

        if (product is null)
            return NotFound(new { message = "Product not found." });

        if (product.Variants.Any(
                v => v.CartItems.Count > 0 || v.OrderItems.Count > 0))
        {
            return Conflict(new
            {
                message = "This product cannot be deleted because its variants are associated with cart or order records. Deactivate it instead."
            });
        }

        await _productRepository.DeleteAsync(
            product, cancellationToken);

        return NoContent();
    }

    private static string? ValidateRequest(ProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return "Product name is required.";

        foreach (var variant in request.Variants)
        {
            if (string.IsNullOrWhiteSpace(variant.SKU))
                return "Every product variant must have an SKU.";

            if (variant.Price <= 0)
                return "Variant price must be greater than zero.";

            if (variant.CompareAtPrice.HasValue &&
                variant.CompareAtPrice.Value < variant.Price)
            {
                return "Compare-at price must be greater than or equal to the selling price.";
            }
        }

        foreach (var image in request.Images)
        {
            if (image.Length == 0)
                return "Empty image files are not allowed.";

            if (image.Length > 5 * 1024 * 1024)
                return "Each image must be 5 MB or smaller.";

            var allowedTypes = new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };

            if (!allowedTypes.Contains(
                    image.ContentType.ToLowerInvariant()))
            {
                return "Only JPEG, PNG and WebP images are allowed.";
            }
        }

        return null;
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string name,
        int? excludeProductId,
        CancellationToken cancellationToken)
    {
        var slug = Regex.Replace(
            name.Trim().ToLowerInvariant(),
            @"[^a-z0-9]+",
            "-").Trim('-');

        if (string.IsNullOrWhiteSpace(slug))
            slug = "product";

        var uniqueSlug = slug;
        var counter = 1;

        while (await _productRepository.ExistsBySlugAsync(
                   uniqueSlug, excludeProductId, cancellationToken))
        {
            uniqueSlug = $"{slug}-{counter++}";
        }

        return uniqueSlug;
    }

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            Description = product.Description,
            Brand = product.Brand,
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,

            CategoryIds = product.ProductCategories
                .Select(pc => pc.CategoryId)
                .ToList(),

            Categories = product.ProductCategories
                .Where(pc => pc.Category is not null)
                .Select(pc => new ProductCategoryResponse
                {
                    Id = pc.Category.Id,
                    Name = pc.Category.Name,
                    Slug = pc.Category.Slug
                })
                .ToList(),

            Variants = product.Variants
                .Select(v => new ProductVariantResponse
                {
                    Id = v.Id,
                    SKU = v.SKU,
                    Price = v.Price,
                    CompareAtPrice = v.CompareAtPrice,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                })
                .ToList(),

            Images = product.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new ProductImageResponse
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    AltText = i.AltText,
                    SortOrder = i.SortOrder,
                    IsPrimary = i.IsPrimary
                })
                .ToList()
        };
    }
}