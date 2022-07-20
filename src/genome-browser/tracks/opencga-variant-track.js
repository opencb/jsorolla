import UtilsNew from "../../core/utilsNew.js";
import {SVG} from "../../core/svg.js";
import FeatureTrack from "./feature-track.js";
import HistogramRenderer from "../renderers/histogram-renderer.js";
import VariantRenderer from "../renderers/variant-renderer.js";
import FeatureRenderer from "../renderers/feature-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";

export default class OpenCGAVariantTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        this.sampleNames = null;
        this.samplesInfo = null;

        // Initialize Rendererers
        this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);

        // Check if samples has been provided in the query object
        if (this.config?.query?.sample) {
            this.sampleNames = this.config.query.sample.split(",")
                .map(item => item.split(":")[0])
                .filter(name => !!name);

            // Initialize samples DOM
            this.#initSamplesDOM();

            // Initialize variant renderer to display Sample Genotypes
            this.renderer = new VariantRenderer({
                sampleNames: this.sampleNames,
                sampleHeight: this.config.sampleHeight,
                headerHeight: this.config.headerHeight,
                dividerHeight: this.config.dividerHeight,
                lollipopVisible: this.config.lollipopVisible,
                lollipopHeight: this.config.lollipopHeight,
                highlights: this.config.highlights,
                highlightVisible: this.config.highlightVisible,
                highlightHeight: this.config.highlightHeight,
                ...this.config.renderer,
            });
        } else {
            // If not samples are provided then we use the basic feature renderer as we do in CellBase variant track
            this.renderer = new FeatureRenderer({
                color: GenomeBrowserUtils.variantColorFormatter,
                label: GenomeBrowserUtils.variantLabelFormatter,
                tooltipTitle: GenomeBrowserUtils.variantTooltipTitleFormatter,
                tooltipText: GenomeBrowserUtils.variantTooltipTextFormatter,
                histogramColor: "#58f3f0",
                ...this.config.renderer,
            });
        }
    }

    async #initSamplesDOM() {
        this.samplesInfo = new Map();
        const response = await this.config.opencgaClient.samples().search({
            study: this.config.opencgaStudy,
            id: this.sampleNames.join(","),
            includeIndividual: true,
        });

        response.getResults().forEach(result => {
            this.samplesInfo.set(result.id, {
                disorders: result.attributes?.OPENCGA_INDIVIDUAL?.disorders || [],
                sex: result.attributes?.OPENCGA_INDIVIDUAL?.sex?.id || "UNKNOWN",
                somatic: !!result.somatic,
            });
        });

        const topPosition = this.#getHeaderHeight();
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}SampleNames" style="position:absolute;top:0px;">
                ${this.sampleNames.map(name => {
                    const info = this.samplesInfo.get(name);
                    const sampleColor = info.disorders?.length > 0 ? "#CC0000" : "inherit";
                    const sampleSexIcon = GenomeBrowserUtils.getIndividualSexIcon(info.sex);
                    const sampleSexColor = GenomeBrowserUtils.getIndividualSexColor(info.sex);
                    return `
                        <div style="height:${this.config.sampleHeight}px;display:flex;flex-direction:column;justify-content:center;">
                            <div style="font-size:14px;">
                                <i class="fas ${sampleSexIcon}" style="padding-right:4px;color:${sampleSexColor};"></i>
                                <b style="color:${sampleColor};">${name}</b>
                            </div>
                            <div style="color:#6C757D;font-size:10px;padding-left:12px;">
                                <b>${info.somatic ? "Somatic" : "Germline"} sample</b>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
            <div id="${this.prefix}Divider" style="position:absolute;width:100%;"></div>
        `);

        // Sample names
        this.sampleNamesDiv = template.querySelector(`div#${this.prefix}SampleNames`);
        this.sampleNamesDiv.style.backgroundColor = "rgba(255,255,255,0.7)";
        this.sampleNamesDiv.style.paddingLeft = "16px";
        this.sampleNamesDiv.style.paddingRight = "16px";
        this.sampleNamesDiv.style.paddingTop = `${topPosition}px`;

        // Header divider
        this.dividerDiv = template.querySelector(`div#${this.prefix}Divider`);
        if (this.config.dividerVisible) {
            this.dividerDiv.style.height = `${this.config.dividerHeight}px`;
            this.dividerDiv.style.backgroundColor = this.config.dividerColor;
            this.dividerDiv.style.top = `${topPosition - (this.config.dividerHeight / 2)}px`;
        }

        // Append elements
        this.content.appendChild(this.sampleNamesDiv);
        this.content.appendChild(this.dividerDiv);
        // this.content.insertBefore(this.sampleBackgroundDiv, this.content.firstChild);
        // this.content.appendChild(this.sampleBackgroundDiv);

        // Append samples background
        const bgGroup = SVG.addChild(this.content.firstChild, "g", {}, 0);
        this.sampleNames.forEach((name, index) => {
            SVG.addChild(bgGroup, "rect", {
                x: "0px",
                y: `${topPosition + (index * this.config.sampleHeight)}px`,
                width: "100%",
                height: `${this.config.sampleHeight}px`,
                fill: index % 2 ? this.config.sampleBackgroundEven : this.config.sampleBackgroundOdd,
            });
        });

        // Update track height
        this.height = topPosition + this.sampleNames.length * this.config.sampleHeight;
    }

    // Get total header height
    #getHeaderHeight() {
        let height = this.config.lollipopVisible ? this.config.lollipopHeight : this.config.headerHeight;

        // Check if highlights are visible
        if (this.config.highlightVisible) {
            height = height + this.config.highlightHeight;
        }

        return height;
    }

    getData(options) {
        if (options.dataType === "histogram" && !this.sampleNames) {
            // Fetch aggregation stats for the current region
            return this.config.opencgaClient.variants().aggregationStats({
                study: this.config.opencgaStudy,
                region: options.region.toString(),
                field: `start[${options.region.start}..${options.region.end}]:${this.config.histogramInterval}`,
            });
        } else {
            // Fetch variants
            return this.config.opencgaClient.variants().query({
                ...(this.config.query || {}),
                study: this.config.opencgaStudy,
                limit: 5000,
                region: options.region.toString(),
                include: "id,chromosome,start,end,strand,type,annotation.displayConsequenceType,studies",
            });
        }
    }

    // Get default config
    getDefaultConfig() {
        return {
            title: "",
            height: 0,
            resizable: false,
            opencgaClient: null,
            opencgaStudy: "",
            query: null,
            histogramMinRegionSize: 300000000,
            histogramInterval: 10000,
            labelMaxRegionSize: 10000000,
            renderer: {}, // Renderer configuration
            histogramRenderer: {}, // Histogram renderer configuration
            sampleHeight: 40,
            sampleBackgroundOdd: "rgba(255,255,255,0.2)",
            sampleBackgroundEven: "rgba(164, 171, 182, 0.2)", // === "#a4abb6",
            // Variants header
            headerHeight: 20,
            // Lollipop and samples divider
            dividerVisible: true,
            dividerHeight: 2,
            dividerColor: "#d4d8dd",
            // Lollipop configuration
            lollipopVisible: true,
            lollipopHeight: 40,
            // Highlights
            highlights: [],
            highlightVisible: true,
            highlightHeight: 16,
        };
    }

}
