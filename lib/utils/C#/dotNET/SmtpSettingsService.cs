public class SmtpSettingsService
{
	private readonly IConfigurationSection _smtpConfig;

	public SmtpSettingsService(string provider)
	{
		IConfiguration? _configuration = ConfigurationService.GetConfig();
		if (_configuration == null)
		{
			throw new Exception("Configuration is null. Cannot create SmtpSettingsService instance.");
		}
		else
		{
			_smtpConfig = _configuration.GetSection($"SmtpSettings:{provider}");
		}
	}

	public string? GetSmtpServer()
	{
		return _smtpConfig.GetValue<string>("Server");
	}
	public int GetSmtpPort()
	{
		return int.TryParse(_smtpConfig.GetValue<string>("Port"), out int value) ? value : 0;

	}
	public string? GetSmtpLogin()
	{
		return _smtpConfig.GetValue<string>("Login");

	}
	public string? GetSmtpPassword()
	{
		return _smtpConfig.GetValue<string>("Password");
	}

	public bool GetSecurityType()
	{
		return bool.TryParse(_smtpConfig.GetValue<string>("IsUseSecureConnection"), out bool value) ? value : false;
	}
}
