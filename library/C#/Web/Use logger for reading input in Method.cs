public class HomeController : Controller
{

	private readonly ILogger<HomeController> _logger;

	public HomeController(ILogger<HomeController> logger)
	{
		_logger = logger;
	}

	public async Task<IActionResult> MyAction(string Name, int Age)
	{
		var request = HttpContext.Request;

		var reader = new StreamReader(request.Body, Encoding.UTF8);
		string requestBody = await reader.ReadToEndAsync();

		_logger.LogInformation("Data in MyAction method: {RequestBody}", requestBody);
		
		var loggo = (Name != null) ? Name : "Undefined";
		_logger.LogInformation(loggo);

		return Ok();
	}
}
