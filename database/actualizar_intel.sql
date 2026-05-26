USE [HoneypotDB];
GO

-- Agregamos columnas para Inteligencia de Red y Hardware
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'IspName')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [IspName] NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'GpuModel')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [GpuModel] NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'ConnectionType')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [ConnectionType] NVARCHAR(MAX) NULL;
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
    @Longitude DECIMAL(11, 8) = NULL,
    @IspName NVARCHAR(MAX) = NULL,
    @GpuModel NVARCHAR(MAX) = NULL,
    @ConnectionType NVARCHAR(MAX) = NULL
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
        [Longitude],
        [IspName],
        [GpuModel],
        [ConnectionType]
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
        @Longitude,
        @IspName,
        @GpuModel,
        @ConnectionType
    );
END
GO
