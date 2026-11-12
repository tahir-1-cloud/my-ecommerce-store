using Ecommerce.Application.DTOs.Orders;
using Ecommerce.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface IAdminOrderRepository
    {
        Task<(List<AdminOrderDto> Items, int TotalCount)> GetAllAsync(
           int page,
           int pageSize,
           OrderStatus? status,
           string? search,
           CancellationToken cancellationToken = default);

        Task<AdminOrderDto?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateStatusAsync(
            int id,
            UpdateAdminOrderStatusDto request,
            CancellationToken cancellationToken = default);

        Task<AdminOrderSummaryDto> GetSummaryAsync(
            CancellationToken cancellationToken = default);
    }
}
