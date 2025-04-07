import {LitElement, html, nothing} from "lit";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/forms/data-form.js";

export default class CohortCreateSamples extends LitElement {

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
                type: Object
            },
            resource: {
                type: String,
            },
            query: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._cohort = {};
        this._samples = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("resource") || changedProperties.has("query")) {
            this.propertyObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    propertyObserver() {
        this._samples = null;
        if (this.opencgaSession && this.resource && this.query) {
            if (this.resource === "SAMPLE") {
                this.opencgaSession.opencgaClient.samples()
                    .search({
                        ...this.query,
                        include: "id",
                        limit: 5000,
                    })
                    .then(response => {
                        const results = response?.responses?.[0]?.results || [];
                        if (results?.length > 0) {
                            this._samples = results.map(sample => {
                                return {id: sample.id};
                            });
                            this.requestUpdate();
                        }
                    })
                    .catch(response => {
                        console.error(response);
                    });
            }
        }
    }

    onFieldChange() {
        this._cohort = {...this._cohort};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear cohort",
            message: "Are you sure to clear?",
            ok: () => {
                this._cohort = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const data = {
            id: this._cohort?.id,
            name: this._cohort?.name || "",
            samples: this._samples,
        };
        this.opencgaSession.opencgaClient.cohorts()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Cohort created correctly",
                });
                LitUtils.dispatchCustomEvent(this, "cohortCreate", data, {}, error);
            })
            .catch(reason => {
                console.log(reason);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    render() {
        if (!this.opencgaSession || !this._samples) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._cohort}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: true,
                buttonOkText: "Create Cohort",
                defaultLayout: "vertical",
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            type: "text",
                            text: () => html`
                                Create a new cohort with <b>${this._samples.length} samples</b>. This can take few seconds depending on the number of samples.
                            `,
                        },
                        {
                            title: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                            },
                        },
                        {
                            title: "Cohort Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a cohort name...",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("cohort-create-samples", CohortCreateSamples);
