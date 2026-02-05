import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class ClinicalPharmacogenomicsAnnotation extends LitElement {

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
                type: Object
            },
            alleleTyperParams: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._annotationSources = {
            pharmGKB: true,
            cpic: true,
            dpwg: true,
            fda: true,
            clinVar: false,
        };
        this._customAnnotations = [];
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._annotationSources = this.toolParams?.annotationSources || this._annotationSources;
            this._customAnnotations = this.toolParams?.customAnnotations || [];
        }
        super.update(changedProperties);
    }

    onAnnotationSourceChange(event, source) {
        this._annotationSources[source] = event.target.checked;
        this.notifyParamsChange();
    }

    onCustomAnnotationAdd() {
        this._customAnnotations.push({
            name: "",
            url: "",
            description: "",
        });
        this.requestUpdate();
        this.notifyParamsChange();
    }

    onCustomAnnotationRemove(index) {
        this._customAnnotations.splice(index, 1);
        this.requestUpdate();
        this.notifyParamsChange();
    }

    onCustomAnnotationChange(index, field, value) {
        this._customAnnotations[index][field] = value;
        this.notifyParamsChange();
    }

    notifyParamsChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            annotationSources: this._annotationSources,
            customAnnotations: this._customAnnotations,
        });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        const selectedGenes = this.alleleTyperParams?.genes || [];

        return html`
            <div class="mb-4">
                <h3 class="mb-3">Annotation Configuration</h3>
                <p class="text-muted">
                    Configure pharmacogenomics annotation sources to interpret identified variants.
                    Annotations include drug-gene interactions, clinical guidelines, and pharmacogenomics databases.
                </p>
            </div>

            <div class="alert alert-info mb-4">
                <i class="fas fa-info-circle me-2"></i>
                Analyzing <strong>${selectedGenes.length}</strong> pharmacogenes:
                ${selectedGenes.length > 0 ? html`
                    <span class="ms-2">${selectedGenes.join(", ")}</span>
                ` : html`
                    <span class="ms-2 text-warning">No genes selected</span>
                `}
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-database me-2"></i>Annotation Sources
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check mb-3">
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="pharmGKB"
                                            .checked="${this._annotationSources.pharmGKB}"
                                            @change="${e => this.onAnnotationSourceChange(e, "pharmGKB")}">
                                        <label class="form-check-label" for="pharmGKB">
                                            <strong>PharmGKB</strong>
                                        </label>
                                        <small class="form-text text-muted d-block">
                                            Pharmacogenomics Knowledge Base - comprehensive drug-gene interactions
                                        </small>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="cpic"
                                            .checked="${this._annotationSources.cpic}"
                                            @change="${e => this.onAnnotationSourceChange(e, "cpic")}">
                                        <label class="form-check-label" for="cpic">
                                            <strong>CPIC</strong>
                                        </label>
                                        <small class="form-text text-muted d-block">
                                            Clinical Pharmacogenetics Implementation Consortium - clinical guidelines
                                        </small>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="dpwg"
                                            .checked="${this._annotationSources.dpwg}"
                                            @change="${e => this.onAnnotationSourceChange(e, "dpwg")}">
                                        <label class="form-check-label" for="dpwg">
                                            <strong>DPWG</strong>
                                        </label>
                                        <small class="form-text text-muted d-block">
                                            Dutch Pharmacogenetics Working Group - European guidelines
                                        </small>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-check mb-3">
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="fda"
                                            .checked="${this._annotationSources.fda}"
                                            @change="${e => this.onAnnotationSourceChange(e, "fda")}">
                                        <label class="form-check-label" for="fda">
                                            <strong>FDA</strong>
                                        </label>
                                        <small class="form-text text-muted d-block">
                                            FDA pharmacogenomics biomarkers and drug labels
                                        </small>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            id="clinVar"
                                            .checked="${this._annotationSources.clinVar}"
                                            @change="${e => this.onAnnotationSourceChange(e, "clinVar")}">
                                        <label class="form-check-label" for="clinVar">
                                            <strong>ClinVar</strong>
                                        </label>
                                        <small class="form-text text-muted d-block">
                                            Clinical variant database with pharmacogenomics annotations
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="fas fa-plus-circle me-2"></i>Custom Annotations
                            </h5>
                            <button
                                class="btn btn-sm btn-primary"
                                @click="${() => this.onCustomAnnotationAdd()}">
                                <i class="fas fa-plus me-1"></i> Add Custom Source
                            </button>
                        </div>
                        <div class="card-body">
                            ${this._customAnnotations.length === 0 ? html`
                                <div class="text-center text-muted py-3">
                                    <i class="fas fa-info-circle me-2"></i>
                                    No custom annotation sources added
                                </div>
                            ` : html`
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>URL</th>
                                                <th>Description</th>
                                                <th style="width:80px;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${this._customAnnotations.map((annotation, index) => html`
                                                <tr>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            class="form-control form-control-sm"
                                                            placeholder="Source name"
                                                            .value="${annotation.name}"
                                                            @input="${e => this.onCustomAnnotationChange(index, "name", e.target.value)}">
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            class="form-control form-control-sm"
                                                            placeholder="https://..."
                                                            .value="${annotation.url}"
                                                            @input="${e => this.onCustomAnnotationChange(index, "url", e.target.value)}">
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            class="form-control form-control-sm"
                                                            placeholder="Description"
                                                            .value="${annotation.description}"
                                                            @input="${e => this.onCustomAnnotationChange(index, "description", e.target.value)}">
                                                    </td>
                                                    <td class="text-center">
                                                        <button
                                                            class="btn btn-sm btn-danger"
                                                            @click="${() => this.onCustomAnnotationRemove(index)}">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `)}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-pharmacogenomics-annotation", ClinicalPharmacogenomicsAnnotation);
