
using System.Text.RegularExpressions;
using Ecommerce.Application.DTOs.Categories;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize(Roles = "Admin")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repository;
    private readonly ICloudinaryImageService _imageService;

    public CategoriesController(
        ICategoryRepository repository,
        ICloudinaryImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoryResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllAsync(cancellationToken);

        return Ok(categories.Select(MapToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<CategoryResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(
            id, cancellationToken);

        if (category is null)
            return NotFound(new { message = "Category not found." });

        return Ok(MapToResponse(category));
    }



    [HttpPost]
    [Consumes("multipart/form-data")]
    [AllowAnonymous]
    public async Task<ActionResult<CategoryResponse>> Create(
        [FromForm] CategoryRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        var slug = GenerateSlug(name);

        // Check for duplicate category.
        var exists = await _repository.ExistsBySlugAsync(
            slug,
            cancellationToken: cancellationToken);

        if (exists)
        {
            return Conflict(new
            {
                message = "A category with this name already exists."
            });
        }

        // Upload image to Cloudinary.
        string? imageUrl = null;

        if (request.Image is not null)
        {
            try
            {
                imageUrl = await _imageService.UploadAsync(
                    request.Image,
                    cancellationToken);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Save category to database.
        var category = new Category
        {
            Name = name,
            Slug = slug,
            Description = Normalize(request.Description),
            ImageUrl = imageUrl,
            IsActive = request.IsActive
        };

        await _repository.AddAsync(category, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.Id },
            MapToResponse(category));
    }


    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    [AllowAnonymous]
    public async Task<ActionResult<CategoryResponse>> Update(
        int id,
        [FromForm] CategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(
            id, cancellationToken);

        if (category is null)
            return NotFound(new { message = "Category not found." });

        var name = request.Name.Trim();
        var slug = GenerateSlug(name);

        if (await _repository.ExistsBySlugAsync(
                slug,
                id,
                cancellationToken))
        {
            return Conflict(new
            {
                message = "A category with this name already exists."
            });
        }

        // Keep the existing image if no new file was submitted.
        if (request.Image is not null)
        {
            try
            {
                category.ImageUrl = await _imageService.UploadAsync(
                    request.Image,
                    cancellationToken);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        category.Name = name;
        category.Slug = slug;
        category.Description = Normalize(request.Description);
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(category));
    }

    [HttpDelete("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(
            id, cancellationToken);

        if (category is null)
            return NotFound(new { message = "Category not found." });

        if (await _repository.HasProductsAsync(id, cancellationToken))
        {
            return Conflict(new
            {
                message = "Cannot delete a category that has associated products."
            });
        }

        await _repository.DeleteAsync(category, cancellationToken);

        return NoContent();
    }

    private static string GenerateSlug(string name)
    {
        var slug = Regex.Replace(
            name.ToLowerInvariant(),
            @"[^a-z0-9]+",
            "-").Trim('-');

        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new ArgumentException(
                "Category name must contain English letters or numbers.");
        }

        return slug;
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static CategoryResponse MapToResponse(Category category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive
        };
    }
}
