// Универсальный курсорный поиск с погружением и всплытием
// Ищет любые элементы, способные иметь фокус (аналог нажатия Tab)

function cursorTreeSearch(startElem) {
    if (!startElem) { return null };
	var isDone = false;
	var currElem = startElem;

	while (!isDone) {
	    var nextElem = currElem.firstElementChild || currElem.nextElementSibling;
	    if (nextElem) {
	        currElem = nextElem;
	    } else {
	        nextElem = currElem;
	        var isNextFound = false;
	        while (!isNextFound) {
	            nextElem = nextElem.parentNode;
	            if (nextElem) {
	                var nextSibling = nextElem.nextElementSibling
	                if (nextSibling) {
	                    currElem = nextSibling;
	                    isNextFound = true;
	                }
	            } else {
	                currElem = null;
	                isNextFound = true;
                }
	        }
	    }
	    if (currElem) {
	        if (currElem.tabIndex > -1) { //Сменить в будущем условие через параметр
                isDone = true;
            }
        } else {
	        isDone = true;
	    }
    }
    return currElem;
}