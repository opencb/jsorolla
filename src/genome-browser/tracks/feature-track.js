class FeatureTrack {
    constructor(args) {
        this.id = Utils.genId("track");
        this.dataAdapter;
        this.renderer;
        this.histogramRendererName = "HistogramRenderer";
        this.resizable = true;
        this.autoHeight = false;
        this.targetId;
        this.title;
        this.minHistogramRegionSize = 300000000;
        this.maxLabelRegionSize = 300000000;
        this.width = 200;
        this.height = 100;
        this.visibleRegionSize;
        this.visible = true;
        this.contentVisible = true;
        this.closable = false;
        this.fontClass = "ocb-font-roboto ocb-font-size-14";
        this.externalLink = "";
        this.autoRender = false;

        Object.assign(this, args);
        if (this.renderer != null) {
            this.renderer.track = this;
        }

        this.pixelBase;
        this.svgCanvasWidth = 500000;
        this.pixelPosition = this.svgCanvasWidth / 2;
        this.svgCanvasOffset;

        this.status;
        this.histogram;
        this.histogramLogarithm;
        this.histogramMax;
        this.interval;

        this.svgCanvasLeftLimit;
        this.svgCanvasRightLimit;


        this.invalidZoomText;
        this.exclude;

        this.renderedArea = {}; //used for renders to store binary trees
        this.chunksDisplayed = {}; //used to avoid painting multiple times features contained in more than 1 chunk

        if ("handlers" in this) {
            for (eventName in this.handlers) {
                this.on(eventName, this.handlers[eventName]);
            }
        }

        this.rendered = false;
        if (this.autoRender) {
            this.render();
        }

        Object.assign(this, Backbone.Events);

        //save default render reference;
        this.defaultRenderer = this.renderer;

        this.histogramRenderer = new window[this.histogramRendererName](args);
        this.dataType = "features";

        this.featureType = "Feature"; // This only have the old class feature track
        // this.resource = this.dataAdapter.resource;// This only have the old class feature track
        // this.species = this.dataAdapter.species;// This only have the old class feature track
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
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    remove() {
        $(this.div).remove();
    }

    hideContent() {
        this.contentVisible = false;
        this.contentDiv.classList.add("hidden");
        this.resizeDiv.classList.add("hidden");

        this.iToggleEl.classList.remove("fa-minus");
        this.iToggleEl.classList.add("fa-plus");
    }

    showContent() {
        this.contentVisible = true;
        this.contentDiv.classList.remove("hidden");
        this.resizeDiv.classList.remove("hidden");

        this.iToggleEl.classList.remove("fa-plus");
        this.iToggleEl.classList.add("fa-minus");
        this.updateHeight();
    }

    toggleContent() {
        if (this.contentVisible) {
            this.hideContent();
        } else {
            this.showContent();
        }
    }

    close() {
        this.trigger("track:close", { sender: this });
    }

    up() {
        this.trigger("track:up", { sender: this });
    }

    down() {
        this.trigger("track:down", { sender: this });
    }

    setSpecies(species) {
        this.species = species;
        this.dataAdapter.setSpecies(this.species);
    }

    enableAutoHeight() {
        console.log("enable autoHeigth");
        this.autoHeight = true;
        this.updateHeight();
    }

    disableAutoHeight() {
        console.log("disable autoHeigth");
        this.autoHeight = false;
        this.updateHeight();
    }

    toggleAutoHeight(bool) {
        if (bool === true) {
            this.enableAutoHeight();
            return;
        } else if (bool === false) {
            this.disableAutoHeight();
            return;
        }
        if (this.autoHeight === true) {
            this.disableAutoHeight();
            return;
        } else if (this.autoHeight === false) {
            this.enableAutoHeight();
            return;
        }
    }

    setTitle(title) {
        $(this.titleText).html(title);
    }

    setLoading(bool) {
        if (bool) {
            this.status = "rendering";
            $(this.loadingEl).html('&nbsp; &nbsp;<i class="fa fa-spinner fa-spin"></i> Loading...</span>');
        } else {
            this.status = "ready";
            $(this.loadingEl).html("");
        }
    }

    updateHistogramParams() {
        if (this.region.length() > this.minHistogramRegionSize) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = Math.ceil(10 / this.pixelBase); //server interval limit 512
            $(this.histogramEl).html('&nbsp;<i class="fa fa-signal"></i>');
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
            this.interval = undefined;
            $(this.histogramEl).html("");
        }
    }
    clean() {
        this._clean();
        while (this.svgCanvasFeatures.firstChild) {
            this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
        }
    }

    _clean() {
        //Must be called on child clean method
        this.chunksDisplayed = {};
        this.renderedArea = {};
    }

    //updateHeight() {
    //    this._updateHeight();
    //}
    //
    //_updateHeight() {
    //    $(this.contentDiv).css({
    //        'height': this.height + 10
    //    });
    //}

    updateHeight() {
        //this._updateHeight();
        if (this.histogram) {
            this.contentDiv.style.height = `${this.histogramRenderer.histogramHeight + 5}px`;
            this.main.setAttribute("height", this.histogramRenderer.histogramHeight);
            return;
        }

        let renderedHeight = this.height;
        let heightKeys = Object.keys(this.renderedArea);
        heightKeys.sort(function (a, b) {
            return parseInt(b) - parseInt(a);
        });
        if (heightKeys.length > 0) {
            renderedHeight = parseInt(heightKeys[0]) + 30;
        }
        renderedHeight = Math.max(renderedHeight, this.height);
        this.main.setAttribute("height", renderedHeight);

        if (this.resizable) {
            if (this.autoHeight === false) {
                this.contentDiv.style.height = `${this.height + 10}px`;
            } else if (this.autoHeight === true) {
                let x = this.pixelPosition;
                let width = this.width;
                let lastContains = 0;
                for (let i in this.renderedArea) {
                    if (this.renderedArea[i].contains({
                            start: x,
                            end: x + width
                        })) {
                        lastContains = i;
                    }
                }
                let visibleHeight = Math.max(parseInt(lastContains) + 30, this.height);
                this.contentDiv.style.height = `${visibleHeight + 10}px`;
                this.main.setAttribute("height", visibleHeight);
            }
        }
    }

    setWidth(width) {
        this._setWidth(width);
        this.main.setAttribute("width", this.width);
    }

    _setWidth(width) {
        this.width = width;
    }

    initializeDom(targetId) {
        this._initializeDom(targetId);

        this.main = SVG.addChild(this.contentDiv, "svg", {
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width
        });
        this.svgCanvasFeatures = SVG.addChild(this.main, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth
        });
        this.updateHeight();
        this.renderer.init();
    }

    _initializeDom(targetId) {
        let _this = this;
        let div = $(`<div id="${this.id}-div"></div>`)[0];
        div.classList.add("ocb-gv-track");

        let titleBarHtml = `
           <div class="ocb-gv-track-title">
               <div class="ocb-gv-track-title-el">
                    <span class="ocb-gv-track-title-text">${this.title}</span>
                    <span class="ocb-gv-track-title-histogram"></span>
                    <span class="ocb-gv-track-title-toggle"><i class="fa fa-minus"></i></span>
                    <span class="ocb-gv-track-title-down"><i class="fa fa-chevron-down"></i></span>
                    <span class="ocb-gv-track-title-up"><i class="fa fa-chevron-up"></i></span>
        `;

        if (this.closable === true) {
            titleBarHtml += '           <span class="ocb-gv-track-title-close"><i class="fa fa-times"></i></span>';
        }

        if (this.externalLink !== "") {
            titleBarHtml += '           <span class="ocb-gv-track-title-external-link"><i class="fa fa-external-link"></i></span>';
        }

        titleBarHtml += `            <span class="ocb-gv-track-title-loading"></span>
                </div>
            </div>
        `;

        let titleBardiv = $(titleBarHtml)[0];

        if (typeof this.title === "undefined") {
            $(titleBardiv).addClass("hidden");
        }

        let titlediv = titleBardiv.querySelector(".ocb-gv-track-title");
        this.titleEl = titleBardiv.querySelector(".ocb-gv-track-title-el");

        this.titleText = titleBardiv.querySelector(".ocb-gv-track-title-text");
        this.histogramEl = titleBardiv.querySelector(".ocb-gv-track-title-histogram");
        this.toggleEl = titleBardiv.querySelector(".ocb-gv-track-title-toggle");
        this.iToggleEl = this.toggleEl.querySelector("i");
        this.loadingEl = titleBardiv.querySelector(".ocb-gv-track-title-loading");
        this.closeEl = titleBardiv.querySelector(".ocb-gv-track-title-close");
        this.upEl = titleBardiv.querySelector(".ocb-gv-track-title-up");
        this.downEl = titleBardiv.querySelector(".ocb-gv-track-title-down");
        this.externalLinkEl = titleBardiv.querySelector(".ocb-gv-track-title-external-link");

        let contentDiv = $(`<div id="${this.id}-svgdiv"></div>`)[0];
        $(contentDiv).css({
            "position": "relative",
            "box-sizing": "boder-box",
            "z-index": 3,
            "height": this.height,
            "overflow-y": (this.resizable) ? "auto" : "hidden",
            "overflow-x": "hidden"
        });

        let resizediv = $(`<div id="${this.id}-resizediv" class="ocb-track-resize"></div>`)[0];

        $(targetId).addClass("unselectable");
        $(targetId).append(div);
        $(div).append(titleBardiv);
        $(div).append(contentDiv);
        $(div).append(resizediv);


        /** title div **/
        $(titleBardiv).css({
            "padding": "4px"
        }).on("dblclick", function(e) {
            e.stopPropagation();
        });

        $(this.toggleEl).click(function(e) {
            _this.toggleContent();
        });
        $(this.closeEl).click(function(e) {
            _this.close();
        });
        $(this.upEl).click(function(e) {
            _this.up();
        });
        $(this.downEl).click(function(e) {
            _this.down();
        });
        $(this.externalLinkEl).click(function(e) {
            window.open(_this.externalLink);
        });

        if (this.resizable) {
            $(resizediv).mousedown(function(event) {
                $("html").addClass("unselectable");
                event.stopPropagation();
                let downY = event.clientY;
                $("html").bind("mousemove.genomeViewer", function(event) {
                    let despY = (event.clientY - downY);
                    let actualHeight = $(contentDiv).outerHeight();
                    let newHeight = actualHeight + despY;
                    if (newHeight > 0) {
                        _this.height = newHeight;
                        $(contentDiv).css({
                            height: _this.height
                        });
                    }
                    downY = event.clientY;
                    //                    _this.autoHeight = false;
                });
            });
            $("html").bind("mouseup.genomeViewer", function(event) {
                $("html").removeClass("unselectable");
                $("html").off("mousemove.genomeViewer");
            });
            $(contentDiv).closest(".trackListPanels").mouseup(function(event) {
                _this.updateHeight();
            });
        }

        this.div = div;
        this.contentDiv = contentDiv;
        this.titlediv = titlediv;
        this.resizeDiv = resizediv;
        this.rendered = true;
        this.status = "ready";
    }

    _drawHistogramLegend() {
        let histogramHeight = this.histogramRenderer.histogramHeight;
        let multiplier = this.histogramRenderer.multiplier;

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

    render(targetId) {
        this.initializeDom(targetId);

        this._setCanvasConfig();
    }

    _setCanvasConfig() {
        this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
        this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
        this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;
    }

    getDataHandler(event) {
        let features;
        if (event.dataType === "histogram") {
            this.renderer = this.histogramRenderer;
            features = event.items;
        } else {
            this.renderer = this.defaultRenderer;
            features = this.getFeaturesToRenderByChunk(event);
        }
        this.renderer.render(features, {
            cacheItems: event.items,
            svgCanvasFeatures: this.svgCanvasFeatures,
            featureTypes: this.featureTypes,
            renderedArea: this.renderedArea,
            pixelBase: this.pixelBase,
            position: this.region.center(),
            regionSize: this.region.length(),
            maxLabelRegionSize: this.maxLabelRegionSize,
            width: this.width,
            pixelPosition: this.pixelPosition,
            resource: this.resource,
            species: this.species,
            featureType: this.featureType
        });
        this.updateHeight();
    }

    draw(adapter, renderer) {

        if(adapter == null){
            adapter = this.dataAdapter;
        }
        if (renderer == null){
            renderer = this.renderer;
        }
        this.clean();
        this._setCanvasConfig();

        this.updateHistogramParams();

        this.dataType = "features";
        if (this.histogram) {
            this.dataType = "histogram";
        }

// debugger
        let _this = this;
        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {
            this.setLoading(true);

            let region = new Region({chromosome: this.region.chromosome,start: this.region.start -
            this.svgCanvasOffset * 2, end: this.region.end + this.svgCanvasOffset * 2});

            let params = {
                histogram: this.histogram,
                histogramLogarithm: this.histogramLogarithm,
                histogramMax: this.histogramMax,
                interval: this.interval,
                exclude: this.exclude
                };

            adapter.getData({dataType:this.dataType, region: region, params: params})
                .then(function (response){
                    _this.getDataHandler(response);
                    _this.setLoading(false);
                })
                .catch(function(response){
                    console.log("Feature Track draw error.")
                });
            //this.dataAdapter.getData({
            //    dataType: this.dataType,
            //    region: new Region({
            //        chromosome: this.region.chromosome,
            //        start: this.region.start - this.svgCanvasOffset * 2,
            //        end: this.region.end + this.svgCanvasOffset * 2
            //    }),
            //    params: {
            //        histogram: this.histogram,
            //        histogramLogarithm: this.histogramLogarithm,
            //        histogramMax: this.histogramMax,
            //        interval: this.interval,
            //        exclude: this.exclude
            //    },
            //    done: function (event) {
            //        _this.getDataHandler(event);
            //        _this.setLoading(false);
            //    }
            //});
        } else {
            //        this.invalidZoomText.setAttribute("visibility", "visible");
        }
        this.updateHeight();
    }

    getFeaturesToRenderByChunk(response, filters) {
        //Returns an array avoiding already drawn features in this.chunksDisplayed

        let getChunkId = function(position) {
            return Math.floor(position / response.chunkSize);
        };
        let getChunkKey = function(chromosome, chunkId) {
            return `${chromosome}:${chunkId}_${response.dataType}_${response.chunkSize}`;
        };

        let chunks = response.items;

        let feature, displayed, featureFirstChunk, featureLastChunk, features = [];
        for (let i = 0, leni = chunks.length; i < leni; i++) {
            if (this.chunksDisplayed[chunks[i].chunkKey] !== true) { //check if any chunk is already displayed and skip it

                for (let j = 0, lenj = chunks[i].value.length; j < lenj; j++) {
                    feature = chunks[i].value[j];

                    //check if any feature has been already displayed by another chunk
                    displayed = false;
                    featureFirstChunk = getChunkId(feature.start);
                    featureLastChunk = getChunkId(feature.end);
                    for (let chunkId = featureFirstChunk; chunkId <= featureLastChunk; chunkId++) {
                        let chunkKey = getChunkKey(feature.chromosome, chunkId);
                        if (this.chunksDisplayed[chunkKey] === true) {
                            displayed = true;
                            break;
                        }
                    }
                    if (!displayed) {
                        features.push(feature);
                    }
                }
                this.chunksDisplayed[chunks[i].chunkKey] = true;
            }
        }
        return features;
    }

    move(disp) {
        let _this = this;

        this.dataType = "features";
        if (this.histogram) {
            this.dataType = "histogram";
        }

        _this.region.center();
        let pixelDisplacement = disp * _this.pixelBase;
        this.pixelPosition -= pixelDisplacement;

        //parseFloat important
        let move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        let virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        let virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {

            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                        end: this.svgCanvasLeftLimit
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval
                    },
                    done: function (event) {
                        _this.getDataHandler(event);
                    }
                });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: this.svgCanvasRightLimit,
                        end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset)
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval
                    },
                    done: function (event) {
                        _this.getDataHandler(event);
                    }

                });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }

        if (this.autoHeight === true) {
            this.updateHeight();
        }
    }
}
