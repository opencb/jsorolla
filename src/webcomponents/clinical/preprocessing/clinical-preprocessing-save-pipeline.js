import {html, LitElement} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSavePipeline extends LitElement {

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
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
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
        LitUtils.dispatchCustomEvent(this, "pipelineSave", null, this._data);
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
                            title: "File Name",
                            field: "fileName",
                            type: "input-text",
                            required: true,
                            display: {
                            },
                        },
                        {
                            title: "Pipeline Name",
                            field: "name",
                            type: "input-text",
                            required: true,
                            display: {
                            },
                        },
                        {
                            title: "Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["genomics", "affy"],
                            defaultValue: "genomics",
                            display: {
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-save-pipeline", ClinicalPreprocessingSavePipeline);
