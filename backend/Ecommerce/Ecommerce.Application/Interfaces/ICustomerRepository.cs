using Ecommerce.Application.DTOs.Customer;

namespace Ecommerce.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<CustomerDashboardDto?> GetDashboardAsync(
            Guid userId,
            CancellationToken cancellationToken = default);

        Task<List<CustomerAddressDto>> GetAddressesAsync(
            Guid userId,
            CancellationToken cancellationToken = default);

        Task<CustomerAddressDto?> GetAddressByIdAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default);

        Task<CustomerAddressDto> CreateAddressAsync(
            Guid userId,
            CustomerAddressRequest request,
            CancellationToken cancellationToken = default);

        Task<CustomerAddressDto?> UpdateAddressAsync(
            Guid userId,
            int addressId,
            CustomerAddressRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAddressAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default);

        Task<bool> SetDefaultAddressAsync(
            Guid userId,
            int addressId,
            CancellationToken cancellationToken = default);

        Task<CustomerOrdersResponseDto> GetOrdersAsync(
            Guid userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<CustomerOrderDetailsDto?> GetOrderDetailsAsync(
            Guid userId,
            int orderId,
            CancellationToken cancellationToken = default);

        Task<CustomerOrderTrackingDto?> GetOrderTrackingAsync(
            Guid userId,
            int orderId,
            CancellationToken cancellationToken = default);

        Task<CustomerProfileDto?> GetProfileAsync(
                Guid userId,
                CancellationToken cancellationToken = default);

                    Task<CustomerProfileDto?> UpdateProfileAsync(
                        Guid userId,
                        UpdateCustomerProfileDto request,
                        CancellationToken cancellationToken = default);
    }
}