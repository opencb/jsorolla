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
            active: {
                type: Boolean,
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
        this.componentId = "";
        this.active = true;
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
        if (changedProperties.has("component")) {
            this.componentObserver();
        }
        if (changedProperties.has("componentId") || (changedProperties.has("active") && this.active)) {
            this.componentIdObserver();
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

    componentIdObserver() {
        if (this.componentId && this.opencgaSession && this.active) {
            this.#initComponent();

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

    resourceObserver() {
        this.#initComponent();
    }

    opencgaSessionObserver() {
        if (this.opencgaSession?.study?.fqn) {
            this.#initComponent();
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        if (!this._config?.notification) {
            this.#initConfigNotification();
        }
    }

    #initConfigNotification() {
        // const resourceLabel = this.#getResourceName("label");
        this._config.notification = {
            title: "",
            // Todo Vero 20230525: Discuss with bioinfo/webteam how to display changes.
            //  I leave the previous message for now
            // text: () => {
            //     return `${resourceLabel} updated: ` + Object.keys(this.updatedFields).join(", ");
            // },
            text: "Some changes have been done in the form. Not saved, changes will be lost",
            type: "notification",
            display: {
                visible: () => UtilsNew.isNotEmpty(this.updatedFields),
                notificationType: "warning",
            },
        };
    }

    initOriginalObjects() {
        this._component = UtilsNew.objectClone(this.component);
        this.updatedFields = {};
        // this.componentId = "";
        this.configObserver();
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
                            if (params.dateOfBirth) {
                                params.dateOfBirth = UtilsNew.dateFormatter(params.dateOfBirth, "YYYYMMDD");
                            }
                        },
                    ];
                    break;
                case "COHORT":
                    this.endpoint = this.opencgaSession.opencgaClient.cohorts();
                    this.resourceInfoParams = {};
                    this.updateCustomisation = ["status.date"];
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
                case "DISEASE_PANEL":
                    this.endpoint = this.opencgaSession.opencgaClient.panels();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {};
                    this.updateCustomisation = [];
                    break;
                case "CLINICAL_ANALYSIS":
                    this.endpoint = this.opencgaSession.opencgaClient.clinical();
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        flagsAction: "SET",
                        panelsAction: "SET",
                        analystsAction: "SET",
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
                            if (params.disorder) {
                                // eslint-disable-next-line no-param-reassign
                                params.disorder= {id: params.disorder.id};
                            }
                            // Note 20221220 Vero: It is possible to unasign the analyst
                            // if (params.analyst) {
                            //     // eslint-disable-next-line no-param-reassign
                            //     params.analyst= {id: params.analyst.id};
                            // }
                            if (params.comments) {
                                // eslint-disable-next-line no-param-reassign
                                params.comments = params.comments
                                    .filter(comment => !comment.author)
                                    .map(comment => ({
                                        ...comment,
                                        tags: UtilsNew.commaSeparatedArray(comment.tags)
                                    }));
                            }
                        },
                    ];
                    break;
                case "CLINICAL_INTERPRETATION":
                    this.endpoint = this.opencgaSession.opencgaClient.clinical();
                    this.methodUpdate = "updateInterpretation";
                    this.methodInfo = "infoInterpretation";
                    this.resourceInfoParams = {};
                    this.resourceUpdateParams = {
                        panelsAction: "SET",
                        // commentsAction: "REPLACE",
                    };
                    this.updateCustomisation = [
                        params => {
                            // Note: we need to remove additional fields to the status and priority objects that are
                            // added by OpenCGA but not accepted in the update endpoint
                            if (params.status?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.status = {
                                    id: params.status.id,
                                };
                            }
                            if (params.comments) {
                                // eslint-disable-next-line no-param-reassign
                                params.comments = params.comments
                                    .filter(comment => !comment.author)
                                    .map(comment => ({
                                        ...comment,
                                        tags: UtilsNew.commaSeparatedArray(comment.tags),
                                    }));
                            }
                            if (params.analyst?.id) {
                                // eslint-disable-next-line no-param-reassign
                                params.analyst = {
                                    id: params.analyst.id,
                                };
                            }
                        },
                    ];
                    break;
                case "NOTE":
                    this.endpoint = this.component?.scope === "ORGANIZATION" ?
                        this.opencgaSession.opencgaClient.organization() :
                        this.opencgaSession.opencgaClient.studies();
                    this.methodUpdate = "updateNotes";
            }
        }
    }

    #getResourceName(type) {
        this.resourceLabel = this.resource
            .toLowerCase()
            .split("_");

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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.updatedFields = FormUtils.getUpdatedFields(
                this.component,
                this.updatedFields,
                param,
                e.detail.value,
                e.detail.action);

            // Notify to parent components in case the want to perform any other action, for instance, get the gene info in the disease panels.
            LitUtils.dispatchCustomEvent(this, "componentFieldChange", e.detail.value, {
                component: this._component,
                updatedFields: this.updatedFields,
                action: e.detail.action,
                param: param,
            });
            this.requestUpdate();
        }
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
                // We need to dispatch a component clear event
                LitUtils.dispatchCustomEvent(this, "componentClear", null, {
                    component: this._component,
                });
            },
        });
    }

    // Display a button to back sample browser.
    // CAUTION Note 20230531 Vero: if the Catalog Management from the Admin App gets definitely disabled and deprecated,
    //  this code should be removed.
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
        // CAUTION: workaround for clinical-interpreation singular API

        // updateFunction
        let updateFunction = "";
        switch (this.resource) {
            case "NOTE":
                if (this.component.scope === "ORGANIZATION") {
                    updateFunction = this.endpoint[endpointMethod](this.component.id, updateParams, params);
                } else {
                    const {study, ...noteParams} = params;
                    updateFunction = this.endpoint[endpointMethod](study, this.component.id, updateParams, noteParams);
                }
                break;
            case "CLINICAL_INTERPRETATION":
                updateFunction = this.endpoint[endpointMethod](this.component.clinicalAnalysisId, this.component.id, updateParams, params);
                break;
            default:
                updateFunction = this.endpoint[endpointMethod](this.component.id, updateParams, params);
                break;
        }
        // updateFunction = (this.resource === "CLINICAL_INTERPRETATION") ?
        //     this.endpoint[endpointMethod](this.component.clinicalAnalysisId, this.component.id, updateParams, params) :
        //     this.endpoint[endpointMethod](this.component.id, updateParams, params);
        updateFunction
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

        return html `
            <!-- $this._config?.display?.showBtnSampleBrowser ? this.onShowBtnSampleBrowser() : nothing} -->
            <data-form
                .data="${this._component}"
                .originalData="${this.component}"
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
            buttons: {
                // previewText: "Preview",
                clearText: "Discard Changes",
                okText: "Update",
            },
            display: this.displayConfigDefault,
        });
    }

}

customElements.define("opencga-update", OpencgaUpdate);
