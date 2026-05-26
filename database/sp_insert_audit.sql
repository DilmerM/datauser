CREATE PROCEDURE [dbo].[InsertZeroTrustAudit]
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

    INSERT INTO [HoneypotDB].[dbo].[ZeroTrustAudits] (
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
GO
