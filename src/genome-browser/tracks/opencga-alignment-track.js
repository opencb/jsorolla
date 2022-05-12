import FeatureTrack from "./feature-track.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import AlignmentRenderer from "../renderers/alignment-renderer.js";

export default class OpenCGAAlignmentTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize Rendererers
        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
        this.renderer = new AlignmentRenderer({
            ...(this.config.renderer || {}),
        });

        this.alignmentInfo = null;
    }

    // Import sample info
    async #getSampleAndAlignmentInfo() {
        // this.sampleInfo = await this.config.opencgaClient.samples()
        //     .info(this.config.sample, {
        //         study: this.config.opencgaStudy,
        //         includeIndividual: true,
        //     })
        //     .results[0];

        // Alignment file info
        const alignmentResponse = await this.config.opencgaClient.files()
            .search({
                study: this.config.opencgaStudy,
                sampleIds: this.config.sample,
                bioformat: "ALIGNMENT",
                exclude: "qualityControl,attributes",
            });
        this.alignmentInfo = alignmentResponse.getResults()[0];
    }

    async getData(options) {
        if (!this.alignmentInfo) {
            await this.#getSampleAndAlignmentInfo();
        }

        // Fetch alignments info for the current region
        const alignmentsRequest = this.config.opencgaClient.alignments().query(this.alignmentInfo.id, {
            study: this.config.opencgaStudy,
            limit: 5000,
            region: options.region.toString(),
            offset: 0,
        });

        // Fetch coverage data for the current region
        const coverageRequest = this.config.opencgaClient.alignments().queryCoverage(this.alignmentInfo.id, {
            study: this.config.opencgaStudy,
            region: options.region.toString(),
            windowSize: 1,
            offset: 0,
        });

        // Wrap all requests in a single promise
        return Promise.all([
            coverageRequest,
            alignmentsRequest,
        ]);
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
