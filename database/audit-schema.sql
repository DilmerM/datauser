-- Crear Base de Datos
CREATE DATABASE [HoneypotDB];
GO

USE [HoneypotDB];
GO

-- Crear esquema de auditoría
CREATE TABLE [dbo].[ZeroTrustAudits] (
    -- Identificador único de auditoría
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Timestamp del servidor en UTC (mejor práctica de seguridad)
    [TimestampUtc] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    
    -- Dirección IP (VARCHAR de 45 soporta direcciones IPv6 enteras o mapeadas)
    [IpAddress] VARCHAR(45) NULL, 
    
    -- Identidad Recolectada de Google OAuth
    [IdentityName] NVARCHAR(255) NULL,
    [IdentityEmail] NVARCHAR(255) NULL,
    [IdentityPictureUrl] NVARCHAR(1000) NULL,
    
    -- Hardware y Entorno (Browser Fingerprinting)
    [ScreenWidth] INT NULL,
    [ScreenHeight] INT NULL,
    [CpuCores] TINYINT NULL,         -- TINYINT porque los nucleos son menores a 255
    [RamGb] INT NULL,                
    [BatteryLevelPct] DECIMAL(5,2) NULL, -- ej. 100.00 o 45.65
    
    -- Configuración Regional e Identidad del Cliente
    [LanguageInfo] VARCHAR(50) NULL, -- ej. "es-ES" "en-US"
    [TimeZoneInfo] VARCHAR(100) NULL, -- ej. "America/New_York"
    [UserAgentData] NVARCHAR(2000) NULL -- User-Agent string (NVARCHAR para soportar caracteres raros)
);

-- Índices recomendados por el DBA para analítica de ciberseguridad
CREATE INDEX IX_ZeroTrustAudits_IpAddress ON [dbo].[ZeroTrustAudits]([IpAddress]);
CREATE INDEX IX_ZeroTrustAudits_IdentityEmail ON [dbo].[ZeroTrustAudits]([IdentityEmail]);
CREATE INDEX IX_ZeroTrustAudits_TimestampUtc ON [dbo].[ZeroTrustAudits]([TimestampUtc] DESC);