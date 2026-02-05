import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

export default class ClinicalPharmacogenomicsAlleleTyper extends LitElement {

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
            registryParams: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._genes = [];
        this._configuration = {
            includeStarAlleles: true,
            includeStructuralVariants: false,
            customRegions: "",
        };
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._genes = this.toolParams?.genes || [];
            this._configuration = this.toolParams?.configuration || this._configuration;
        }
        super.update(changedProperties);
    }

    onFieldChange(event, field) {
        this._configuration[field] = event.detail.value;
        this.notifyParamsChange();
    }

    onGenesChange(event) {
        this._genes = event.detail.value ? event.detail.value.split(",").map(g => g.trim()) : [];
        this.notifyParamsChange();
    }

    notifyParamsChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            genes: this._genes,
            configuration: this._configuration,
        });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <div class="mb-4">
                <h3 class="mb-3">Allele Typer Configuration</h3>
                <p class="text-muted">
                    Configure the allele typing analysis for pharmacogenomics genes.
                    This step will identify star alleles (*alleles) and relevant variants in pharmacogenes.
                </p>
            </div>

            <div class="alert alert-info mb-4">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Uploaded Files:</strong>
                <ul class="mb-0 mt-2">
                    <li>Genotyping File: ${this.registryParams?.genotypingFileContent?.length > 0 ? html`<span class="text-success fw-bold">Uploaded</span>` : html`<span class="text-danger">Not uploaded</span>`}</li>
                    <li>Samplesheet: ${this.registryParams?.samplesheetFileContent?.length > 0 ? html`<span class="text-success fw-bold">Uploaded</span>` : html`<span class="text-muted">Optional - not uploaded</span>`}</li>
                </ul>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-dna me-2"></i>Gene Selection
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Pharmacogenes</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    placeholder="Enter gene names (comma-separated), e.g., CYP2D6, CYP2C19, DPYD"
                                    .value="${this._genes.join(", ")}"
                                    @input="${e => this.onGenesChange(e)}">
                                <small class="form-text text-muted">
                                    Common pharmacogenes: CYP2D6, CYP2C9, CYP2C19, CYP3A4, CYP3A5, DPYD, TPMT, UGT1A1, SLCO1B1, VKORC1
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-cog me-2"></i>Configuration
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="form-check mb-3">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="includeStarAlleles"
                                    .checked="${this._configuration.includeStarAlleles}"
                                    @change="${e => this.onFieldChange(e, "includeStarAlleles")}">
                                <label class="form-check-label" for="includeStarAlleles">
                                    Include Star Alleles (*alleles) Nomenclature
                                </label>
                                <small class="form-text text-muted d-block">
                                    Use standardized star allele nomenclature (e.g., *2, *3, etc.)
                                </small>
                            </div>

                            <div class="form-check mb-3">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="includeStructuralVariants"
                                    .checked="${this._configuration.includeStructuralVariants}"
                                    @change="${e => this.onFieldChange(e, "includeStructuralVariants")}">
                                <label class="form-check-label" for="includeStructuralVariants">
                                    Include Structural Variants (CNVs, deletions, duplications)
                                </label>
                                <small class="form-text text-muted d-block">
                                    Analyze copy number variations and structural variants affecting pharmacogenes
                                </small>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Custom Genomic Regions</label>
                                <textarea
                                    class="form-control"
                                    rows="3"
                                    placeholder="Optional: Enter custom regions (e.g., chr1:12345-67890)"
                                    .value="${this._configuration.customRegions}"
                                    @input="${e => this.onFieldChange(e, "customRegions")}">
                                </textarea>
                                <small class="form-text text-muted">
                                    Specify additional genomic regions to analyze (one per line)
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-pharmacogenomics-allele-typer", ClinicalPharmacogenomicsAlleleTyper);
