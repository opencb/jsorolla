import {LitElement, html, nothing} from "lit";
import "../tool-header.js";
import "../../clinical/analysis/mutational-signature-analysis.js";
import "../../clinical/analysis/rd-tiering-analysis.js";
import "../../clinical/analysis/hrdetect-analysis.js";
import "../../job/analysis/tool-analysis.js";
import "../../job/analysis/custom-tool-builder.js";
import "../../variant/analysis/gwas-analysis.js";
import "../../variant/analysis/sample-variant-stats-analysis.js";
import "../../variant/analysis/cohort-variant-stats-analysis.js";
import "../../variant/analysis/sample-eligibility-analysis.js";
import "../../variant/analysis/inferred-sex-analysis.js";
import "../../variant/analysis/individual-relatedness-analysis.js";
import "../../variant/analysis/mendelian-error-analysis.js";
import "../../variant/analysis/sample-qc-analysis.js";
import "../../variant/analysis/individual-qc-analysis.js";
import "../../variant/analysis/family-qc-analysis.js";
import "../../variant/analysis/knockout-analysis.js";
import "../../variant/analysis/opencga-plink-analysis.js";
import "../../variant/analysis/opencga-gatk-analysis.js";
import "../../variant/analysis/bcftools-analysis.js";
import "../../variant/analysis/variant-export-analysis.js";
import "../../variant/analysis/opencga-variant-stats-exporter-analysis.js";
import "../../variant/interpretation/variant-interpreter.js";
import "../../workflow/analysis/workflow-analysis.js";

export default class AnalysisTools extends LitElement {

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
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._tool = "";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            // initialize this._tool with the first tool in the list
            if (!this._tool) {
                this._tool = this._config.menu?.[0]?.submenu?.[0]?.id;
            }
        }

        super.update(changedProperties);
    }

    onChangeTool(newTool) {
        this._tool = newTool;
        this.requestUpdate();
    }

    renderMenu() {
        return this._config.menu.map(item => {
            return html`
                <div class="">
                    <div class="d-flex align-items-center gap-2 text-gray-700 fs-9 user-select-none py-1">
                        <i class="fa fa-chevron-down"></i>
                        <span class="fw-bold">${item.name}</span>
                    </div>
                    <div class="d-flex flex-column gap-1">
                        ${(item.submenu || []).map(tool => html`
                            <div class="btn w-full text-start ${tool.id === this._tool ? "btn-primary" : "hover:bg-gray-200"}" @click="${() => this.onChangeTool(tool.id)}">
                                ${tool.name}
                            </div>     
                        `)}
                    </div>
                </div>
            `;
        });
    }

    renderTool() {
        let content = nothing;

        switch (this._tool) {
            case "tool-analysis":
                content = html`
                    <tool-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </tool-analysis>
                `;
                break;
            case "custom-tool-builder":
                content = html`
                    <custom-tool-builder
                        .opencgaSession="${this.opencgaSession}">
                    </custom-tool-builder>
                `;
                break;
            case "workflow-analysis":
                content = html`
                    <workflow-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </workflow-analysis>
                `;
                break;
            case "sample-variant-stats":
                content = html`
                    <sample-variant-stats-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </sample-variant-stats-analysis>
                `;
                break;
            case "cohort-variant-stats":
                content = html`
                    <cohort-variant-stats-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </cohort-variant-stats-analysis>
                `;
                break;
            case "eligibility":
                content = html`
                    <opencga-variant-eligibility-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-variant-eligibility-analysis>
                `;
                break;
            case "sample-eligibility":
                content = html`
                    <sample-eligibility-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </sample-eligibility-analysis>
                `;
                break;
            case "knockout":
                content = html`
                    <knockout-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </knockout-analysis>
                `;
                break;
            case "inferred-sex":
                content = html`
                    <inferred-sex-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </inferred-sex-analysis>
                `;
                break;
            case "individual-relatedness":
                content = html`
                    <individual-relatedness-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </individual-relatedness-analysis>
                `;
                break;
            case "mendelian-error":
                content = html`
                    <mendelian-error-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </mendelian-error-analysis>
                `;
                break;
            case "sample-qc":
                content = html`
                    <sample-qc-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </sample-qc-analysis>
                `;
                break;
            case "individual-qc":
                content = html`
                    <individual-qc-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </individual-qc-analysis>
                `;
                break;
            case "family-qc":
                content = html`
                    <family-qc-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </family-qc-analysis>
                `;
                break;
            case "plink":
                content = html`
                    <opencga-plink-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-plink-analysis>
                `;
                break;
            case "gatk":
                content = html`
                    <opencga-gatk-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-gatk-analysis>
                `;
                break;
            case "variant-export":
                content = html`
                    <variant-export-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </variant-export-analysis>
                `;
                break;
            case "variant-stats-exporter":
                content = html`
                    <opencga-variant-stats-exporter-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-variant-stats-exporter-analysis>
                `;
                break;
            case "mutational-signature":
                content = html`
                    <mutational-signature-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </mutational-signature-analysis>
                `;
                break;
            case "gwas":
                content = html`
                    <gwas-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </gwas-analysis>
                `;
                break;
            case "rd-tiering":
                content = html`
                    <rd-tiering-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </rd-tiering-analysis>
                `;
                break;
            case "alignment-index":
                content = html`
                    <opencga-alignment-index-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-alignment-index-analysis>
                `;
                break;
            case "coverage-index":
                content = html`
                    <opencga-coverage-index-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-coverage-index-analysis>
                `;
                break;
            case "alignment-stats":
                content = html`
                    <opencga-alignment-stats-analysis
                        .opencgaSession="${this.opencgaSession}">
                    </opencga-alignment-stats-analysis>
                `;
                break;
        }
        return content;
    }

    render() {
        return html`
            <tool-header
                .title="${this._config.name || this._config.title}"
                .icon="${this._config.icon}">
            </tool-header>
            <div class="row w-full">
                <div class="col-2 d-flex flex-column gap-3">
                    ${this.renderMenu()}
                </div>
                <div class="col-10">
                    <div class="w-full mx-auto" style="max-width:812px;">
                        ${this.renderTool()}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            name: "Analysis Tools",
            icon: "fa-tools",
            menu: [],
        };
    }

}

customElements.define("analysis-tools", AnalysisTools);
