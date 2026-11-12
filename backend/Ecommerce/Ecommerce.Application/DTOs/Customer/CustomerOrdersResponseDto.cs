using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerOrdersResponseDto
    {
        public List<CustomerOrderDto> Orders { get; set; } = new();

        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
}
