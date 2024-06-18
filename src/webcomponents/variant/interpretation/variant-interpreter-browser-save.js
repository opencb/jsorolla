import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

class VariantInterpreterBrowserSave extends LitElement {

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

    renderVariant(variant, icon) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        const iconHtml = icon ? html`<span style="cursor: pointer"><i class="${icon}"></i></span>` : "";

        return html`
            <div class="mb-1" style="border-left: 2px solid #0c2f4c;">
                <div class="my-1 mx-2">${variant.id} (${variant.type}) ${iconHtml}</div>
                <div class="my-1 mx-2">${variant.annotation.displayConsequenceType}</div>
                <div class="my-1 mx-2">${geneNames.join(", ")}</div>
            </div>
        `;
    }

    render() {
        const hasVariantsToSave = this.state.addedVariants?.length || this.state.removedVariants?.length || this.state.updatedVariants?.length;
        return html`
            <div>
                <div class="my-1 mx-0">
                    <span class="fw-bold">Changed Variants</span>
                </div>
                <div class="my-1 mx-2">
                    <div class="fw-bold">New selected variants (${this.state?.addedVariants?.length ?? 0})</div>
                    <div class="">
                        ${(this.state?.addedVariants || []).map(variant => this.renderVariant(variant))}
                    </div>
                    <div class="fw-bold">Updated variants (${this.state?.updatedVariants?.length ?? 0})</div>
                    <div class="">
                        ${(this.state?.updatedVariants || []).map(variant => this.renderVariant(variant))}
                    </div>
                    <div class="fw-bold">Removed variants (${this.state?.removedVariants?.length ?? 0})</div>
                    <div class="">
                        ${(this.state?.removedVariants || []).map(variant => this.renderVariant(variant))}
                    </div>
                </div>
                <hr class="dropdown-divider">
                <div class="my-1 mx-0">
                    <span class="fw-bold">Add new comment</span>
                </div>
                <div class="my-1 mx-0">
                    <text-field-filter
                        placeholder="Add comment..."
                        .rows=${3}
                        @filterChange="${e => this.onSaveFieldsChange("message", e)}">
                    </text-field-filter>
                </div>
                <div class="my-1 mx-0">
                    <text-field-filter
                        placeholder="Add tags..."
                        .rows=${1}
                        @filterChange="${e => this.onSaveFieldsChange(e)}">
                    </text-field-filter>
                </div>
                <hr class="dropdown-divider">
                <div class="float-end">
                    <button type="button" ?disabled="${!hasVariantsToSave}" class="btn btn-primary m-1 ${hasVariantsToSave ? "" : "disabled"}"
                            @click="${this.onSaveInterpretation}">Save
                    </button>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("variant-interpreter-browser-save", VariantInterpreterBrowserSave);
