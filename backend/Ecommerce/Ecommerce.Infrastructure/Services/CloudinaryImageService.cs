
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Ecommerce.Infrastructure.Services;

public sealed class CloudinaryImageService : ICloudinaryImageService
{
    private const long MaxFileSize = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService(IConfiguration configuration)
    {
        var section = configuration.GetSection("Cloudinary");

        var cloudName = section["CloudName"];
        var apiKey = section["ApiKey"];
        var apiSecret = section["ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) ||
            string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException(
                "Cloudinary configuration is missing.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);

        _cloudinary = new Cloudinary(account)
        {
            Api =
            {
                Secure = true
            }
        };
    }

    public async Task<string> UploadAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(file);

        if (file.Length <= 0)
            throw new ArgumentException("Please select a valid image.");

        if (file.Length > MaxFileSize)
            throw new ArgumentException("Image size cannot exceed 5 MB.");

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            throw new ArgumentException(
                "Only JPEG, PNG and WebP images are allowed.");
        }

        await using var stream = file.OpenReadStream();

        var parameters = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "ecommerce/categories",
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(
            parameters,
            cancellationToken);

        if (result.Error is not null || result.SecureUrl is null)
        {
            throw new InvalidOperationException(
                result.Error?.Message ?? "Cloudinary image upload failed.");
        }

        return result.SecureUrl.ToString();
    }
}
