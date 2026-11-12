using Ecommerce.Application.DTOs.Customer;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/customer")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerController(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        private bool TryGetUserId(out Guid userId)
        {
            var userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            return Guid.TryParse(userIdValue, out userId);
        }


        // GET PROFILE
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetProfileAsync(
                userId, cancellationToken);

            if (result == null)
                return NotFound(new
                {
                    status = false,
                    message = "Customer not found."
                });

            return Ok(new
            {
                status = true,
                message = "Profile retrieved successfully.",
                data = result
            });
        }

        // UPDATE PROFILE
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileDto request,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            try
            {
                var result = await _customerRepository.UpdateProfileAsync(
                    userId, request, cancellationToken);

                if (result == null)
                    return NotFound(new
                    {
                        status = false,
                        message = "Customer not found."
                    });

                return Ok(new
                {
                    status = true,
                    message = "Profile updated successfully.",
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

        // DASHBOARD
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetDashboardAsync(
                userId, cancellationToken);

            if (result == null)
                return NotFound(new { status = false, message = "Customer not found." });

            return Ok(new
            {
                status = true,
                message = "Dashboard retrieved successfully.",
                data = result
            });
        }

        // GET ADDRESSES
        [HttpGet("addresses")]
        public async Task<IActionResult> GetAddresses(
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetAddressesAsync(
                userId, cancellationToken);

            return Ok(new
            {
                status = true,
                message = "Addresses retrieved successfully.",
                data = result
            });
        }

        // GET ADDRESS
        [HttpGet("addresses/{id:int}")]
        public async Task<IActionResult> GetAddress(int id,CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetAddressByIdAsync(
                userId, id, cancellationToken);

            if (result == null)
                return NotFound(new { status = false, message = "Address not found." });

            return Ok(new
            {
                status = true,
                message = "Address retrieved successfully.",
                data = result
            });
        }

        // CREATE ADDRESS
        [HttpPost("addresses")]
        public async Task<IActionResult> CreateAddress([FromBody] CustomerAddressRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            try
            {
                var result = await _customerRepository.CreateAddressAsync(
                    userId, request, cancellationToken);

                return CreatedAtAction(
                    nameof(GetAddress),
                    new { id = result.Id },
                    new
                    {
                        status = true,
                        message = "Address created successfully.",
                        data = result
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { status = false, message = ex.Message });
            }
        }

        // UPDATE ADDRESS
        [HttpPut("addresses/{id:int}")]
        public async Task<IActionResult> UpdateAddress(int id,[FromBody] CustomerAddressRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            try
            {
                var result = await _customerRepository.UpdateAddressAsync(
                    userId, id, request, cancellationToken);

                if (result == null)
                    return NotFound(new { status = false, message = "Address not found." });

                return Ok(new
                {
                    status = true,
                    message = "Address updated successfully.",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { status = false, message = ex.Message });
            }
        }

        // DELETE ADDRESS
        [HttpDelete("addresses/{id:int}")]
        public async Task<IActionResult> DeleteAddress(int id,CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.DeleteAddressAsync(
                userId, id, cancellationToken);

            if (!result)
                return NotFound(new { status = false, message = "Address not found." });

            return Ok(new
            {
                status = true,
                message = "Address deleted successfully."
            });
        }

        // SET DEFAULT ADDRESS
        [HttpPatch("addresses/{id:int}/default")]
        public async Task<IActionResult> SetDefaultAddress(int id,CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.SetDefaultAddressAsync(
                userId, id, cancellationToken);

            if (!result)
                return NotFound(new { status = false, message = "Address not found." });

            return Ok(new
            {
                status = true,
                message = "Default address updated successfully."
            });
        }

        // ORDER HISTORY
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders([FromQuery] int page = 1,[FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetOrdersAsync(
                userId, page, pageSize, cancellationToken);

            return Ok(new
            {
                status = true,
                message = "Orders retrieved successfully.",
                data = result
            });
        }

        // ORDER DETAILS
        [HttpGet("orders/{id:int}")]
        public async Task<IActionResult> GetOrderDetails(
            int id,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetOrderDetailsAsync(
                userId, id, cancellationToken);

            if (result == null)
                return NotFound(new { status = false, message = "Order not found." });

            return Ok(new
            {
                status = true,
                message = "Order details retrieved successfully.",
                data = result
            });
        }

        // ORDER TRACKING
        [HttpGet("orders/{id:int}/tracking")]
        public async Task<IActionResult> GetOrderTracking(
            int id,
            CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _customerRepository.GetOrderTrackingAsync(
                userId, id, cancellationToken);

            if (result == null)
                return NotFound(new { status = false, message = "Order not found." });

            return Ok(new
            {
                status = true,
                message = "Order tracking retrieved successfully.",
                data = result
            });
        }
    }
}