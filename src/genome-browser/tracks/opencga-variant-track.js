import UtilsNew from "../../core/utilsNew.js";
import FeatureTrack from "./feature-track.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import VariantRenderer from "../renderers/variant-renderer.js";
import OpencgaAdapter from "../../core/data-adapter/opencga-adapter.js";

export default class OpenCGAVariantTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize the dataAdapter
        this.dataAdapter = this.config.dataAdapter || this.#initDataAdapter();

        // Initialize Rendererers
        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        this.renderer = new VariantRenderer({
            ...this.config.renderer,
            // sampleNames: this.config.opencgaSamples,
        });
    }

    #initDataAdapter() {
        let dataAdapter = null;

        if (this.config.opencgaClient) {
            const params = {
                studies: this.config.opencgaStudies,
                exclude: "studies,annotation",
            };

            if (this.config.opencgaSamples && this.config.opencgaSamples.length > 0) {
                params.exclude = "studies.files,studies.stats,annotation";
                params.returnedSamples = this.config.opencgaSamples;
            }

            if (this.config.opencgaFiles && this.config.opencgaFiles.length > 0) {
                params.exclude = "studies.files,studies.stats,annotation";
                params.file = this.config.opencgaFiles;
            }

            dataAdapter = new OpencgaAdapter(this.config.opencgaClient, "analysis/variant", "", "query", params, {
                chunkSize: 100000,
            });
        } else {
            console.error("No opencga object provided");
        }

        return dataAdapter;
    }

    getDataHandler(event) {
        // Not histogram data type
        // if (event.dataType !== "histogram" || UtilsNew.isNotUndefinedOrNull(this.renderer.config.sampleNames)) {
        if (event.dataType !== "histogram") {
            const features = this.getFeaturesToRenderByChunk(event);
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
                resource: this.dataAdapter.resource,
                species: this.dataAdapter.species,
                featureType: this.featureType
            });
            this.updateHeight();
        } else {
            (event.items || []).forEach(features => {
                this.histogramRenderer.render(features, {
                    cacheItems: features,
                    svgCanvasFeatures: this.svgCanvasFeatures,
                    featureTypes: this.featureTypes,
                    renderedArea: this.renderedArea,
                    pixelBase: this.pixelBase,
                    position: this.region.center(),
                    regionSize: this.region.length(),
                    maxLabelRegionSize: this.maxLabelRegionSize,
                    width: this.width,
                    pixelPosition: this.pixelPosition,
                    resource: this.dataAdapter.resource,
                    species: this.dataAdapter.species,
                    featureType: this.featureType
                });
                this.updateHeight();
            });
        }
    }

    // Get default config
    getDefaultConfig() {
        return {
            title: "",
            dataAdapter: null,
            opencgaClient: null,
            opencgaStudies: "",
            opencgaSamples: [],
            opencgaFiles: [],
            // minHistogramRegionSize: 300000000, // Default track value
            minHistogramRegionSize: 200000,
            renderer: {}, // Renderer configuration
            histogramRenderer: {}, // Histogram renderer configuration
        };
    }

}
