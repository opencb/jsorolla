/**
 * Copyright 2015-2022 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement, nothing} from "lit";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/status/status-update.js";
import "../commons/filters/catalog-search-autocomplete.js";
import NotificationUtils from "./utils/notification-utils";

export default class OpencgaUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            resource: {
                type: String,
            },
            component: {
                type: Object,
            },
            componentId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.resource = "";
        this.component = {};
        this.params = {};
        this.updateCustomisation = [];


        this.updatedFields = {};
        this.isLoading = false;
        this.endpoint = {};
        this.resourceLabel = "";
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            labelWidth: 3,
            buttonOkText: "Update"
        };

        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("componentId")) {
            this.componentIdObserver();
        }
        if (changedProperties.has("component")) {
            this.componentObserver();
        }
        if (changedProperties.has("resource")) {
            this.resourceObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    componentObserver() {
        if (this.component && this.opencgaSession) {
            this.initOriginalObjects();
        }
    }

    #getResourceName(type) {
        this.resourceLabel = this.resource
            .toLowerCase()
            .split("-");

        switch (type) {
            case "event":
                return this.resourceLabel
                    .reduce((result, word) => result + UtilsNew.capitalize(word));
            case "label":
                return this.resourceLabel
                    .map(word => UtilsNew.capitalize(word))
                    .join(" ");
        }
    }

    #initComponent() {
        if (this.resource) {
            switch (this.resource?.toUpperCase()) {
                case "SAMPLE":
                    this.endpoint = this.opencgaSession.opencgaClient.samples();
                    this.resourceInfoParams = {includeIndividual: true};
                    this.resourceUpdateParams = {phenotypesAction: "SET"};
                    this.updateCustomisation = ["status.date"];
                    break;
                case "INDIVIDUAL":
                    this.endpoint = this.opencgaSession.opencgaClient.individuals();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        samplesAction: "SET",
                        phenotypesAction: "SET",
                        disordersAction: "SET",
                    };
                    this.updateCustomisation = [
                        params => {
                            // Note: we need to remove additional fields to the father and mother objects that are
                            // added by OpenCGA but not accepted in the update endpoint
                            if (params.father?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.father = {id: params.father.id};
                            }
                            if (params.mother?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.mother = {id: params.mother.id};
                            }
                        },
                    ];
                    break;
                case "COHORT":
                    this.endpoint = this.opencgaSession.opencgaClient.cohorts();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        samplesAction: "SET",
                        annotationSetsAction: "SET",
                    };
                    break;
                case "FAMILY":
                    this.endpoint = this.opencgaSession.opencgaClient.families();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        updateRoles: false,
                        annotationSetsAction: "SET",
                    };
                    this.updateCustomisation = ["status.date"];
                    break;
                case "DISEASE-PANEL":
                    this.endpoint = this.opencgaSession.opencgaClient.panels();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {};
                    this.updateCustomisation = [];
                    break;
                case "CLINICAL-ANALYSIS":
                    this.endpoint = this.opencgaSession.opencgaClient.clinical();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        flagsAction: "SET",
                        panelsAction: "SET",
                    };
                    this.updateCustomisation = [
                        params => {
                            // Note: we need to remove additional fields to the status and priority objects that are
                            // added by OpenCGA but not accepted in the update endpoint
                            if (params.status?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.status = {id: params.status.id};
                            }
                            if (params.priority?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.priority = {id: params.priority.id};
                            }
                            if (params.comments) {
                                // eslint-disable-next-line no-param-reassign
                                params.comments = params.comments.filter(comment => !comment.author);
                            }
                        },
                    ];
                    break;
                case "CLINICAL-INTERPRETATION":
                    this.endpoint = this.opencgaSession.opencgaClient.clinical();
                    this.methodUpdate = "updateInterpretation";
                    this.methodInfo = "infoInterpretation";
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        panelsAction: "SET",
                    };
                    break;
            }
        }
    }

    resourceObserver() {
        this.#initComponent();
    }

    componentIdObserver() {
        if (this.componentId && this.opencgaSession) {
            this.#initComponent();
            // QUESTION: eventId is *Update or *Search?
            // const eventId = this.#getResourceName("event");

            const params = {
                study: this.opencgaSession.study.fqn,
                ...this.resourceInfoParams
            };

            let error;
            this.#setLoading(true);
            const endpointMethod = this.methodInfo || "info";
            this.endpoint[endpointMethod](this.componentId, params)
                .then(response => {
                    this.component = response.responses[0].results[0];
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "componentIdObserver", this.component, {
                        query: {...params},
                        // [eventId]: this.component,
                    }, error);
                    this.#setLoading(false);
                });
        }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession?.study?.fqn) {
            this.#initComponent();
        }
    }

    configObserver() {
        this._config = {
            ...this.config,
            ...this.getDefaultConfig(),
        };

        // TODO: Add the notification element
        // {
        //     type: "notification",
        //     text: "Some changes have been done in the form. Not saved, changes will be lost",
        //     display: {
        //         visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
        //         notificationType: "warning",
        //     }
        // },
    }

    initOriginalObjects() {
        this._component = UtilsNew.objectClone(this.component);
        this.updatedFields = {};
        // this.componentId = "";
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
            // ...this.getDefaultConfig(),
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.component,
            this.updatedFields,
            param,
            e.detail.value);
        // e.detail.component = this._component;
        LitUtils.dispatchCustomEvent(this, "componentFieldChange", e.detail.value, {
            component: this._component,
            onSuccess: () =>this.requestUpdate(),
            // param: param,
        }, null);
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
            },
        });
    }


    // Display a button to back sample browser.
    onShowBtnSampleBrowser() {
        const query = {
            xref: this.sampleId
        };

        const showBrowser = () => {
            LitUtils.dispatchCustomEvent(this, "querySearch", null, {query: query}, null);
            const hash = window.location.hash.split("/");
            // FIXME
            window.location.hash = "#sample/" + hash[1] + "/" + hash[2];
        };

        return html `
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${showBrowser}">
                    <i class="fa fa-hand-o-left-borrame" aria-hidden="true"></i> Sample Browser
                </button>
            </div>
        `;
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true,
            ...this.resourceUpdateParams
        };
        const updateParams = FormUtils.getUpdateParams(this._component, this.updatedFields, this.updateCustomisation);
        const resourceName = this.#getResourceName("label");
        const updateEventId = this.#getResourceName("event").concat("Update");

        let error;
        this.#setLoading(true);
        const endpointMethod = this.methodUpdate || "update";
        this.endpoint[endpointMethod](this.component.id, updateParams, params)
            .then(response => {
                this.component = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updatedFields = {};
                // QUESTION: missing update config?
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `${resourceName} Update`,
                    message: `${resourceName} updated correctly`,
                    // Fixme: in clinical analysis update, message different from resource name
                    // message: "Case info updated successfully",
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, updateEventId, this.component, {}, error);
                this.#setLoading(false);
            });

    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        // Todo: validate config
        if (!this.component?.id) {
            return html `
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    The ${this.resource} does not have an ID.
                </div>
            `;
        }

        return html`
            ${this._config?.display?.showBtnSampleBrowser ? this.onShowBtnSampleBrowser() : nothing}
            <data-form
                .data="${this._component}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            display: this.displayConfigDefault,
        });
    }

}

customElements.define("opencga-update", OpencgaUpdate);
