using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Auth
{
    public class RefreshTokenRequest
    {

        public string RefreshToken { get; set; } = string.Empty;
    }
}
