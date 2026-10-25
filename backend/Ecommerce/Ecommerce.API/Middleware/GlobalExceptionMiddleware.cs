
using System.Text.Json;

namespace Ecommerce.API.Middleware
{
    public sealed class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                if (context.Response.HasStarted)
                {
                    throw;
                }

                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception)
        {
            var (statusCode, title, message) = exception switch
            {
                ArgumentException =>
                    (StatusCodes.Status400BadRequest,
                     "Bad Request",
                     "The request contains invalid arguments."),

                UnauthorizedAccessException =>
                    (StatusCodes.Status401Unauthorized,
                     "Unauthorized",
                     exception.Message),

                KeyNotFoundException =>
                    (StatusCodes.Status404NotFound,
                     "Not Found",
                     exception.Message),

                InvalidOperationException =>
                    (StatusCodes.Status409Conflict,
                     "Conflict",
                     exception.Message),

                _ =>
                    (StatusCodes.Status500InternalServerError,
                     "Internal Server Error",
                     "An unexpected error occurred.")
            };

            if (statusCode >= 500)
            {
                _logger.LogError(
                    exception,
                    "Unhandled exception occurred. TraceId: {TraceId}",
                    context.TraceIdentifier);
            }
            else
            {
                _logger.LogWarning(
                    "Request failed with status {StatusCode}. TraceId: {TraceId}",
                    statusCode,
                    context.TraceIdentifier);
            }

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                statusCode,
                title,
                message,
                traceId = context.TraceIdentifier,
                details = _environment.IsDevelopment()
                    ? exception.ToString()
                    : null
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}
