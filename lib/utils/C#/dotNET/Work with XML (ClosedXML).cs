public ActionResult Load(HttpPostedFileBase load)
{
	if (load != null)
	{
		// получаем имя файла
		string fileName = Path.GetFileName(load.FileName);
		// сохраняем файл в папку на сервере
		load.SaveAs(Server.MapPath("~/App_Data/" + fileName));
		// получаем сохраненный файл
		string xsltPath = Path.Combine(System.Web.HttpContext.Current.Server.MapPath(@"~/App_Data"), fileName);
		// начало использования библиотеке ClosedXML
		var workbook = new XLWorkbook(xsltPath);
		var worksheet = workbook.Worksheet(1);
		// получим все строки в файле
		var rows = worksheet.RangeUsed().RowsUsed(); // Skip header row
		// пример чтения строк файла.
		foreach (var row in rows)
		{
			// Вместо строки можно заносить в базу согласно модели.
			string rowNumber = $"Имя {row.Cell(1).Value} Фамилия {row.Cell(2).Value}";
			// для проверки, что данные были получены - можно поставить точку останова
		}
	}
	SaveEndOfBase();
	return RedirectToAction("Test");
}


public FileResult GetFile()
{

	// Путь к файлу
	string file_path = Server.MapPath("~/Content/files/AAA.xlsx");
	// Тип файла - content-type
	string file_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	// Имя файла - необязательно
	string file_name = "AAA.xlsx";

	string xsltPath = Path.Combine(System.Web.HttpContext.Current.Server.MapPath(@"~/Content/files"), file_name);
	var workbook = new XLWorkbook(xsltPath);

	MemoryStream stream = new MemoryStream();
	workbook.SaveAs(stream);
	stream.Seek(0, SeekOrigin.Begin);

	return File(stream, file_type, file_name);
}
