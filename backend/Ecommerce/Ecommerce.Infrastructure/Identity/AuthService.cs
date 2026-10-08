using Ecommerce.Application.DTOs.Auth;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Ecommerce.Infrastructure.Identity
{
    public class AuthService : IAuthService
    {
        private const string CustomerRole = "Customer";

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly EcommerceDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly JwtOptions _jwtOptions;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            EcommerceDbContext dbContext,
            ITokenService tokenService,
            IOptions<JwtOptions> jwtOptions)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _dbContext = dbContext;
            _tokenService = tokenService;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<AuthResponse> RegisterAsync(
            RegisterRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "An account with this email already exists.");
            }

            if (!await _roleManager.RoleExistsAsync(CustomerRole))
            {
                var roleResult = await _roleManager.CreateAsync(
                    new IdentityRole<Guid>(CustomerRole));

                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Unable to create customer role.");
                }
            }

            var user = new ApplicationUser
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                UserName = email
            };

            var createResult = await _userManager.CreateAsync(
                user,
                request.Password);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    createResult.Errors.Select(x => x.Description));

                throw new InvalidOperationException(errors);
            }

            var roleResultForUser = await _userManager.AddToRoleAsync(
                user,
                CustomerRole);

            if (!roleResultForUser.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                throw new InvalidOperationException(
                    "Unable to assign customer role.");
            }

            return await CreateAuthResponseAsync(user);
        }

        public async Task<AuthResponse> LoginAsync(
            LoginRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                throw new UnauthorizedAccessException(
                    "Your account is temporarily locked.");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(
                user,
                request.Password);

            if (!passwordValid)
            {
                await _userManager.AccessFailedAsync(user);

                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            return await CreateAuthResponseAsync(user);
        }

        public async Task<AuthResponse> RefreshTokenAsync(
            RefreshTokenRequest request)
        {
            var tokenHash = RefreshTokenHasher.Hash(
                request.RefreshToken);

            var storedToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(x => x.Token == tokenHash);

            if (storedToken == null || !storedToken.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or expired refresh token.");
            }

            var user = await _userManager.FindByIdAsync(
                storedToken.UserId.ToString());

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User account not found.");
            }

            storedToken.RevokedAt = DateTime.UtcNow;

            return await CreateAuthResponseAsync(user);
        }

        public async Task LogoutAsync(Guid userId)
        {
            var activeTokens = await _dbContext.RefreshTokens
                .Where(x =>
                    x.UserId == userId &&
                    x.RevokedAt == null)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
            }

            await _dbContext.SaveChangesAsync();
        }

        private async Task<AuthResponse> CreateAuthResponseAsync(
            ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var tokenResult =
                await _tokenService.GenerateAccessTokenAsync(
                    user.Id,
                    user.Email!,
                    roles);

            var rawRefreshToken =
                _tokenService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = RefreshTokenHasher.Hash(rawRefreshToken),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(
                    _jwtOptions.RefreshTokenExpirationDays)
            };

            _dbContext.RefreshTokens.Add(refreshToken);

            await _dbContext.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = tokenResult.AccessToken,
                RefreshToken = rawRefreshToken,
                AccessTokenExpiresAt = tokenResult.ExpiresAt,
                User = new UserResponse
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email!,
                    Roles = roles.ToList()
                }
            };
        }
    }
}