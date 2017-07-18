class GenomeBrowser{
    constructor(args){
        Object.assign(this, Backbone.Events);

        let _this = this;
        this.id = Utils.genId("GenomeBrowser");

        //set default args
        this.autoRender = true;
        this.version = 'Powered by <a target="_blank" href="http://www.opencb.org/">OpenCB</a>';
        this.target;

        this.width;
        this.height;

        this.client;
        this.cellBaseHost = "http://bioinfo.hpc.cam.ac.uk/cellbase";
        this.cellBaseVersion = "v4";

        this.quickSearchResultFn;
        this.quickSearchDisplayKey = "name";

        this.drawNavigationBar = true;
        this.drawKaryotypePanel = true;
        this.drawChromosomePanel = true;
        this.drawOverviewTrackListPanel = true;
        this.overviewZoomMultiplier = 8;
        this.karyotypePanelConfig = {
            hidden: false,
            collapsed: false,
            collapsible: true
        };
        this.chromosomePanelConfig = {
            hidden: false,
            collapsed: false,
            collapsible: true
        };
        this.regionPanelConfig = {
            hidden: false,
            collapsed: false,
            collapsible: true
        };
        this.navigationBarConfig = {};
        this.drawStatusBar = true;
        this.resizable = true;
        this.sidePanel = true;//enable or disable sidePanel at construction
        this.trackListTitle = "Detailed information";//enable or disable sidePanel at construction
        this.trackPanelScrollWidth = 18;

        this.zoom;

        this.chromosomes = [];
        this.chromosomeList;

        //set instantiation args, must be last
        Object.assign(this, args);

        this.getChromosomes();

        this.defaultRegion = new Region(this.region);

        this.sidePanelWidth = (this.sidePanel) ? 25 : 0;

        //events attachments
        this.on(this.handlers);

        this.fullscreen = false;
        this.resizing = false;

        this.changingRegion = false;

        this.rendered = false;
        if (this.autoRender) {
            this.render();
        }
    }

    render() {
        console.log("Initializing Genome Viewer");

        //HTML skel
        this.div = document.createElement("div");
        this.div.setAttribute("id", this.id);
        this.div.setAttribute("class", "ocb-gv ocb-box-vertical");

        this.navigationbarDiv = document.createElement("div");
        this.navigationbarDiv.setAttribute("class", "ocb-gv-navigation");
        this.div.appendChild(this.navigationbarDiv);

        this.centerPanelDiv = document.createElement("div");
        this.centerPanelDiv.setAttribute("class", "ocb-gv-center");
        this.div.appendChild(this.centerPanelDiv);

        this.statusbarDiv = document.createElement("div");
        this.statusbarDiv.setAttribute("class", "ocb-gv-status");
        this.div.appendChild(this.statusbarDiv);


        this.rightSidebarDiv = document.createElement("div");
        this.rightSidebarDiv.setAttribute("class", "ocb-gv-right-side");
        this.centerPanelDiv.appendChild(this.rightSidebarDiv);

        this.leftSidebarDiv = document.createElement("div");
        this.leftSidebarDiv.setAttribute("class", "ocb-gv-left-side");
        this.centerPanelDiv.appendChild(this.leftSidebarDiv);


        this.karyotypeDiv = document.createElement("div");
        this.karyotypeDiv.setAttribute("class", "ocb-gv-karyotype");
        this.centerPanelDiv.appendChild(this.karyotypeDiv);

        this.chromosomeDiv = document.createElement("div");
        this.chromosomeDiv.setAttribute("class", "ocb-gv-chromosome");
        this.centerPanelDiv.appendChild(this.chromosomeDiv);


        this.trackListPanelsDiv = document.createElement("div");
        this.trackListPanelsDiv.setAttribute("class", "ocb-gv-tracklist-target");
        this.centerPanelDiv.appendChild(this.trackListPanelsDiv);

        this.regionDiv = document.createElement("div");
        this.regionDiv.setAttribute("class", "ocb-gv-overview");
        this.trackListPanelsDiv.appendChild(this.regionDiv);

        this.tracksDiv = document.createElement("div");
        this.tracksDiv.setAttribute("class", "ocb-gv-detailed");
        this.trackListPanelsDiv.appendChild(this.tracksDiv);

        this._init();

        this.rendered = true;
    }

    _init() {
        let _this = this;
        this._checkAndSetMinimumRegion(this.region, this.getSVGCanvasWidth());
        this.zoom = this._calculateZoomByRegion(this.region);

        /* Navigation Bar */
        if (this.drawNavigationBar) {
            this.navigationBar = this._createNavigationBar(this.navigationbarDiv);
        }

        /*karyotype Panel*/
        if (this.drawKaryotypePanel) {
            this.karyotypePanel = this._drawKaryotypePanel(this.karyotypeDiv);
        }

        /* Chromosome Panel */
        if (this.drawChromosomePanel) {
            this.chromosomePanel = this._drawChromosomePanel(this.chromosomeDiv);
        }

        /* Region Panel, is a TrackListPanel Class */
        if (this.drawOverviewTrackListPanel) {
            this.overviewTrackListPanel = this._createOverviewTrackListPanel(this.regionDiv);
        }
        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel(this.tracksDiv);

        /*Status Bar*/
        if (this.drawStatusBar) {
            this.statusBar = this._createStatusBar(this.statusbarDiv);
        }

        this.on("region:change region:move", function (event) {
            if (event.sender !== _this) {
                _this.region.load(event.region);
            }
        });
        this.on("width:change", function (event) {
            if (event.sender !== _this) {
                _this.width = event.width;
                $(_this.div).width(event.width);
                $(_this.targetDiv).width(event.width);
            }
        });

        $("html").bind("keydown.genomeViewer", function (e) {
            switch (e.keyCode) {
                case 40://down arrow
                case 109://minus key
                    if (e.shiftKey) {
                        _this.increaseZoom(-10);
                    }
                    break;
                case 38://up arrow
                case 107://plus key
                    if (e.shiftKey) {
                        _this.increaseZoom(10);
                    }
                    break;
            }
        });
    }

    draw() {
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log("target not found");
            return;
        }
        this.targetDiv.appendChild(this.div);
    }

    destroy() {
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        $(this.div).remove();
        this.off();
        this.rendered = false;
        $("html").unbind(".genomeViewer");
        $("body").unbind(".genomeViewer");
        delete this;
    }

    getChromosomes() {
        let saveChromosomes = function (chromosomeList) {
            let chromosomes = {};
            for (let i = 0; i < chromosomeList.length; i++) {
                let chromosome = chromosomeList[i];
                chromosomes[chromosome.name] = chromosome;
            }
            return chromosomes;
        };

        if (typeof this.chromosomeList !== "undefined") {
            this.chromosomes = saveChromosomes(this.chromosomeList);
            this.species.chromosomes = this.chromosomes;
        } else {
            let _this = this;

            _this.client.get("genomic", "chromosome", undefined, "search")
                .then(function (response) {
                    let chromosomesOld = _this.chromosomes;
                    _this.chromosomes = saveChromosomes(response.response[0].result[0].chromosomes);
                    if (chromosomesOld !== undefined && chromosomesOld.length === 0) {
                        // If it's the first time we get the chromosomes...
                        _this._checkAndSetMinimumRegion(_this.region, _this.getSVGCanvasWidth());
                        _this.zoom = _this._calculateZoomByRegion(_this.region);
                        _this._updateSpecies(_this.species);
                        console.log("Recalculating sizes...");
                    }
                });
        }
    }
    /**/
    /*Components*/
    /**/

    _createNavigationBar(target) {
        let _this = this;

        if (!$.isFunction(this.quickSearchResultFn)) {
            this.quickSearchResultFn = function (query) {
                return _this.client.get("feature", "id", query, "starts_with", { limit: 10 });
            };
        }

        let goFeature = function (feature) {
            _this._regionChangeHandler({region: new Region(feature)});
        };

        let navigationBar = new NavigationBar({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            availableSpecies: this.availableSpecies,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth,
            zoom: this.zoom,
            quickSearchResultFn: this.quickSearchResultFn,
            quickSearchDisplayKey: this.quickSearchDisplayKey,
            componentsConfig: this.navigationBarConfig.componentsConfig,
            karyotypePanelConfig: this.karyotypePanelConfig,
            chromosomePanelConfig: this.chromosomePanelConfig,
            regionPanelConfig: this.regionPanelConfig,
            handlers: {
                "region:change": function (event) {
                    _this._regionChangeHandler(event);
                },
                "region:move": function (event) {
                    _this._regionMoveHandler(event);
                },
                "zoom:change": function (event) {
                    _this._zoomChangeHandler(event);
                },
                "species:change": function (event) {
                    _this._speciesChangeHandler(event);
                },

                "karyotype-button:change": function (event) {
                    if (event.selected) {
                        _this.karyotypePanel.show();
                    } else {
                        _this.karyotypePanel.hide();
                    }
                },
                "chromosome-button:change": function (event) {
                    if (event.selected) {
                        _this.chromosomePanel.show();
                    } else {
                        _this.chromosomePanel.hide();
                    }
                },
                "region-button:change": function (event) {
                    if (event.selected) {
                        _this.overviewTrackListPanel.show();
                    } else {
                        _this.overviewTrackListPanel.hide();
                    }
                },
                "fullscreen:click": function (event) {
                    if (_this.fullscreen) {
                        $(_this.div).css({width: "auto"});
                        Utils.cancelFullscreen();//no need to pass the dom object;
                        _this.fullscreen = false;
                    } else {
                        $(_this.div).css({width: screen.width});
                        Utils.launchFullScreen(_this.div);
                        _this.fullscreen = true;
                    }
                },
                "restoreDefaultRegion:click": function (event) {
                    event.region = _this.defaultRegion;
                    _this._regionChangeHandler(event);
                },
                "autoHeight-button:change": function (event) {
                    _this.toggleAutoHeight(event.selected);
                },
                "quickSearch:select": function (event) {
                    goFeature(event.item);
                    _this.trigger("quickSearch:select", event);
                },
                "quickSearch:go": function (event) {
                    goFeature(event.item);
                }
            }
        });

        this.on("region:change", function (event) {
            _this.navigationBar.setRegion(event.region, _this.zoom);
        });
        this.on("region:move", function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.moveRegion(event.region);
            }
        });
        this.on("width:change", function (event) {
            _this.navigationBar.setWidth(event.width);
        });

        navigationBar.draw();

        return navigationBar;
    }

    _drawKaryotypePanel(target) {
        let _this = this;
        let karyotypePanel = new KaryotypePanel({
            target: target,
            client: this.client,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            width: this.width - this.sidePanelWidth,
            height: 125,
            species: this.species,
            title: "Karyotype",
            collapsed: this.karyotypePanelConfig.collapsed,
            collapsible: this.karyotypePanelConfig.collapsible,
            hidden: this.karyotypePanelConfig.hidden,
            region: this.region,
            autoRender: true,
            handlers: {
                "region:change": function (event) {
                    _this._regionChangeHandler(event);
                }
            }
        });

        this.on("region:change region:move", function (event) {
            karyotypePanel.setRegion(event.region);
        });
        this.on("width:change", function (event) {
            karyotypePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        karyotypePanel.draw();

        return karyotypePanel;
    }

    _drawChromosomePanel(target) {
        let _this = this;

        let chromosomePanel = new ChromosomePanel({
            target: target,
            client: this.client,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            height: 65,
            species: this.species,
            title: "Chromosome",
            collapsed: this.chromosomePanelConfig.collapsed,
            collapsible: this.chromosomePanelConfig.collapsible,
            hidden: this.chromosomePanelConfig.hidden,
            region: this.region,
            handlers: {
                "region:change": function (event) {
                    _this._regionChangeHandler(event);
                }
            }
        });

        this.on("region:change region:move", function (event) {
            chromosomePanel.setRegion(event.region);
        });
        this.on("width:change", function (event) {
            chromosomePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        chromosomePanel.draw();

        return chromosomePanel;
    }

    _createOverviewTrackListPanel(target) {
        let _this = this;

        let trackListPanel = new TrackListPanel({
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            target: target,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoomMultiplier: this.overviewZoomMultiplier,
            title: "Region overview",
            showRegionOverviewBox: true,
            collapsible: this.regionPanelConfig.collapsible,
            region: this.region,
            species: this.species,
            handlers: {
                "region:change": function (event) {
                    event.sender = undefined;
                    _this._regionChangeHandler(event);
                },
                "region:move": function (event) {
                    _this._regionMoveHandler(event);
                }
            }
        });

        this.on("region:change", function (event) {
            if (event.sender !== trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });
        this.on("region:move", function (event) {
            if (event.sender !== trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on("width:change", function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        trackListPanel.draw();

        return trackListPanel;
    }

    _createTrackListPanel(target) {
        let _this = this;
        let trackListPanel = new TrackListPanel({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            title: this.trackListTitle,
            region: this.region,
            species: this.species,
            hidden: this.regionPanelConfig.hidden,
            handlers: {
                "region:change": function (event) {
                    event.sender = undefined;
                    _this._regionChangeHandler(event);
                },
                "region:move": function (event) {
                    _this._regionMoveHandler(event);
                }
            }
        });

        this.on("region:change", function (event) {
            if (event.sender !== trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });
        this.on("region:move", function (event) {
            if (event.sender !== trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on("width:change", function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.on("feature:highlight", function (event) {
            trackListPanel.highlight(event);
        });

        trackListPanel.draw();

        return trackListPanel;
    }

    _createStatusBar(target) {
        let statusBar = new StatusBar({
            target: target,
            autoRender: true,
            region: this.region,
            width: this.width,
            version: this.version
        });

        this.on("region:change", function (event) {
            statusBar.setRegion(event);
        });

        this.trackListPanel.on("mousePosition:change", function (event) {
            statusBar.setMousePosition(event);
        });

        statusBar.draw();
        return statusBar;
    }


    /*****************/
    /** PRIVATE HELPER METHODS **/
    /*****************/
    _checkAndSetNewChromosomeRegion(region) {
        if (this.chromosomes.length > 0) {
            let newChr = this.chromosomes[region.chromosome];
            if (region.chromosome !== this.region.chromosome) {
                if (region.start > newChr.size || region.end > newChr.size) {
                    region.start = Math.round(newChr.size / 2);
                    region.end = Math.round(newChr.size / 2);
                }
            }
        }
    }
    _checkAndSetMinimumRegion(region, width) {
        let minLength = Math.floor(width / 10);
        if (region.length() < minLength) {
            let centerPosition = region.center();
            let aux = Math.ceil((minLength / 2) - 1);
            region.start = Math.floor(centerPosition - aux);
            region.end = Math.floor(centerPosition + aux);
        }
    }
    _calculateRegionByZoom(zoom) {
        let minNtPixels = 10; // 10 is the minimum pixels per nt
        let chr = this.chromosomes[this.region.chromosome];
        let minRegionLength = this.getSVGCanvasWidth() / minNtPixels;
        let zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels
        let regionLength = minRegionLength * (Math.pow(zoomLevelMultiplier, 100 - zoom)); // invert   100 - zoom
        let centerPosition = this.region.center();
        let aux = Math.ceil((regionLength / 2) - 1);
        let start = Math.floor(centerPosition - aux);
        let end = Math.floor(centerPosition + aux);

        return {start: start, end: end};
    }
    _calculateZoomByRegion(region) {
        let minNtPixels = 10; // 10 is the minimum pixels per nt
        let minRegionLength = this.getSVGCanvasWidth() / minNtPixels;

        let zoomLevelMultiplier = 0.01;
        if (this.chromosomes !== undefined && Object.keys(this.chromosomes).length > 0) {
            let chr = this.chromosomes[region.chromosome];
            zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels
        }
        let regionLength = region.length();

        let zoom = Math.log(regionLength / minRegionLength) / Math.log(zoomLevelMultiplier);
        return 100 - Math.round(zoom);
    }

    _checkChangingRegion() {
        if (typeof this.overviewTrackListPanel !== "undefined") {
            if (!this.overviewTrackListPanel.checkTracksReady()) {
                return false;
            }
        }
        if (typeof this.trackListPanel !== "undefined") {
            if (!this.trackListPanel.checkTracksReady()) {
                return false;
            }
        }
        return true;
    }

    /*****************/
    /** EVENT METHODS **/
    /*****************/
    _regionChangeHandler(event) {
        if (this._checkChangingRegion()) {

            this._checkAndSetNewChromosomeRegion(event.region);
            this._checkAndSetMinimumRegion(event.region, this.getSVGCanvasWidth());
            this.zoom = this._calculateZoomByRegion(event.region);
            //Relaunch
            this.trigger("region:change", event);
            /**/
            return true;
        } else {
            if (event.sender) {
                if (event.sender.updateRegionControls) {
                    event.sender.updateRegionControls();
                }
            }
            //console.log('****************************');
            //console.log('**************************** region change already in progress');
            //console.log('****************************');
            return false;
        }
    }
    _regionMoveHandler(event) {
        //Relaunch
        this.trigger("region:move", event);
    }
    _zoomChangeHandler(event) {
        event.zoom = Math.min(100, event.zoom);
        event.zoom = Math.max(0, event.zoom);
        this.zoom = event.zoom;
        this.region.load(this._calculateRegionByZoom(event.zoom));
        this.setRegion(this.region);
    }
    _speciesChangeHandler(event) {
        //Relaunch
        this.trigger("species:change", event);
        this._updateSpecies(event.species);

        // TODO: Change this call
        let firstGeneRegion;
        CellBaseManager.get({
            host: this.cellBaseHost,
            async: false,
            category: "feature",
            subCategory: "gene",
            resource: "first",
            species: event.species,
            params: {
                include: "chromosome,start,end"
            },
            success: function (r) {
                firstGeneRegion = r.response[0].result[0];
            }
        });

        let region = new Region(firstGeneRegion);
        this.setRegion(region);
    }

    _updateSpecies(species) {
        this.species = species;
        // this.chromosomes = this.getChromosomes();
        this.species.chromosomes = this.chromosomes;

        if (this.overviewTrackListPanel) {
            this.overviewTrackListPanel.setSpecies(species);
        }
        if (this.trackListPanel) {
            this.trackListPanel.setSpecies(species);
        }
        if (this.chromosomePanel) {
            this.chromosomePanel.setSpecies(species);
        }
        if (this.karyotypePanel) {
            this.karyotypePanel.setSpecies(species);
        }
        if (this.navigationBar) {
            this.navigationBar.setSpecies(species);
        }
    }

    _getSpeciesByTaxonomy(taxonomyCode) {
        //find species object
        let speciesObject = null;
        if (taxonomyCode !== undefined) {
            for (let i = 0; i < this.availableSpecies.items.length; i++) {
                for (let j = 0; j < this.availableSpecies.items[i].items.length; j++) {
                    let species = this.availableSpecies.items[i].items[j];
                    let taxonomy = Utils.getSpeciesCode(species.scientificName);
                    if (taxonomy === taxonomyCode) {
                        speciesObject = species;
                        break;
                    }
                }
            }
        }
        return speciesObject;
    }

    /*****************/
    /** API METHODS **/
    /*****************/

    setSpeciesByTaxonomy(taxonomyCode) {
        let species = this._getSpeciesByTaxonomy(taxonomyCode);
        if (species !== null) {
            this._speciesChangeHandler({species: species});
        } else {
            console.log("Species taxonomy not found on availableSpecies.");
        }
    }

    setRegion(region, taxonomy) {
        if (taxonomy !== undefined && taxonomy !== null) {
            let species = this._getSpeciesByTaxonomy(taxonomy);
            this._updateSpecies(species);
        }
        return this._regionChangeHandler({region: new Region(region)});
    }

    moveRegion(disp) {
        this.region.start += disp;
        this.region.end += disp;
        this.trigger("region:move", {region: this.region, disp: -disp, sender: this});
    }

    setWidth(width) {
        let newRegion = new Region(this.region);
        let newLength = width * this.region.length() / this.width;
        let centerPosition = this.region.center();
        let aux = Math.ceil((newLength / 2) - 1);
        newRegion.start = Math.floor(centerPosition - aux);
        newRegion.end = Math.floor(centerPosition + aux);

        this.width = width;

        if (this.overviewTrackListPanel) {
            this.overviewTrackListPanel.setWidth(width);
        }
        if (this.trackListPanel) {
            this.trackListPanel.setWidth(width);
        }
        if (this.chromosomePanel) {
            this.chromosomePanel.setWidth(width);
        }
        if (this.karyotypePanel) {
            this.karyotypePanel.setWidth(width);
        }
        if (this.navigationBar) {
            this.navigationBar.setWidth(width);
        }

        let hasChanged = this._regionChangeHandler({
            region: newRegion
        });
    }

    setZoom(zoom) {
        zoom = Math.min(100, zoom);
        zoom = Math.max(0, zoom);
        this.zoom = zoom;
        this.region.load(this._calculateRegionByZoom(zoom));
        this.setRegion(this.region);
    }

    increaseZoom(zoomToIncrease) {
        let zoom = this.zoom + zoomToIncrease;
        this.setZoom(zoom);
    }

    setCellBaseHost(host) {
        if (host !== this.cellBaseHost) {
            this.cellBaseHost = host;
            this.navigationBar.setCellBaseHost(this.cellBaseHost);
            this.chromosomePanel.setCellBaseHost(this.cellBaseHost);
            this.karyotypePanel.setCellBaseHost(this.cellBaseHost);
            this.trackListPanel.setCellBaseHost(this.cellBaseHost);
            this.overviewTrackListPanel.setCellBaseHost(this.cellBaseHost);

            this._updateSpecies(this.species);
            this.setRegion(new Region(this.region));
        }
    }

    /*****************/
    getSVGCanvasWidth() {
        return this.width - this.trackPanelScrollWidth - this.sidePanelWidth;
    }
    /*****************/

    mark(args) {
        let attrName = args.attrName || "feature_id";
        let cssClass = args.class || "ocb-feature-mark";
        if ("attrValues" in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (let key in args.attrValues) {
                $(`rect[${attrName} ~= ${args.attrValues[key]}]`).attr("class", cssClass);
            }

        }
    }

    unmark(args) {
        let attrName = args.attrName || "feature_id";
        if ("attrValues" in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (let key in args.attrValues) {
                $(`rect[${attrName} ~= ${args.attrValues[key]}]`).attr("class", "");
            }
        }
    }

    highlight(args) {
        this.trigger("feature:highlight", args);
    }

    getRightSidePanelId() {
        return $(this.rightSidebarDiv).attr("id");
    }

    getLeftSidePanelId() {
        return $(this.leftSidebarDiv).attr("id");
    }

    getNavigationPanelId() {
        return $(this.navigationbarDiv).attr("id");
    }

    getStatusPanelId() {
        return $(this.statusbarDiv).attr("id");
    }

    setNavigationBar(navigationBar) {
        this.navigationBar = navigationBar;
        let config = {
            availableSpecies: this.availableSpecies,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth
        };
        _.extend(this.navigationBar, config);
        navigationBar.render(this.getNavigationPanelId());
    }

    toggleAutoHeight(bool) {
        this.trackListPanel.toggleAutoHeight(bool);
        this.overviewTrackListPanel.toggleAutoHeight(bool);
    }

    updateHeight() {
        this.trackListPanel.updateHeight();
        this.overviewTrackListPanel.updateHeight();
    }

    setSpeciesVisible(bool) {
        this.navigationBar.setSpeciesVisible(bool);
    }

    setChromosomesVisible(bool) {
        this.navigationBar.setChromosomeMenuVisible(bool);
    }

    setKaryotypePanelVisible(bool) {
        this.karyotypePanel.setVisible(bool);
        this.navigationBar.setVisible({"karyotype": bool});
    }

    setChromosomePanelVisible(bool) {
        this.chromosomePanel.setVisible(bool);
        this.navigationBar.setVisible({"chromosome": bool});
    }

    setRegionOverviewPanelVisible(bool) {
        this.overviewTrackListPanel.setVisible(bool);
        this.navigationBar.setVisible({"region": bool});
    }

    setRegionTextBoxVisible(bool) {
        this.navigationBar.setRegionTextBoxVisible(bool);
    }
    setSearchVisible(bool) {
        this.navigationBar.setSearchVisible(bool);
    }
    setFullScreenVisible(bool) {
        this.navigationBar.setFullScreenButtonVisible(bool);
    }

    /*Track management*/
    addOverviewTrack(track) {
        this.overviewTrackListPanel.addTrack(track);
    }

    addTrack(track) {
        this.trackListPanel.addTrack(track);
    }

    getTrackById(trackId) {
        return this.trackListPanel.getTrackById(trackId);
    }

    removeTrack(track) {
        return this.trackListPanel.removeTrack(track);
    }

    restoreTrack(track, index) {
        return this.trackListPanel.restoreTrack(track, index);
    }

    setTrackIndex(track, newIndex) {
        return this.trackListPanel.setTrackIndex(track, newIndex);
    }

    scrollToTrack(track) {
        return this.trackListPanel.scrollToTrack(track);
    }

    showTrack(track) {
        this.trackListPanel.showTrack(track);
    }

    hideTrack(track) {
        this.trackListPanel.hideTrack(track);
    }
    containsTrack(track) {
        return this.trackListPanel.containsTrack(track);
    }
    containsTrackById(trackId) {
        return this.getTrackById(trackId) !== null;
    }
    deleteTracksCache(){
        this.overviewTrackListPanel.deleteTracksCache();
        this.trackListPanel.deleteTracksCache();
    }

    // TODO - DEPRECATED
    checkRenderedTrack(trackId) {
        console.log("DEPRECATED METHOD");
        console.log(this.checkRenderedTrack);
        this.trackExists(trackId);
    }
}
