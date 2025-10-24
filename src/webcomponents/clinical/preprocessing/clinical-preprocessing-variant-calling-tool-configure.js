import {html, LitElement, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class ClinicalPreprocessingVariantCallingToolConfigure extends LitElement {

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
            toolName: {
                type: String,
            },
            toolData: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolData")) {
            this._data = UtilsNew.objectClone(this.toolData || {});
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange(event) {
        this._data = {
            ...this._data,
        };
        this.requestUpdate();
    }

    onSubmit() {
        LitUtils.dispatchCustomEvent(this, "toolConfigureSave", null, this._data);
    }

    render() {
        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @submit="${event=> this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: true,
                buttonClearText: "",
                buttonOkText: "Save",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            title: "Reference Genome Index",
                            field: "reference",
                            type: "custom",
                            display: {
                                render: (reference, dataFormFilterChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${reference}"
                                            .resource="${"FILE"}"
                                            .searchField="${"path"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                multiple: false,
                                            }}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Tool Parameters",
                            field: "parameters",
                            type: "input-parameters",
                            display: {
                                itemsNotFoundText: "No parameters registered for this tool.",
                                fileRender: (selectedFile, dataFormFilterChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${selectedFile}"
                                        .resource="${"FILE"}"
                                        .searchField="${"path"}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-variant-calling-tool-configure", ClinicalPreprocessingVariantCallingToolConfigure);
