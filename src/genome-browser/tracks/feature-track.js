import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utilsNew.js";
// import HistogramRenderer from "../renderers/histogram-renderer.js";
import {SVG} from "../../core/svg.js";

export default class FeatureTrack {

    constructor(config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.prefix = UtilsNew.randomString(8);
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    #init() {
        this.width = this.config.width || 200;
        this.height = this.config.height || 100;
        this.visible = true;
        this.contentVisible = true;
        this.autoHeight = true;

        this.status = "";

        this.fontClass = "ocb-font-roboto ocb-font-size-14";

        // TODO: review if we need this
        // if (this.renderer != null) {
        //     this.renderer.track = this;
        // }

        this.svgCanvasWidth = 500000;
        this.svgCanvasOffset;

        this.pixelBase = 0;
        this.pixelPosition = this.svgCanvasWidth / 2;

        this.svgCanvasLeftLimit;
        this.svgCanvasRightLimit;

        this.invalidZoomText;

        this.renderedArea = {}; // used for renders to store binary trees
        this.renderedFeatures = new Set(); // used to prevent rendering features twice
        // this.chunksDisplayed = {}; // used to avoid painting multiple times features contained in more than 1 chunk

        // save default render reference;
        // this.defaultRenderer = this.renderer;
        // this.renderer = this.renderer;

        // this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        // this.histogramRendererName = "HistogramRenderer";

        this.dataType = "features";
        this.featureType = "Feature"; // This only have the old class feature track

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
        // this.content.style.height = `${this.height}px`;
        this.content.style.overflowX = "hidden";
        if (this.config.resizable) {
            this.content.style.maxHeight = `${this.height}px`;
            this.content.style.overflowY = "auto";
        }

        // Resize bar
        this.resize = this.div.querySelector(`div#${this.prefix}Resize`);
        if (!this.config.resizable) {
            this.resize.style.display = "none";
        }

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
                downY = event.clientY;

                if (newHeight > 0) {
                    this.content.style.maxHeight = `${newHeight}px`;
                }
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
        // this.renderer.init();
    }

    // TODO: review this method
    render(target) {
        this.initializeDom(target);

        this.#setCanvasConfig();
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
        // this.dataAdapter.setSpecies(this.species);
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
            // this.interval = Math.ceil(10 / this.pixelBase); // server interval limit 512
            this.interval = 100000;
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
        // this.chunksDisplayed = {};
        this.renderedArea = {};
        this.renderedFeatures.clear();
    }

    updateHeight() {
        if (this.histogram) {
            this.content.style.height = `${this.histogramRenderer.config.histogramHeight + 5}px`;
            this.main.setAttribute("height", this.histogramRenderer.config.histogramHeight);
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

        if (this.config.resizable) {
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
                this.content.style.height = `${visibleHeight + 10}px`;
                this.main.setAttribute("height", visibleHeight);
            }
        }
    }

    setWidth(width) {
        this.width = width;
        this.main.setAttribute("width", this.width);
    }

    setRegion(newRegion) {
        this.region = newRegion;
    }

    setPixelBase(newPixelBase) {
        this.pixelBase = newPixelBase;
    }

    #drawHistogramLegend() {
        const histogramHeight = this.histogramRenderer.config.histogramHeight;
        const multiplier = this.histogramRenderer.config.multiplier;

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

    #setCanvasConfig() {
        this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
        this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
        this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;
    }

    // Generic get data method (to be implemented in each track)
    getData(options) {
        return this.dataAdapter.getData(options);
    }

    getDataHandler(data, request) {
        const renderer = this.dataType === "histogram" ? this.histogramRenderer : this.renderer;

        renderer.render(data, {
            // cacheItems: event.items,
            svgCanvasFeatures: this.svgCanvasFeatures,
            featureTypes: this.featureTypes,
            renderedArea: this.renderedArea,
            renderedFeatures: this.renderedFeatures,
            pixelBase: this.pixelBase,
            position: this.region.center(),
            regionSize: this.region.length(),
            labelMaxRegionSize: this.config.labelMaxRegionSize,
            width: this.width,
            pixelPosition: this.pixelPosition,
            resource: this.resource,
            species: this.species,
            featureType: this.featureType,
            requestedRegion: request.region,
        });

        this.updateHeight();
    }

    getDataType() {
        if (this.config.histogramMinRegionSize && this.region.length() > this.config.histogramMinRegionSize) {
            this.titleHistogram.style.display = "inline-block";
            return "histogram";
        }

        // Not histogram data --> return features
        this.titleHistogram.style.display = "none";
        return "features";
    }

    // draw(customAdapter, customRenderer) {
    draw() {
        // const adapter = customAdapter || this.dataAdapter;

        this.clean();
        this.#setCanvasConfig();

        // this.updateHistogramParams();
        // Get data type
        this.dataType = this.getDataType();
        // this.renderedFeatures.clear(); // Reset rendered features list

        if (typeof this.config.visibleRegionSize === "undefined" || this.region.length() < this.config.visibleRegionSize) {
            this.setLoading(true);

            // Get data options
            const options = {
                dataType: this.dataType,
                region: new Region({
                    chromosome: this.region.chromosome,
                    start: Math.max(this.region.start - this.svgCanvasOffset * 2, 0),
                    end: this.region.end + this.svgCanvasOffset * 2,
                }),
            };

            // Import and draw data
            this.getData(options).then(response => {
                this.getDataHandler(response.responses[0].results, options);
                this.setLoading(false);
            });
        }

        this.updateHeight();
    }

    move(disp) {
        // this.dataType = this.histogram ? "histogram" : "features";
        this.region.center();

        const pixelDisplacement = disp * this.pixelBase;
        this.pixelPosition -= pixelDisplacement;

        // parseFloat important
        const move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        const virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        const virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

        if (typeof this.config.visibleRegionSize === "undefined" || this.region.length() < this.config.visibleRegionSize) {
            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                const options = {
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: this.region.chromosome,
                        start: Math.max(parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset), 0),
                        end: this.svgCanvasLeftLimit,
                    }),
                };
                this.getData(options).then(response => {
                    return this.getDataHandler(response.responses[0].results, options);
                });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                const options = {
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: this.region.chromosome,
                        start: Math.max(this.svgCanvasRightLimit, 0),
                        end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset),
                    }),
                };
                this.getData(options).then(response => {
                    return this.getDataHandler(response.responses[0].results, options);
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
            title: "",
            height: 100,
            resizable: true,
            closable: false,
            showSettings: false,
            histogramMinRegionSize: 300000000,
            histogramInterval: 100000,
            labelMaxRegionSize: 300000000,
            visibleRegionSize: 200,
        };
    }

}
