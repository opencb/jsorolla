import FeatureTrack from "./feature-track.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import AlignmentRenderer from "../renderers/alignment-renderer.js";

export default class AlignmentTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize Rendererers
        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        this.renderer = new AlignmentRenderer({
            ...(this.config.renderer || {}),
        });

        // Init sample and file info
        this.#getSampleAndAlignmentInfo();
    }

    // Import sample info
    async #getSampleAndAlignmentInfo() {
        this.sampleInfo = await this.config.opencgaClient.samples()
            .info(this.config.sample, {
                study: this.config.opencgaStudy,
                includeIndividual: true,
            })
            .results[0];

        // Alignment file info
        this.alignmentInfo = await this.config.opencgaClient.files()
            .query({
                study: this.config.opencgaStudy,
                sampleIds: this.config.sample,
                bioformat: "ALIGNMENT",
                exclude: "qualityControl,attributes",
            })
            .results[0];
    }

    getData(options) {
        if (options.dataType === "histogram") {
            // Fetch aggregation stats for the current region
            // return this.config.opencgaClient.variants().aggregationStats({
            //     study: this.config.opencgaStudy,
            //     region: options.region.toString(),
            //     field: `start[${options.region.start}..${options.region.end}]:${this.config.histogramInterval}`,
            // });
        } else {
            // Fetch alignments info for the current region
            return this.config.opencgaClient.alignments().query({
                file: this.alignmentInfo.id,
                study: this.config.opencgaStudy,
                limit: 5000,
                region: options.region.toString(),
            });
        }
    }

    getDefaultConfig() {
        return {
            title: "",
            height: 200,
            maxHeight: 300,
            resizable: true,
            opencgaClient: null,
            opencgaStudy: "",
            sample: null,
            // query: null,
            histogramMinRegionSize: 300000000,
            histogramInterval: 10000,
            labelMaxRegionSize: 10000000,
            renderer: {}, // Renderer configuration
            histogramRenderer: {}, // Histogram renderer configuration
        };
    }

}
