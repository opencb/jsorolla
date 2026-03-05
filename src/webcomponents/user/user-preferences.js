import {LitElement, html} from "lit";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";

export default class UserPreferences extends LitElement {

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
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.STORAGE_KEY = "iva.preferences";
        this._preferences = this.#loadFromStorage();
        this._config = this.getDefaultConfig();
    }

    #loadFromStorage() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "{}");
        } catch (e) {
            return {};
        }
    }

    #saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._preferences));
    }

    static getPreference(key) {
        try {
            const prefs = JSON.parse(localStorage.getItem("iva.preferences") || "{}");
            return prefs[key] || "";
        } catch (e) {
            return "";
        }
    }

    update(changedProperties) {
        if (changedProperties.has("active") && this.active) {
            this._preferences = this.#loadFromStorage();
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this._preferences = {...e.detail.data};
        this.requestUpdate();
    }

    onSubmit() {
        this.#saveToStorage();
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Preferences saved successfully",
        });
    }

    onClear() {
        this._preferences = this.#loadFromStorage();
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._preferences}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${() => this.onSubmit()}"
                @clear="${() => this.onClear()}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Preferences",
            display: {
                style: "margin: 10px",
                titleWidth: 3,
                defaultLayout: "horizontal",
                buttonOkText: "Save",
            },
            sections: [
                {
                    title: "External API Keys",
                    description: "Configure API keys for external services. Keys are stored locally in your browser and never sent to the server.",
                    elements: [
                        {
                            title: "MobiDetails API Key",
                            type: "input-text",
                            field: "mobidetailsApiKey",
                            defaultValue: "",
                            display: {
                                helpMessage: "Get your API key from https://mobidetails.chu-montpellier.fr",
                            },
                        },
                    ],
                },
                {
                    title: "cBioPortal",
                    description: "Configure cBioPortal settings. If no studies are specified, the default cross-cancer study set will be used.",
                    elements: [
                        {
                            title: "Study IDs",
                            type: "custom",
                            field: "cbioportalStudyIds",
                            display: {
                                helpMessage: "One study ID per line",
                                render: () => html`
                                    <textarea
                                        class="form-control"
                                        rows="5"
                                        placeholder="Enter one study ID per line"
                                        .value="${this._preferences.cbioportalStudyIds || ""}"
                                        @input="${e => {
                                            this._preferences = {...this._preferences, cbioportalStudyIds: e.target.value};
                                        }}">
                                    </textarea>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-preferences", UserPreferences);
