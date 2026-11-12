using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressTypeToCustomerAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "CustomerAddresses",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "CustomerAddresses");
        }
    }
}
