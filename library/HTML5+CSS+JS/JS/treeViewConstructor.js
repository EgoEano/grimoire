class TreeViewConstructor {
    constructor(containerID, options) {
        this.treeView = document.querySelector("#" + containerID);
        this.options = options || {
            nodeName: "entityName",
            childNodeName: "ChildNodes",
            classes: {
                containerClass: "dynamicTreeContainer",
                nodeClass: "dtvTile",
                nodeItemClass: "dtvTileItem",
                nodeFocusedClass: "dtvSelectedItem",
                ulClass: "dtvUl",
                liClass: "dtvLi",
                expandButtonClass: "dtvUl_btn",
                selectorCheckboxClass: "dtvUl_slct",
                dragNDropCurrent: "dtvSelectedItem",
                dragNDropGhost: "dtvDnD_ghost",
                dragNDropPointer: "dtvDnD_sep",
            }
        };

        //Container settings
        (this.options.classes.containerClass) ? this.setClasses(this.treeView, this.options.classes.containerClass) : null;

        //Tree li element
        this.treeElemLi = document.createElement("li");
        (this.options.classes.liClass) ? this.setClasses(this.treeElemLi, this.options.classes.liClass) : null;

        //Tree ul element
        this.treeElemUl = document.createElement("ul");
        (this.options.classes.ulClass) ? this.setClasses(this.treeElemUl, this.options.classes.ulClass) : null;

        //Tree node element
        this.treeElemNode = document.createElement("div");
        (this.options.classes.nodeClass) ? this.setClasses(this.treeElemNode, this.options.classes.nodeClass) : null;

        //Tree node item element
        this.treeElemItemNode = document.createElement("div");
        (this.options.classes.nodeItemClass) ? this.setClasses(this.treeElemItemNode, this.options.classes.nodeItemClass) : null;

        //Tree expander button
        this.expanderBtn = document.createElement("input");
        this.expanderBtn.type = "checkbox";
        (this.options.classes.expandButtonClass) ? this.setClasses(this.expanderBtn, this.options.classes.expandButtonClass) : null;

        //Node selector button
        this.selectorBtn = document.createElement("input");
        this.selectorBtn.type = "checkbox";
        (this.options.classes.selectorCheckboxClass) ? this.setClasses(this.selectorBtn, this.options.classes.selectorCheckboxClass) : null;

        //Drag&Drop separator
        this.dropTargetPointer = document.createElement("div");
        (this.options.classes.dragNDropPointer) ? this.setClasses(this.dropTargetPointer, this.options.classes.dragNDropPointer) : null;

        this.dataModel;

        this.clientEvents = undefined;

        this.isExpandable = false;
        this.expandedTreeLevel = -1; // -1 - all expanded, 0 - all collapsed, positive number - number of nodes to which the list is expanded

        this.isClickable = false;
        this.onSelectFunc = undefined;

        this.isSelectable = false;
        this.isFocusable = false;
        this.isDragAndDrop = false;
        this.onDropFunc = undefined;


        this.useRelativityLines = false;

        return this;
    }

    /* ------ Initialization ------ */

    init() {
        this.setClientEvents();
        this.buildTreeView();
        (this.isDragAndDrop) ? this.setDragAndDrop() : null;
    }

    Expandandable(lvl) {
        if (!isNaN(lvl)) {
            this.isExpandable = true;
            this.expandedTreeLevel = parseInt(lvl);
            return this;
        } else {
            console.error("setExpandingLevel only accepts numbers")
        }
    }

    Selectable() {
        this.isSelectable = true;
        return this;
    }

    Focusable() {
        this.isFocusable = true;
        return this;
    }

    ClientEvents(events) {
        this.clientEvents = events;
        return this;
    }

    setClientEvents() {
        if (this.clientEvents || this.isFocusable) {
            var self = this;
            // onSelect Area
            var selectBufr;
            var dropBufr;
            if (this.clientEvents?.onSelect) {
                try {
                    var dynamicFunc = new Function("return " + this.clientEvents.onSelect + ";");
                    if (dynamicFunc) {
                        this.isClickable = true;
                        selectBufr = this.clientEvents.onSelect.bind(this);
                    }
                } catch (ex) {
                    console.error(ex.message);
                }
            }

            //onNodeDrop Area
            if (this.clientEvents?.onNodeDrop) {
                try {
                    var dynamicFunc = new Function("return " + this.clientEvents.onNodeDrop + ";");
                    if (dynamicFunc) {
                        dropBufr = this.clientEvents.onNodeDrop.bind(this);
                    }
                } catch (ex) {
                    console.error(ex.message);
                }
            }

            //Final executing
            this.onSelectFunc = function (event, ...args) {
                if (selectBufr && typeof (selectBufr) === 'function') {
                    // Here is integrated:
                    // treeView class as context
                    // selected element as param1
                    // element's model data as param2
                    // event as last param
                    selectBufr(event.target, event.target.treeView.nodeData, ...args, event);
                }

                if (self.isFocusable) {
                    self.focusNode(event.target);
                }
                self.isDragStart = false;
            }

            this.onDropFunc = function (event, ...args) {
                if (dropBufr && typeof (dropBufr) === 'function') {
                    // Here is integrated:
                    // drop result data
                    dropBufr(...args, event);
                }
            }
        }
        return this;
    }

    DragAndDrop() {
        this.isDragAndDrop = true;
        return this;
    }

    setDragAndDrop() {
        this.isDragStart = false;
        this.isDragProcess = false;
        this.isDropAllowed = false;
        this.currentDraged = null;
        this.dropTarget = null;
        this.currentGhost = null;
        this.currentPointer = null;
        this.visitedNode = null;
        this.isAllowLeaveMasterNode = false;
        this.mousePos = {
            posX: 0,
            posY: 0,
            movX: 0,
            movY: 0,
        };
        this.startDragDelayer = (event) => {
            (this.isDragStart) ? this.startDrag(event) : null;
        };

        var isTouchScreen = window.matchMedia('(hover: none)').matches;
        if (isTouchScreen) {
            document.addEventListener("touchstart", this.startDragHandler.bind(this));
            document.addEventListener("touchmove", this.processDragHandler.bind(this));
            document.addEventListener("touchend", this.endDrag.bind(this));
        } else {
            document.addEventListener("mousedown", this.startDragHandler.bind(this));
            document.addEventListener("mousemove", this.processDragHandler.bind(this));
            document.addEventListener("mouseup", this.endDrag.bind(this));
        }
    }

    /* ------ Data & Models ------ */

    setModel(mdl) {
        var isArr = Array.isArray(mdl);
        this.dataModel = (isArr) ? mdl : [mdl];
        return this;
    }

    buildTreeView() {
        var self = this;
        this.treeView.innerHTML = "";
        this.nestingLvlIterator = -1;

        this.dataModel.forEach((nod) => {
            var trvw = this.createUlRecursion(nod);
            var ul = this.treeElemUl.cloneNode(true);
            ul.appendChild(trvw);
            this.treeView.appendChild(ul);
        })

        if (this.isExpandable) {
            this.addTreeExpandingAbilitty();
            window.addEventListener("DOMContentLoaded", () => {
                this.setExpandingLevel();

            });
        };
    }

    /* ------ Inner Functionality ------ */

    createUlRecursion(node) {
        this.nestingLvlIterator++;

        var li = this.treeElemLi.cloneNode(true);
        var tileDiv = this.treeElemNode.cloneNode(true);

        if (node[this.options.childNodeName] && node[this.options.childNodeName].length > 0) {
            var btn = this.expanderBtn.cloneNode(true);
            btn.classList.add("lvl_" + this.nestingLvlIterator);
            tileDiv.appendChild(btn);
        }

        if (this.isSelectable) {
            var slct = this.selectorBtn.cloneNode(true);
            slct.onclick = this.changeChildrenSelection.bind(this);
            tileDiv.appendChild(slct);
        }

        var textDiv = this.treeElemItemNode.cloneNode(true);
        textDiv.textContent = node[this.options.nodeName] || "";
        textDiv.treeView = { nodeData: node };
        tileDiv.appendChild(textDiv);

        if (this.isClickable || this.isFocusable) {
            textDiv.onclick = this.onSelectFunc;
        }

        li.appendChild(tileDiv);

        var children = node[this.options.childNodeName];
        if (children?.length > 0) {
            var ul = this.treeElemUl.cloneNode(true);
            children.forEach((child) => {
                var childLi = this.createUlRecursion(child);
                (childLi.innerHTML.length > 0) ? ul.appendChild(childLi) : null;
            });
            li.appendChild(ul);
        }
        this.nestingLvlIterator--;
        return li;
    }

    addTreeExpandingAbilitty() {
        document.addEventListener('click', (event) => {
            var btn = event.target;
            if (btn.classList.contains(this.options.classes.expandButtonClass)) {
                var ul = btn.parentNode.parentNode.querySelector("ul." + this.options.classes.ulClass);
                if (ul) {
                    var computedHeight = window.getComputedStyle(ul)["height"].replace("px", "") * 1.1;
                    ul.ulHeight = (!ul.ulHeight) ? computedHeight : ul.ulHeight;
                    this.toggleNode(ul, btn);
                }
            }
        });
    }

    setExpandingLevel() {
        var uls = document.querySelectorAll("." + this.options.classes.ulClass);
        uls.forEach((ul) => {
            var computedHeight = window.getComputedStyle(ul)["height"].replace("px", "") * 1.1;
            ul.ulHeight = computedHeight;
            ul.style.maxHeight = `${computedHeight}px`;

            var btn = ul.closest("li." + this.options.classes.liClass)?.querySelector("input[class*='lvl_']");
            if (ul && btn && this.expandedTreeLevel !== undefined) {
                switch (true) {
                    case (this.expandedTreeLevel === 0):
                        this.collapseNode(ul, btn);
                        break;

                    case (this.expandedTreeLevel > 0):
                        var nestingLevel = Array.from(btn.classList).find(i => i.includes('lvl_')).replace("lvl_", "");
                        (nestingLevel >= this.expandedTreeLevel) ? this.collapseNode(ul, btn) : null;
                        break;
                }
            }
        });
    }

    collapseNode(ul, btn) {
        ul.classList.add("collapsed");
        ul.querySelectorAll("." + this.options.classes.nodeItemClass).forEach((e) => {
            e.classList.add("inactive");
        });

        ul.style.maxHeight = `${ul.ulHeight}px`;
        ul.style.maxHeight = "0px";
        btn.checked = true;
    }

    expandNode(ul, btn) {
        ul.style.maxHeight = `${ul.ulHeight}px`;
        btn.checked = false;
        ul.classList.remove("collapsed");

        ul.querySelectorAll("." + this.options.classes.nodeItemClass).forEach((e) => {
            var collapsedCheck = e.closest("ul").classList.contains("collapsed");
            if (!collapsedCheck) {
                e.classList.remove("inactive");
            }
        });
    }

    toggleNode(ul, btn) {
        (btn.checked) ? this.collapseNode(ul, btn) : this.expandNode(ul, btn);
    }

    focusNode(newNode) {
        var oldNode = document.querySelector("." + this.options.classes.nodeFocusedClass);
        oldNode?.classList.remove(this.options.classes.nodeFocusedClass);
        (newNode) ? newNode.classList.add(this.options.classes.nodeFocusedClass) : undefined;
    }

    setClasses(elem, clsString) {
        var classes = clsString.split(" ");
        elem.classList.add(...classes);
    }

    changeChildrenSelection(event) {
        var state = event.target.checked;
        var currNode = event.target.closest("li." + this.options.classes.liClass);
        currNode.querySelectorAll("input[type='checkbox']." + this.options.classes.selectorCheckboxClass).forEach((e) => {
            e.checked = state;
        });

    }

    /* ------ Drag & Drop ------ */

    startDragHandler(event) {
        if (event.button !== 0) return;
        this.isDragStart = true;
        clearTimeout(this.startDragDelayer);
        setTimeout(this.startDragDelayer.bind(this, event), 170);
    }

    startDrag(event) {
        this.mousePos.posX = (event.touches) ? event.touches[0].clientX : event.clientX;
        this.mousePos.posY = (event.touches) ? event.touches[0].clientY : event.clientY;

        var trgt = event.target;
        if (trgt.classList?.contains(this.options.classes.nodeItemClass)) {
            this.isDragProcess = true;
            this.currentDraged = trgt;
            this.ghostDragChecking();
            document.documentElement.style.userSelect = "none";
        }
    }

    processDragHandler(event) {
        if (this.isDragStart) {
            this.isDragStart = false;
            this.startDrag(event)
        } else {
            this.processDrag(event)
        }
    }

    processDrag(event) {
        //Cursor movement checking
        var newPosX = (event.touches) ? event.touches[0].clientX : event.clientX;
        var newPosY = (event.touches) ? event.touches[0].clientY : event.clientY;
        var pos = this.mousePos;
        pos.movX = newPosX - pos.posX;
        pos.movY = newPosY - pos.posY;
        pos.posX = newPosX;
        pos.posY = newPosY;

        if (this.isDragProcess) {
            this.ghostDragChecking();
            this.nodePositionChecking();
            this.dropPossibilityChecking();
        }
    }

    endDrag() {
        this.dropFunctionality();

        //Set all on default
        this.isDragProcess = false;
        this.currentDraged?.classList.remove(this.options.classes.dragNDropCurrent);
        this.currentPointer?.remove();
        this.visitedNode?.classList.remove(this.options.classes.nodeFocusedClass);
        this.visitedNode, this.currentPointer, this.currentDraged = null;
        this.dropTarget = null;
        document.documentElement.style.userSelect = "auto";
        this.ghostDragChecking();
    }

    dropFunctionality() {
        if (this.isDragProcess && this.isDropAllowed) {
            //Caclulating index
            var index;
            //Inserting into list, or into node
            if (this.visitedNode) {
                index = this.visitedNode.treeView.nodeData[this.options.childNodeName]?.length || 0;
            } else {
                var pointerIndex = Array.prototype.indexOf.call(this.dropTarget.children, this.currentPointer);
                var isSameParent = this.currentDraged.closest("ul") == this.currentPointer.closest("ul");
                if (isSameParent) {
                    this.currentPointer?.remove();
                    var currIndex = Array.prototype.indexOf.call(this.currentDraged.closest("ul").children, this.currentDraged.closest("li"));
                    index = (pointerIndex > currIndex) ? pointerIndex - 1 : pointerIndex;
                } else {
                    index = pointerIndex;
                }
            };

            var dropData = {
                element: {
                    node: this.currentDraged,
                    data: this.currentDraged?.treeView.nodeData
                },
                target: {
                    node: this.visitedNode || this.dropTarget,
                    data: this.visitedNode?.treeView.nodeData || this.dropTarget?.parentNode.querySelector(`.${this.options.classes.nodeItemClass}`)?.treeView.nodeData,
                    index: index,
                },
            };
            this.onDropFunc(event, dropData);
        }
    }

    nodePositionChecking() {
        var pos = this.mousePos;
        var parentBorders = this.treeView.getBoundingClientRect();
        var isMatchX = pos.posX > parentBorders.left && pos.posX < parentBorders.right;
        var isMatchY = pos.posY > parentBorders.top && pos.posY < parentBorders.bottom;
        this.isDropAllowed = isMatchX && isMatchY;

        //Is cursor inside parent
        if (this.currentDraged && this.isDropAllowed) {
            var nodes = this.treeView.querySelectorAll(`.${this.options.classes.nodeItemClass}:not(.${this.options.classes.dragNDropGhost}):not(.inactive)`);
            this.currentPointer?.remove();
            this.currentPointer = null;
            var sep = this.dropTargetPointer.cloneNode(true);

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var dimens = node.getBoundingClientRect();
                var nextDimens = nodes[i+1]?.getBoundingClientRect();
                var innerUl = node.closest("li")?.querySelector("ul");

                // Checking that cursor is inside node
                if (
                    (pos.posX > dimens.left && pos.posX < dimens.right) &&
                    (pos.posY > dimens.top && pos.posY < dimens.bottom)
                ) {
                    //If curent node
                    if (node === this.currentDraged) {
                        this.isDropAllowed = false;
                        break;
                    }

                    //If parent node (still is allowed)
                    //var curParent = this.currentDraged.closest("ul").parentNode?.querySelector(`.${this.options.classes.nodeItemClass}`);
                    //if (curParent === node) {
                    //    this.isDropAllowed = false;
                    //    break;
                    //}

                    this.visitedNode = node;
                    this.visitedNode?.classList.add(this.options.classes.nodeFocusedClass);
                    break;
                } else {
                    this.visitedNode?.classList.remove(this.options.classes.nodeFocusedClass);
                    this.visitedNode = null;
                }

                //Find the node after which the determinant will be located
                if (pos.posY > dimens.top && pos.posY < (nextDimens?.top || dimens.bottom)) {
                    if (innerUl && !innerUl.classList.contains("collapsed")) {
                        innerUl.firstChild.insertAdjacentElement("beforebegin", sep);
                        this.dropTarget = innerUl;
                    } else {
                        node.parentNode.parentNode.insertAdjacentElement("afterend", sep);
                        this.dropTarget = node.closest("ul");
                    }
                    this.currentPointer = sep;
                    break;

                    // if the cursor leaves the list bottom
                } else if (pos.posY > nodes[nodes.length - 1].getBoundingClientRect().bottom) {
                    var erste = nodes[0].closest("li")?.querySelector("ul");
                    erste.lastChild.insertAdjacentElement("afterend", sep);
                    this.dropTarget = erste;
                    this.currentPointer = sep;
                    break;

                    // If cursor is higher than the list begins
                } else if (this.isAllowLeaveMasterNode && pos.posY < nodes[0].getBoundingClientRect().top) {
                    var ul = nodes[0].closest("ul");
                    ul.insertAdjacentElement("beforeend", sep);
                    this.dropTarget = undefined;
                    this.currentPointer = sep;
                    break;
                }
            }
        } else {
            this.currentPointer?.remove();
            this.currentPointer, this.visitedNode, this.dropTarget = null;
        }
    }

    ghostDragChecking() {
        if (this.currentDraged) {
            var pos = this.mousePos;
            this.currentDraged?.classList.add(this.options.classes.dragNDropCurrent);
            // Refresh or create ghost
            if (this.currentGhost) {
                var prepLeft = parseInt(this.currentGhost.style.left.replace("px", ""));
                var prepTop = parseInt(this.currentGhost.style.top.replace("px", ""));
                this.currentGhost.style.left = `${prepLeft + pos.movX}px`;
                this.currentGhost.style.top = `${prepTop + pos.movY}px`;

            } else {
                var currPos = this.currentDraged.getBoundingClientRect();

                this.currentGhost = this.currentDraged.cloneNode(true);
                this.currentGhost.classList.add(this.options.classes.dragNDropGhost, this.options.classes.dragNDropCurrent);

                this.currentGhost.style.position = "fixed";
                this.currentGhost.style.left = `${currPos.left}px`;
                this.currentGhost.style.top = `${currPos.top}px`;
                this.currentGhost.style.opacity = 0.5;

                this.treeView.appendChild(this.currentGhost);
            }
        } else {
            this.currentGhost?.remove();
            this.currentGhost = null;
        }
    }

    dropPossibilityChecking() {
        this.currentGhost.style.cursor = (this.isDropAllowed) ? "copy" : "not-allowed";
    }
}