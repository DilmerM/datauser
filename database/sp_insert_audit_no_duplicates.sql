USE [HoneypotDB];
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
    @UserAgentData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar si existe un registro idéntico (ignorando el Timestamp)
    IF NOT EXISTS (
        SELECT 1 FROM [dbo].[ZeroTrustAudits]
        WHERE 
            ISNULL([IpAddress], '') = ISNULL(@IpAddress, '') AND
            ISNULL([IdentityName], '') = ISNULL(@IdentityName, '') AND
            ISNULL([IdentityEmail], '') = ISNULL(@IdentityEmail, '') AND
            ISNULL([ScreenWidth], 0) = ISNULL(@ScreenWidth, 0) AND
            ISNULL([ScreenHeight], 0) = ISNULL(@ScreenHeight, 0) AND
            ISNULL([CpuCores], 0) = ISNULL(@CpuCores, 0) AND
            ISNULL([RamGb], 0) = ISNULL(@RamGb, 0) AND
            ISNULL([BatteryLevelPct], 0) = ISNULL(@BatteryLevelPct, 0) AND
            ISNULL([LanguageInfo], '') = ISNULL(@LanguageInfo, '') AND
            ISNULL([TimeZoneInfo], '') = ISNULL(@TimeZoneInfo, '') AND
            ISNULL([UserAgentData], '') = ISNULL(@UserAgentData, '')
    )
    BEGIN
        -- Si no existe, entonces lo insertamos
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
            [UserAgentData]
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
            @UserAgentData
        );
    END
END
GO
