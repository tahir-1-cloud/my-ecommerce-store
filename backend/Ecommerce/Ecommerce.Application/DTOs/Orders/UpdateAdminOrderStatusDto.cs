using Ecommerce.Domain.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Orders
{
    public class UpdateAdminOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }
    }
}
