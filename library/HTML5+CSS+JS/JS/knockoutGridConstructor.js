// This is description of complicated parameters
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

class KnockoutGridConstructor {
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
            searchMarkedRowClass: "dynamicGridRowMarked",  //In css use combined class with 'gridRowClass'

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

        this.header = this.grid.querySelector("." + this.options.gridHeaderClass);

        this.body = this.grid.querySelector("." + this.options.gridBodyClass);

        this.footer = document.createElement("div");
        this.footer.classList.add(this.options.gridFooterClass);  

        this.grid.appendChild(this.footer);

        this.dataModelName;
        this.dataModel = {};
        this.isRefreshingData = ko.observable(false);
        this.isDataSettedManually = false;
        this.dataBindingAddress;
        this.dataBindingActions;
        this.dataResult = ko.observableArray()
        this.dataRows = ko.observableArray();

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
        this.setPageability();
        this.setFilterability();
        this.setSearchability();
        this.setScrollability();
        this.setSortability();
        (this.isDataSettedManually) ? this.rowFilling(this.dataRows) : this.dataRefresher();
    }

    /* ------ Functionality ------ */
    //Pageability
    setPageability() {
        if (this.Pageability) {
            //Creating Pager widget
            this.pageWidgetArchitector();

            //Setting page parameters
            var sizeParam = {};
            sizeParam[this.pagerModelName] = {};
            sizeParam[this.pagerModelName][this.pagerName] = this.pageCurrent;
            sizeParam[this.pagerModelName][this.pagerSizeName] = this.pageSizeCurrent;

            this.modelRefresher(sizeParam);
        }
    }

    Pageable(opt) {
        this.Pageability = true;
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
        var sizeParam = {};
        sizeParam[this.pagerModelName] = {};
        sizeParam[this.pagerModelName][this.pagerName] = this.pageCurrent;
        sizeParam[this.pagerModelName][this.pagerSizeName] = this.pageSizeCurrent;

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
                            this.modelRefresher({ [this.dataModelName]: this.dataCollectorThruForm(event.target) });
                            this.modelRefresher({
                                [this.pagerModelName]: {
                                    [this.pagerName]: this.pageCurrent,
                                }
                            });
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

            var scrollbarWidth = (self.body.offsetWidth - self.body.clientWidth) || 10;  //If grid is not displayed, scrollbarWidth will be undefined. In this case we use Magic number
            this.header.style.width = `calc(100% - ${scrollbarWidth}px)`;

            //    document.addEventListener("DOMContentLoaded", () => {
            //        //var scrollbarWidth = (window.innerWidth - element.clientWidth) || 10;
            //        var scrollbarWidth = (self.body.offsetWidth - self.body.clientWidth) || 10;  //If grid is not displayed, scrollbarWidth will be undefined. In this case we use Magic number
            //        this.header.style.width = `calc(100% - ${scrollbarWidth}px)`;
            //    });
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

    setSortability() {
        if (!this.Sortability || !this.sortabilityArea) return;

        this.header.querySelectorAll(`.${this.options.gridHeaderCellClass}`).forEach((clmn, index) => {
            var isSortingForbidden = clmn.classList.contains("noneSortable");
            if (!isSortingForbidden) {
                clmn.style.cursor = "pointer";
                clmn.style.userSelect = "none";
                clmn.innerHTML += "&nbsp;↕";
                clmn.knockGrid = {
                    sortablilty: {
                        param: clmn.dataset?.parameter,
                        order: 0
                    },
                };
                switch (this.sortabilityArea) {
                    case ("local"):
                        clmn.onclick = () => {
                            //this.rowsSorting(index);
                        };
                        break;
                    case ("global"):
                    default:
                        clmn.onclick = () => {
                            this.rowsOrderBy(index, clmn);
                        };
                        break;
                }
            }
        });
    }

    //Selectability
    Selectable(selector) {
        this.Selectability = true;
        this.selectabilitySelector = selector;
        return this;
    }

    getSelectedList() {
        if (this.Selectability && this.selectabilitySelector) {
            var selectedData = [];
            var rowsArr = Array.from(this.body.children);
            var dataArr = this.dataRows();
            var elements = this.body.querySelectorAll(this.selectabilitySelector);
            elements.forEach((e) => {
                var row = e.closest(`.${this.options.gridRowClass}`);
                var index = rowsArr.indexOf(row);
                selectedData.push({
                    node: row,
                    data: dataArr[index],
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

    dataRefresher(options) {
        if (!this.dataBindingAddress && !options?.url) {
            console.error("To refresh data by get/post method, you must set URL through options, or set binding address through 'dataBinding()' method, before init().");
            return null;
        }

        this.isRefreshingData(true);
        if (this.dataBindingActions?.onStart) this.dataBindingActions.onStart();

        this.dataRows([]);
        this.dataResult([]);
        options = options || {};
        this.ajaxRequest({
            url: options.url || this.dataBindingAddress,
            method: 'POST',

            data: options.params || this.dataModel || "",

            success: (data) => {
                this.dataRows(data.Data || data.data || data);
                this.dataResult(data);
                this.grid.dataResult = data;
                (this.Pageability) ? this.pageWidgetRefresher(data[this.pagerTotalName]) : null;
                this.isRefreshingData(false);
                if (this.dataBindingActions?.onSuccess) this.dataBindingActions.onSuccess(data);
            },

            error: (error) => {
                this.isRefreshingData(false);
                if (this.dataBindingActions?.onError) this.dataBindingActions.onError(error);
            },

            complete: (data) => {
                if (this.dataBindingActions?.onComplete) this.dataBindingActions.onComplete(data);
                if (this.Searchability) { this.searchRows(); }
            }
        });
        return this;
    }

    setData(dataArr) {
        this.dataRows(dataArr);
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

    /* ------ C(R)UD ------ */
    createData() {

    }

    updateData() {

    }

    deleteData() {

    }

    /* ------ Inner Functionality ------ */

    searchRows(form) {
        form = form || document.querySelector("form." + this.options.searchClass);
        var params = this.dataCollectorThruForm(form);
        var rowsArr = [];
        this.dataRows().forEach((row, index) => {
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
        this.body.querySelectorAll("." + this.options.gridRowClass).forEach((row, index) => {
            if (rowsArr.includes(index)) {
                row.classList.add(this.options.searchMarkedRowClass);
            } else {
                row.classList.remove(this.options.searchMarkedRowClass);
            }
        });
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

    resultParser(str, opt) {
        var options = opt || {
            dateFormat: "dd-MM-yyyy",
        };

        if (typeof (str) === "string") {
            var masteredStr = str;
            var regex = /\/\w+\((\d+)\)\/.*?/g;
            var matches = str.match(regex);
            if (matches) {
                matches.forEach((p) => {
                    switch (true) {
                        case (/\bDate\b/.test(p)):
                            var milliseconds = parseInt(p.match(/\d+/)[0]);
                            var dateString = this.formatDate(new Date(milliseconds), options.dateFormat);
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

    rowsOrderBy(colIndex, columnCell) {
        if (this.isRefreshingData()) return;

        var sortOrderArr = [];
        var sortOrder = columnCell.knockGrid.sortablilty.order;

        switch (true) {
            case (sortOrder == 0):
                columnCell.knockGrid.sortablilty.order = 1;
                break;
            case (sortOrder > 0):
                columnCell.knockGrid.sortablilty.order = -1;
                break;
            case (sortOrder < 0):
                columnCell.knockGrid.sortablilty.order = 0;
                break;
        }

        this.header.querySelectorAll(`.${this.options.gridHeaderCellClass}`).forEach((col) => {
            var symbol = "↕";
            var sortData = col.knockGrid?.sortablilty;
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
}
