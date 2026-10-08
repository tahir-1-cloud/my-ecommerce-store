using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Domain.Enum
{
    public enum OrderStatus
    {
        Pending = 1,
        Confirmed = 2,
        Processing = 3,
        Shipped = 4,
        OutForDelivery = 5,
        Delivered = 6,
        Cancelled = 7,
        Returned = 8
    }
}
