using Ecommerce.Application.DTOs.Customer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<CustomerDashboardDto?> GetDashboardAsync(
         Guid userId,
         CancellationToken cancellationToken = default);
    }
}
