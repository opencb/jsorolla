import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";

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
        this._prefix = UtilsNew.randomString(8);
    }

    onSave() {
        // 1. Dispatch evnet to save variants and include the (optional) comment
        LitUtils.dispatchCustomEvent(this, "saveVariants", null, {
            comment: {
                message: this.querySelector(`textarea#${this._prefix}CommentMessage`).value || "",
                tags: (this.querySelector(`input#${this._prefix}CommentTags`).value || "").trim().split(",").map(t => t.trim()).filter(Boolean),
            },
        });
        // 2. Reset comment fields
        this.querySelector(`textarea#${this._prefix}CommentMessage`).value = "";
        this.querySelector(`input#${this._prefix}CommentTags`).value = "";
    }

    onDiscard() {
        LitUtils.dispatchCustomEvent(this, "discardVariants", null);
    }

    onFilter() {
        LitUtils.dispatchCustomEvent(this, "filterVariants", null);
    }

    renderVariant(variant, color) {
        const geneNames = Array.from(new Set(variant.annotation.consequenceTypes.filter(ct => ct.geneName).map(ct => ct.geneName)));
        return html`
            <div class="mb-1 border-start border-4 border-${color}">
                <div class="my-1 mx-2"><b>${variant.id}</b> <i class="ps-3">${variant.annotation.displayConsequenceType || ""}</i></div>
                <div class="my-1 mx-2 small">${geneNames.join(", ")}</div>
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
        const hasVariantsToFilter = this.state.addedVariants?.length || this.state.updatedVariants?.length;
        return html`
            <div>
                <div class="my-1 mx-2">
                    <span class="fw-bold">Changed Variants</span>
                </div>
                <div class="my-1 mx-3 overflow-y-auto" style="max-height:350px;">
                    ${this.renderVariantsList("New selected variants", this.state?.addedVariants || [], "success")}
                    ${this.renderVariantsList("Updated variants", this.state?.updatedVariants || [], "warning")}
                    ${this.renderVariantsList("Removed variants", this.state?.removedVariants || [], "danger")}
                </div>
                <hr class="dropdown-divider">
                <div class="my-1 mx-2">
                    <span class="fw-bold">Add a new Interpretation Comment</span>
                </div>
                <div class="my-1 mx-3">
                    <div class="mb-1">
                        <label for="${this._prefix}CommentMessage" class="form-label small mb-0">Comment Message</label>
                        <textarea id="${this._prefix}CommentMessage" class="form-control" rows="3" placeholder="Your message..."></textarea>
                    </div>
                    <div class="">
                        <label for="${this._prefix}CommentTags" class="form-label small mb-0">Comment Tags</label>
                        <input type="text" id="${this._prefix}CommentTags" class="form-control" placeholder="Example: tag1,tag2"/>
                    </div>
                </div>
                <hr class="dropdown-divider">
                <div class="d-flex align-items-center justify-content-between mx-2">
                    <div class="d-flex">
                        <button class="btn btn-light ${hasVariantsToFilter ? "" : "disabled"}" @click="${() => this.onFilter()}">
                            <i class="fas fa-filter pe-1"></i> Filter Variants
                        </button>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-light ${hasVariantsToSave ? "" : "disabled"}" @click="${() => this.onDiscard()}">
                            <i class="fas fa-eraser pe-1"></i> Discard Changes
                        </button>
                        <button class="btn btn-primary ${hasVariantsToSave ? "" : "disabled"}" @click="${() => this.onSave()}">
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

customElements.define("variant-interpreter-browser-save", VariantInterpreterBrowserSave);
