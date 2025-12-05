public static class CustomLoggerService
{
	public static bool Create(string inputPath, string inputTxt) {

		string path = AppDomain.CurrentDomain.BaseDirectory;
		string now = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff zzz");

		try
		{
			var parcing = inputPath.Split('/');
			foreach (var elem in parcing)
			{
				if (elem.Length > 0)
				{
					if (!elem.Contains('.'))
					{
						path = Path.Combine(path, elem);
						if (!Directory.Exists(path))
						{
							Directory.CreateDirectory(path);
						}
					}
					else
					{
						string filePath = Path.Combine(path, elem);
						string preparedTxt = "[" + now + "] " + inputTxt + Environment.NewLine + Environment.NewLine;
						File.AppendAllText(filePath, preparedTxt);
					}
				}
			}
			return true;
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.ToString());
			return false;
		}
	}
}