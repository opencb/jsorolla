import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utils-new.js";

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
        this.width = this.config.width;

        this.elements = {};
        this.zoomChanging = false;
        this.regionChanging = false;
        this.quickSearchDataset = {};
        this.quickSearchLastQuery = "";

        this.#initDom();
        this.#initEvents();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="d-flex justify-content-between my-1">
                <div class="d-flex flex-wrap gap-1">

                    <!-- Region input -->
                    <div id="${this.prefix}RegionForm" class="m-0" data-cy="gb-region" title="Position">
                        <div title="Position" class="input-group input-group-sm mb-0">
                            <input
                                data-cy="gb-region-input"
                                type="text"
                                id="${this.prefix}RegionInput"
                                class="form-control"
                                placeholder="1:10000-20000"
                                style="width:170px;display:inline-block;"
                            />

                            <button id="${this.prefix}RegionSubmit" data-cy="gb-region-submit" class="btn btn-light btn-sm">
                                <strong>Go!</strong>
                            </button>
                        </div>
                    </div>

                    <!-- Gene search -->
                    <div>
                        <div id="${this.prefix}SearchForm" class="input-group input-group-sm m-0">
                            <input
                                type="text"
                                id="${this.prefix}SearchInput"
                                list="${this.prefix}SearchDataList"
                                class="form-control"
                                placeholder="gene"
                                style="display:inline-block;max-width:90px;"
                            />
                            <datalist id="${this.prefix}SearchDataList"></datalist>
                            <button id="${this.prefix}SearchButton" class="btn btn-light btn-sm">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Features of interest -->
                    <div id="${this.prefix}FeaturesOfInterest" class="dropdown" style="display:none;">
                        <button type="button" class="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                            ${this.config.featuresOfInterestTitle}
                        </button>
                        <ul id="${this.prefix}FeaturesOfInterestMenu" data-cy="gb-features-list" class="dropdown-menu" style="width: 12rem;"></ul>
                    </div>

                    <div id="${this.prefix}ControlsSpace" style="width:1rem;display:none;"></div>

                    <!-- Position controls -->
                    <div id="${this.prefix}PositionControls" class="btn-group" style="display:inline-block">
                        <button id="${this.prefix}MoveFurtherLeftButton" class="btn btn-light btn-sm">
                            <i class="fa fa-angle-double-left"></i>
                        </button>
                        <button id="${this.prefix}MoveLeftButton" class="btn btn-light btn-sm">
                            <i class="fa fa-angle-left"></i>
                        </button>
                        <button id="${this.prefix}MoveRightButton" class="btn btn-light btn-sm">
                            <i class="fa fa-angle-right"></i>
                        </button>
                        <button id="${this.prefix}MoveFurtherRightButton" class="btn btn-light btn-sm">
                            <i class="fa fa-angle-double-right"></i>
                        </button>
                    </div>

                    <!-- Zoom controls -->
                    <div id="${this.prefix}ZoomControls" class="d-flex flex-wrap gap-1 align-items-center">
                        <button title="Decrease window size" id="${this.prefix}ZoomOutButton" class="btn btn-light btn-sm">
                            <span class="fa fa-search-minus"></span>
                        </button>
                        <div class="" style="display:inline-block;">
                            <input type="range" id="${this.prefix}ZoomRange" min="0" max="100" />
                        </div>
                        <button title="Increase window size" id="${this.prefix}ZoomInButton" class="btn btn-light btn-sm">
                            <span class="fa fa-search-plus"></span>
                        </button>
                    </div>

                    <!-- Window size input -->
                    <div class="m-0">
                        <div id="${this.prefix}WindowSizeForm" title="Window size (Nucleotides)" class="input-group input-group-sm">
                            <input id="${this.prefix}WindowSizeInput" data-cy="gb-window-size" class="form-control" style="max-width:60px;" />
                            <span class="input-group-text">nts</span>
                        </div>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-1">
                    <!-- Panels buttons -->
                    <div id="${this.prefix}PanelButtons" class="btn-group" style="display:inline-block;">
                        <button title="Toggle karyotype panel" id="${this.prefix}KaryotypeButton" class="btn btn-light btn-sm active">
                            <span class="gb-icon gb-icon-karyotype" style="display:block;width:16px;height:18px;"></span>
                        </button>
                        <button title="Toggle chromosome panel" id="${this.prefix}ChromosomeButton" class="btn btn-light btn-sm active">
                            <span class="gb-icon gb-icon-chromosome" style="display:block;width:16px;height:18px;"></span>
                        </button>
                        <button title="Toggle overview panel" id="${this.prefix}OverviewButton" class="btn btn-light btn-sm active">
                            <span class="gb-icon gb-icon-region" style="display:block;width:16px;height:18px;"></span>
                        </button>
                    </div>

                    <!-- Region history -->
                    <div id="${this.prefix}HistoryControls">
                        <div title="Region history" class="dropdown" style="display:inline-block;">
                            <button type="button" id="${this.prefix}RegionHistoryButton" class="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="fa fa-history"></i>
                            </button>
                            <ul id="${this.prefix}RegionHistoryMenu" class="dropdown-menu"></ul>
                        </div>
                        <button id="${this.prefix}RegionHistoryRestore" class="btn btn-light btn-sm">
                            <i class="fa fa-redo"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);

        // Panels buttons
        this.elements.panelButtons = this.div.querySelector(`div${this.prefix}PanelButtons`);
        this.elements.karyotypeButton = this.div.querySelector(`button#${this.prefix}KaryotypeButton`);
        this.elements.chromosomeButton = this.div.querySelector(`button#${this.prefix}ChromosomeButton`);
        this.elements.overviewButton = this.div.querySelector(`button#${this.prefix}OverviewButton`);

        // Zooming controls
        this.elements.zoomControls = this.div.querySelector(`div#${this.prefix}ZoomControls`);
        this.elements.zoomRange = this.div.querySelector(`input#${this.prefix}ZoomRange`);
        this.elements.zoomOutButton = this.div.querySelector(`button#${this.prefix}ZoomOutButton`);
        this.elements.zoomInButton = this.div.querySelector(`button#${this.prefix}ZoomInButton`);

        // Window size
        this.elements.windowSizeForm = this.div.querySelector(`div#${this.prefix}WindowSizeForm`);
        this.elements.windowSizeInput = this.div.querySelector(`input#${this.prefix}WindowSizeInput`);

        this.elements.regionForm = this.div.querySelector(`div#${this.prefix}RegionForm`);
        this.elements.regionInput = this.div.querySelector(`input#${this.prefix}RegionInput`);
        this.elements.regionSubmit = this.div.querySelector(`button#${this.prefix}RegionSubmit`);

        // Region history buttons
        this.elements.historyControls = this.div.querySelector(`div#${this.prefix}HistoryControls`);
        this.elements.regionHistoryRestore = this.div.querySelector(`button#${this.prefix}RegionHistoryRestore`);
        this.elements.regionHistoryMenu = this.div.querySelector(`ul#${this.prefix}RegionHistoryMenu`);
        this.elements.regionHistoryButton = this.div.querySelector(`div#${this.prefix}RegionHistoryButton`);

        // Position controls
        this.elements.positionControls = this.div.querySelector(`div#${this.prefix}PositionControls`);
        this.elements.moveFurtherLeftButton = this.div.querySelector(`button#${this.prefix}MoveFurtherLeftButton`);
        this.elements.moveFurtherRightButton = this.div.querySelector(`button#${this.prefix}MoveFurtherRightButton`);
        this.elements.moveLeftButton = this.div.querySelector(`button#${this.prefix}MoveLeftButton`);
        this.elements.moveRightButton = this.div.querySelector(`button#${this.prefix}MoveRightButton`);

        // Gene search elements
        this.elements.searchForm = this.div.querySelector(`div#${this.prefix}SearchForm`);
        this.elements.searchInput = this.div.querySelector(`input#${this.prefix}SearchInput`);
        this.elements.searchButton = this.div.querySelector(`button#${this.prefix}SearchButton`);
        this.elements.searchDataList = this.div.querySelector(`datalist#${this.prefix}SearchDataList`);

        // Features of interest elements
        this.elements.featuresOfInterest = this.div.querySelector(`div#${this.prefix}FeaturesOfInterest`);
        this.elements.featuresOfInterestMenu = this.div.querySelector(`ul#${this.prefix}FeaturesOfInterestMenu`);

        // Spacing elements
        this.elements.controlsSpace = this.div.querySelector(`div#${this.prefix}ControlsSpace`);

        // Hide panel buttons
        if (!this.config.karyotypePanelVisible && !this.config.chromosomePanelVisible && !this.overviewPanelVisible) {
            this.elements.panelButtons.style.display = "none";
        } else {
            if (!this.config.karyotypePanelVisible) {
                this.elements.karyotypeButton.style.display = "none";
            }

            if (!this.config.chromosomePanelVisible) {
                this.elements.chromosomeButton.style.display = "none";
            }

            if (!this.config.overviewPanelVisible) {
                this.elements.overviewButton.style.display = "none";
            }
        }

        if (!this.config.historyControlsVisible) {
            this.elements.historyControls.style.display = "none";
        }

        if (!this.config.positionControlsVisible) {
            this.elements.positionControls.style.display = "none";
        }

        if (!this.config.zoomControlsVisible) {
            this.elements.zoomControls.style.display = "none";
        }

        if (!this.config.regionSearchVisible) {
            this.elements.regionForm.style.display = "none";
        } else {
            this.elements.controlsSpace.style.display = "block";
        }

        if (!this.config.geneSearchVisible) {
            this.elements.searchForm.style.display = "none";
        } else {
            this.elements.controlsSpace.style.display = "block";
        }

        // Fill features of interest dropdown
        if (this.config.featuresOfInterest.length > 0) {
            this.#fillFeaturesOfInterestDropdown();
            this.elements.controlsSpace.style.display = "block";
        }

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

        // Toggle panels
        this.elements.karyotypeButton.addEventListener("click", () => this.#handlePanelToggle(this.elements.karyotypeButton, "karyotype"));
        this.elements.chromosomeButton.addEventListener("click", () => this.#handlePanelToggle(this.elements.chromosomeButton, "chromosome"));
        this.elements.overviewButton.addEventListener("click", () => this.#handlePanelToggle(this.elements.overviewButton, "overview"));

        // Zooming events
        this.elements.zoomOutButton.addEventListener("click", () => this.#handleZoomOutButton());
        this.elements.zoomInButton.addEventListener("click", () => this.#handleZoomInButton());
        this.elements.zoomRange.value = this.zoom;
        this.elements.zoomRange.addEventListener("change", e => {
            const value = parseInt(e.target.value);
            if (this.zoom !== value) {
                this.#handleZoomSlider(value);
            }
        });

        this.elements.regionInput.value = this.region.toString();
        this.elements.regionSubmit.addEventListener("click", () => this.#regionSubmit());
        this.elements.regionInput.addEventListener("keyup", event => event.which === 13 && this.#regionSubmit());

        this.elements.moveFurtherLeftButton.addEventListener("click", () => this.#handleMoveRegion(10));
        this.elements.moveFurtherRightButton.addEventListener("click", () => this.#handleMoveRegion(-10));
        this.elements.moveLeftButton.addEventListener("click", () => this.#handleMoveRegion(1));
        this.elements.moveRightButton.addEventListener("click", () => this.#handleMoveRegion(-1));

        this.elements.searchButton.addEventListener("click", () => this.#quickSearchSubmit());
        this.elements.searchInput.addEventListener("keyup", event => {
            this.elements.searchInput.classList.remove("has-error");
            const query = this.elements.searchInput.value || "";
            if (query.length > 2 && this.quickSearchLastQuery !== query && event.which !== 13) {
                this.#setQuickSearchMenu(query);
                this.quickSearchLastQuery = query;
            }
            if (event.which === 13) {
                this.#quickSearchSubmit();
            }
        });

        this.elements.windowSizeInput.value = this.region.length();
        this.elements.windowSizeInput.addEventListener("keyup", event => {
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

    // Toggle panel visibility
    #handlePanelToggle(target, panelName) {
        target.classList.toggle("active"); // Toggle the active class

        this.trigger(`${panelName}-button:change`, {
            selected: target.classList.contains("active"),
        });
    }

    #addRegionHistoryMenuItem(region) {
        const template = UtilsNew.renderHTML(`
            <li><a class="dropdown-item" href="">${region.toString()}</a></li>
        `);
        const entry = template.querySelector("li");
        entry.addEventListener("click", event => {
            this.#triggerRegionChange({
                region: new Region(event.target.textContent),
                sender: this,
            });
        });

        this.elements.regionHistoryMenu.appendChild(entry);
    }

    #setQuickSearchMenu(query) {
        if (typeof this.config.quickSearchResultFn === "function") {
            // Clear all elements in the datalist
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
        }
    }

    #quickSearchSubmit() {
        const query = this.elements.searchInput.value || "";
        this.elements.searchForm.classList.remove("has-error");

        if (query && this.quickSearchDataset[query]) {
            this.trigger("quickSearch:go", {
                item: this.quickSearchDataset[query],
                sender: this,
            });
        } else {
            this.elements.searchForm.classList.add("has-error");
        }
    }

    #regionSubmit() {
        const value = this.elements.regionInput.value;
        this.elements.regionForm.classList.remove("has-error");

        if (value && this.#checkRegion(value)) {
            this.#triggerRegionChange({
                region: new Region(value),
                sender: this,
            });
        } else {
            this.elements.regionForm.classList.add("has-error");
        }
    }

    #checkRegion(value) {
        const region = new Region(value);
        return region.parse(value) && region.start >= 0 && region.end >= 0;
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
        const pixelBase = this.width / this.region.length();
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

    #triggerRegionChange(event) {
        if (!this.regionChanging) {
            this.regionChanging = true;
            this.trigger("region:change", event);

            // TODO: review this hack...
            setTimeout(() => {
                this.regionChanging = false;
            }, 700);
        } else {
            this.#updateRegionControls();
        }
    }

    #updateRegionControls() {
        this.elements.regionInput.value = this.region.toString();
        this.elements.windowSizeInput.value = this.region.length();
        this.elements.regionForm.classList.remove("has-error");
        this.elements.zoomRange.value = this.zoom;
    }

    #fillFeaturesOfInterestDropdown() {
        this.elements.featuresOfInterest.style.display = "block";
        this.config.featuresOfInterest.forEach(item => {
            if (item.separator) {
                const itemTemplate = UtilsNew.renderHTML(`
                    <li class="divider"></li>
                `);
                this.elements.featuresOfInterestMenu.appendChild(itemTemplate.querySelector("li"));
            } else if (item.category && item.name) {
                const itemTemplate = UtilsNew.renderHTML(`
                    <li class="dropdown-header">
                        <strong>${item.name}</strong>
                    </li>
                `);
                this.elements.featuresOfInterestMenu.appendChild(itemTemplate.querySelector("li"));
            } else if (item.features && item.name) {
                const itemTemplate = UtilsNew.renderHTML(`
                    <li class="dropdown-submenu dropend">
                        <a class="d-flex align-items-center gap-2 ms-2 px-2 dropdown-toggle text-decoration-none text-dark">
                            ${item.display?.color ? `
                                <div style="background-color:${item.display.color};width:1rem;height:1rem;border-radius:999px;"></div>
                            ` : ""}
                            <span>${item.name}</span>
                        </a>
                        <ul class="dropdown-menu ps-3" style="max-height:300px;overflow:auto;width:14rem"></ul>
                    </li>
                `);
                const itemEntry = itemTemplate.querySelector("li");

                item.features.forEach(feature => {
                    const featureRegion = new Region(feature);
                    const featureTemplate = UtilsNew.renderHTML(`
                        <li data-region="${featureRegion.toString()}">
                            <a>${feature.name || feature.id || featureRegion.toString()}</a>
                        </li>
                    `);
                    const featureEntry = featureTemplate.querySelector("li");
                    featureEntry.querySelector("a").addEventListener("click", event => {
                        event.preventDefault();
                        this.#triggerRegionChange({
                            region: featureRegion,
                            sender: this,
                        });
                    });

                    itemEntry.querySelector("ul").appendChild(featureEntry);
                });

                this.elements.featuresOfInterestMenu.appendChild(itemEntry);
            }
        });
    }

    setWidth(width) {
        this.width = width;
    }

    setRegion(region, zoom) {
        this.region.load(region);
        if (zoom) {
            this.zoom = 5 * (Math.round(zoom / 5));
        }
        this.#updateRegionControls();
        this.#addRegionHistoryMenuItem(region);
    }

    moveRegion(region) {
        this.region.load(region);
        this.elements.regionInput.value = this.region.toString();
    }

    // Get default config for navigation bar
    getDefaultConfig() {
        return {
            karyotypePanelVisible: true,
            chromosomePanelVisible: true,
            overviewPanelVisible: true,
            region: null,
            quickSearchDisplayKey: "name",
            quickSearchResultFn: null,
            zoom: 50,
            width: 100,
            featuresOfInterest: [],
            featuresOfInterestTitle: "Features of Interest",
            historyControlsVisible: true,
            zoomControlsVisible: true,
            positionControlsVisible: true,
            geneSearchVisible: true,
            regionSearchVisible: true,
        };
    }

}
