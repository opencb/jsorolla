import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class LiftOverAnalysis extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolParams: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "liftover";
        this.ANALYSIS_TITLE = "LiftOver Analysis";
        this.ANALYSIS_DESCRIPTION = "Liftover your VCF files from hg19 to hg38 (GRCH38 for Ensembl or HG38 for NCBI).";

        this.DEFAULT_TOOLPARAMS = {
            targetAssembly: "GRCh38",
        };
        // Make a deep copy to avoid modifying default object.
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
        }
        if (changedProperties.has("config")) {
            // Note: this.config is merged with the default config in the AnalysisUtils.getAnalysisConfiguration method.
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        return null;
    }

    onFieldChange() {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            files: this._toolParams.files.split(","),
            targetAssembly: this._toolParams.targetAssembly,
            outdir: this._toolParams.outdir || "",
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
        };

        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runLiftover(toolParams, params),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const params = [
            {
                title: "Input Parameters",
                elements: [
                    {
                        title: "VCF File",
                        required: true,
                        field: "files",
                        type: "custom",
                        display: {
                            render: (files, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${files}"
                                        .resource="${"FILE"}"
                                        .query="${{format: "VCF"}}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            }
                        }
                    },
                    {
                        title: "Target Assembly",
                        field: "targetAssembly",
                        type: "select",
                        required: true,
                        allowedValues: ["GRCh38", "hg38"],
                        display: {
                            helpMessage: "Target assembly for lift over.",
                        },
                    },
                    {
                        title: "Output Directory",
                        field: "outdir",
                        type: "custom",
                        display: {
                            render: (outdir, dataFormFilterChange) => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${outdir}"
                                        .resource="${"DIRECTORY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                            helpMessage: "Destination path where the lifted-over VCF files will be stored. If left empty, the VCF files will be stored in the job folder.",
                        },
                    },
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            this.config,
        );
    }

}

customElements.define("liftover-analysis", LiftOverAnalysis);
