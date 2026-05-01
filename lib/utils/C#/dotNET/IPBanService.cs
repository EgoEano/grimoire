public static class IPBanService
{
	public static string? GetConnectionString()
	{
		return new ConfigurationService().GetConfig().GetConnectionString("TestDBConnection");
	}

	public static (bool? verdict, string level) PassiveCheckIP(string ip) //  Checking IP without appending into ban list iterations
	{
		try
		{
			using (DBApplicationContext<IPBanModel> db = new DBApplicationContext<IPBanModel>(GetConnectionString()))
			{
				bool? verdict = false; // True - banned, False - allowed
				long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
				int yellow_diff = 300;
				int yellow_attempts = 5;
				int red_diff = 3600;
				int red_attempts = 3;
				int black_diff = 86400;

				//db.Database.EnsureCreated();

				List<(string, string, object)> conditionsList = new List<(string, string, object)>()
				{
					("IP", "==", ip)
				};
				List<IPBanModel>? result = db.SearchBy(conditionsList);

				if (result == null || result.Count == 0)
				{
					//  new record
					return (verdict, "grey");
				}
				else
				{
					var model = result[0];
					// BLACK
					if ((now - model.black_stamp) < black_diff)
					{
						verdict = true;
						//  still banned
						return (verdict, "black");
					}
					else
					{
						//  record is old
						verdict = false;
					}
					//end BLACK
					// RED
					if ((now - model.red_stamp) < red_diff)
					{
						if (model.red_index < red_attempts)
						{
							verdict = true;
							// still in red
							return (verdict, "red");
						}
						else
						{
							// now is banned
							return (verdict, "black");
						}
					}
					else
					{
						//  record is old
						verdict = false;
					}
					//end RED
					// YELLOW
					if ((now - model.yellow_stamp) < yellow_diff)
					{
						if (model.yellow_index < yellow_attempts)
						{
							// still is grey
							verdict = false;
						}
						else
						{
							verdict = true;
							// now in red
							return (verdict, "red");
						}
					}
					else
					{
						//  record is old
						verdict = false;
					}
					//end YELLOW
					return (verdict, "yellow");
				}
			}
		} catch (Exception ex)
		{
			CustomLoggerService.Create("/Logs/Exceptions/log.txt", ex.ToString());
			return (null, "error");
		}
	}

	public static (bool? verdict, string level) ActiveCheckIP(string ip)  //  Checking IP and appending into ban list iterations
	{
		try
		{
			using (DBApplicationContext<IPBanModel> db = new DBApplicationContext<IPBanModel>(GetConnectionString()))
			{
				bool? verdict = false; // True - banned, False - allowed
				int call;
				long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
				int yellow_diff = 300;
				int yellow_attempts = 5;
				int red_diff = 3600;
				int red_attempts = 3;
				int black_diff = 86400;

				//db.Database.EnsureCreated();

				List<(string, string, object)> conditionsList = new List<(string, string, object)>()
				{
					("IP", "==", ip)
				};
				List<IPBanModel>? result = db.SearchBy(conditionsList);

				if (result == null || result.Count == 0)
				{
					IPBanModel model = new IPBanModel()
					{
						IP = ip,
						yellow_index = 1,
						yellow_stamp = now,
					};
					call = db.Add(model);
					if (call <= 0) { 
						CustomLoggerService.Create("/Logs/Warning/DBEF_log.txt", "model is not updated");
						verdict = null;
					}

					//  new record
					return (verdict, "grey");
				}
				else
				{
					var model = result[0];
					// BLACK
					if ((now - model.black_stamp) < black_diff)
					{
						verdict = true;
						//  still banned
						return (verdict, "black");
					}
					else
					{
						//  record is old
						verdict = false;
					}
					//end BLACK
					// RED
					if ((now - model.red_stamp) < red_diff)
					{
						if (model.red_index < red_attempts)
						{
							model.red_index++;
							model.red_stamp = now;
							call = db.Update(model);
							if (call <= 0) { CustomLoggerService.Create("/Logs/Warning/DBEF_log.txt", "model is not updated"); };
							verdict = true;
							// still in red
							return (verdict, "red");
						}
						else
						{
							model.black_stamp = now;
							call = db.Update(model);
							if (call <= 0) { CustomLoggerService.Create("/Logs/Warning/DBEF_log.txt", "model is not updated"); };
							verdict = true;
							// now is banned
							return (verdict, "black");
						}
					}
					else
					{
						model.red_index = 0;
						model.red_stamp = 0;
						//  record is old
						verdict = false;
					}
					//end RED
					// YELLOW
					if ((now - model.yellow_stamp) < yellow_diff)
					{
						if (model.yellow_index < yellow_attempts)
						{
							model.yellow_index++;
							model.yellow_stamp = now;
							// still is grey
							verdict = false;
						}
						else
						{
							model.red_index++;
							model.red_stamp = now;
							call = db.Update(model);
							if (call <= 0) { CustomLoggerService.Create("/Logs/Warning/DBEF_log.txt", "model is not updated"); };
							verdict = true;
							// now in red
							return (verdict, "red");
						}
					}
					else
					{
						//  record is old
						model.yellow_index = 1;
						model.yellow_stamp = now;
						verdict = false;
					}
					//end YELLOW
					call = db.Update(model);
					if (call <= 0) { CustomLoggerService.Create("/Logs/Warning/DBEF_log.txt", "model is not updated"); };
					return (verdict, "yellow");
				}
			}
		} catch (Exception ex)
		{
			CustomLoggerService.Create("/Logs/Exceptions/log.txt", ex.ToString());
			return (null, "error");
		}
	}
}