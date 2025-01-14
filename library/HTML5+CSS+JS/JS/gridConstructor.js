// This is description of complicated parameters
var columnParamDescription = {
    title: "This is name of column in header",
    parameter: "Parameter name, which will be binded by input data model. Value of this parameter will filling rows",
    width: "This is width of column (optionally). You can use all standart html points. Default - 1fr",
    headerTemplate: "You can use your own template for header cells (optionally) - it will replace title. Use html syntax",
    headerAttributes: {
        "description": "You can use your own attributes for header (optionally)",
        class: ["Add", "needed", "classes"],
        id: "Set ID",
        style: "You can use your own style string (optionally)",
    },
    bodyTemplate: "You can use your own template for body cells (optionally) - all row data will be inputted into template. Use html syntax, and set this tag into html '<#=param#>' for using 'param' data parameter",
    bodyAttributes: {
        "description": "You can use your own attributes for body (optionally)",
        class: ["Add", "needed", "classes"],
        id: "Set ID",
        style: "You can use your own style string (optionally)",
    },
};

var footerParamDescription = {
    title: "This is name of footer",
    parameter: "Parameter name, which will be binded by input data model. Value of this parameter will fill footer",
    template: "You can use your own template for footer (optionally) - it will replace title. Use html syntax",
    attributes: {
        "description": "You can use your own attributes for footer (optionally)",
        class: ["Add", "needed", "classes"],
        id: "Set ID",
        style: "You can use your own style string (optionally)",
    },
};

var searchabilityParamsDescription = {
    "method": "form/field - Currently implemented only for form.",
    "type": "local/global - Currently implemented only for local. Global may be no needed.",
    "buttonSelectorSubmit": "selector, which will be used to find button inside form",
    "onSubmit": "functionality which will be used after button click",
    "buttonSelectorClear": "selector, which will be used to find button inside form",
    "onClear": "functionality which will be used after button click",
    "buttonSelectorReset": "selector, which will be used to find button inside form",
    "onReset": "functionality which will be used after button click",
};

class GridConstructor {
    //#FIXME May be add just one listener for every type, and append needed functionality into them?
    /**
     * This class realize dynamic grid constructor for server data
     * @param {any} containerID
     * @returns
     */
    constructor(containerID, options) {
        this.options = {
            gridClass: "dynamicGridCommon",
            gridHeaderClass: "dynamicGridHeader",
            gridHeaderCellClass: "dynamicGridHeaderCell",
            gridBodyClass: "dynamicGridBody",
            gridBodyCapClass: "dynamicGridBody_BodyCap",
            gridRowClass: "dynamicGridRow",
            gridRowCellClass: "dynamicGridRowCell",
            gridFooterClass: "dynamicGridFooter",

            filterClass: "dynamicGridFormsFilter",
            searchClass: "grid-search",
            searchMarkedRowClass: "dynamicGridRowMarked", //In css use combined class with 'gridRowClass'

            gridRowInsertClass: "dynamicGrid_NewRow",

            pagerWidgetClass: "dynamicGrid_PageWidget",
            pagerWidgetPagerClass: "dynamicGrid_PageWidget_Pager",
            pagerWidgetPagesFieldClass: "dynamicGrid_PageWidget_PagesField",
            pagerWidgetTileClass: "dynamicGrid_PageWidget_Icon",
            pagerWidgetButtonClass: "dynamicGrid_PageWidget_Btn",
            pagerWidgetPageButtonClass: "dynamicGrid_PageWidget_PgBtn",
            pagerWidgetPageButtonCurrentClass: "dynamicGrid_PageWidget_PgBtn_Current",
            pagerWidgetRefresherClass: "dynamicGrid_PageWidget_Refresh",
            pagerWidgetNaviFirstClass: "dynamicGrid_PageWidget_First",
            pagerWidgetNaviFirstDisabledClass: "dynamicGrid_PageWidget_First_Dis",
            pagerWidgetNaviPreviousClass: "dynamicGrid_PageWidget_Prev",
            pagerWidgetNaviPreviousDisabledClass: "dynamicGrid_PageWidget_Prev_Dis",
            pagerWidgetNaviNextClass: "dynamicGrid_PageWidget_Next",
            pagerWidgetNaviNextDisabledClass: "dynamicGrid_PageWidget_Next_Dis",
            pagerWidgetNaviLastClass: "dynamicGrid_PageWidget_Last",
            pagerWidgetNaviLastDisabledClass: "dynamicGrid_PageWidget_Last_Dis",
            pagerWidgetAddressedPageInputClass: "dynamicGrid_PageWidget_addressedPageInput",
            pagerWidgetAddressedPageInputButtonClass: "dynamicGrid_PageWidget_addressedPageInputButton",
            pagerWidgetInfoFieldClass: "dynamicGrid_PageWidget_InfoField",
        };

        if (options) {
            var keys = Object.keys(options) || [];
            keys.forEach((k) => {
                var opt = options[k];
                if (opt) this.options[k] = opt;
            });
        }

        this.grid = document.querySelector("#" + containerID);
        this.grid.classList.add(this.options.gridClass);  

        this.header = document.createElement("div");
        this.header.classList.add(this.options.gridHeaderClass);  
        this.grid.appendChild(this.header);

        this.body = document.createElement("div");
        this.body.classList.add(this.options.gridBodyClass);  

        this.bodyCap = document.createElement("div");
        this.bodyCap.classList.add(this.options.gridBodyCapClass);
        this.bodyCapActivate("Запуск...");

        this.grid.appendChild(this.body);

        this.footer = document.createElement("div");
        this.footer.classList.add(this.options.gridFooterClass);  

        this.grid.appendChild(this.footer);

        this.columnsProperties = [];
        this.gridColumnsParam;
        this.gridColumnsCount;
        this.columnTemplate = "";
        this.gridFooterParam;

        this.dataModelName;
        this.dataModel = {};
        this.isRefreshingData = false;
        this.isDataSettedManually = false;
        this.dataBindingAddress;
        this.dataBindingActions;
        this.dataResult;
        this.dataRows;
        this.dataComputedRows = [];

        this.pageCurrent = 1;
        this.pageSizeCurrent = 20;

        this.currentGridHeight;

        this.sortabilityArea;
        this.sortingCurrColIndex;

        this.selectabilitySelector = undefined;

        this.Pageability = false;
        this.Filterability = false;
        this.Searchability = false;
        this.Scrollability = false;
        this.Sortability = false;
        this.Selectability = false;

        return this;
    }

    /* ------ Initialization ------ */

    init() {  // This method always need to add after all functions
        this.drawColumns();
        this.drawFooter();
        this.setPageability();
        this.setFilterability();
        this.setSearchability();
        this.setScrollability();
        (this.isDataSettedManually) ? this.rowFilling(this.dataRows) : this.dataRefresher();
    }

    setColumns(columnParam) {
        // Empty checking
        var colCount = columnParam.length;
        if (colCount) {
            this.gridColumnsCount = colCount;
            this.gridColumnsParam = columnParam;
        } else {
            return;
        }
        return this;
    }

    drawColumns() {
        //Create Header
        this.gridColumnsParam.forEach((elem, index) => {
            var colInfo = {};  
            var clmn = document.createElement("div");
            clmn.classList.add(this.options.gridHeaderCellClass);  

            //Set custom Attributes
            if (elem.headerAttributes) {

                var classes = elem.headerAttributes.class;
                if (classes && classes.length > 0) {
                    classes.forEach((cls) => {
                        clmn.classList.add(cls);
                    });
                }

                var setId = elem.headerAttributes.id;
                if (setId && setId.length > 0) {
                    clmn.id = setId;
                }

                var setStyle = elem.headerAttributes.style;
                if (setStyle && setStyle.length > 0) {
                    var buffer = clmn.getAttribute("style") || "";
                    clmn.setAttribute("style", buffer + " " + setStyle);
                }
            }

            //If width isn't specified in parameters, sets 1fr
            var setWidth = elem.width || "1fr";
            this.columnTemplate += setWidth + " ";

            //Inner columns info parameters
            colInfo.name = elem.title;
            colInfo.width = setWidth;

            if (elem.parameter) {
                colInfo.parameter = elem.parameter;
            }

            if (elem.bodyTemplate) {
                colInfo.bodyTemplate = elem.bodyTemplate;
            }

            if (elem.bodyAttributes) {
                colInfo.bodyAttributes = elem.bodyAttributes;
            }

            this.columnsProperties.push(colInfo); // #FIXME Возможно ненужный дубликат параметров, уточнить. 

            var titleWrapper = document.createElement("div");
            titleWrapper.innerHTML = elem.title;

            clmn.innerHTML = elem.headerTemplate || titleWrapper.outerHTML;

            var isSortingForbidden = clmn.classList.contains("noneSortable");
            if (this.Sortability && this.sortabilityArea && !isSortingForbidden) {
                clmn.style.cursor = "pointer";
                clmn.style.userSelect = "none";
                clmn.innerHTML += "&nbsp;↕";
                clmn.dynamicGrid = {
                    sortablilty: {
                        param: clmn.dataset?.parameter,
                        order: 0
                    },
                };
                switch (this.sortabilityArea) {
                    case ("local"):
                        clmn.onclick = () => {
                            this.rowsSorting(index);
                        };
                        break;
                    case ("global"):
                        clmn.onclick = () => {
                            this.rowsOrderBy(index, clmn);
                        };
                        break;
                }
            }
            this.header.appendChild(clmn);
        })
        this.header.style.display = "grid";
        this.header.style.gridTemplateColumns = this.columnTemplate;
        return this;
    }

    setFooter(footerParam) {
        this.gridFooterParam = footerParam;
        return this;
    }

    drawFooter() {
        if (this.gridFooterParam) {
            if (this.gridFooterParam.attributes) {

                var classes = this.gridFooterParam.attributes.class;
                if (classes && classes.length > 0) {
                    classes.forEach((cls) => {
                        this.footer.classList.add(cls);
                    });
                }

                var setId = this.gridFooterParam.attributes.id;
                if (setId && setId.length > 0) {
                    this.footer.id = setId;
                }

                var setStyle = this.gridFooterParam.attributes.style;
                if (setStyle && setStyle.length > 0) {
                    var buffer = this.footer.getAttribute("style") || "";
                    this.footer.setAttribute("style", buffer + " " + setStyle);
                }
            }
            this.footer.innerHTML = this.gridFooterParam.template || this.gridFooterParam.title || "";
        }
    }

    rowFilling(rows) {
        //Create Body
        this.body.innerHTML = "";
        if (rows.length === 0) {
            this.bodyCapActivate("Нет данных");
            (this.Pageability) ? this.pageWidgetArchitector() : null;
            this.pageCurrent = 1;
            return;
        }

        rows.forEach((rowData) => {
            //Creating row
            var row = document.createElement("div");
            row.classList.add(this.options.gridRowClass);  
            row.style.display = "grid";
            row.style.gridTemplateColumns = this.columnTemplate;

            //Creating cells
            this.columnsProperties.forEach((cellInfo) => {
                var cell = document.createElement("div");
                cell.classList.add(this.options.gridRowCellClass);  

                //Set custom Attributes
                if (cellInfo.bodyAttributes) {

                    var classes = cellInfo.bodyAttributes.class;
                    if (classes && classes.length > 0) {
                        classes.forEach((cls) => {
                            cell.classList.add(cls);
                        });
                    }

                    var setId = cellInfo.bodyAttributes.id;
                    if (setId && setId.length > 0) {
                        cell.id = setId;
                    }

                    var setStyle = cellInfo.bodyAttributes.style;
                    if (setStyle && setStyle.length > 0) {
                        var buffer = cell.getAttribute("style") || "";
                        cell.setAttribute("style", buffer + " " + setStyle);
                    }
                }

                //Custom Template
                if (cellInfo.bodyTemplate) {
                    var customHTML = cellInfo.bodyTemplate;
                    var masteredHTML = customHTML;
                    var customOpeningTag = "<#=";
                    var customEndingTag = "#>";

                    //Is have custom Tags
                    var entries = this.findAllEntries(customHTML, customOpeningTag);
                    entries.forEach((openingIndex) => {
                        var endingIndex = customHTML.indexOf(customEndingTag, openingIndex);
                        var nextOpeningIndex = customHTML.indexOf(customOpeningTag, openingIndex + customOpeningTag.length);
                        var isHaveNewOpening = nextOpeningIndex > 0 && nextOpeningIndex < endingIndex;

                        if (endingIndex !== -1 && !isHaveNewOpening) {
                            var paramTag = customHTML.substring(openingIndex, endingIndex + customEndingTag.length);
                            var paramName = paramTag.replace(customOpeningTag, "").replace(customEndingTag, "").trim();

                            var prop = rowData[paramName];
                            prop = this.resultParser(prop);
                            // If this parameter is in dict - just replace, else - deep analysis
                            if (prop) {
                                masteredHTML = masteredHTML.replace(paramTag, (prop || ""));
                            } else {
                                var analyzStr = this.stringAnalyzer(paramName);
                                if (analyzStr.isValid) {
                                    switch (true) {
                                        case (analyzStr.signs.variable):
                                            masteredHTML = masteredHTML.replace(paramTag, "");
                                            break;
                                        case (analyzStr.signs.func || analyzStr.signs.tern):
                                            var result = this.stringFuncExecutor(analyzStr, rowData);
                                            result = this.resultParser(result);
                                            masteredHTML = masteredHTML.replace(paramTag, result || "");
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        }
                    });
                    cell.innerHTML = masteredHTML;
                }
                else {
                    var prop = rowData[cellInfo.parameter];
                    prop = this.resultParser(prop);
                    cell.innerHTML = prop || "";
                }
                row.appendChild(cell);
            });
            this.body.appendChild(row);

        });
        this.fillComputedRows();
        if (this.Searchability) { this.searchRows(); }
        return this;
    }

    /* ------ Functionality ------ */
    //Pageability
    setPageability() {
        if (this.Pageability) {
            //Creating Pager widget
            this.pageWidgetArchitector();

            //Setting page parameters
            var sizeParam = {
                [this.pagerModelName]: {
                    [this.pagerName]: this.pageCurrent,
                    [this.pagerSizeName]: this.pageSizeCurrent
                }
            };
            this.modelRefresher(sizeParam);
        }
    }

    Pageable(opt) { //#FIXME Add types of pageability - global/local
        this.Pageability = true;
        var testo = {
            type: "global/local",
            model: {
                "search": {
                    iPageNum: 1,
                    iPageSize: 20,
                    Total: 0
                }

            },
        };

        var options = opt || {  // This is default model, and the example for paging model. You can use your in opt.
            "search": {
                iPageNum: 1,
                iPageSize: 20,
                Total: 0
            }
        };

        this.pagerOptionsDefault = options;
        this.pagerModelName = Object.keys(options);
        var pagerNames = Object.keys(options[this.pagerModelName]);
        this.pagerName = pagerNames[0];
        this.pagerSizeName = pagerNames[1];
        this.pagerTotalName = pagerNames[2];

        this.pageSizeCurrent = this.pagerOptionsDefault[this.pagerModelName][this.pagerSizeName] || 20;
        return this;
    }

    refreshPage(pageNum, pageSize) {
        this.pageCurrent = pageNum || this.pageCurrent;
        this.pageSizeCurrent = pageSize || this.pageSizeCurrent;
        var sizeParam = {
            [this.pagerModelName]: {
                [this.pagerName]: this.pageCurrent,
                [this.pagerSizeName]: this.pageSizeCurrent
            }
        };

        this.modelRefresher(sizeParam);
        this.dataRefresher();
        return this;

    }

    //Filterability
    setFilterability() {
        if (this.Filterability && this.filterabilityParams) {
            switch (this.filterabilityParams.method || "form") {  //  Forms is default
                case ("form"):
                    // For forms fields updates the data model, you need to append class "filterClass" into form class list.
                    document.addEventListener("submit", (event) => {
                        if (event.target.classList.contains(this.options.filterClass)) {
                            this.pageCurrent = 1;
                            var params = {
                                [this.dataModelName]: this.dataCollectorThruForm(event.target),
                                [this.pagerModelName]: {
                                    [this.pagerName]: this.pageCurrent,
                                },
                            };
                            this.modelRefresher(params);
                            this.dataRefresher();
                        }
                    });

                    document.addEventListener("click", (event) => {
                        var btn = event.target;
                        var frm = btn.closest("form." + this.options.filterClass);
                        if (frm) {
                            switch (true) {
                                case (btn.matches(this.filterabilityParams.buttonSelectorSubmit)): //This one is not used, cause of submit listener
                                    if (this.filterabilityParams.onSubmit) {
                                        this.filterabilityParams.onSubmit(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.filterabilityParams.buttonSelectorClear)):
                                    if (this.filterabilityParams.onClear) {
                                        this.filterabilityParams.onClear(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.filterabilityParams.buttonSelectorReset)):
                                    if (this.filterabilityParams.onReset) {
                                        this.filterabilityParams.onReset(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.filterabilityParams.buttonSelectorClose)):
                                    if (this.filterabilityParams.onClose) {
                                        this.filterabilityParams.onClose(event, frm, btn);
                                    }
                                    break;
                            };
                        }
                    });
                    break;
                case ("map"):  // In this case you need prepare fields with ids, and provide a dict parameter_name: element_id
                    this.dataCollectorThruSearching();  // Unimplemented stub
                    break;
            }
        }
    }

    Filterable(params) {
        this.Filterability = true;
        this.filterabilityParams = params || {
            "method": "form",

            "buttonSelectorSubmit": "button[type='submit']",
            "onSubmit": undefined,

            "buttonSelectorClear": "button[data-action='clearFilter']",
            "onClear": (event, frm, btn) => {
                frm.reset();
            },

            "buttonSelectorReset": "button[data-action='resetFilter']",
            "onReset": (event, frm, btn) => {
                frm.reset();
                frm.submit();
            },

            "buttonSelectorClose": "button[data-action='closeFilter']",
            "onClose": undefined,
        };
        return this;
    }

    //Searchability
    setSearchability() {
        if (this.Searchability && this.searchabilityParams) {
            switch (this.searchabilityParams.method || "form") { // Currently implemented only for forms
                case ("form"):
                    document.addEventListener("submit", (event) => {
                        if (event.target.classList.contains(this.options.searchClass)) {
                            this.searchRows(event.target);
                        }
                    });

                    document.addEventListener("click", (event) => {
                        var btn = event.target;
                        var frm = btn.closest("form." + this.options.searchClass);
                        if (frm) {
                            switch (true) {
                                case (btn.matches(this.searchabilityParams.buttonSelectorSubmit)): //This one is not used, cause of submit listener
                                    if (this.searchabilityParams.onSubmit) {
                                        this.searchabilityParams.onSubmit(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.searchabilityParams.buttonSelectorClear)):
                                    if (this.searchabilityParams.onClear) {
                                        this.searchabilityParams.onClear(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.searchabilityParams.buttonSelectorReset)):
                                    if (this.searchabilityParams.onReset) {
                                        this.searchabilityParams.onReset(event, frm, btn);
                                    }
                                    break;
                                case (btn.matches(this.searchabilityParams.buttonSelectorClose)):
                                    if (this.searchabilityParams.onClose) {
                                        this.searchabilityParams.onClose(event, frm, btn);
                                    }
                                    break;
                            };
                        }
                    });
                    break;

                case ("field"):  // Unimplemented stub
                    break;
            }
        }
    }

    Searchable(params) {
        this.Searchability = true;
        this.searchabilityParams = params || {
            "method": "form",
            "type": "local",

            "buttonSelectorSubmit": "button[type='submit']",
            "onSubmit": undefined,

            "buttonSelectorClear": "button[data-action='clearFilter']",
            "onClear": (event, frm, btn) => {
                frm.reset();
            },

            "buttonSelectorReset": "button[data-action='resetFilter']",
            "onReset": (event, frm, btn) => {
                frm.reset();
                frm.submit();
            },

            "buttonSelectorClose": "button[data-action='closeFilter']",
            "onClose": undefined,
        };
        return this;
    }

    //Scrollability
    setScrollability() {
        if (this.Scrollability && this.currentGridHeight) {
            var self = this;
            this.grid.style.minHeight = "100px";
            this.grid.style.maxHeight = this.currentGridHeight;
            this.body.style.overflowY = "scroll";

            document.addEventListener("DOMContentLoaded", () => {
                var scrollbarWidth = (self.body.offsetWidth - self.body.clientWidth) || 10;  //If grid is not displayed, scrollbarWidth will be undefined. In this case we use Magic number
                self.header.style.gridTemplateColumns = `${self.columnTemplate} ${scrollbarWidth}px`;
            })
        }
    }

    Scrollable(gridHeight) {
        this.Scrollability = true;
        var allowedheight = window.innerHeight - this.grid.offsetTop + "px";
        this.currentGridHeight = gridHeight || allowedheight || "100%";
        return this;
    }

    //Sortability
    Sortable(options) {
        this.Sortability = true;
        this.sortabilityOptions = options || {
            type: "local",
            paramName: "vcOrderPart",
        }

        switch (this.sortabilityOptions.type) {
            case ("local"):  // Sorting only loaded data rows
                this.sortabilityArea = "local";
                break;
            case ("global"):  // Sorting by "order by" parameter in sql requests
                this.sortabilityArea = "global";
                break;
        }
        return this;
    }

    //Selectability
    Selectable(selector) {
        //Set a selector, that will be used for searching checkboxes on grid
        this.Selectability = true;
        this.selectabilitySelector = selector;
        return this;
    }

    getSelectedList() {
        if (this.Selectability && this.selectabilitySelector) {
            var selectedData = [];
            var rowsArr = Array.from(this.body.children);
            var elements = this.body.querySelectorAll(this.selectabilitySelector);
            elements.forEach((e) => {
                var row = e.closest(`.${this.options.gridRowClass}`);
                var index = rowsArr.indexOf(row);
                selectedData.push({
                    node: row,
                    data: this.dataRows[index],
                });
            });
            return selectedData;
        } else {
            console.error("You must initialize Selectable method, and set checkbox selector, before init");
        }
    }


    /* ------ Data & Models ------ */

    modelBinding(modelName, model) {
        //  Here you have to set the main data model name
        //  And optionally you can set model, which be used in first grid building
        //
        //  In razor pages you need to convert model into json type through razor syntax - "@Html.Raw(Json.Encode(Model))"
        //  Where Model - is the linked model from page, or new exemplair.
        if (modelName) {
            this.dataModelName = modelName;
            this.dataModel[this.dataModelName] = model || {};
            return this;
        } else {
            console.error("You must set the name of the main data model.");
            return null;
        }
    }

    dataBinding(url, actions) {
        //Actions is used for customization of data loading process
        this.dataBindingAddress = url;
        if (actions) {
            try {
                var keys = (actions && typeof actions === 'object') ? Object.keys(actions) : [];

                if (keys.length == 0) throw new Error("You must specify an object with actions!");

                keys.forEach((key) => {
                    //Check areas availability and compilability
                    var area = actions[key];
                    if (area && typeof area === "function") new Function("return (" + area + ")");
                });
            } catch (ex) {
                console.error(ex);
                throw new Error("The specified functions does not compile. Check your input!");
            }
            this.dataBindingActions = actions;
        }
        return this;
    }

    modelRefresher(params) {
        for (let modl in params) {
            for (let k in params[modl]) {
                this.dataModel[modl] = this.dataModel[modl] || {};
                this.dataModel[modl][k] = params[modl][k];
            }
        }
        return this;
    }

    dataModelRefresher(params) {
        if (this.dataModelName) {
            for (let k in params) {
                this.dataModel[this.dataModelName][k] = params[k];
            }
            return this;
        } else {
            console.error("To update a bound model you must set its name via the 'modelBinding()' method, before init().");
            return null;
        }
    }

    modelCleaner() {  //#FIXME Not ready yet 
        for (let modl in this.dataModel) {
            for (let k in this.dataModel[modl]) {
                this.dataModel[modl][k] = null;
            }
        }
        return this;
    }

    dataRefresher(options) {
        if (!this.dataBindingAddress && !options?.url) {
            console.error("To refresh data by get/post method, you must set URL through options, or set binding address through 'dataBinding()' method, before init().");
            return null;
        }

        this.isRefreshingData = true;
        this.bodyCapActivate("Загрузка...");
        if (this.dataBindingActions?.onStart) this.dataBindingActions.onStart();
        options = options || {};
        this.ajaxRequest({
            url: options.url || this.dataBindingAddress,
            method: 'POST',

            data: options.params || this.dataModel || "",

            success: (data) => {
                this.dataRows = data.Data || data.data || data;
                this.dataResult = data;
                this.grid.dataResult = data;
                this.rowFilling(this.dataRows);
                (this.Pageability) ? this.pageWidgetRefresher(data[this.pagerTotalName]) : null;
                if (this.sortabilityArea === "local") { this.sortingCurrColIndex = undefined };
                this.isRefreshingData = false;
                if (this.dataBindingActions?.onSuccess) this.dataBindingActions.onSuccess(data);
            },

            error: (error) => {
                this.bodyCapActivate("Ошибка загрузки");
                this.isRefreshingData = false;
                if (this.dataBindingActions?.onError) this.dataBindingActions.onError(error);
            }, 

            complete: (data) => {
                if (this.dataBindingActions?.onComplete) this.dataBindingActions.onComplete(data);
            }
        });
        return this;
    }

    setData(dataArr) {
        this.isDataSettedManually = true;
        this.dataRows = dataArr;
        return this;
    }

    ajaxRequest(options) {
        var headers;
        var data;
        switch (options.type || "json") {  //  Default header and data type is for Json data type
            case "json":
                headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
                data = JSON.stringify(options.data);
                break;
            case "string":
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                data = Object.keys(options.data)
                    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]))
                    .join('&');
                break;
            case "multipart":
                headers = undefined;
                data = options.data;
                break;
        }

        return fetch(options.url, {
            method: options.method || 'POST', //  Default method is POST
            headers: headers,
            cache: options.cache || 'no-cache',  //  Defaultly don't use cache
            redirect: options.redirect || 'follow', //  Defaultly allow redirect
            credentials: options.credentials || 'same-origin', //  Defaultly don't allow third party data
            body: options.data ? data : undefined,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fetch request. Network response was not ok');
                }
                var header = response.headers.get('content-type');
                switch (true) {
                    case header.includes('application/json'):
                        return response.json();
                        break;
                    case header.includes('text/html'):
                        return response.text();
                        break;
                    default:
                        throw new Error('Fetch request. Invalid content type.');
                        return null;
                        break;
                }
            })
            .then(data => {
                if (options.success) {
                    return options.success(data);
                }
            })
            .catch(error => {
                if (options.error) {
                    return options.error(error);
                }
            })

            .finally(() => {
                if (options.complete) {
                    return options.complete();
                }
            });
    }

    dataOutProvider(index) {
        if (this.dataResult) {
            if (index) {
                return this.dataResult[index];
            } else {
                return this.dataResult;
            }
        } else {
            return null;
        }
    }

    dataCollectorThruForm(inputForm) {
        var regExIntFloat = /^\d+(\.\d+)?$/;
        var form = new FormData(inputForm);
        var formData = {};
        Array.from(inputForm.elements).forEach(function (element) {
            if (element.type === 'checkbox') {
                form.append(element.name, element.checked);
            }
        });

        form.forEach((value, key) => {
            var compVal;
            switch (true) {
                case (typeof value === "string" && (value.toLowerCase() === "true" || value.toLowerCase() === "false")):
                    compVal = value === "true";
                    break;
                case (regExIntFloat.test(value)):
                    compVal = parseFloat(value);
                    break;
                case (Date.parse(value)):
                    compVal = new Date(Date.parse(value));
                    break;
                default:
                    compVal = value;
            }
            formData[key] = compVal;
        });
        return formData;
    }

    dataCollectorThruSearching() {
        // Method for searching choosen elements by ID
        return this;
    }

    /* ------ C(R)UD ------ */
    createData() {  //Template. Not ready
        //Creating row
        var row = document.createElement("div");
        row.classList.add(this.options.gridRowClass);
        row.classList.add(this.options.gridRowInsertClass);
        row.style.gridTemplateColumns = this.columnTemplate;

        //Creating cells
        this.columnsProperties.forEach((cellInfo) => {
            var cell = document.createElement("div");
            cell.classList.add(this.options.gridRowCellClass);

            //Set custom Attributes
            if (cellInfo.bodyAttributes) {

                var classes = cellInfo.bodyAttributes.class;
                if (classes && classes.length > 0) {
                    classes.forEach((cls) => {
                        cell.classList.add(cls);
                    });
                }

                var setId = cellInfo.bodyAttributes.id;
                if (setId && setId.length > 0) {
                    cell.id = setId;
                }

                var setStyle = cellInfo.bodyAttributes.style;
                if (setStyle && setStyle.length > 0) {
                    var buffer = cell.getAttribute("style") || "";
                    cell.setAttribute("style", buffer + " " + setStyle);
                }
            }

            //Custom Template
            var inp = document.createElement("input");
            inp.type = "text";
            inp.style.width = "90%";
            cell.appendChild(inp);
            row.appendChild(cell);
        });
        this.body.appendChild(row);
    }

    updateData() {

    }

    deleteData() {

    }

    /* ------ Inner Functionality ------ */

    bodyCapActivate(msg) {
        this.bodyCap.innerHTML = msg;
        this.body.innerHTML = ""
        this.body.appendChild(this.bodyCap);
    }

    searchRows(form) {
        form = form || document.querySelector("form." + this.options.searchClass);
        var params = this.dataCollectorThruForm(form);
        var rowsArr = [];
        this.dataRows.forEach((row, index) => {
            var match = false;
            for (let k in params) {
                var inputParam = String(params[k]).toLowerCase();
                if (inputParam && inputParam.length > 0) {
                    match = String(row[k]).toLowerCase().includes(inputParam);
                }
            }
            (match) ? rowsArr.push(index) : null;
        });
        this.markRows(rowsArr);
    }

    markRows(rowsArr) {
        this.body.childNodes.forEach((row, index) => {
            if (rowsArr.includes(index)) {
                row.classList.add(this.options.searchMarkedRowClass);
            } else {
                row.classList.remove(this.options.searchMarkedRowClass);
            }
        });
    }

    findAllEntries(mainString, subString) {
        var indices = [];
        var index = mainString.indexOf(subString);
        while (index !== -1) {
            indices.push(index);
            index = mainString.indexOf(subString, index + 1);
        }
        return indices;
    }

    stringAnalyzer(str) {
        try {
            var isFunc = /\([^)]*\)/.test(str);
            var isTernary = /\?.*?:/.test(str);
            var parts = str.split(/(\?|\:|\(|\)|\s+)/).filter(part => part.trim() !== '');
            var isVar = (parts.length === 1 && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(parts[0]));

            new Function(str);  // Check code compilability, but don't execute it

            return {
                isValid: true,
                expression: str,
                parts: parts,
                signs: {
                    func: isFunc,
                    tern: isTernary,
                    variable: isVar
                }
            };
        } catch (error) {  // If code doesn't compilable, it'll throw an exeption
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    resultParser(str) {
        if (typeof (str) === "string") {
            var masteredStr = str;
            var regex = /\/\w+\((\d+)\)\/.*?/g;
            var matches = str.match(regex);
            if (matches) {
                matches.forEach((p) => {
                    switch (true) {
                        case (/\bDate\b/.test(p)):
                            var milliseconds = parseInt(p.match(/\d+/)[0]);
                            var dateString = this.formatDate(new Date(milliseconds), "dd-MM-yyyy");
                            masteredStr = masteredStr.replace(p, dateString);
                            break;
                        default:
                            break;
                    }
                });
            }
            return masteredStr;
        } else {
            return str;
        }
    }

    stringFuncExecutor(str, data) {
        switch (true) {
            case (str.signs.func):
                var definitionOpen = false;
                var definitionClose = true;
                var definitionCount = 0;
                var funcStr = "";
                var paramsArr = {};
                str.parts.forEach((p) => {
                    switch (true) {
                        case (p === "("):
                            definitionOpen = true;
                            definitionClose = false;
                            definitionCount++;
                            paramsArr["args" + definitionCount] = [];
                            funcStr += p;
                            break;
                        case (p === ")"):
                            definitionOpen = false;
                            definitionClose = true;
                            funcStr += "...params.args" + definitionCount;
                            funcStr += p;
                            break;
                        case (!definitionOpen && definitionClose):
                            funcStr += p;
                            break;
                        case (definitionOpen && !definitionClose):
                            var paramName = p.replace(/,/g, "").trim();
                            var isString = /(["'])(.*?)\1/g.test(paramName);
                            var isNumeric = /^\d+(\.\d+)?$/g.test(paramName);
                            var paramVal;
                            switch (true) {
                                case (isString):
                                    paramVal = paramName.replace(/'/g, "").replace(/"/g, "");
                                    break;
                                case (isNumeric):
                                    paramVal = paramName;
                                    break;
                                case (paramName === "data"):
                                    paramVal = data || "";
                                    break;
                                default:
                                    paramVal = data[paramName] || "";
                                    break;
                            }
                            paramsArr["args" + definitionCount].push(paramVal);
                            break;
                        default:
                            break;
                    }
                });
                try {
                    var dynamicFunc = new Function("params", "return " + funcStr + ";");
                    return dynamicFunc(paramsArr);
                } catch (ex) {
                    console.log(ex.message);
                    return null;
                }
                break;
            case (str.signs.tern):
                var funcStr = "";
                str.parts.forEach((p) => {
                    switch (true) {
                        case (p === "?"):
                            funcStr += "? ";
                            break;
                        case (p === ":"):
                            funcStr += ": ";
                            break;
                        default:
                            var paramName = p.replace(/,/g, "").trim();
                            var isString = /(["'])(.*?)\1/g.test(paramName);
                            var isNumeric = /^\d+(\.\d+)?$/g.test(paramName);
                            var paramVal;
                            switch (true) {
                                case (isString || isNumeric):
                                    paramVal = paramName;
                                    break;
                                case (paramName === "data"):
                                    paramVal = data || "";
                                    break;
                                default:
                                    paramVal = data[paramName];
                                    break;
                            }
                            funcStr += paramVal + " ";
                            break;
                    }
                });
                try {
                    var dynamicFunc = new Function("return " + funcStr + ";");
                    return dynamicFunc();
                } catch (ex) {
                    console.log(ex.message);
                    return null;
                }
                break;
            default:
                break
        }
    }

    formatDate(date, format) {
        var options = {
            year: format.includes('yyyy') ? 'numeric' : undefined,
            month: format.includes('MM') ? 'numeric' : undefined,
            day: format.includes('dd') ? 'numeric' : undefined,
            hour: format.includes('HH') ? 'numeric' : undefined,
            minute: format.includes('mm') ? 'numeric' : undefined,
            second: format.includes('ss') ? 'numeric' : undefined,
            timeZoneName: format.includes('GMT') ? 'short' : undefined,
        };
        return new Intl.DateTimeFormat('ru-RU', options).format(date);
    }

    customFormatDate(date, format) {
        format = format || "yyyy.MM.dd HH:mm:ss GMT";
        var dt;
        try {
            switch (true) {
                case (date instanceof Date && !isNaN(date.getTime())):
                    dt = date;
                    break;
                case (typeof date === "string"):
                    var milliseconds = (/\bDate\b/.test(date)) ? parseInt(date.match(/\d+/)[0]) : date;
                    dt = new Date(parseInt(milliseconds));
                    break;
                default:
                    console.error("In 'customFormatDate()' method, only the date or a string in milliseconds is accepted as the first parameter");
            }
            var offset = dt.getTimezoneOffset();
            var offsetHr = (Math.floor(Math.abs(offset) / 60)).toString().padStart(2, '0');
            var offsetMn = (Math.abs(offset) % 60).toString().padStart(2, '0');
            var offsetSign = offset < 0 ? '+' : '-';

            return format
                .replace('yyyy', dt.getFullYear())
                .replace('MM', (dt.getMonth() + 1).toString().padStart(2, '0'))
                .replace('dd', dt.getDate().toString().padStart(2, '0'))
                .replace('HH', dt.getHours().toString().padStart(2, '0'))
                .replace('mm', dt.getMinutes().toString().padStart(2, '0'))
                .replace('ss', dt.getSeconds().toString().padStart(2, '0'))
                .replace('GMT', `GMT${offsetSign}${offsetHr}:${offsetMn}`);
        } catch (ex) {
            console.error("There was an error in the 'customFormatDate()' method");
            throw new Error(ex);
        }
    }

    pageWidgetArchitector(rowsTotalCount, textPagesFrom, textPagesTo, totalPages, minFieldPage, maxFieldPage) {
        //Container for all page widget
        var pageWidget = document.createElement("div");
        pageWidget.classList.add(this.options.pagerWidgetClass);

        //Container for page navigation
        var pager = document.createElement("div");
        pager.classList.add(this.options.pagerWidgetPagerClass);

        //Refresh Button
        var refreshButton = document.createElement("button");
        refreshButton.classList.add(this.options.pagerWidgetTileClass, this.options.pagerWidgetRefresherClass);
        refreshButton.innerHTML = "";
        refreshButton.onclick = () => {
            this.refreshPage();
        };
        pager.appendChild(refreshButton);

        //Backward Buttons
        var firstButton = document.createElement("button");
        firstButton.classList.add(this.options.pagerWidgetTileClass);
        firstButton.innerHTML = "";
        if (this.pageCurrent - 1 > 0) {
            firstButton.classList.add(this.options.pagerWidgetButtonClass, this.options.pagerWidgetNaviFirstClass);
            firstButton.onclick = () => {
                this.refreshPage(1);
            };
        } else {
            firstButton.classList.add(this.options.pagerWidgetNaviFirstDisabledClass);
            firstButton.disabled = true;
        }
        pager.appendChild(firstButton);
        var prevButton = document.createElement("button");
        prevButton.classList.add(this.options.pagerWidgetTileClass);
        prevButton.innerHTML = "";
        if (this.pageCurrent - 1 > 0) {
            prevButton.classList.add(this.options.pagerWidgetButtonClass, this.options.pagerWidgetNaviPreviousClass);
            prevButton.onclick = () => {
                this.refreshPage(this.pageCurrent - 1);
            };
        } else {
            prevButton.classList.add(this.options.pagerWidgetNaviPreviousDisabledClass);
            prevButton.disabled = true;
        }
        pager.appendChild(prevButton);

        var pagesField = document.createElement("div");
        pagesField.classList.add(this.options.pagerWidgetPagesFieldClass);

        //Page's buttons
        for (let i = minFieldPage; i <= maxFieldPage; i++) {
            var pgBtn = document.createElement("button");
            pgBtn.classList.add(this.options.pagerWidgetTileClass, this.options.pagerWidgetPageButtonClass);
            pgBtn.innerHTML = i;
            if (i !== this.pageCurrent) {
                pgBtn.onclick = () => {
                    this.refreshPage(i);
                };
            } else {
                pgBtn.classList.add(this.options.pagerWidgetPageButtonCurrentClass);
            }
            pagesField.appendChild(pgBtn);
        };
        pager.appendChild(pagesField);

        //Forward Buttons
        var nextButton = document.createElement("button");
        nextButton.classList.add(this.options.pagerWidgetTileClass);
        nextButton.innerHTML = "";
        if (this.pageCurrent + 1 <= totalPages) {
            nextButton.classList.add(this.options.pagerWidgetButtonClass, this.options.pagerWidgetNaviNextClass);
            nextButton.onclick = () => {
                this.refreshPage(this.pageCurrent + 1);
            };
        } else {
            nextButton.classList.add(this.options.pagerWidgetNaviNextDisabledClass);
            nextButton.disabled = true;
        }
        pager.appendChild(nextButton);

        var lastButton = document.createElement("button");
        lastButton.classList.add(this.options.pagerWidgetTileClass);
        lastButton.innerHTML = "";
        if (this.pageCurrent + 1 <= totalPages) {
            lastButton.classList.add(this.options.pagerWidgetButtonClass, this.options.pagerWidgetNaviLastClass);
            lastButton.onclick = () => {
                this.refreshPage(totalPages);
            };
        } else {
            lastButton.classList.add(this.options.pagerWidgetNaviLastDisabledClass);
            lastButton.disabled = true;
        }
        pager.appendChild(lastButton);

        // Page input field
        var addressedPage = document.createElement("input");
        addressedPage.type = "number";
        addressedPage.classList.add(this.options.pagerWidgetAddressedPageInputClass);
        pager.appendChild(addressedPage);

        var addressedPageGo = document.createElement("button");
        addressedPageGo.innerHTML = "Перейти";
        addressedPageGo.classList.add(this.options.pagerWidgetAddressedPageInputButtonClass);
        addressedPageGo.onclick = () => {
            var valField = parseInt(this.grid.querySelector("." + this.options.pagerWidgetAddressedPageInputClass).value);
            if (valField && valField > 0 && valField <= totalPages) {
                this.refreshPage(valField);
            };
        };
        pager.appendChild(addressedPageGo);

        var pageSizerLabel = document.createElement("div");
        pageSizerLabel.innerHTML = "Строк в таблице:&nbsp";
        pager.appendChild(pageSizerLabel);
        var pageSizer = document.createElement("select");
        pageSizer.style.cursor = "pointer";
        var pageSizerData = [10, 20, 50, 75, 100];
        pageSizerData.forEach((opt) => {
            var option = document.createElement("option");
            option.text = opt;
            option.value = opt;
            pageSizer.add(option);
        });
        pageSizer.value = this.pageSizeCurrent || 20;
        pageSizer.onchange = (event) => {
            var newSize = parseInt(event.currentTarget.value);
            this.refreshPage(this.pageCurrent, newSize);
        };
        pager.appendChild(pageSizer);

        //Container for page info field
        var infoField = document.createElement("div");
        infoField.classList.add(this.options.pagerWidgetInfoFieldClass);

        infoField.innerHTML = "Отображены записи " + (textPagesFrom || 0) + " - " + (textPagesTo || 0) + " из " + (rowsTotalCount || 0)

        pageWidget.appendChild(pager);
        pageWidget.appendChild(infoField);

        this.footer.innerHTML = "";
        this.footer.appendChild(pageWidget);
    }

    pageWidgetRefresher(rowsTotalCount) {
        var textPagesFrom = (rowsTotalCount > 0) ? (((this.pageCurrent - 1) * this.pageSizeCurrent) + 1) : 0;
        var textPagesToLast = (textPagesFrom + this.pageSizeCurrent) - 1;
        var textPagesTo = (textPagesToLast > rowsTotalCount) ? rowsTotalCount : textPagesToLast;
        var totalPages = Math.floor(rowsTotalCount / this.pageSizeCurrent) + 1;
        var minFieldPage = (this.pageCurrent - 5 > 0) ? this.pageCurrent - 5 : 1;
        var maxFieldPage = (this.pageCurrent + 5 <= totalPages) ? this.pageCurrent + 5 : totalPages;

        this.pageWidgetArchitector(rowsTotalCount, textPagesFrom, textPagesTo, totalPages, minFieldPage, maxFieldPage);
    }

    fillComputedRows() {
        this.dataComputedRows = [];
        var rows = this.body.childNodes;
        rows.forEach((row) => {
            var rowArr = [];
            var cells = row.childNodes;
            cells.forEach((cell) => {
                rowArr.push(cell.innerHTML);
            });
            this.dataComputedRows.push(rowArr);
        });
    }

    rowsSorting(colIndex, source) {
        if (this.isRefreshingData) {
            return;
        };

        var data = source || this.dataComputedRows;
        var prepArr = [];
        data.forEach((elem, pos) => {
            var bufr = {};
            bufr[pos] = elem[colIndex];
            prepArr.push(bufr);
        });

        var headerCols = this.header.childNodes;
        headerCols.forEach((col) => {
            var cell = col.innerHTML;
            col.innerHTML = cell.replace("⬆", "↕").replace("⬇", "↕");
        });

        var tbl = this.body.cloneNode(true).childNodes;
        this.body.innerHTML = "";

        if (colIndex !== Math.abs(this.sortingCurrColIndex)) {

            var sorted = this.mergeSort(prepArr);
            sorted.forEach((elem) => {
                var indx = Object.keys(elem);
                this.body.appendChild(tbl[indx].cloneNode(true));
            });
            this.sortingCurrColIndex = colIndex;

        } else {
            for (let i = (prepArr.length - 1); i >= 0; i--) {
                this.body.appendChild(tbl[i].cloneNode(true));
            }
            this.sortingCurrColIndex = -this.sortingCurrColIndex;
        }

        //Redraw arrows
        var cell = headerCols[colIndex].innerHTML;

        if (this.sortingCurrColIndex >= 0) {
            headerCols[colIndex].innerHTML = cell.replace("↕", "⬆").replace("⬇", "⬆");
        } else {
            headerCols[colIndex].innerHTML = cell.replace("↕", "⬇").replace("⬆", "⬇");
        }

        this.fillComputedRows();
    }

    rowsOrderBy(colIndex, columnCell) {
        if (this.isRefreshingData) return;

        var sortOrderArr = [];
        var sortOrder = columnCell.dynamicGrid.sortablilty.order;

        switch (true) {
            case (sortOrder == 0):
                columnCell.dynamicGrid.sortablilty.order = 1;
                break;
            case (sortOrder > 0):
                columnCell.dynamicGrid.sortablilty.order = -1;
                break;
            case (sortOrder < 0):
                columnCell.dynamicGrid.sortablilty.order = 0;
                break;
        }

        this.header.querySelectorAll(`.${this.options.gridHeaderCellClass}`).forEach((col) => {
            var symbol = "↕";
            var sortData = col.dynamicGrid?.sortablilty;
            if (sortData && sortData?.order != 0) {
                sortOrderArr.push({
                    param: sortData.param,
                    order: sortData.order,
                    exprStr: sortData.param + ((sortData.order == -1) ? " desc" : " asc"),
                });
                symbol = (sortData.order > 0) ? "⬆" : "⬇";
            }
            col.innerHTML = col.innerHTML.replace("↕", symbol).replace("⬆", symbol).replace("⬇", symbol);
        });
        var orderByString = sortOrderArr.map(el => el.exprStr).join(", ");

        //Refresh data by Order param
        this.modelRefresher({
            [this.dataModelName]: {
                [this.sortabilityOptions.paramName]: orderByString
            }
        });
        this.dataRefresher();
    }

    sortDataBy(param, source) {
        var arr = [];
        rows = source || this.dataResult.Data || this.dataResult;
        rows.forEach((elem) => {
            arr.push(elem[param]);
        });
        return this.mergeSort(arr);
    }

    /*Dict Merge Sort*/
    merge(left, right) {
        let arr = [];
        while (left.length && right.length) {
            if (Object.values(left[0]) <= Object.values(right[0])) {
                arr.push(left.shift());
            } else {
                arr.push(right.shift());
            }
        }
        return [...arr, ...left, ...right];
    }

    mergeSort(array) {
        const half = array.length / 2;

        if (array.length < 2) {
            return array;
        }

        const left = array.splice(0, half);
        return this.merge(this.mergeSort(left), this.mergeSort(array));
    }
}
