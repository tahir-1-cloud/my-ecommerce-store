using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Data;

public class EcommerceDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public EcommerceDbContext(
        DbContextOptions<EcommerceDbContext> options)
        : base(options)
    {
    }

    // Catalog
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();

    // Customer
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();

    // Cart
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    // Orders
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderAddress> OrderAddresses => Set<OrderAddress>();
    public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();

    // Payments
    public DbSet<Payment> Payments => Set<Payment>();

    // Authentication
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Product
        builder.Entity<Product>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        // Category
        builder.Entity<Category>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        // Product Variant
        builder.Entity<ProductVariant>()
            .HasIndex(x => x.SKU)
            .IsUnique();

        builder.Entity<ProductVariant>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        builder.Entity<ProductVariant>()
            .Property(x => x.CompareAtPrice)
            .HasPrecision(18, 2);

        // Product Category
        builder.Entity<ProductCategory>()
            .HasKey(x => new
            {
                x.ProductId,
                x.CategoryId
            });

        // Cart
        builder.Entity<Cart>()
            .HasIndex(x => x.UserId)
            .IsUnique();

        // Cart Item
        builder.Entity<CartItem>()
            .Property(x => x.UnitPrice)
            .HasPrecision(18, 2);

        builder.Entity<CartItem>()
            .HasIndex(x => new
            {
                x.CartId,
                x.ProductVariantId
            })
            .IsUnique();

        builder.Entity<CartItem>()
            .HasOne(x => x.ProductVariant)
            .WithMany(x => x.CartItems)
            .HasForeignKey(x => x.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order
        builder.Entity<Order>()
            .HasIndex(x => x.OrderNumber)
            .IsUnique();

        builder.Entity<Order>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Entity<Order>()
            .Property(x => x.PaymentStatus)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Entity<Order>()
            .Property(x => x.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Entity<Order>()
            .Property(x => x.Subtotal)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.ShippingAmount)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.TaxAmount)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.TotalAmount)
            .HasPrecision(18, 2);

        // Order Item
        builder.Entity<OrderItem>()
            .Property(x => x.UnitPrice)
            .HasPrecision(18, 2);

        builder.Entity<OrderItem>()
            .Property(x => x.TotalPrice)
            .HasPrecision(18, 2);

        builder.Entity<OrderItem>()
            .HasOne(x => x.ProductVariant)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order Address
        builder.Entity<OrderAddress>()
            .Property(x => x.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Order Status History
        builder.Entity<OrderStatusHistory>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Payment
        builder.Entity<Payment>()
            .Property(x => x.Method)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Entity<Payment>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Entity<Payment>()
            .Property(x => x.Amount)
            .HasPrecision(18, 2);

        // Refresh Token
        builder.Entity<RefreshToken>()
            .HasIndex(x => x.Token)
            .IsUnique();

        builder.Entity<RefreshToken>()
            .HasIndex(x => x.UserId);
    }
}