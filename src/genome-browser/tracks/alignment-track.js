class AlignmentTrack extends FeatureTrack {

    constructor(args) {
        super(args);

        //set default args
        this.retrievedAlignments = null;
        this.retrievedChunkIds = new Set();

        this.config = {
            display: {
                asPairs: true,
                minMapQ: 50, // Reads with a mapping quality under 20 will have a transparency
            },
            filters: {
                properlyPaired: false,
                skipUnmapped: false,
                skipDuplicated: false,
                contained: false,
                minMapQ: -1,
                maxNM: -1,
                maxNH: -1
            }
        };

        // set user args
        Object.assign(this, args);

        this.showSettings = true;

        this._init();

        this.on("track:settings", function(event) {
            this.showModalSettings(event.sender);
        });
    }

    _init() {
        // Set OpenCGA adapter as default.
        // OpenCGA Client constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            if (UtilsNew.isNotUndefinedOrNull(this.opencga)) {
                if (UtilsNew.isNotUndefinedOrNull(this.opencga.client)) {
                    this.dataAdapter = new OpencgaAdapter(this.opencga.client, "analysis/alignment", "", "query", {
                        study: this.opencga.study,
                        fileId: this.opencga.file
                    }, {
                        chunkSize: 5000,
                    });
                }
            } else {
                console.error("No 'dataAdapter' or 'opencga' object provided");
            }
        }

        // Set FeatureRenderer as default
        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            let customConfig = {};
            if (UtilsNew.isNotUndefinedOrNull(this.opencga)) {
                customConfig = Object.assign(customConfig, this.opencga.config);
            }
            this.renderer = new AlignmentRenderer(
                { config: customConfig }
            );
        }
        this.renderer.track = this;

    }

    initializeDom(targetId) {
        this._initializeDom(targetId);
        this._createModalDiv(targetId);

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

    getDataHandler(event) {
        let features = event;
        this.renderedArea = {}; //<- this is only in Alignments
        this.renderer.render(features, {
            config: this.config.display,
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
            region: this.region,
            trackListPanel: this.trackListPanel
        });
        this.updateHeight();
    }

    draw() {
        let _this = this;

        this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
        this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
        this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;

        this.updateHistogramParams();
        this.clean();

        this.dataType = "features";
        if (this.histogram) {
            this.dataType = "histogram";
        }

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {
            this.setLoading(true);
            this.dataAdapter.getData({
                dataType: this.dataType,
                region: new Region({
                    chromosome: this.region.chromosome,
                    start: this.region.start - this.svgCanvasOffset * 2,
                    end: this.region.end + this.svgCanvasOffset * 2
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                }
            })
                .then(function(response) {
                    _this._storeRetrievedAlignments(response);
                    _this.getDataHandler(response);
                    _this.setLoading(false);
                })
                .catch(function(reason){
                    console.log("Alignment Track draw error: " + reason);
                });
            //this.invalidZoomText.setAttribute("visibility", "hidden");
        } else {
            //this.invalidZoomText.setAttribute("visibility", "visible");
        }
        _this.updateHeight();
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

        let move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
        this.svgCanvasFeatures.setAttribute("x", move);

        let virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
        let virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

        if (typeof this.visibleRegionSize === "undefined" || this.region.length() < this.visibleRegionSize) {

            if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
                _this.setLoading(true);
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset - 1),
                        end: this.svgCanvasLeftLimit - 1
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval
                    }
                })
                    .then(function(response){
                        _this._addNewAlignments(response, "left");
                        // if(response.dataType === "histogram"){
                        //     _this.getDataHandler(response);
                        // }else {
                        _this.getDataHandler(_this.retrievedAlignments);
                        // }
                        _this.setLoading(false);
                    })
                    .catch(function(reason){
                        console.log("Alignment Track move error: " + reason);

                    });
                this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
            }

            if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
                _this.setLoading(true);
                this.dataAdapter.getData({
                    dataType: this.dataType,
                    region: new Region({
                        chromosome: _this.region.chromosome,
                        start: this.svgCanvasRightLimit + 1,
                        end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset + 1)
                    }),
                    params: {
                        histogram: this.histogram,
                        histogramLogarithm: this.histogramLogarithm,
                        histogramMax: this.histogramMax,
                        interval: this.interval
                    }
                })
                    .then(function(response){
                        _this._addNewAlignments(response, "right");
                        _this.getDataHandler(_this.retrievedAlignments);
                        _this.setLoading(false);

                    })
                    .catch(function(reason){
                        console.log("Alignment Track move error: " + reason);

                    });
                this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
            }
        }
    }

    _storeRetrievedAlignments(event) {
        if (event.dataType === "histogram") {
            return;
        }

        this.retrievedAlignments = event;

        // Update real left and right limits
        this.svgCanvasLeftLimit = event.items[0].region.start;
        this.svgCanvasRightLimit = event.items[event.items.length - 1].region.end;

        this.retrievedChunkIds = new Set();
        for (let i = 0; i < event.items.length; i++) {
            this.retrievedChunkIds.add(event.items[i].chunkKey);
        }
    }

    _addNewAlignments(event, position) {
        if (event.dataType === "histogram") {
            return;
        }

        if (position === "right") {
            for (let i = 0; i < event.items.length; i++) {
                if (this.retrievedChunkIds.has(event.items[i].chunkKey)) {
                    // We should not call several times to the webservices asking for regions we already have
                } else {
                    this.retrievedChunkIds.add(event.items[i].chunkKey);
                    this.retrievedAlignments.items.push(event.items[i]);
                }
            }

            // Dispose of far away items from the left
            while (this.retrievedAlignments.items[0].region.end < this.region.start - this.svgCanvasOffset) {
                let chunkKey = this.retrievedAlignments.items[0].chunkKey;
                console.log(`Dispose region ${chunkKey}`);
                this.retrievedChunkIds.delete(chunkKey);
                this.retrievedAlignments.items.splice(0, 1);
            }
        } else { // left
            // this.retrievedAlignments.items.unshift(event.items);
            for (let i = event.items.length - 1; i >= 0; i--) {
                if (this.retrievedChunkIds.has(event.items[i].chunkKey)) {
                    // We should not call several times to the webservices asking for regions we already have
                    // debugger;
                } else {
                    this.retrievedChunkIds.add(event.items[i].chunkKey);
                    this.retrievedAlignments.items.unshift(event.items[i]);
                }
            }

            // Dispose of far away items from the right
            while (this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].region.start >
            this.region.end + this.svgCanvasOffset) {
                let chunkKey = this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].chunkKey;
                console.log(`Dispose region ${chunkKey}`);
                this.retrievedChunkIds.delete(chunkKey);
                this.retrievedAlignments.items.splice(this.retrievedAlignments.items.length - 1, 1);
            }

        }

        // Update canvas limits
        this.svgCanvasLeftLimit = this.retrievedAlignments.items[0].region.start;
        this.svgCanvasRightLimit = this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].region.end;
    }

    _createModalDiv() {

        /*
        * <div class="modal fade">
           <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p>Modal body text goes here.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary">Save changes</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
        * */
        let div = document.createElement("div");
        div.setAttribute("class", "modal fade");
        div.setAttribute("role", "dialog");

        let modalDialog = document.createElement("div");
        modalDialog.setAttribute("class", "modal-dialog");
        modalDialog.setAttribute("role", "document");
        div.appendChild(modalDialog);

        let modalContent = document.createElement("div");
        modalContent.setAttribute("class", "modal-content");
        modalDialog.appendChild(modalContent);

        let modalBody = document.createElement("div");
        modalBody.setAttribute("class", "modal-body");
        modalBody.appendChild(modalContent);

        this.div.append(div);
        
        this.modalSettings = div;
    }

    showModalSettings(event) {
        this.modalSettings.modal('show');
    }
}
