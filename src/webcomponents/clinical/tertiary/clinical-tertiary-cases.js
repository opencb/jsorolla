import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/disease-panel-filter.js";

export default class ClinicalTertiaryCases extends LitElement {

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
            createCases: true,
            type: "SINGLE",
            caseIdPrefix: "",
            panels: [],
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
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
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
            title: "Create Cases",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Case Creation Configuration",
                    elements: [
                        {
                            title: "Create Cases",
                            field: "createCases",
                            type: "toggle-switch",
                            display: {
                                helpMessage: "Enable this option to create clinical analysis cases.",
                            },
                        },
                        {
                            title: "Clinical Analysis Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            display: {
                                visible: data => data?.createCases === true,
                                helpMessage: "Select the type of clinical analysis to create.",
                            },
                        },
                        {
                            title: "Case ID Prefix",
                            field: "caseIdPrefix",
                            type: "input-text",
                            display: {
                                visible: data => data?.createCases === true,
                                placeholder: "eg. AN-",
                                helpMessage: "Prefix to be used for generating case IDs. Case IDs will be generated as: {prefix}{number}",
                            },
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                visible: data => data?.createCases === true,
                                render: (panels, dataFormFilterChange) => {
                                    const handlePanelsFilterChange = e => {
                                        const panelList = (e.detail?.value?.split(",") || [])
                                            .filter(panelId => panelId)
                                            .map(panelId => ({id: panelId}));
                                        dataFormFilterChange(panelList);
                                    };
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study?.panels}"
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            @filterChange="${e => handlePanelsFilterChange(e)}">
                                        </disease-panel-filter>
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

customElements.define("clinical-tertiary-cases", ClinicalTertiaryCases);

