import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class ClinicalTertiarySamples extends LitElement {

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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.DEFAULT_TOOLPARAMS = {
            samples: [],
        };
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParamsObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    toolParamsObserver() {
        if (this.toolParams) {
            this._toolParams = {...this.DEFAULT_TOOLPARAMS, ...this.toolParams};
        } else {
            this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        }
    }

    onFieldChange(event) {
        const {field, value} = event.detail;
        this._toolParams = {
            ...this._toolParams,
            [field]: value,
        };
        this.dispatchEvent(new CustomEvent("paramsChange", {
            detail: this._toolParams,
            bubbles: true,
            composed: true,
        }));
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
    }

    renderCatalogSearchAutocomplete(value, resource, onFieldChange) {
        return html`
            <catalog-search-autocomplete
                .value="${value}"
                .resource="${resource}"
                .opencgaSession="${this.opencgaSession}"
                .config="${{
                    multiple: true,
                }}"
                @filterChange="${e => onFieldChange(e.detail.value)}">
            </catalog-search-autocomplete>
        `;
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Select Samples",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Samples",
                    elements: [
                        {
                            title: "Select Samples",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: (samples, dataFormFilterChange) => {
                                    const sampleIds = (samples || []).map(s => s.id || s).join(",");
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${sampleIds}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                multiple: true,
                                            }}"
                                            @filterChange="${e => {
                                                const sampleList = (e.detail.value?.split(",") || [])
                                                    .filter(sampleId => sampleId)
                                                    .map(sampleId => ({id: sampleId}));
                                                dataFormFilterChange(sampleList);
                                            }}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-samples", ClinicalTertiarySamples);

