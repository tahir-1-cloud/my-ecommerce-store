using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Customer
{
    public class CustomerOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;

        public decimal Subtotal { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; }
        public int ItemsCount { get; set; }
    }
}
