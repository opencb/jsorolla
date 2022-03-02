import FeatureTrack from "./feature-track.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import VariantRenderer from "../renderers/variant-renderer.js";
// import OpencgaAdapter from "../../core/data-adapter/opencga-adapter.js";

export default class OpenCGAVariantTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize the dataAdapter
        // this.dataAdapter = this.config.dataAdapter || this.#initDataAdapter();

        // Initialize Rendererers
        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        this.renderer = new VariantRenderer({
            ...this.config.renderer,
            // sampleNames: this.config.opencgaSamples,
        });
    }

    // #initDataAdapter() {
    //     let dataAdapter = null;

    //     if (this.config.opencgaClient) {
    //         const params = {
    //             studies: this.config.opencgaStudies,
    //             exclude: "studies,annotation",
    //         };

    //         if (this.config.opencgaSamples && this.config.opencgaSamples.length > 0) {
    //             params.exclude = "studies.files,studies.stats,annotation";
    //             params.returnedSamples = this.config.opencgaSamples;
    //         }

    //         if (this.config.opencgaFiles && this.config.opencgaFiles.length > 0) {
    //             params.exclude = "studies.files,studies.stats,annotation";
    //             params.file = this.config.opencgaFiles;
    //         }

    //         dataAdapter = new OpencgaAdapter(this.config.opencgaClient, "analysis/variant", "", "query", params, {
    //             chunkSize: 100000,
    //         });
    //     } else {
    //         console.error("No opencga object provided");
    //     }

    //     return dataAdapter;
    // }

    getData(options) {
        if (options.dataType === "histogram") {
            // Fetch aggregation stats for the current region
            return this.config.opencgaClient.variants().aggregationStats({
                studies: this.config.opencgaStudies,
                region: options.region.toString(),
                field: `start[${options.region.start}..${options.region.end}]:${this.config.histogramInterval}`,
            });
        } else {
            // Fetch variants
            return this.config.opencgaClient.variants().query(
                {
                    studies: this.config.opencgaStudies,
                    limit: 5000,
                    region: options.region.toString(),
                    include: "id,chromosome,start,end,strand,type,annotation.displayConsequenceType",
                }
            );
        }
    }

    // Get default config
    getDefaultConfig() {
        return {
            title: "",
            height: 200,
            maxHeight: 300,
            resizable: true,
            dataAdapter: null,
            opencgaClient: null,
            opencgaStudies: "",
            opencgaSamples: [],
            opencgaFiles: [],
            histogramMinRegionSize: 200000, // 300000000,
            histogramInterval: 10000,
            labelMaxRegionSize: 10000000,
            renderer: {}, // Renderer configuration
            histogramRenderer: {}, // Histogram renderer configuration
        };
    }

}
