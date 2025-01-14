class mediaSlider {
    /**
     * 
     * Constructor for page's media slider
     * 
     * @param {String} mediasContainerID - Container with medias, that need to be slided
     * @param {String} progressBarContainerID - Optionally. Container with progress bars.
     * @param {Number} duration - Optionally. Duration between changing slides.
     */
    constructor(mediasContainerID, progressBarContainerID, duration, associatedFuncName) {

        this.medias = document.querySelector("#" + mediasContainerID).children;

        var barsCheck = document.querySelector("#" + progressBarContainerID);
        this.bars = (barsCheck !== null) ? (barsCheck.querySelectorAll(".progressBar")) : [];

        this.barElements = [];
        this.curFileIndex = 0;
        this.duration = duration;
        this.currentTimeCheck;
        this.currentMediaType;

        if (this.bars.length > 0) {
            this.bars.forEach(bar => {
                var elem = new ProgressBar(bar.id);
                this.barElements.push(elem);
            });
        }

        this.fileTypeChecker();
    }

    fileTypeChecker() {  // Now realized only for videos
        var element = this.medias[this.curFileIndex].tagName;

        switch (true) {
            case element.startsWith("VIDEO"):
                this.currentMediaType = "VIDEO"
                this.videoSliderChecker();
                break;
            case element.startsWith("AUDIO"):
                this.currentMediaType = "AUDIO"
                console.log("audio");
                break;
            case element.startsWith("IMG"):
                this.currentMediaType = "IMG"
                console.log("image");
                break;
            default:
                this.currentMediaType = "OTHER"
                this.anotherSliderChecker();
                break;
        }
    }

    addressedChanging(newIndex) {
        //#FIXME Add changing type depends of currentMediaType
    }



    /*Videos area */
    addressedVideoChanging(newIndex) {
        this.medias[this.curFileIndex].removeEventListener("ended", this.videoSliderToggler.bind(this), { once: true });
        this.videoSliderToggler(event, newIndex);
    }

    videoSliderChecker() {
        if (this.medias[this.curFileIndex].readyState === 4) {
            this.videoSliderStarter();
        } else {
            this.medias[this.curFileIndex].addEventListener("canplaythrough", this.videoSliderStarter.bind(this), { once: true });
        }
        this.medias[this.curFileIndex].addEventListener("enterpictureinpicture", (event) => {
            event.preventDefault();
        });
    }

    videoSliderStarter() {
        showBannerText(this.curFileIndex);  //#FIXME Use links in methods

        var media = this.medias[this.curFileIndex];
        media.style.display = 'block';
        //media.playbackRate = 3;  //#FIXME Delete me
        media.play();
        var duration = media.duration;
        var barElement = (this.barElements.length > 0) ? this.barElements[this.curFileIndex] : null;
        clearInterval(this.currentTimeCheck);
        this.currentTimeCheck = setInterval(() => {
            var currentTimePercentage = parseInt((media.currentTime / duration) * 100);
            (barElement) ? barElement.changeProgressBar(currentTimePercentage) : null;
        }, 100);
        media.addEventListener("ended", this.videoSliderToggler.bind(this), { once: true });

    }

    videoSliderToggler(event, newIndex) {
        var media = this.medias[this.curFileIndex];
        (this.barElements.length > 0) ? this.barElements[this.curFileIndex].clearProgressBar() : null;
        media.pause();
        media.currentTime = 0;
        media.style.display = 'none';
        this.curFileIndex = (newIndex !== undefined) ? newIndex : ((this.curFileIndex + 1) % this.medias.length);
        this.fileTypeChecker();
    }
    /*end Videos area */


    /* Another types area */
    addressedElementChanging(newIndex) {
        this.anotherSliderToggler(event, newIndex);
    }

    anotherSliderChecker() {
        this.anotherSliderStarter();
    }

    anotherSliderStarter() {
        this.medias[this.curFileIndex].style.display = 'flex';
        if (this.duration > 0 && this.duration !== undefined) {
            clearTimeout(this.currentTimeCheck);
            this.currentTimeCheck = setTimeout(() => {
                this.anotherSliderToggler();
            }, (this.duration * 1000));
        }
    }

    anotherSliderToggler(event, newIndex) {
        this.medias[this.curFileIndex].style.display = 'none';
        this.curFileIndex = (newIndex !== undefined) ? newIndex : ((this.curFileIndex + 1) % this.medias.length);
        this.fileTypeChecker();
    }
    /*end Another types area */
}

