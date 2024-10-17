import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Region from "../../core/bioinfo/region.js";
import GenomeBrowser from "../../genome-browser/genome-browser.js";

import FeatureTrack from "../../genome-browser/tracks/feature-track.js";
import GeneOverviewTrack from "../../genome-browser/tracks/gene-overview-track.js";
import GeneTrack from "../../genome-browser/tracks/gene-track.js";
import SequenceTrack from "../../genome-browser/tracks/sequence-track.js";
import VariantTrack from "../../genome-browser/tracks/variant-track.js";
import OpenCGAVariantTrack from "../../genome-browser/tracks/opencga-variant-track.js";
import OpenCGAAlignmentTrack from "../../genome-browser/tracks/opencga-alignment-track.js";


export default class GenomeBrowserComponent extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            region: {
                type: Object,
            },
            species: {
                type: String,
            },
            tracks: {
                type: Array,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.genomeBrowser = null;
        this.active = true;
        this.species = "hsapiens";
        this.tracks = [];
        this.config = this.getDefaultConfig();

        this.defaultRegion = "13:32996311-32996450";
        this.prevRegion = null;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config") || changedProperties.has("tracks")) {
            this.opencgaSessionOrConfigObserver();
        }

        if (changedProperties.has("region") || changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    opencgaSessionOrConfigObserver() {
        if (this.opencgaSession && this.config && this.tracks) {
            if (this.genomeBrowser) {
                this.genomeBrowser.destroy();
                this.genomeBrowser = null;
            }

            // Check the active property to initialize genomebrowser
            if (this.active) {
                this.initGenomeBrowser();
            }
        }
    }

    propertyObserver() {
        if (this.active) {
            // Check for no genomebrowser instance ready
            if (!this.genomeBrowser) {
                return this.initGenomeBrowser();
            }

            // Check if region has been provided and is different from prev region
            if (this.region) {
                const nextRegion = new Region(this.region).toString();

                if (this.prevRegion !== nextRegion) {
                    this.genomeBrowser.setRegion(this.region);
                    this.prevRegion = nextRegion;
                }
            }
        }
    }

    initGenomeBrowser() {
        const parent = this.querySelector(`div#${this._prefix}GenomeBrowser`);
        const initialRegion = this.region || this.defaultRegion;
        const config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        this.genomeBrowser = new GenomeBrowser(parent, {
            width: parent.getBoundingClientRect().width || 100,
            region: new Region(initialRegion),
            resizable: true,
            ...config,
        });

        // When GB is ready add tracks and draw
        this.genomeBrowser.on("ready", () => {
            this.genomeBrowser.addOverviewTracks(this.getOverviewTracks());
            this.genomeBrowser.addTracks(this.getDetailTracks());
            this.genomeBrowser.draw();
        });

        // Save current region
        this.prevRegion = new Region(initialRegion).toString();
    }

    // Get only overview tracks
    getOverviewTracks() {
        return this.parseTracks(this.tracks.filter(track => !!track.overview));
    }

    // Get only detail tracks
    getDetailTracks() {
        return this.parseTracks(this.tracks.filter(track => !track.overview));
    }

    parseTracks(tracks) {
        return (tracks || [])
            .filter(track => {
                return typeof track.visible !== "boolean" || track.visible;
            })
            .map(track => {
                switch (track.type) {
                    case "sequence":
                        return new SequenceTrack({
                            cellBaseClient: this.config.cellBaseClient,
                            ...track.config,
                        });
                    case "gene":
                        return new GeneTrack({
                            cellBaseClient: this.config.cellBaseClient,
                            ...track.config,
                        });
                    case "gene-overview":
                        return new GeneOverviewTrack({
                            cellBaseClient: this.config.cellBaseClient,
                            ...track.config,
                        });
                    case "variant":
                        return new VariantTrack({
                            cellBaseClient: this.config.cellBaseClient,
                            ...track.config,
                        });
                    case "opencga-variant":
                        return new OpenCGAVariantTrack({
                            opencgaClient: this.opencgaSession.opencgaClient,
                            opencgaStudy: this.opencgaSession.study.fqn,
                            ...track.config,
                        });
                    case "opencga-alignment":
                        return new OpenCGAAlignmentTrack({
                            opencgaClient: this.opencgaSession.opencgaClient,
                            opencgaStudy: this.opencgaSession.study.fqn,
                            ...track.config,
                        });
                    default:
                        return new FeatureTrack({
                            cellBaseClient: this.config.cellBaseClient,
                            ...track.config,
                        });
                }
            });
    }

    render() {
        return html`
            <div id="${this._prefix}GenomeBrowser" style="width:100%;"></div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("genome-browser", GenomeBrowserComponent);
