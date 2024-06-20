import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

class VariantInterpreterBrowserReview extends LitElement {

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
            clinicalAnalysis: {
                type: Object,
            },
            state: {
                type: Object,
            },
        };
    }

    #init() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("state")) {
            this._data = {};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onSave() {
        LitUtils.dispatchCustomEvent(this, "saveInterpretationChanges", null, {
            comment: this._data?.comment,
        });
    }

    onClear() {
        LitUtils.dispatchCustomEvent(this, "clearInterpretationChanges", null, {});
    }

    renderVariant(variant, color) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        return html`
            <div class="mb-1 border-start border-4 border-${color}">
                <div class="my-1 mx-2">${variant.id} (${variant.type})</div>
                <div class="my-1 mx-2">${variant.annotation.displayConsequenceType}</div>
                <div class="my-1 mx-2">${geneNames.join(", ")}</div>
            </div>
        `;
    }

    renderVariantsList(title, variants, color) {
        return html`
            <div class="fw-bold text-secondary-emphasis">${title} (${variants.length})</div>
            <div class="mb-2">
                ${variants.map(variant => this.renderVariant(variant, color))}
            </div>
        `;
    }

    render() {
        const hasVariantsToSave = this.state.addedVariants?.length || this.state.removedVariants?.length || this.state.updatedVariants?.length;
        return html`
            <div>
                <div class="my-1 mx-2">
                    <span class="fw-bold">Changed Variants</span>
                </div>
                <div class="my-1 mx-3">
                    ${this.renderVariantsList("New selected variants", this.state?.addedVariants || [], "success")}
                    ${this.renderVariantsList("Updated variants", this.state?.updatedVariants || [], "primary")}
                    ${this.renderVariantsList("Removed variants", this.state?.removedVariants || [], "danger")}
                </div>
                <hr class="dropdown-divider">
                <div class="my-1 mx-2">
                    <span class="fw-bold">Add new comment</span>
                </div>
                <div class="my-1 mx-3">
                    <div class="mb-1">
                        <text-field-filter
                            placeholder="Add comment..."
                            .rows=${2}
                            @filterChange="${e => this.onSaveFieldsChange("message", e)}">
                        </text-field-filter>
                    </div>
                    <div class="">
                        <text-field-filter
                            placeholder="Add tags..."
                            .rows=${1}
                            @filterChange="${e => this.onSaveFieldsChange(e)}">
                        </text-field-filter>
                    </div>
                </div>
                <hr class="dropdown-divider">
                <div class="d-flex align-items-center justify-content-between mx-2">
                    <div class="d-flex">
                        <button class="btn btn-light ${hasVariantsToSave ? "" : "disabled"}" @click="${this.onFilter}">
                            <i class="fas fa-filter pe-1"></i> Filter Variants
                        </button>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-light ${hasVariantsToSave ? "" : "disabled"}" @click="${this.onDiscard}">
                            <i class="fas fa-eraser pe-1"></i> Discard
                        </button>
                        <button class="btn btn-primary ${hasVariantsToSave ? "" : "disabled"}" @click="${this.onSave}">
                            <i class="fas fa-save pe-1"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("variant-interpreter-browser-review", VariantInterpreterBrowserReview);
