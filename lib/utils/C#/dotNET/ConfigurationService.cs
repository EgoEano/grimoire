public static class ConfigurationService
{
	public static IConfiguration? GetConfig() {
        return new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json")
            .Build();
    }

	public static string? GetConnectionString(string connectionString)
	{
        return GetConfig()?.GetConnectionString(connectionString);
    }
}
