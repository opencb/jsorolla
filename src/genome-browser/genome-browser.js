import {CellBaseClient} from "../core/clients/cellbase/cellbase-client.js";
import Region from "../core/bioinfo/region.js";
import UtilsNew from "../core/utils-new.js";
import TrackListPanel from "./panels/tracklist-panel.js";
import NavigationBar from "./panels/navigation-bar.js";
import KaryotypePanel from "./panels/karyotype-panel.js";
import ChromosomePanel from "./panels/chromosome-panel.js";
import StatusBar from "./panels/status-bar.js";
import GenomeBrowserUtils from "./genome-browser-utils.js";


export default class GenomeBrowser {

    constructor(target, config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.target = target instanceof HTMLElement ? target : document.querySelector(`#${target}`);
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    // Initialize GenomeBrowser
    async #init() {
        this.prefix = UtilsNew.randomString(8);
        this.version = "Powered by <a target=\"_blank\" href=\"http://www.opencb.org/\">OpenCB</a>";

        this.width = this.target.offsetWidth - this.config.padding;
        this.height = 100;

        // Initialize CellBase client
        if (this.config.cellBaseClient) {
            this.cellBaseClient = this.config.cellBaseClient;
        } else {
            // Initialize a new cellbase client with the host and version from config
            this.cellBaseClient = new CellBaseClient({
                host: this.config.cellBaseHost,
                version: this.config.cellBaseVersion,
                cache: {
                    active: false,
                },
            });
        }

        // Import chromosomes data
        this.chromosomes = await this.#getChromosomes();
        this.chromosomesList = GenomeBrowserUtils.sortChromosomes(Object.values(this.chromosomes));

        this.region = this.#parseRegion(this.config.region);
        this.defaultRegion = new Region(this.region);

        this.zoom = this.#calculateZoomByRegion(this.region);
        this.species = this.config.species;

        this.#initDom();
        this.#initPanels();
        this.#initEvents();

        // Trigger ready event
        this.trigger("ready");
    }

    #initDom() {
        // Generate GB template
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" data-cy="gb-parent" class="card text-bg-light mb-3">
                <div id="${this.prefix}Navigation" data-cy="gb-navigation" class="card-header bg-light sticky-top"></div>
                <ul class="list-group rounded-0">
                    <li id="${this.prefix}Karyotype" data-cy="gb-karyotype" class="list-group-item" style="display:none;"></li>
                    <li id="${this.prefix}Chromosome" data-cy="gb-chromosome" class="list-group-item" style="display:none;"></li>
                    <li id="${this.prefix}Region" data-cy="gb-region" class="list-group-item" style="display:none;"></li>
                    <li id="${this.prefix}Tracks" data-cy="gb-tracks" class="list-group-item"></li>
                </ul>
                <div id="${this.prefix}Status" data-cy="gb-status" class="card-footer text-bg-light" style="display:none;"></div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.navigationbarDiv = this.div.querySelector(`div#${this.prefix}Navigation`);
        this.statusbarDiv = this.div.querySelector(`div#${this.prefix}Status`);

        this.karyotypeDiv = this.div.querySelector(`li#${this.prefix}Karyotype`);
        this.chromosomeDiv = this.div.querySelector(`li#${this.prefix}Chromosome`);

        this.regionDiv = this.div.querySelector(`li#${this.prefix}Region`);
        this.tracksDiv = this.div.querySelector(`li#${this.prefix}Tracks`);

        // Append to target element
        this.target.appendChild(this.div);
    }

    #initPanels() {
        // Create Navigation Bar
        if (this.config.navigationPanelVisible) {
            this.navigationbarDiv.style.display = "block";
            this.navigationBar = this.#createNavigationBar(this.navigationbarDiv);
        }

        // Create karyotype Panel
        if (this.config.karyotypePanelVisible) {
            this.karyotypeDiv.style.display = "block";
            this.karyotypePanel = this.#createKaryotypePanel(this.karyotypeDiv);
        }

        // Create Chromosome panel
        if (this.config.chromosomePanelVisible) {
            this.chromosomeDiv.style.display = "block";
            this.chromosomePanel = this.#createChromosomePanel(this.chromosomeDiv);
        }

        // Create overview track list panel
        if (this.config.overviewPanelVisible) {
            this.regionDiv.style.display = "block";
            this.overviewTrackListPanel = this.#createOverviewTrackListPanel(this.regionDiv);
        }

        // General track list panel is always visible
        this.trackListPanel = this.#createTrackListPanel(this.tracksDiv);

        // Create status bar
        if (this.config.statusPanelVisible) {
            this.statusbarDiv.style.display = "block";
            this.statusBar = this.#createStatusBar(this.statusbarDiv);
        }
    }

    // Initialize events
    #initEvents() {
        // Register document/window event listeners
        window.addEventListener("resize", this.#resizeHandler);

        this.on("region:change region:move", event => {
            if (event.sender !== this) {
                this.region.load(event.region);
            }
        });
    }

    // Public draw method
    draw() {
        this.trigger("draw");
    }

    destroy() {
        // Remove all DOM elements
        while (this.target.firstChild) {
            this.target.removeChild(this.target.firstChild);
        }

        // Remove all event listeners
        window.removeEventListener("resize", this.#resizeHandler);
        this.off();
    }

    // Get chromosomes from CellBase
    #getChromosomes() {
        // Check if chromosomes has been provided in configuration
        if (this.config.chromosomes?.length > 0) {
            return Promise.resolve(this.config.chromosomes);
        }

        // Import chromosomes from cellbase
        return this.cellBaseClient.get("genomic", "chromosome", undefined, "search").then(res => {
            const chromosomesList = res.responses[0].results[0].chromosomes;

            // Convert chromosomes list to object
            return Object.fromEntries(chromosomesList.map(chromosome => {
                return [chromosome.name, chromosome];
            }));
        });
    }

    #createNavigationBar(target) {
        let quickSearchResultFn = this.config.navigationPanelQuickSearchResultFn;
        if (typeof quickSearchResultFn !== "function") {
            quickSearchResultFn = query => {
                return this.cellBaseClient.get("feature", "gene", query, "startsWith", {
                    limit: 10,
                });
            };
        }

        // Helper method to center in the specified feature region
        const goToFeature = feature => this.#regionChangeHandler({
            region: new Region(feature),
        });

        const navigationBar = new NavigationBar(target, {
            width: this.width,
            region: this.region,
            zoom: this.zoom,
            quickSearchResultFn: quickSearchResultFn,
            quickSearchDisplayKey: this.config.navigationPanelQuickSearchDisplayKey,
            karyotypePanelVisible: this.config.karyotypePanelVisible,
            chromosomePanelVisible: this.config.chromosomePanelVisible,
            overviewPanelVisible: this.config.overviewPanelVisible,
            featuresOfInterest: this.config.featuresOfInterest || [],
            featuresOfInterestTitle: this.config.featuresOfInterestTitle,
            geneSearchVisible: this.config.navigationPanelGeneSearchVisible,
            regionSearchVisible: this.config.navigationPanelRegionSearchVisible,
            historyControlsVisible: this.config.navigationPanelHistoryControlsVisible,
            zoomControlsVisible: this.config.navigationPanelZoomControlsVisible,
            positionControlsVisible: this.config.navigationPanelPositionControlsVisible,
        });

        // Register event listeners
        navigationBar.on("region:change", event => this.#regionChangeHandler(event));
        navigationBar.on("region:move", event => this.#regionMoveHandler(event));
        navigationBar.on("zoom:change", event => this.#zoomChangeHandler(event));
        navigationBar.on("karyotype-button:change", event => {
            event.selected ? this.karyotypePanel.show() : this.karyotypePanel.hide();
        });
        navigationBar.on("chromosome-button:change", event => {
            event.selected ? this.chromosomePanel.show() : this.chromosomePanel.hide();
        });
        navigationBar.on("overview-button:change", event => {
            event.selected ? this.overviewTrackListPanel.show() : this.overviewTrackListPanel.hide();
        });
        navigationBar.on("restoreDefaultRegion:click", event => {
            this.#regionChangeHandler({...event, region: this.defaultRegion});
        });
        navigationBar.on("autoHeight-button:change", event => this.toggleAutoHeight(event.selected));
        navigationBar.on("quickSearch:select", event => {
            goToFeature(event.item);
            this.trigger("quickSearch:select", event);
        });
        navigationBar.on("quickSearch:go", event => goToFeature(event.item));

        // Listen to events in GB
        this.on("width:change", event => navigationBar.setWidth(event.width));
        this.on("region:change", event => navigationBar.setRegion(event.region, this.zoom));
        this.on("region:move", event => {
            if (event.sender != navigationBar) {
                navigationBar.moveRegion(event.region);
            }
        });

        return navigationBar;
    }

    #createKaryotypePanel(target) {
        const karyotypePanel = new KaryotypePanel(target, {
            width: this.width,
            height: 125,
            title: "Karyotype",
            chromosomes: this.chromosomesList,
            collapsed: this.config.karyotypePanelCollapsed,
            collapsible: this.config.karyotypePanelCollapsible,
            region: this.region,
            featuresOfInterest: this.config.featuresOfInterest,
        });

        // Register event listeners
        karyotypePanel.on("region:change", event => this.#regionChangeHandler(event));

        // Listen to GB events
        this.on("region:change region:move", event => karyotypePanel.setRegion(event.region));
        this.on("width:change", event => karyotypePanel.setWidth(event.width));
        this.on("draw", () => karyotypePanel.draw());

        return karyotypePanel;
    }

    #createChromosomePanel(target) {
        const chromosomePanel = new ChromosomePanel(target, {
            width: this.width,
            title: "Chromosome",
            chromosomes: this.chromosomesList,
            collapsed: this.config.chromosomePanelCollapsed,
            collapsible: this.config.chromosomePanelCollapsible,
            region: this.region,
            featuresOfInterest: this.config.featuresOfInterest,
        });

        // Register chromosome panel event listeners
        chromosomePanel.on("region:change", event => this.#regionChangeHandler(event));

        // Listen to GB events
        this.on("region:change region:move", event => chromosomePanel.setRegion(event.region));
        this.on("width:change", event => chromosomePanel.setWidth(event.width));
        this.on("draw", () => chromosomePanel.draw());

        return chromosomePanel;
    }

    #createOverviewTrackListPanel(target) {
        const trackListPanel = new TrackListPanel(target, {
            width: this.width,
            title: "Region overview",
            zoomMultiplier: this.config.overviewPanelZoomMultiplier,
            collapsible: this.config.overviewPanelCollapsible,
            collapsed: this.config.overviewPanelCollapsed,
            region: this.region,
            showRegionOverviewBox: true,
        });

        // Register overview track list event listeners
        trackListPanel.on("region:change", event => this.#regionChangeHandler(event));
        trackListPanel.on("region:move", event => this.#regionMoveHandler(event));

        // Listen to GB events
        this.on("region:change", event => {
            if (event.sender !== trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });
        this.on("region:move", event => {
            if (event.sender !== trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on("width:change", event => trackListPanel.setWidth(event.width));
        this.on("draw", () => trackListPanel.draw());

        return trackListPanel;
    }

    #createTrackListPanel(target) {
        const trackListPanel = new TrackListPanel(target, {
            width: this.width,
            title: "Detailed information",
            region: this.region,
        });

        // Register event listeners
        trackListPanel.on("region:change", event => this.#regionChangeHandler(event));
        trackListPanel.on("region:move", event => this.#regionMoveHandler(event));

        // Listen to GB events
        this.on("region:change", event => {
            if (event.sender !== trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });
        this.on("region:move", event => {
            if (event.sender !== trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on("width:change", event => trackListPanel.setWidth(event.width));
        this.on("feature:highlight", event => trackListPanel.highlight(event));
        this.on("draw", () => trackListPanel.draw());

        return trackListPanel;
    }

    #createStatusBar(target) {
        const statusBar = new StatusBar(target, {
            autoRender: true,
            region: this.region,
            version: this.version,
        });

        // Listen to events in GB
        this.on("region:change", event => statusBar.setRegion(event));

        // Listen to events in tracklistPanel
        this.trackListPanel.on("mousePosition:change", event => statusBar.setMousePosition(event));

        return statusBar;
    }

    //
    // Private helpers
    //

    #checkAndSetNewChromosomeRegion(region) {
        if (this.chromosomes && this.chromosomes[region.chromosome]) {
            const chr = this.chromosomes[region.chromosome];
            if (region.chromosome !== this.region.chromosome) {
                if (region.start > chr.size || region.end > chr.size) {
                    // eslint-disable-next-line no-param-reassign
                    region.start = Math.round(chr.size / 2);
                    // eslint-disable-next-line no-param-reassign
                    region.end = Math.round(chr.size / 2);
                }
            }
        }
    }

    #parseRegion(initialRegion) {
        const region = new Region(initialRegion);
        const minLength = Math.floor(this.width / this.config.minNtPixels);

        // Check region size
        if (region.length() < minLength) {
            const centerPosition = region.center();
            const aux = Math.ceil((minLength / 2) - 1);
            region.start = Math.floor(centerPosition - aux);
            region.end = Math.floor(centerPosition + aux);
        }

        return region;
    }

    #calculateRegionByZoom(zoom) {
        const chr = this.chromosomes[this.region.chromosome];
        const minRegionLength = this.width / this.config.minNtPixels;
        const zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels
        const regionLength = minRegionLength * (Math.pow(zoomLevelMultiplier, 100 - zoom)); // invert   100 - zoom
        const centerPosition = this.region.center();
        const aux = Math.ceil((regionLength / 2) - 1);

        return {
            start: Math.floor(centerPosition - aux),
            end: Math.floor(centerPosition + aux),
        };
    }

    #calculateZoomByRegion(region) {
        const minRegionLength = this.width / this.config.minNtPixels;
        const regionLength = region.length();

        let zoomLevelMultiplier = 0.01;
        if (this.chromosomes && this.chromosomes[region.chromosome]) {
            const chr = this.chromosomes[region.chromosome];
            zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels
        }

        const zoom = Math.log(regionLength / minRegionLength) / Math.log(zoomLevelMultiplier);
        return 100 - Math.round(zoom);
    }

    #checkChangingRegion() {
        if (this.overviewTrackListPanel && !this.overviewTrackListPanel.checkTracksReady()) {
            return false;
        }
        if (this.trackListPanel && !this.trackListPanel.checkTracksReady()) {
            return false;
        }
        return true;
    }

    //
    // EVENT METHODS
    //

    #resizeHandler = () => {
        this.width = this.target.offsetWidth - this.config.padding;

        // Trigger width change event
        this.trigger("width:change", {
            width: this.width,
        });

        // Check if we should update the current displayed region
        const newRegion = this.#parseRegion(this.region);
        if (!this.region.equals(newRegion)) {
            this.#regionChangeHandler({region: newRegion});
        }
    }

    #regionChangeHandler(event) {
        if (this.#checkChangingRegion()) {

            this.#checkAndSetNewChromosomeRegion(event.region);
            const region = this.#parseRegion(event.region);
            this.zoom = this.#calculateZoomByRegion(region);

            // Relaunch
            this.trigger("region:change", {
                region: region,
                sender: event.sender,
            });
            return true;
        } else {
            if (event.sender && event.sender.updateRegionControls) {
                event.sender.updateRegionControls();
            }
            return false;
        }
    }

    #regionMoveHandler(event) {
        this.trigger("region:move", event);
    }

    #zoomChangeHandler(event) {
        this.zoom = Math.min(100, Math.max(0, event.zoom));
        this.region.load(this.#calculateRegionByZoom(event.zoom));
        this.setRegion(this.region);
    }

    //
    // API METHODS
    //

    setRegion(region) {
        return this.#regionChangeHandler({
            region: new Region(region),
        });
    }

    moveRegion(disp) {
        this.region.start += disp;
        this.region.end += disp;
        this.trigger("region:move", {
            region: this.region,
            disp: -disp,
            sender: this,
        });
    }

    setZoom(zoom) {
        this.zoom = Math.min(100, Math.max(0, zoom));
        this.region.load(this.#calculateRegionByZoom(zoom));
        this.setRegion(this.region);
    }

    increaseZoom(increment) {
        this.setZoom(this.zoom + increment);
    }

    mark(args) {
        const attrName = args.attrName || "feature_id";
        const cssClass = args.class || "ocb-feature-mark";
        if (typeof args.attrValues !== "undefined") {
            [args.attrValues].flat().forEach(key => {
                // TODO: Use a native document selector instead of using jquery
                $(`rect[${attrName} ~= ${args.attrValues[key]}]`).attr("class", cssClass);
            });
        }
    }

    unmark(args) {
        const attrName = args.attrName || "feature_id";
        if (typeof args.attrValues !== "undefined") {
            [args.attrValues].flat().forEach(key => {
                // TODO: Use a native document selector instead of using jquery
                $(`rect[${attrName} ~= ${args.attrValues[key]}]`).attr("class", "");
            });
        }
    }

    highlight(args) {
        this.trigger("feature:highlight", args);
    }

    toggleAutoHeight(bool) {
        this.trackListPanel.toggleTracksAutoHeight(bool);
        this.overviewTrackListPanel.toggleTracksAutoHeight(bool);
    }

    updateHeight() {
        this.trackListPanel.updateHeight();
        this.overviewTrackListPanel.updateHeight();
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

    // Track management
    addOverviewTrack(track) {
        if (this.overviewTrackListPanel) {
            this.overviewTrackListPanel.addTrack(track);
        }
    }

    addOverviewTracks(tracks) {
        if (this.overviewTrackListPanel) {
            this.overviewTrackListPanel.addTracks(tracks);
        }
    }

    addTrack(track) {
        this.trackListPanel.addTrack(track);
    }

    addTracks(tracks) {
        this.trackListPanel.addTracks(tracks);
    }

    removeTrack(track) {
        return this.trackListPanel.removeTrack(track);
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

    // Get default configuration for GenomeBrowser
    getDefaultConfig() {
        return {
            // General configuration
            resizable: true,
            region: null,
            padding: 30,
            minNtPixels: 10, // 10 is the minimum pixels per nt

            // CellBase configuration
            cellBaseClient: null,
            cellBaseHost: null,
            cellBaseVersion: null,

            // Navigation panel configuration
            navigationPanelVisible: true,
            navigationPanelQuickSearchResultFn: null,
            navigationPanelQuickSearchDisplayKey: "name",
            navigationPanelHistoryControlsVisible: true,
            navigationPanelZoomControlsVisible: true,
            navigationPanelPositionControlsVisible: true,
            navigationPanelGeneSearchVisible: true,
            navigationPanelRegionSearchVisible: true,

            // Status panel configuration
            statusPanelVisible: true,

            // Karyotype panel configuration
            karyotypePanelVisible: true,
            karyotypePanelCollasible: true,
            karyotypePanelCollapsed: false,

            // Chromosome panel configuration
            chromosomePanelVisible: true,
            chromosomePanelCollapsible: true,
            chromosomePanelCollapsed: false,

            // Overview panel configuration
            overviewPanelVisible: true,
            overviewPanelCollapsible: true,
            overviewPanelCollapsed: false,
            overviewPanelZoomMultiplier: 8,

            // Species and chromosomes data
            species: [],
            chromosomes: null,

            // Features of interest
            featuresOfInterest: [],
            featuresOfInterestTitle: "Features of Interest",
        };
    }

}
