using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ICloudinaryImageService
    {
        Task<string> UploadAsync(
             IFormFile file,
             CancellationToken cancellationToken = default);
    }
}
