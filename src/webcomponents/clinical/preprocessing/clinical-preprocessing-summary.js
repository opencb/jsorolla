import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSummary extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    render() {
        if (!this.opencgaSession || !this.toolParams) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this.toolParams}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Preprocessing Summary & Run",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Selected Files",
                    display: {},
                    elements: [
                        {
                            field: "select.analysisType",
                            title: "Analysis Type",
                        },
                        {
                            title: "Selected Files",
                            field: "select",
                            type: "table",
                            display: {
                                getData: data => {
                                    const analysisType = data.select?.analysisType?.toLowerCase();
                                    const fileIds = data.select?.[analysisType]?.fileIds?.split(",") || [];

                                    // filter and return only the selected files
                                    return (data.select?.[analysisType]?.files || []).filter(ffileId => {
                                        return fileIds.includes(ffileId.fileId);
                                    });
                                },
                                className: "table-borderless table-grid mb-0",
                                columns: [
                                    {
                                        title: "Individual",
                                        field: "individualId",
                                    },
                                    {
                                        title: "Sample",
                                        field: "sampleId",
                                        type: "custom",
                                        display: {
                                            render: (sampleId, onFieldChange, updateParams, data, row) => html`
                                                <div class="mb-1">${sampleId}</div>
                                                <div class="text-muted fs-7">${row.sampleSomatic ? "Somatic" : "Germline"}</div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "File",
                                        field: "fileName",
                                    },
                                    {
                                        title: "Format",
                                        field: "fileFormat",
                                    },
                                    {
                                        title: "Size",
                                        field: "fileSize",
                                        type: "custom",
                                        display: {
                                            render: size => UtilsNew.getDiskUsage(size),
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Sarek Parameters",
                    display: {},
                    elements: [],
                },
                {
                    title: "Variant Index Parameters",
                    display: {},
                    elements: [],
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-summary", ClinicalPreprocessingSummary);
