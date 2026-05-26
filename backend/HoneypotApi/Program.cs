using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.SetIsOriginAllowed(origin => true) // Permitir cualquier origen en desarrollo/despliegue
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Agregar Rate Limiting: Máximo 5 peticiones cada 10 segundos por IP
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429; // Too Many Requests
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromSeconds(10)
            }));
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.UseRateLimiter(); // Activar el middleware de Rate Limiting
app.UseCors("AllowReactApp");
app.MapControllers();
app.Run();
