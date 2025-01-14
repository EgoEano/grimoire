function initDraggability() {
	window.draggability = {};
	window.draggability.mousePos = {
		posX: 0,
		posY: 0,
		movX: 0,
		movY: 0,
	};
	window.draggability.current = null;

	var isTouchScreen = window.matchMedia('(hover: none)').matches;
	if (isTouchScreen) {
		document.addEventListener("touchstart", startDrag);
		document.addEventListener("touchmove", processDrag);
		document.addEventListener("touchend", endDrag);
	} else {
		document.addEventListener("mousedown", startDrag);
		document.addEventListener("mousemove", processDrag);
		document.addEventListener("mouseup", endDrag);
	}
}


function startDrag(event) {
	//Reading mouse position
	window.draggability.mousePos.posX = (event.touches) ? event.touches[0].clientX : event.clientX;
	window.draggability.mousePos.posY = (event.touches) ? event.touches[0].clientY : event.clientY;

	//Checking draggability permission
	var elem = event.target;
	if (elem.classList.contains("draggable")) {
		elem.style.position = "relative";
		var computed = window.getComputedStyle(elem);

		//Temporary ban for text selecting
		document.documentElement.style.userSelect = "none";

		//Elem highest on screen
		var zInd = computed.getPropertyValue("z-index");
		window.draggability.currentZInd = (zInd === "auto") ? 1 : zInd;
		elem.style.zIndex = 900;

		window.draggability.current = elem;
	}

}

function processDrag() {
	var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
	var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

	var newPosX = (event.touches) ? event.touches[0].clientX : event.clientX;
	var newPosY = (event.touches) ? event.touches[0].clientY : event.clientY;

	var pos = window.draggability.mousePos;
	pos.movX = newPosX - pos.posX;
	pos.movY = newPosY - pos.posY;
	pos.posX = newPosX;
	pos.posY = newPosY;

	var elem = window.draggability.current;
	if (elem) {
		var elemBorders = elem.getBoundingClientRect();
		var parentBorders = elem.parentNode.getBoundingClientRect();

		//Checking movements permission
		var isHorizontalForbidden = (elem.classList.contains("dragHorizLock") ||
			elemBorders.left + pos.movX < 0 ||
			elemBorders.right + pos.movX > viewportWidth ||
			(elem.classList.contains("dragParentLock") && elemBorders.left + pos.movX < parentBorders.left) ||
			(elem.classList.contains("dragParentLock") && elemBorders.right + pos.movX > parentBorders.right)
		) ? true : false;

		var isVerticalForbidden = (elem.classList.contains("dragVertLock") ||
			elemBorders.top + pos.movY < 0 ||
			elemBorders.bottom + pos.movY > viewportHeight ||
			(elem.classList.contains("dragParentLock") && elemBorders.top + pos.movY < parentBorders.top) ||
			(elem.classList.contains("dragParentLock") && elemBorders.bottom + pos.movY > parentBorders.bottom)
		) ? true : false;

		var computed = window.getComputedStyle(elem);
		var elemX = parseFloat(computed.getPropertyValue("left").replace("px", ""));
		var elemY = parseFloat(computed.getPropertyValue("top").replace("px", ""));
		elem.style.left = (isHorizontalForbidden) ? elemX + "px" : elemX + pos.movX + "px";
		elem.style.top = (isVerticalForbidden) ? elemY + "px" : elemY + pos.movY + "px";
	}
}

function endDrag() {
	var elem = window.draggability.current;
	if (elem) {
		//Returning zIndex as before, or default
		elem.style.zIndex = window.draggability.currentZInd || "auto";
		window.draggability.current = null;
	}
	//Return text selecting
	document.documentElement.style.userSelect = "auto";
}
