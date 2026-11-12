
using Ecommerce.Application.DTOs.Orders;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly IAdminOrderRepository _repository;

        public AdminOrdersController(IAdminOrderRepository repository)
        {
            _repository = repository;
        }

        // GET: api/admin/orders
        [HttpGet("GetAllOrders")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] OrderStatus? status = null,
            [FromQuery] string? search = null,
            CancellationToken cancellationToken = default)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var result = await _repository.GetAllAsync(
                page,
                pageSize,
                status,
                search,
                cancellationToken);

            return Ok(new
            {
                status = true,
                data = result.Items,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount = result.TotalCount,
                    totalPages = (int)Math.Ceiling(
                        result.TotalCount / (double)pageSize)
                }
            });
        }

        // GET: api/admin/orders/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
        {
            var result = await _repository.GetSummaryAsync(
                cancellationToken);

            return Ok(new
            {
                status = true,
                data = result
            });
        }

        // GET: api/admin/orders/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id,CancellationToken cancellationToken)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Invalid order ID."
                });
            }

            var order = await _repository.GetByIdAsync(
                id,
                cancellationToken);

            if (order == null)
            {
                return NotFound(new
                {
                    status = false,
                    message = "Order not found."
                });
            }

            return Ok(new
            {
                status = true,
                data = order
            });
        }

        // PUT: api/admin/orders/5/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdateAdminOrderStatusDto request,
            CancellationToken cancellationToken)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Invalid order ID."
                });
            }

            if (!Enum.IsDefined(typeof(OrderStatus), request.Status))
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Invalid order status."
                });
            }

            var updated = await _repository.UpdateStatusAsync(
                id,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound(new
                {
                    status = false,
                    message = "Order not found."
                });
            }

            return Ok(new
            {
                status = true,
                message = "Order status updated successfully."
            });
        }
    }
}
