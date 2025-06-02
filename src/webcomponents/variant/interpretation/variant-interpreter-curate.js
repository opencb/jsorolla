import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../annotation/cellbase-variant-annotation-summary.js";
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";

export default class VariantInterpreterCurate extends LitElement {

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
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            variant: {
                type: Object
            },
            variantId: {
                type: String
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this._variant = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.opencgaSession && this.variantId) {
            this.opencgaSession.opencgaClient.clinical()
                .queryVariant({
                    study: this.opencgaSession.study.fqn,
                    id: this.variantId,
                    includeSampleId: "true",
                })
                .then(response => {
                    this._variant = response?.responses?.[0]?.results?.[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    variantObserver() {
        this._variant = UtilsNew.objectClone(this.variant);
    }

    render() {
        if (!this.opencgaSession || !this._variant) {
            return nothing;
        }

        return html`
            <div class="alert alert-light mb-4 d-flex align-items-center justify-content-between">
                <div class="">Select this variant</div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="switchCheckDefault">
                </div>
            </div>
            <data-form
                .data="${this._variant}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-2",
                pillsRightColumnClass: "col-md-10",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    render: variant => html`
                        <cellbase-variant-annotation-summary
                            .variantAnnotation="${variant?.annotation}"
                            .consequenceTypes="${CONSEQUENCE_TYPES}"
                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                            .assembly="${this.opencgaSession.project.organism.assembly}">
                        </cellbase-variant-annotation-summary>
                    `,
                },
                {
                    id: "review",
                    name: "Review",
                    render: variant => html`
                        <clinical-interpretation-variant-review
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variant}"
                            .mode="${"form"}"
                            @variantChange="${e => {
                                // TODO
                            }}">
                        </clinical-interpretation-variant-review>
                    `,
                },
                {
                    id: "evidences",
                    name: "Evidences",
                    render: () => html`
                        <p>Provide any additional evidence or comments regarding the variant.</p>
                    `,
                },
            ],
        };
    }

}

customElements.define("variant-interpreter-curate", VariantInterpreterCurate);
