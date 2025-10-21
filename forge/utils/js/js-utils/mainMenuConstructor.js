class HeaderMenu {
    constructor(headerID, containerID, dropMenuID, buttonSelectorID, menuDict) {
        this.mainMenuDict = menuDict || {};
        this.header = document.querySelector('#' + headerID);
        this.container = document.querySelector('#' + containerID);
        this.menu = document.querySelector('#' + dropMenuID);
        this.button = document.querySelector('#' + buttonSelectorID);
        this.isHeaderHovered = false;
        this.isMenuHovered = false;

        this.initHeader();

        //Header hover checking
        this.header.addEventListener('mouseenter', (event) => {
            this.isHeaderHovered = true;
        });

        this.header.addEventListener('mouseleave', (event) => {
            this.isHeaderHovered = false;
            this.hideMenuTimer(300);
        });

        //Menu hover checking
        this.menu.addEventListener('mouseenter', (event) => {
            this.isMenuHovered = true;
        });

        this.menu.addEventListener('mouseleave', (event) => {
            this.isMenuHovered = false;
            this.hideMenuTimer(300);
        });
    }

    initHeader() {
        // Create first line buttons
        if (Object.keys(this.mainMenuDict).length > 0) {
            for (let k in this.mainMenuDict) {

                var element = this.mainMenuDict[k];
                let div = document.createElement('div');
                var link;

                // Checking links
                if (element['a'] !== undefined) {
                    var par = document.createElement('p');
                    par.textContent = k;
                    link = document.createElement('a');
                    link.href = element['a'];
                    link.appendChild(par);
                }
                else {
                    link = document.createElement('p');
                    link.textContent = k;
                }
                div.appendChild(link);

                //Add classes
                div.className = (element["class"] !== undefined) ? element["class"] : "";

                //Checking and adding datasets
                var dataset = element['dataset'];
                for (var data in dataset) {
                    div.setAttribute("data-" + data, dataset[data]);
                }

                this.container.appendChild(div);

                div.addEventListener('mouseenter', (event) => {
                    var itemValue = event.currentTarget.dataset.itemValue;
                    this.showMenu(itemValue);
                });

                div.addEventListener('click', (event) => {
                    var itemValue = event.currentTarget.dataset.itemValue;
                    this.toggleMenu(itemValue);
                });
            }
        }
    }

    showMenu(itemValue) {
        var children = this.mainMenuDict[itemValue]["child"];
        var dataset = this.mainMenuDict[itemValue]["dataset"];
        this.menu.textContent = "";
        this.menu.dataset.currentMenu = itemValue;

        var menuRoute = dataset['menu'];
        if (menuRoute) {
            this.getMenuPartial(menuRoute)
                .then(data => {
                    if (data) {
                        this.menu.innerHTML = data;

                        var importedScript = this.menu.querySelector("script");
                        if (importedScript !== null) {
                            var appendScript = document.createElement('script');
                            appendScript.innerHTML = importedScript.textContent;
                            var deadElem = this.menu.querySelector("script");
                            deadElem.parentNode.removeChild(deadElem);
                            this.menu.appendChild(appendScript);
                        }

                        this.menu.classList.add("HeaderDropMenu_active");
                    } else {
                        this.menu.classList.remove("HeaderDropMenu_active");
                    }
                })
                .catch(error => {
                    this.menu.innerHTML = "";
                    this.menu.classList.remove("HeaderDropMenu_active");
                });

        } else {
            if (children !== undefined && children !== null && Object.keys(children).length > 0) {
                for (let item in children) {

                    var element = children[item];
                    let div = document.createElement('div');
                    var link;

                    // Checking links
                    if (element['a'] !== undefined) {
                        var par = document.createElement('p');
                        par.textContent = item;
                        link = document.createElement('a');
                        link.href = element['a'];
                        link.appendChild(par);
                    }
                    else {
                        link = document.createElement('p');
                        link.textContent = item;
                    }
                    div.appendChild(link);

                    //Add classes
                    div.className = (element["class"] !== undefined) ? element["class"] : "";

                    //Checking and adding datasets
                    var dataset = element['dataset'];
                    for (var data in dataset) {
                        div.setAttribute("data-" + data, dataset[data]);
                    }

                    this.menu.appendChild(div);
                }
                this.menu.classList.add("HeaderDropMenu_active");

            } else {
                this.menu.classList.remove("HeaderDropMenu_active");
            }
        }


    }

    hideMenu() {
        this.menu.classList.remove("HeaderDropMenu_active");
    }

    hideMenuTimer(interval) {
        setTimeout(() => {
            if (!this.isMenuHovered && !this.isHeaderHovered) {
                this.hideMenu();
            }
        }, interval);
    }

    toggleMenu(itemValue) {
        if (this.menu.classList.contains("HeaderDropMenu_active")) {
            this.hideMenu();
        } else {
            this.showMenu(itemValue);
        }
    }

    getMenuPartial(connectionString) {

        return ajaxRequest({
            url: "/Home/GetPartial",
            method: 'POST',

            data: {
                route: connectionString
            },

            success: (data) => {
                return data;
            },

            error: (error) => {
                return null;
            }
        });

    }

    /////////////////////////////////////////

    toggleHeader() {
        if (window.getComputedStyle(this.container).getPropertyValue("display") === "none") {
            this.showHeader();
        } else {
            this.hideHeader();
        }
    }

    showHeader() {
        this.container.style.display = "flex";
    }

    hideHeader() {
        this.container.style.display = "none";
    }
}