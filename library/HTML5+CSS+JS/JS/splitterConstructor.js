// This is description of complicated parameters
var panelsParamDescription = {
    size: "This is width or height of panel (optionally). You can use all standart html points. Defaultly panels are split evenly",
    panelAttributes: {
        class: ["Add", "needed", "classes"],
        id: "Set ID",
        style: "You can use your own style string (optionally)",
    },
    panelTemplate: "You can use your own template for body cells (optionally) - all row data will be inputted into template. Use html syntax, and set this tag into html '<#=param#>' for using 'param' data parameter",
};

class SplitterConstructor {
    constructor(containerID) {
        this.splitter = document.querySelector("#" + containerID);
        this.PanelsProperties = [];
        this.splitterOrientation = undefined;

        //switch (this.splitterOrientation) {
        //    case ("vertical"):
        //        separator.style.height = "8px";
        //        separator.style.width = "100%";
        //        separator.style.cursor = "ns-resize";
        //        break;
        //    case ("horizontal"):
        //        separator.style.height = "100%";
        //        separator.style.width = "8px";
        //        separator.style.cursor = "ew-resize";
        //        break;
        //}


        return this;
    }

    init() {
        //this.drawPanels();
        this.initDraggability();
        this.attachPanes();
    }

    Orientation(ori) {
        this.splitter.style.display = "flex";
        this.splitter.style.flexWrap = "nowrap";
        switch (ori) {
            case ("horizontal"):
                this.splitterOrientation = ori;
                this.splitter.style.flexDirection = "row";
                break;
            case ("vertical"):
                this.splitterOrientation = ori;
                this.splitter.style.flexDirection = "column";
                break;
        }
        return this;
    }

    attachPanes() {
        // Панели должны изменять свои размеры согласно движениям разделителя
        // Должна присутствовать петля обратной связи:
        //      разделитель двигается и делает запрос к панелям
        //      Если панель не конфликтует (достигла граничных значений, коллизия) - возвращает true. Иначе - false.
        //      Если панель дала добро - разделитель двигается
        //
        //      Движение разделителя говорит 
        this.splitter.querySelectorAll(".splitter").forEach((e) => {
            console.log(e);
        });
    }
    //setPanels(panelsParam) {
    //    // Empty checking
    //    var panCount = panelsParam.length;
    //    if (panCount) {
    //        this.splitterPanelsCount = panCount;
    //        this.splitterPanelsParam = panelsParam;
    //    } else {
    //        return;
    //    }
    //    return this;
    //}

    //drawPanels() {
    //    this.splitterPanelsParam.forEach((elem, index) => {
    //        var panInfo = {};
    //        var pan = document.createElement("div");
    //        pan.style.flex = "1";
    //        //this.setBasisStyle(pan, "cell");  //This method append important styles to element
    //        pan.classList.add("splitterPanel");  //This style add custom designs for this element type

    //        //If width isn't specified in parameters, sets 1fr
    //        var setWidth = elem.size || "1fr";

    //        //Inner columns info parameters
    //        panInfo.size = setWidth;

    //        this.PanelsProperties.push(panInfo);

    //        var titleWrapper = document.createElement("div");
    //        titleWrapper.innerHTML = elem.title;

    //        this.splitter.appendChild(pan);
    //    });

    //    var separator = document.createElement("div");
    //    switch (this.splitterOrientation) {
    //        case ("vertical"):
    //            separator.style.height = "8px";
    //            separator.style.width = "100%";
    //            separator.style.cursor = "ns-resize";
    //            break;
    //        case ("horizontal"):
    //            separator.style.height = "100%";
    //            separator.style.width = "8px";
    //            separator.style.cursor = "ew-resize";
    //            break;
    //    }
    //    separator.classList.add("dragVertLock"); //Insert draggability into splitter
    //    var childs = this.splitter.childNodes;

    //    if (childs.length > 1) {
    //        for (var i = 1; i <= childs.length - 1; i+=2) {
    //            this.splitter.insertBefore(separator.cloneNode(true), childs[i]);
    //        };
    //    }
    //}


    /* ----- Draggability ----- */
    initDraggability() {
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
            document.addEventListener("touchstart", this.startDrag.bind(this), false);
            document.addEventListener("touchmove", this.processDrag.bind(this), false);
            document.addEventListener("touchend", this.endDrag.bind(this), false);
        } else {
            document.addEventListener("mousedown", this.startDrag.bind(this), false);
            document.addEventListener("mousemove", this.processDrag.bind(this), false);
            document.addEventListener("mouseup", this.endDrag.bind(this), false);
        }
    }

    startDrag(event) {
        window.draggability.mousePos.posX = (event.touches) ? event.touches[0].clientX : event.clientX;
        window.draggability.mousePos.posY = (event.touches) ? event.touches[0].clientY : event.clientY;

        var elem = event.target;
        if (elem.classList.contains("splitter")) {
            elem.style.position = "relative";
            var computed = window.getComputedStyle(elem);

            document.documentElement.style.userSelect = "none";

            var zInd = computed.getPropertyValue("z-index");
            window.draggability.currentZInd = (zInd === "auto") ? 1 : zInd;
            elem.style.zIndex = 900;

            window.draggability.current = elem;
        }
    }

    processDrag(event) {
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
            var isHorizontalForbidden = false;
            if (this.splitterOrientation === "vertical") {
                isHorizontalForbidden = true;
            } else {
                isHorizontalForbidden = 
                    elemBorders.left + pos.movX < 0 ||
                    elemBorders.right + pos.movX > viewportWidth ||
                    (elemBorders.left + pos.movX < parentBorders.left) ||
                    (elemBorders.right + pos.movX > parentBorders.right);
            }

            var isVerticalForbidden = false;
            if (this.splitterOrientation === "horizontal") {
                isVerticalForbidden = true;
            } else {
                isVerticalForbidden =
                    elemBorders.top + pos.movY < 0 ||
                    elemBorders.bottom + pos.movY > viewportHeight ||
                    (elemBorders.top + pos.movY < parentBorders.top) ||
                    (elemBorders.bottom + pos.movY > parentBorders.bottom);
            };

            var computed = window.getComputedStyle(elem);
            var elemX = parseFloat(computed.getPropertyValue("left").replace("px", ""));
            var elemY = parseFloat(computed.getPropertyValue("top").replace("px", ""));
            elem.style.left = (isHorizontalForbidden) ? elemX + "px" : elemX + pos.movX + "px";
            elem.style.top = (isVerticalForbidden) ? elemY + "px" : elemY + pos.movY + "px";
        }
    }

    endDrag() {
        var elem = window.draggability.current;
        if (elem) {
            elem.style.zIndex = window.draggability.currentZInd || "auto";
            window.draggability.current = null;
        }
        document.documentElement.style.userSelect = "auto";
    }
}