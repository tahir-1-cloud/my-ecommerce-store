using Ecommerce.Application.DTOs.Checkout;
using Ecommerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces
{
    public interface ICheckoutRepository
    {
        Task<CheckoutResponse> GetCheckoutPreviewAsync(
        Guid? userId,
        string mode,
        int? productVariantId,
        int quantity,
        CancellationToken cancellationToken = default);

   

        Task<Order> CreateCodOrderAsync(
            Guid userId,
            CheckoutRequest request,
            bool isGuest,
            CancellationToken cancellationToken = default);
    }
}
