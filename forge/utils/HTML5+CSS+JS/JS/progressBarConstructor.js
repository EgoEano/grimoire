class ProgressBar {
    /**
     * Create an exemplair if ProgressBar class
     * 
     * @param {string} barID - ID of prepared bar in DOM
     * @param {number} duration - Duration in seconds, if Progress Bar starts independed (Optional. Default - 1)
     * @param {boolean} autostart - If is need to start Bar automatically after page loading (Optional. Default - false)
     */
    constructor(barID, duration, autostart) {
        this.id = barID;
        this.duration = duration || 1;
        this.barProgress = 0;
        this.isActive = false;
        this.isDone = false;
        this.autostart = autostart || false;
        this.process;
        this.targetBar = document.querySelector("#" + barID);

        if (autostart) {
            this.activateProcess();
        }
    }

    activateProcess() {
        this.deactivateProcess();
        this.isActive = true;
        this.isDone = false;
        this.process = setInterval(() => {
            if (this.barProgress < 100) {
                this.barProgress++;
                this.changeProgressBar();
            } else {
                this.isDone = true;
                this.deactivateProcess();
            }
        }, (this.duration * 10));
    }

    deactivateProcess() {
        clearInterval(this.process);
        this.process = undefined;
        this.isActive = false;

    }

    changeProgressBar(value) {
        var percent = value || this.barProgress;
        this.targetBar.firstElementChild.style.width = percent + "%";
    }

    clearProgressBar() {
        this.targetBar.firstElementChild.style.width = "0%";
    }
}