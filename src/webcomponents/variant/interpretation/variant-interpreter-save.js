import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

class VariantInterpreterSave extends LitElement {

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

    render() {
        const hasVariantsToSave = this.state.addedVariants?.length || this.state.removedVariants?.length || this.state.updatedVariants?.length;
        return html`
            <div>
                <div class="my-1 mx-0">
                    <span class="fw-bold">Changed Variants</span>
                </div>
                <div class="my-1 mx-2">
                    <div>
                        <label style="font-weight: normal; width: 180px">New selected variants</label>
                        <span style="color: darkgreen;font-weight: bold">${this.state.addedVariants?.length}</span>
                    </div>
                    <div>
                        <label style="font-weight: normal; width: 180px">Removed variants</label>
                        <span style="color: darkred;font-weight: bold">${this.state.removedVariants?.length}</span>
                    </div>
                    <div>
                        <label style="font-weight: normal; width: 180px">Updated variants</label>
                        <span style="color: darkblue;font-weight: bold">${this.state.updatedVariants?.length}</span>
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

customElements.define("variant-interpreter-save", VariantInterpreterSave);
