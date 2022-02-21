import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utilsNew.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import {SVG} from "../../core/svg.js";

export default class FeatureTrack {

    constructor(config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.prefix = UtilsNew.randomString(8);
        this.config = {...this.getDefaultConfig(), ...config};

        this.#init();
    }

    #init() {
        this.width = this.config.width || 200;
        this.height = this.config.height || 100;
        this.visible = true;
        this.contentVisible = true;
        this.autoHeight = true;

        this.status = "";

        this.histogramRendererName = "HistogramRenderer";
        this.visibleRegionSize;
        this.fontClass = "ocb-font-roboto ocb-font-size-14";
        this.externalLink = "";
        this.autoRender = false;

        // TODO: review if we need this
        if (this.renderer != null) {
            this.renderer.track = this;
        }

        this.pixelBase;
        this.svgCanvasWidth = 500000;
        this.pixelPosition = this.svgCanvasWidth / 2;
        this.svgCanvasOffset;

        this.histogram;
        this.histogramLogarithm;
        this.histogramMax;
        this.interval;

        this.svgCanvasLeftLimit;
        this.svgCanvasRightLimit;

        this.invalidZoomText;

        this.renderedArea = {}; // used for renders to store binary trees
        this.chunksDisplayed = {}; // used to avoid painting multiple times features contained in more than 1 chunk

        // save default render reference;
        // this.defaultRenderer = this.renderer;
        // this.renderer = this.renderer;

        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        this.dataType = "features";

        this.featureType = "Feature"; // This only have the old class feature track
        // this.resource = this.dataAdapter.resource;// This only have the old class feature track
        // this.species = this.dataAdapter.species;// This only have the old class feature track

        this.#initDom();
        this.#initEvents();

        this.status = "ready";
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="ocb-gv-track unselectable">
                <div id="${this.prefix}Title" class="ocb-gv-track-title" style="padding:4px;">
                    <div class="ocb-gv-title-el">
                        <span id="${this.prefix}TitleText" class="ocb-gv-track-title-text">
                            ${this.config.title || ""}
                        </span>
                        <span id="${this.prefix}TitleHistogram" class="ocb-gv-track-title-histogram" style="display:none;">
                            &nbsp;<i class="fas fa-signal"></i>
                        </span>
                        <span id="${this.prefix}TitleToggle" class="ocb-gv-track-title-toggle">
                            <i id="${this.prefix}TitleToggleIcon"class="fas fa-minus"></i>
                        </span>
                        <span id="${this.prefix}TitleDown" class="ocb-gv-track-title-down">
                            <i class="fas fa-chevron-down"></i>
                        </span>
                        <span id="${this.prefix}TitleUp" class="ocb-gv-track-title-up">
                            <i class="fas fa-chevron-up"></i>
                        </span>
                        <span id="${this.prefix}TitleSettings" class="ocb-gv-track-title-settings" style="display:none;">
                            <i class="fas fa-cog"></i>
                        </span>
                        <span id="${this.prefix}TitleClose" class="ocb-gv-track-title-close" style="display:none;">
                            <i class="fas fa-times"></i>
                        </span>
                        <span id="${this.prefix}TitleExternalLink" class="ocb-gv-track-title-external-link" style="display:none;">
                            <i class="fas fa-external-link"></i>
                        </span>
                        <span id="${this.prefix}TitleLoading" class="ocb-gv-track-title-loading" style="display:none;">
                            <i class="fas fa-spinner fa-spin"></i> Loading...
                        </span>
                    </div>
                </div>
                <div id="${this.prefix}Content"></div>
                <div id="${this.prefix}Resize" class="ocb-track-resize"></div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);

        this.title = this.div.querySelector(`div#${this.prefix}Title`);
        this.titleText = this.div.querySelector(`span#${this.prefix}TitleText`);
        this.titleHistogram = this.div.querySelector(`span#${this.prefix}TitleHistogram`);
        this.titleToggle = this.div.querySelector(`span#${this.prefix}TitleToggle`);
        this.titleToggleIcon = this.div.querySelector(`i#${this.prefix}TitleToggleIcon`);
        this.titleSettings = this.div.querySelector(`span#${this.prefix}TitleLoading`);
        this.titleClose = this.div.querySelector(`span#${this.prefix}TitleClose`);
        this.titleUp = this.div.querySelector(`span#${this.prefix}TitleUp`);
        this.titleDown = this.div.querySelector(`span#${this.prefix}TitleDown`);
        this.titleExternalLink = this.div.querySelector(`span#${this.prefix}TitleExternalLink`);
        this.titleLoading = this.div.querySelector(`span#${this.prefix}TitleLoading`);

        // Main content wrapper
        this.content = this.div.querySelector(`div#${this.prefix}Content`);
        this.content.style.position = "relative";
        this.content.style.boxSizing = "border-box";
        this.content.style.zIndex = 3;
        this.content.height = this.config.height;
        this.content.overflowY = this.config.resizable ? "auto" : "hidden";
        this.content.overflowX = "hidden";

        this.resize = this.div.querySelector(`div#${this.prefix}Resize`);

        if (this.config.showSettings) {
            this.titleSettings.style.display = "inline-block";
        }

        if (this.config.closable) {
            this.titleClose.style.display = "inline-block";
        }

        if (this.config.externalLink) {
            this.titleExternalLink.style.display = "inline-block";
        }

        if (typeof this.config.title === "undefined") {
            this.title.style.display = "none";
        }

        // Main SVG element
        this.main = SVG.addChild(this.content, "svg", {
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width,
        });
        this.svgCanvasFeatures = SVG.addChild(this.main, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth,
        });
    }

    #initEvents() {
        // Register listeners to title elements
        this.titleToggle.addEventListener("click", () => this.toggleContent());
        this.titleSettings.addEventListener("click", () => this.settingsContent());
        this.titleClose.addEventListener("click", () => this.close());
        this.titleUp.addEventListener("click", () => this.up());
        this.titleDown.addEventListener("click", () => this.down());
        this.titleExternalLink.addEventListener("click", () => {
            window.open(this.config.externalLink);
        });

        if (this.config.resizable) {
            let downY = 0;
            const handleResizeMove = event => {
                const despY = (event.clientY - downY);
                const actualHeight = this.content.offsetHeight;
                const newHeight = actualHeight + despY;
                if (newHeight > 0) {
                    this.height = newHeight;
                    this.content.style.height = this.height;
                }
                downY = event.clientY;
            };

            this.resize.addEventListener("mousedown", event => {
                event.stopPropagation();
                downY = event.clientY;

                document.body.classList.add("unselectable");
                document.body.addEventListener("mousemove", handleResizeMove);
            });

            document.body.addEventListener("mouseup", () => {
                document.body.classList.remove("unselectable");
                document.body.removeEventListener("mousemove", handleResizeMove);
            });

            // TODO: review this event
            // $(contentDiv).closest(".trackListPanels").mouseup(function(event) {
            //     _this.updateHeight();
            // });
        }
    }

    // TODO: review this method
    initializeDom(target) {
        // Moun element
        target.appendChild(this.div);

        this.updateHeight();
        this.renderer.init();
    }

    get(attr) {
        return this[attr];
    }

    set(attr, value) {
        this[attr] = value;
    }

    hide() {
        this.visible = false;
        this.div.classList.add("hidden");
    }

    show() {
        this.visible = true;
        this.div.classList.remove("hidden");
        this.updateHeight();
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    remove() {
        // TODO: implement a non jquery solution
        $(this.div).remove();
    }

    hideContent() {
        this.contentVisible = false;
        this.content.classList.add("hidden");
        this.resize.classList.add("hidden");

        this.titleToggleIcon.classList.remove("fa-minus");
        this.titleToggleIcon.classList.add("fa-plus");
    }

    showContent() {
        this.contentVisible = true;
        this.content.classList.remove("hidden");
        this.resize.classList.remove("hidden");

        this.titleToggleIcon.classList.remove("fa-plus");
        this.titleToggleIcon.classList.add("fa-minus");
        this.updateHeight();
    }

    toggleContent() {
        this.contentVisible ? this.hideContent() : this.showContent();
    }

    settingsContent() {
        this.trigger("track:settings", {sender: this});
    }

    close() {
        this.trigger("track:close", {sender: this});
    }

    up() {
        this.trigger("track:up", {sender: this});
    }

    down() {
        this.trigger("track:down", {sender: this});
    }

    setSpecies(species) {
        this.species = species;
        this.dataAdapter.setSpecies(this.species);
    }

    enableAutoHeight() {
        // console.log("enable autoHeigth");
        this.autoHeight = true;
        this.updateHeight();
    }

    disableAutoHeight() {
        // console.log("disable autoHeigth");
        this.autoHeight = false;
        this.updateHeight();
    }

    toggleAutoHeight() {
        this.autoHeight ? this.disableAutoHeight() : this.enableAutoHeight();
    }

    setTitle(title) {
        this.titleText.textContent = title;
    }

    setLoading(loading) {
        if (loading) {
            this.status = "rendering";
            this.titleLoading.style.display = "inline-block";
        } else {
            this.status = "ready";
            this.titleLoading.style.display = "none";
        }
    }

    updateHistogramParams() {
        if (this.region.length() > this.config.minHistogramRegionSize) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = Math.ceil(10 / this.pixelBase); // server interval limit 512
            this.titleHistogram.style.display = "inline-block";
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
            this.interval = undefined;
            this.titleHistogram.style.display = "none";
        }
    }

    clean() {
        this.#clean();
        while (this.svgCanvasFeatures.firstChild) {
            this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
        }
    }

    #clean() {
        // Must be called on child clean method
        this.chunksDisplayed = {};
        this.renderedArea = {};
    }

    updateHeight() {
        if (this.histogram) {
            this.content.style.height = `${this.histogramRenderer.histogramHeight + 5}px`;
            this.main.setAttribute("height", this.histogramRenderer.histogramHeight);
            return;
        }

        let renderedHeight = this.height;
        const heightKeys = Object.keys(this.renderedArea);
        heightKeys.sort(function (a, b) {
            return parseInt(b) - parseInt(a);
        });
        if (heightKeys.length > 0) {
            renderedHeight = parseInt(heightKeys[0]) + 30;
        }
        renderedHeight = Math.max(renderedHeight, this.height);
        this.main.setAttribute("height", renderedHeight);

        if (this.resizable) {
            if (!this.autoHeight) {
                this.content.style.height = `${this.height + 10}px`;
            } else {
                const x = this.pixelPosition;
                let lastContains = 0;
                Object.keys(this.renderedArea).forEach(key => {
                    if (this.renderedArea[key].contains({
                        start: x,
                        end: x + this.width,
                    })) {
                        lastContains = key;
                    }
                });
                const visibleHeight = Math.max(parseInt(lastContains) + 30, this.height);
                this.contentDiv.style.height = `${visibleHeight + 10}px`;
                this.main.setAttribute("height", visibleHeight);
            }
        }
    }

    setWidth(width) {
        this.#setWidth(width);
        this.main.setAttribute("width", this.width);
    }

    #setWidth(width) {
        this.width = width;
    }

    #drawHistogramLegend() {
        const histogramHeight = this.histogramRenderer.histogramHeight;
        const multiplier = this.histogramRenderer.multiplier;

        this.histogramGroup = SVG.addChild(this.svgGroup, "g", {
            "class": "histogramGroup",
            "visibility": "hidden"
        });
        let text = SVG.addChild(this.histogramGroup, "text", {
            "x": 21,
            "y": histogramHeight + 4,
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            "class": this.fontClass
        });
        text.textContent = "0-";
        text = SVG.addChild(this.histogramGroup, "text", {
            "x": 14,
            "y": histogramHeight + 4 - (Math.log(10) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            "class": this.fontClass
        });
        text.textContent = "10-";
        text = SVG.addChild(this.histogramGroup, "text", {
            "x": 7,
            "y": histogramHeight + 4 - (Math.log(100) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            "class": this.fontClass
        });
        text.textContent = "100-";
        text = SVG.addChild(this.histogramGroup, "text", {
            "x": 0,
            "y": histogramHeight + 4 - (Math.log(1000) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            "class": this.fontClass
        });
        text.textContent = "1000-";
    }

    render(target) {
        this.initializeDom(target);

        this.#setCanvasConfig();
    }

    #setCanvasConfig() {
        this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
        this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
        this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;
    }

    getDataHandler(event) {
        console.time("Total FeatureTrack -> getDataHandler " + event.sender.category);

        console.time("Chunks() FeatureTrack -> getDataHandler " + event.sender.category);
        let renderer, features;
        if (event.dataType !== "histogram") {
            renderer = this.renderer;
            features = this.getFeaturesToRenderByChunk(event);
        } else {
            renderer = this.histogramRenderer;
            features = event.items;
        }
        console.timeEnd("Chunks() FeatureTrack -> getDataHandler " + event.sender.category);

        console.time("render() FeatureTrack -> getDataHandler " + event.sender.category);
        renderer.render(features, {
            cacheItems: event.items,
            svgCanvasFeatures: this.svgCanvasFeatures,
            featureTypes: this.featureTypes,
            renderedArea: this.renderedArea,
            pixelBase: this.pixelBase,
            position: this.region.center(),
            regionSize: this.region.length(),
            maxLabelRegionSize: this.config.maxLabelRegionSize,
            width: this.width,
            pixelPosition: this.pixelPosition,
            resource: this.resource,
            species: this.species,
            featureType: this.featureType
        });
        console.timeEnd("render() FeatureTrack -> getDataHandler " + event.sender.category);

        this.updateHeight();
        console.timeEnd("Total FeatureTrack -> getDataHandler " + event.sender.category);
    }

    draw(customAdapter, customRenderer) {
        const adapter = customAdapter || this.dataAdapter;

        this.clean();
        this.#setCanvasConfig();

        this.updateHistogramParams();

        this.dataType = "features";
        if (this.histogram) {
            this.dataType = "histogram";
        }

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {
            this.setLoading(true);

            const region = new Region({chromosome: this.region.chromosome,
                start: this.region.start - this.svgCanvasOffset * 2,
                end: this.region.end + this.svgCanvasOffset * 2
            });

            const params = {
                ...(adapter.params || {}),
                histogram: this.histogram,
                histogramLogarithm: this.histogramLogarithm,
                histogramMax: this.histogramMax,
                interval: this.interval,
            };

            console.time("SuperTotal FeatureTrack -> getDataHandler");
            adapter.getData({dataType: this.dataType, region: region, params: params})
                .then(response => {
                    this.getDataHandler(response);
                    this.setLoading(false);
                })
                .catch(reason => {
                    console.log("Feature Track draw error: " + reason);
                });
            console.timeEnd("SuperTotal FeatureTrack -> getDataHandler");
        }

        this.updateHeight();
    }

    getFeaturesToRenderByChunk(response, filters) {
        // Returns an array avoiding already drawn features in this.chunksDisplayed
        const getChunkId = pos => Math.floor(pos / response.chunkSize);
        const getChunkKey = (chromosome, chunkId) => {
            return `${chromosome}:${chunkId}_${response.dataType}_${response.chunkSize}`;
        };

        let displayed, featureFirstChunk, featureLastChunk;
        const features = [];

        response.items.forEach(chunk => {
            // check if any chunk is already displayed and skip it
            if (this.chunksDisplayed[chunk.chunkKey] !== true) {
                chunk.value.forEach(feature => {
                    // check if any feature has been already displayed by another chunk
                    let displayed = false;
                    const featureFirstChunk = getChunkId(feature.start);
                    const featureLastChunk = getChunkId(feature.end);
                    for (let chunkId = featureFirstChunk; chunkId <= featureLastChunk; chunkId++) {
                        const chunkKey = getChunkKey(feature.chromosome, chunkId);
                        if (this.chunksDisplayed[chunkKey] === true) {
                            displayed = true;
                            break;
                        }
                    }
                    if (!displayed) {
                        features.push(feature);
                    }
                });
                this.chunksDisplayed[chunk.chunkKey] = true;
            }
        });

        return features;
    }

    move(disp) {
        this.dataType = this.histogram ? "histogram" : "features";
        this.region.center();

        const pixelDisplacement = disp * this.pixelBase;
        this.pixelPosition -= pixelDisplacement;

        // parseFloat important
        const move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        const virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        const virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {

            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: this.region.chromosome,
                        start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                        end: this.svgCanvasLeftLimit,
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval,
                    },
                })
                    .then(response => this.getDataHandler(response))
                    .catch(reason => {
                        console.log("Feature Track move error: " + reason);
                    });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: this.region.chromosome,
                        start: this.svgCanvasRightLimit,
                        end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset)
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval,
                    },
                })
                    .then(response => this.getDataHandler(response))
                    .catch(reason => {
                        console.log("Feature Track move error: " + reason);
                    });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }

        if (this.autoHeight === true) {
            this.updateHeight();
        }
    }

    // Placeholder getDefaultConfig
    getDefaultConfig() {
        return {
            resizable: true,
            closable: false,
            showSettings: false,
            minHistogramRegionSize: 300000000,
            maxLabelRegionSize: 300000000,
        };
    }

}
