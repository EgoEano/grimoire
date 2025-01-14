class InfoField {
    constructor(fieldID) {
        this.field = document.querySelector('#' + fieldID);
        this.field_header = this.field.querySelector('#' + fieldID + "_header");
        this.field_body = this.field.querySelector('#' + fieldID + "_body");

        this.hidingTimeout = undefined;
        this.transitionTimeout = undefined;
        this.dropTimeout = undefined;
        this.dropSettings();
    }

    show(content, vertical, horizontal, duration, status) {
        this.vertical = vertical || "bottom";
        this.horizontal = horizontal || "left";
        this.dropSettings();

        if (content !== undefined) {
            switch (typeof (content)) {
                case "string":
                    this.field_header.textContent = "";
                    this.field_body.textContent = content;
                    break;
                case "object":
                    this.field_header.innerHTML = content["header"] || "";
                    this.field_body.innerHTML = content["body"] || "";
                    break;
                default:
                    break;
            }
        }

        switch (this.vertical) {
            case "top":
                this.posY = 0;
                this.translateYValue = -110;
                this.translateYValueTransition = 0;
                break;
            case "middle":
                this.posY = 50;
                this.translateYValue = -50;
                this.translateYValueTransition = -50;
                break;
            case "bottom":
                this.posY = 95;
                this.translateYValue = 110;
                this.translateYValueTransition = -100;
                break;
            default:
                break;
        }

        switch (this.horizontal) {
            case "left":
                this.posX = 0;
                this.translateXValue = (this.vertical === "middle") ? -110 : 0;
                this.translateXValueTransition = 0;
                break;
            case "middle":
                this.posX = 50;
                this.translateXValue = -50;
                this.translateXValueTransition = -50;
                break;
            case "right":
                this.posX = 95;
                this.translateXValue = (this.vertical === "middle") ? 0 : -110;
                this.translateXValueTransition = -100;
                break;
            default:
                break;
        }

        switch (status) {
            case "warning":
                this.field.style.background = "rgba(240,30,30,0.7)";
                break;
            case "notice":
                this.field.style.background = "rgba(150,150,150,0.7)";
                break;
            case "success":
                this.field.style.background = "rgba(30,240,30,0.7)";
                break;
            default:
                this.field.style.background = "rgba(150,150,150,0.7)";
                break;
        };

        this.field.style.top = this.posY + "%";
        this.field.style.left = this.posX + "%";
        this.field.style.transform = `translate(${this.translateXValue}%, ${this.translateYValue}%)`;

        this.transitionTimeout = setTimeout(() => {
            this.field.style.transition = "transform 1s ease, top 1s ease, left 1s ease, opacity 1s ease";
            this.field.style.transform = `translate(${this.translateXValueTransition}%, ${this.translateYValueTransition}%)`;
            this.field.style.opacity = 1;
        }, 10);

        this.hidingTimeout = (duration) ? setTimeout(() => this.hide(), duration) : undefined;
    };

    hide() {
        this.field.style.opacity = 0;
        this.field.style.transform = `translate(${this.translateXValue}%, ${this.translateYValue}%)`;
        this.dropTimeout = setTimeout(() => this.dropSettings(), 1500);
    }

    dropSettings() {
        clearTimeout(this.hidingTimeout);
        this.hidingTimeout = undefined;
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = undefined;
        clearTimeout(this.dropTimeout);
        this.dropTimeout = undefined;

        this.posX = 110;
        this.posY = 0;
        this.translateXValue = 0;
        this.translateYValue = 0;
        this.translateXValueTransition = 0;
        this.translateYValueTransition = 0;

        this.field.style.background = "rgba(150,150,150,0.7)";
        this.field.style.transition = "transform 0s ease, top 0s ease, left 0s ease, opacity 1s ease";
        this.field.style.opacity = 0;
        this.field.style.top = this.posY +"%";
        this.field.style.left = this.posX + "%";
        this.field.style.transform = `translate(${this.translateXValue}%, ${this.translateYValue}%)`;
    }
}