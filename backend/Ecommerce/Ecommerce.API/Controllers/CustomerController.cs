
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

        public CustomerController(
            ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            CancellationToken cancellationToken)
        {
            var userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(userIdValue, out var userId))
            {
                return Unauthorized(new
                {
                    status = false,
                    message = "Invalid user authentication."
                });
            }

            var result = await _customerRepository.GetDashboardAsync(
                userId,
                cancellationToken);

            if (result == null)
            {
                return NotFound(new
                {
                    status = false,
                    message = "Customer not found."
                });
            }

            return Ok(new
            {
                status = true,
                message = "Dashboard retrieved successfully.",
                data = result
            });
        }
    }
}
