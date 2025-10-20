const original = window.alert; // Создаем копию метода. Тут - alert
window.alert = function(...args) {

	// Создание лога
	var stack = new Error().stack;
	console.log(stack);
	
	// Файл лога
	var blob = new Blob([stack], {type: "text/plain"});

	//Создание ссылки, скачивание, удаление ссылки
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'alert_trace.txt';
	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	original.apply(window, args); // Вызываем оригинальный метод с нужным контекстом и передачей параметров
}
