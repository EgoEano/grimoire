class TickerLine {
    /**
     * Animate prepared exemplair of Ticker Line in DOM
     * 
     * @param {string} tickerID - ID of prepared ticker in DOM
     * @param {number} tickerSpeed - Speed in seconds, if Ticker Line starts independed (Optional. Default - 50)
     * @param {boolean} autostart - If is need to start Ticker Line automatically after page loading (Optional. Default - true)
     */
    constructor(tickerID, tickerSpeed, autostart) {  //#FIXME Not workin with resize
        this.ticker = document.querySelector("#" + tickerID);
        this.children = this.ticker.children;
        this.tickerSpeed = tickerSpeed || 50;
        this.autostart = autostart || true;
        this.process;

        if (this.autostart) {
            this.activateProcess();
        }
    }

    activateProcess() {
        this.deactivateProcess();
        this.process = setInterval(() => {
            this.ticker.scrollLeft += 1;
            var tickerLeft = this.ticker.getBoundingClientRect().left;
            var tileEdge = this.children[1].getBoundingClientRect().left

            if (tileEdge <= tickerLeft) {
                var node = this.children[0];
                this.ticker.removeChild(this.children[0]);
                this.ticker.scrollLeft = 1;
                this.ticker.appendChild(node);
            }
        }, this.tickerSpeed);
    }

    deactivateProcess() {
        clearInterval(this.process);
        this.process = undefined;
    }
}