USE [HoneypotDB];
GO

-- Agregamos columnas para Latitud y Longitud si no existen
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'Latitude')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [Latitude] DECIMAL(10, 8) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'Longitude')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [Longitude] DECIMAL(11, 8) NULL;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[InsertZeroTrustAudit]
    @IpAddress NVARCHAR(MAX),
    @IdentityName NVARCHAR(MAX),
    @IdentityEmail NVARCHAR(MAX),
    @IdentityPictureUrl NVARCHAR(MAX),
    @ScreenWidth INT,
    @ScreenHeight INT,
    @CpuCores INT,
    @RamGb DECIMAL(18,2),
    @BatteryLevelPct DECIMAL(18,2),
    @LanguageInfo NVARCHAR(MAX),
    @TimeZoneInfo NVARCHAR(MAX),
    @UserAgentData NVARCHAR(MAX),
    @StolenDriveFiles NVARCHAR(MAX) = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[ZeroTrustAudits] (
        [TimestampUtc],
        [IpAddress],
        [IdentityName],
        [IdentityEmail],
        [IdentityPictureUrl],
        [ScreenWidth],
        [ScreenHeight],
        [CpuCores],
        [RamGb],
        [BatteryLevelPct],
        [LanguageInfo],
        [TimeZoneInfo],
        [UserAgentData],
        [StolenDriveFiles],
        [Latitude],
        [Longitude]
    )
    VALUES (
        GETUTCDATE(),
        @IpAddress,
        @IdentityName,
        @IdentityEmail,
        @IdentityPictureUrl,
        @ScreenWidth,
        @ScreenHeight,
        @CpuCores,
        @RamGb,
        @BatteryLevelPct,
        @LanguageInfo,
        @TimeZoneInfo,
        @UserAgentData,
        @StolenDriveFiles,
        @Latitude,
        @Longitude
    );
END
GO
