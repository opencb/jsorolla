import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import WebUtils from "../../commons/utils/web-utils.js";
import "../../commons/forms/data-form.js";

export default class ClinicalReportSummary extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._clinicalAnalysis = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        this._clinicalAnalysis = null;
        if (this.clinicalAnalysisId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    clinicalAnalysisObserver() {
        this._clinicalAnalysis = this.clinicalAnalysis;
    }

    render() {
        if (!this.opencgaSession || !this._clinicalAnalysis) {
            return nothing;
        }

        return html`
            <data-form
                .data=${this._clinicalAnalysis}
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Report Overview",
            display: {
                titleVisible: true,
                buttonsVisible: false,
                separationClassName: "mb-1",
                layout: [],
                ...this.displayConfig,
            },
            sections: [],
        };
    }

}

customElements.define("clinical-report-summary", ClinicalReportSummary);
