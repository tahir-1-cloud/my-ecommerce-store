using Ecommerce.Application.DTOs.Auth;
using Ecommerce.Application.DTOs.Checkout;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/checkout")]
public class CheckoutController : ControllerBase
{
    private readonly ICheckoutRepository _checkoutRepository;
    private readonly IAuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;

    public CheckoutController(
        ICheckoutRepository checkoutRepository,
        IAuthService authService,
        UserManager<ApplicationUser> userManager)
    {
        _checkoutRepository = checkoutRepository;
        _authService = authService;
        _userManager = userManager;
    }

    [HttpGet("preview")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPreview(
        [FromQuery] string mode = "BuyNow",
        [FromQuery] int? productVariantId = null,
        [FromQuery] int quantity = 1,
        CancellationToken cancellationToken = default)
    {
        Guid? userId = GetAuthenticatedUserId();

        try
        {
            var result = await _checkoutRepository.GetCheckoutPreviewAsync(
                userId,
                mode,
                productVariantId,
                quantity,
                cancellationToken);

            return Ok(new
            {
                status = true,
                data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                status = false,
                message = ex.Message
            });
        }
    }

    [HttpPost("orders")]
    [AllowAnonymous]
    public async Task<IActionResult> PlaceOrder(
        [FromBody] CheckoutRequest request,
        CancellationToken cancellationToken)
    {
        if (request.ShippingAddress == null ||
            string.IsNullOrWhiteSpace(request.ShippingAddress.FullName) ||
            string.IsNullOrWhiteSpace(request.ShippingAddress.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.ShippingAddress.AddressLine1) ||
            string.IsNullOrWhiteSpace(request.ShippingAddress.City) ||
            string.IsNullOrWhiteSpace(request.ShippingAddress.Country))
        {
            return BadRequest(new
            {
                status = false,
                message = "Complete shipping address is required."
            });
        }

        Guid userId;
        AuthResponse? authentication = null;

        var authenticatedUserId = GetAuthenticatedUserId();

        try
        {
            if (authenticatedUserId.HasValue)
            {
                // Existing logged-in user
                userId = authenticatedUserId.Value;
            }
            else
            {
                // Guest checkout
                if (request.GuestAccount == null)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Account details are required for guest checkout."
                    });
                }

                var existingUser = await _userManager.FindByEmailAsync(
                    request.GuestAccount.Email.Trim());

                if (existingUser != null)
                {
                    return Conflict(new
                    {
                        status = false,
                        message = "This email is already registered. Please login to continue."
                    });
                }

                // Create account and issue tokens using existing AuthService
                authentication = await _authService.RegisterAsync(
                    request.GuestAccount);

                userId = authentication.User.Id;
            }

            var order = await _checkoutRepository.CreateCodOrderAsync(
                userId,
                request,
                !authenticatedUserId.HasValue,
                cancellationToken);

            var orderResponse = new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                PaymentMethod = order.PaymentMethod.ToString(),
                Subtotal = order.Subtotal,
                ShippingAmount = order.ShippingAmount,
                DiscountAmount = order.DiscountAmount,
                TaxAmount = order.TaxAmount,
                TotalAmount = order.TotalAmount,
                CreatedAt = order.CreatedAt
            };

            return Ok(new
            {
                status = true,
                message = "Order placed successfully.",
                data = new
                {
                    order = orderResponse,
                    authentication
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                status = false,
                message = ex.Message
            });
        }
    }

    private Guid? GetAuthenticatedUserId()
    {
        if (User.Identity?.IsAuthenticated != true)
            return null;

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (Guid.TryParse(userIdValue, out var userId))
            return userId;

        return null;
    }
}