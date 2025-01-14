[HttpPost]
public IActionResult? GetPartial ([FromBody] Dictionary<string, object> model)
{
	string? partialWay = model["route"].ToString();
	if (partialWay != null)
	{
		return PartialView($"~/Views/Shared/Partials{partialWay}.cshtml");
	} 
	else
	{
		return StatusCode(404, "Partial not found");
	}
}