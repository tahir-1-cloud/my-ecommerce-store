using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ITokenService
    {
        Task<(string AccessToken, DateTime ExpiresAt)> GenerateAccessTokenAsync(
            Guid userId,
            string email,
            IEnumerable<string> roles);

        string GenerateRefreshToken();
    }
}
