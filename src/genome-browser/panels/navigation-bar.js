import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utilsNew.js";


export default class NavigationBar {

    constructor(target, config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.target = target;
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    #init() {
        this.prefix = UtilsNew.randomString(8);
        this.region = new Region(this.config.region);
        this.zoom = this.config.zoom || 50;

        this.elements = {};
        this.currentChromosomesList = [];
        this.zoomChanging = false;
        this.regionChanging = false;
        this.quickSearchDataset = {};

        this.#initDom();
        this.#initEvents();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" style="display:flex;flex-wrap:wrap;gap:4px;">
                <!-- Region history -->
                <button id="${this.prefix}RegionHistoryRestore" class="btn btn-default btn-sm">
                    <i class="fa fa-redo"></i>
                </button>
                <div title="Region history" class="dropdown" style="display:inline-block;">
                    <button type="button" id="${this.prefix}RegionHistoryButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-history"></i>
                        <span class="caret"></span>
                    </button>
                    <ul id="${this.prefix}RegionHistoryMenu" class="dropdown-menu"></ul>
                </div>
                
                <!-- Panels buttons -->
                <div class="btn-group" style="display:none;">
                    <label title="Toggle karyotype panel" class="ocb-ctrl" id="${this.prefix}KaryotypeButtonLabel">
                        <input id="${this.prefix}KaryotypeButton" type="checkbox" />
                        <span style="border-right:none">
                            <span class="ocb-icon ocb-icon-karyotype"></span>
                        </span>
                    </label>
                    <label title="Toggle chromosome panel" class="ocb-ctrl" id="${this.prefix}ChromosomeButtonLabel">
                        <input id="${this.prefix}ChromosomeButton" type="checkbox" />
                        <span style="border-right:none">
                            <span class="ocb-icon ocb-icon-chromosome"></span>
                        </span>
                    </label>
                    <label title="Toggle overview panel" class="ocb-ctrl" id="${this.prefix}RegionButtonLabel">
                        <input id="${this.prefix}RegionButton" type="checkbox" />
                        <span>
                            <span class="ocb-icon ocb-icon-region"></span>
                        </span>
                    </label>
                </div>

                <!-- Zoom control -->
                <button title="Minimum window size" id="${this.prefix}ZoomMinButton" class="btn btn-default btn-sm" style="display:none;">
                    <span>Min</span>
                </button>
                <button title="Decrease window size" id="${this.prefix}ZoomOutButton" class="btn btn-default btn-sm">
                    <span class="fa fa-search-minus"></span>
                </button>
                <div class="" style="display:inline-block;">
                    <div class="" style="padding-top:7px;padding-bottom:7px;">
                        <input type="range" id="${this.prefix}ZoomRange" min="0" max="100" />
                    </div>
                </div>
                <button title="Increase window size" id="${this.prefix}ZoomInButton" class="btn btn-default btn-sm">
                    <span class="fa fa-search-plus"></span>
                </button>
                <button title="Maximum window size" id="${this.prefix}ZoomMaxButton" class="btn btn-default btn-sm" style="display:none;">
                    <span>Max</span>
                </button>

                <!-- Window size input -->
                <div title="Window size (Nucleotides)" style="display:inline-block">
                    <input id="${this.prefix}WindowSize" class="form-control input-sm" style="max-width:70px;" />
                </div>

                <!-- Region input -->
                <div title="Position" class="input-group input-group-sm" style="display:inline-block;margin-bottom:0px;">
                    <input
                        type="text"
                        id="${this.prefix}RegionInput"
                        class="form-control input-sm"
                        placeholder="1:10000-20000"
                        style="width:170px;display:inline-block;" 
                    />
                    <span class="input-group-btn" style="display:inline-block;">
                        <button id="${this.prefix}RegionSubmit" class="btn btn-default btn-sm">
                            <strong>Go!</strong>
                        </button>
                    </span>
                </div>

                <!-- Region controls -->
                <div class="btn-group" style="display:inline-block">
                    <button id="${this.prefix}MoveFurtherLeftButton" class="btn btn-default btn-sm">
                        <i class="fa fa-angle-double-left"></i>
                    </button>
                    <button id="${this.prefix}MoveLeftButton" class="btn btn-default btn-sm">
                        <i class="fa fa-angle-left"></i>
                    </button>
                    <button id="${this.prefix}MoveRightButton" class="btn btn-default btn-sm">
                        <i class="fa fa-angle-right"></i>
                    </button>
                    <button id="${this.prefix}MoveFurtherRightButton" class="btn btn-default btn-sm">
                        <i class="fa fa-angle-double-right"></i>
                    </button>
                </div>

                <!-- To tix -->
                <button class="btn btn-default btn-sm">
                    <input type="checkbox" id="${this.prefix}AutoheightButton" style="display:none;" />
                    <i class="fa fa-compress"></i>
                </button>

                <!-- Gene search -->
                <div class="input-group input-group-sm" style="display:inline-block;margin-bottom:0px!important;">
                    <input
                        type="text"
                        id="${this.prefix}SearchField"
                        list="${this.prefix}SearchDataList"
                        class="form-control input-sm"
                        placeholder="gene"
                        style="display:inline-block;max-width:90px;"
                    />
                    <datalist id="${this.prefix}SearchDataList"></datalist>
                    <span class="input-group-btn" style="display:inline-block;">
                        <button id="${this.prefix}SearchButton" class="btn btn-default btn-sm">
                            <i class="fa fa-search"></i>
                        </button>
                    </span>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);

        // Initialize elements
        this.elements.karyotypeButton = this.div.querySelector(`input#${this.prefix}KaryotypeButton`);
        this.elements.chromosomeButton = this.div.querySelector(`input#${this.prefix}ChromosomeButton`);
        this.elements.regionButton = this.div.querySelector(`input#${this.prefix}RegionButton`);

        // Zooming controls
        this.elements.zoomRange = this.div.querySelector(`input#${this.prefix}ZoomRange`);
        this.elements.zoomOutButton = this.div.querySelector(`button#${this.prefix}ZoomOutButton`);
        this.elements.zoomInButton = this.div.querySelector(`button#${this.prefix}ZoomInButton`);
        // this.elements.zoomMaxButton = this.div.querySelector(`div#${this.prefix}ZoomMaxButton`);
        // this.elements.zoomMinButton = this.div.querySelector(`div#${this.prefix}ZoomMinButton`);

        // Window size
        this.elements.windowSize = this.div.querySelector(`input#${this.prefix}WindowSize`);

        this.elements.regionInput = this.div.querySelector(`input#${this.prefix}RegionInput`);
        this.elements.regionSubmit = this.div.querySelector(`button#${this.prefix}RegionSubmit`);

        // Region history buttons
        this.elements.regionHistoryRestore = this.div.querySelector(`button#${this.prefix}RegionHistoryRestore`);
        this.elements.regionHistoryMenu = this.div.querySelector(`ul#${this.prefix}RegionHistoryMenu`);
        this.elements.regionHistoryButton = this.div.querySelector(`div#${this.prefix}RegionHistoryButton`);

        // Position controls
        this.elements.moveFurtherLeftButton = this.div.querySelector(`button#${this.prefix}MoveFurtherLeftButton`);
        this.elements.moveFurtherRightButton = this.div.querySelector(`button#${this.prefix}MoveFurtherRightButton`);
        this.elements.moveLeftButton = this.div.querySelector(`button#${this.prefix}MoveLeftButton`);
        this.elements.moveRightButton = this.div.querySelector(`button#${this.prefix}MoveRightButton`);

        this.elements.autoheightButton = this.div.querySelector(`input#${this.prefix}AutoheightButton`);

        this.elements.searchField = this.div.querySelector(`input#${this.prefix}SearchField`);
        this.elements.searchButton = this.div.querySelector(`button#${this.prefix}SearchButton`);
        this.elements.searchDataList = this.div.querySelector(`datalist#${this.prefix}SearchDataList`);

        this.elements.speciesButton = this.div.querySelector(`div#${this.prefix}SpeciesButton`);
        this.elements.speciesMenu = this.div.querySelector(`ul#${this.prefix}SpeciesMenu`);
        this.elements.speciesText = this.div.querySelector(`span#${this.prefix}SpeciesText`);

        this.elements.karyotypeButton.checked = !this.config.karyotypePanelConfig?.hidden;
        this.elements.chromosomeButton.checked = !this.config.chromosomePanelConfig?.hidden;
        this.elements.regionButton.checked = !this.config.regionPanelConfig?.hidden;

        this.target.appendChild(this.div);
    }

    // Initialize events
    #initEvents() {
        this.elements.regionHistoryRestore.addEventListener("click", event => {
            this.trigger("restoreDefaultRegion:click", {
                clickEvent: event,
                sender: {},
            });
        });

        this.#addRegionHistoryMenuItem(this.region);

        this.elements.karyotypeButton.addEventListener("click", event => {
            this.trigger("karyotype-button:change", {
                selected: event.target.checked,
                sender: this,
            });
        });
        this.elements.chromosomeButton.addEventListener("click", event => {
            this.trigger("chromosome-button:change", {
                selected: event.target.checked,
                sender: this,
            });
        });
        this.elements.regionButton.addEventListener("click", event => {
            this.trigger("region-button:change", {
                selected: event.target.checked,
                sender: this,
            });
        });

        // Zooming events
        this.elements.zoomOutButton.addEventListener("click", () => this.#handleZoomOutButton());
        this.elements.zoomInButton.addEventListener("click", () => this.#handleZoomInButton());
        // this.elements.zoomMaxButton.addEventListener("click", () => this.#handleZoomSlider(100));
        // this.elements.zoomMinButton.addEventListener("click", () => this.#handleZoomSlider(0));
        this.elements.zoomRange.value = this.zoom;
        this.elements.zoomRange.addEventListener("change", e => {
            const value = parseInt(e.target.value);
            if (this.zoom !== value) {
                this.#handleZoomSlider(value);
            }
        });

        this.elements.regionInput.value = this.region.toString();
        this.elements.regionInput.addEventListener("keyup", event => {
            const value = event.target.value;
            if (value && this.#checkRegion(value) && event.which === 13) {
                this.#triggerRegionChange({
                    region: new Region(value),
                    sender: event.target,
                });
            }
        });
        this.elements.regionSubmit.addEventListener("click", event => {
            const value = this.elements.regionInput.value;
            if (this.#checkRegion(value)) {
                this.#triggerRegionChange({
                    region: new Region(value),
                    sender: event.target,
                });
            }
        });

        this.elements.moveFurtherLeftButton.addEventListener("click", () => this.#handleMoveRegion(10));
        this.elements.moveFurtherRightButton.addEventListener("click", () => this.#handleMoveRegion(-10));

        this.elements.moveLeftButton.addEventListener("click", () => this.#handleMoveRegion(1));
        this.elements.moveRightButton.addEventListener("click", () => this.#handleMoveRegion(-1));

        this.elements.autoheightButton.addEventListener("click", event => {
            this.trigger("autoHeight-button:change", {
                selected: event.target.checked,
                sender: this,
            });
        });

        let lastQuery = "";
        this.elements.searchField.addEventListener("keyup", event => {
            event.target.classList.remove("error");
            const query = event.target.value || "";
            if (query.length > 2 && lastQuery !== query && event.which !== 13) {
                this.#setQuickSearchMenu(query);
                lastQuery = query;
            }
            if (event.which === 13) {
                if (query && this.quickSearchDataset[query]) {
                    this.trigger("quickSearch:select", {
                        item: this.quickSearchDataset[query],
                        sender: this,
                    });
                } else {
                    event.target.classList.add("error");
                }
            }
        });

        this.elements.searchButton.addEventListener("click", () => {
            this.elements.searchField.classList.remove("error");
            const query = this.elements.searchField.value || "";
            if (query && this.quickSearchDataset[query]) {
                this.trigger("quickSearch:go", {
                    item: this.quickSearchDataset[query],
                    sender: this,
                });
            } else {
                this.elements.searchField.classList.add("error");
            }
        });

        this.elements.windowSize.value = this.region.length();
        this.elements.windowSize.addEventListener("keyup", event => {
            const value = event.target.value || "";
            if ((/^([0-9])+$/).test(value)) {
                event.target.classList.remove("error");
                if (event.which === 13) {
                    const regionSize = parseInt(value);
                    const haflRegionSize = Math.floor(regionSize / 2);
                    this.#triggerRegionChange({
                        region: new Region({
                            chromosome: this.region.chromosome,
                            start: this.region.center() - haflRegionSize,
                            end: this.region.center() + haflRegionSize,
                        }),
                        sender: this,
                    });
                }
            } else {
                event.target.classList.add("error");
            }
        });
    }

    draw() {
        // Nothing to do
    }

    #addRegionHistoryMenuItem(region) {
        const menuEntry = document.createElement("li");
        menuEntry.textContent = region.toString();
        menuEntry.addEventListener("click", event => {
            this.#triggerRegionChange({
                region: new Region(event.target.textContent),
                sender: this,
            });
        });

        this.elements.regionHistoryMenu.appendChild(menuEntry);
    }

    #setQuickSearchMenu(query) {
        if (typeof this.config.quickSearchResultFn === "function") {
            while (this.elements.searchDataList.firstChild) {
                this.elements.searchDataList.removeChild(this.elements.searchDataList.firstChild);
            }

            this.quickSearchDataset = {};
            this.config.quickSearchResultFn(query).then(data => {
                (data.response[0].result || []).forEach(item => {
                    const menuEntry = document.createElement("option");
                    menuEntry.setAttribute("value", item.name);
                    this.elements.searchDataList.appendChild(menuEntry);
                    this.quickSearchDataset[item.name] = item;
                });
            });
        } else {
            console.warn("the quickSearchResultFn function is not valid");
        }
    }

    #checkRegion(value) {
        const region = new Region(value);
        if (!region.parse(value) || region.start < 0 || region.end < 0 || this.currentChromosomesList.indexOf(region.chromosome) === -1) {
            this.elements.regionInput.classList.add("error");
            return false;
        } else {
            this.elements.regionInput.classList.remove("error");
            return true;
        }
    }

    #handleZoomSlider(value) {
        if (!this.zoomChanging) {
            this.zoomChanging = true;
            this.zoom = 5 * (Math.round(value / 5));

            this.trigger("zoom:change", {
                zoom: this.zoom,
                sender: this,
            });

            // TODO: review this hack...
            setTimeout(() => {
                this.zoomChanging = false;
            }, 700);
        }
    }

    #handleZoomOutButton() {
        this.#handleZoomSlider(Math.max(0, this.zoom - 5));
    }

    #handleZoomInButton() {
        this.#handleZoomSlider(Math.min(100, this.zoom + 5));
    }

    #handleMoveRegion(positions) {
        // const pixelBase = (this.width - this.svgCanvasWidthOffset) / this.region.length();
        const pixelBase = (this.config.width - this.config.svgCanvasWidthOffset) / this.region.length();
        const disp = Math.round((positions * 10) / pixelBase);

        this.region.start -= disp;
        this.region.end -= disp;
        this.elements.regionInput.value = this.region.toString();

        // Trigger region move
        this.trigger("region:move", {
            region: this.region,
            disp: disp,
            sender: this,
        });
    }

    setVisible(obj) {
        const els = this.elements;
        Object.keys(obj).forEach(key => {
            obj[key] ? els[key].classList.remove("hidden") : els[key].classList.add("hidden");
        });
    }

    setRegion(region, zoom) {
        this.region.load(region);
        if (zoom) {
            this.zoom = 5 * (Math.round(zoom / 5));
        }
        this.updateRegionControls();
        this.#addRegionHistoryMenuItem(region);
    }

    moveRegion(region) {
        this.region.load(region);
        this.elements.chromosomesText.textContent = this.region.chromosome;
        this.elements.regionInput.value = this.region.toString();
    }

    setWidth(width) {
        this.width = width;
    }

    #triggerRegionChange(event) {
        if (!this.regionChanging) {
            this.regionChanging = true;
            this.trigger("region:change", event);

            // TODO: review this hack...
            setTimeout(() => {
                this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    }

    updateRegionControls() {
        // this.elements.chromosomesText.textContent = this.region.chromosome;
        this.elements.regionInput.value = this.region.toString();
        this.elements.windowSize.value = this.region.length();
        this.elements.regionInput.classList.remove("error");
        this.elements.zoomRange.value = this.zoom;
    }

    // Get default config for navigation bar
    getDefaultConfig() {
        return {
            increment: 3,
            componentsConfig: {
                menuButton: false,
                leftSideButton: false,
                restoreDefaultRegionButton: true,
                regionHistoryButton: true,
                speciesButton: true,
                chromosomesButton: true,
                karyotypeButtonLabel: true,
                chromosomeButtonLabel: true,
                regionButtonLabel: true,
                zoomControl: true,
                windowSizeControl: true,
                positionControl: true,
                moveControl: true,
                autoheightButton: true,
                compactButton: true,
                searchControl: true
            },
            region: null,
            quickSearchDisplayKey: "name",
            zoom: 50,
            width: 1,
            svgCanvasWidthOffset: 0,
            availableSpecies: [],
        };
    }

}
