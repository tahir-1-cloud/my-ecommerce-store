using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Application.DTOs.Customer
{
    public class UpdateCustomerProfileDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
    }
}