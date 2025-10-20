namespace WebInventory.Models
{
    public static class DirManager
    {
        public static string? Create(string inputPath)
        {
            try
            {
                string path = AppDomain.CurrentDomain.BaseDirectory;

                var equalIndex = inputPath.IndexOf("=");
                var cutted = inputPath.Substring(equalIndex + 1);
                var parcing = cutted.Split('/');

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
                            path = Path.Combine(path, elem);
                        }
                    }
                }
				
                if (equalIndex > 0)
                {
                    path = inputPath.Substring(0, equalIndex + 1) + path;
                }
				
                return path;
            } catch
            {
                return null;
            }
        }
    }
}
