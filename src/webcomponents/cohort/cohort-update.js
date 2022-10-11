/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from "lit";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";
import LitUtils from "../commons/utils/lit-utils";

export default class CohortUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cohort: {
                type: Object
            },
            cohortId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.cohort = {};
        this.updateParams = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Update",
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            defaultValue: "",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("cohort")) {
            this.initOriginalObject();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    initOriginalObject() {
        if (this.cohort) {
            this._cohort = UtilsNew.objectClone(this.cohort);
        }
    }

    cohortIdObserver() {
        if (this.cohortId && this.opencgaSession) {
            const query = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.cohorts()
                .info(this.cohortId, query)
                .then(response => {
                    this.cohort = response.responses[0].results[0];
                    this.initOriginalObject();
                })
                .catch(reason => {
                    this.cohort = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "cohortSearch", this.cohort, {query: {...query}}, error);
                    this.#setLoading(true);
                });
        } else {
            this.cohort = {};
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "samples.id":
                this.updateParams = FormUtils.updateObjectArray(
                    this._cohort,
                    this.cohort,
                    this.updateParams,
                    param,
                    e.detail.value
                );
                break;
            case "id":
            case "name":
            case "description":
            case "type":
            case "creationDate":
            case "modificationDate":
                this.updateParams = FormUtils.updateObjectParams(
                    this._cohort,
                    this.cohort,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "status":
                this.updateParams = FormUtils.updateObjectWithObj(
                    this._cohort,
                    this.cohort,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = this.getDefaultConfig();
        this.updateParams = {};
        this.cohortId = "";
        this.cohort = UtilsNew.objectClone(this._cohort);
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            samplesAction: "SET",
            annotationSetsAction: "SET",
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        // CAUTION: workaround for avoiding overwrite non updated keys in an object.
        //  Remove when form-utils.js revisited
        Object.keys(this.updateParams).forEach(key => this.updateParams[key] = this.cohort[key]);
        this.opencgaSession.opencgaClient.cohorts()
            .update(this.cohort.id, this.updateParams, params)
            .then(response => {
                this._cohort = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Update Cohort",
                    message: "cohort updated correctly"
                });
            })
            .catch(reason => {
                this.cohort = {};
                error = reason;
                console.error(reason);
            })
            .finally(() => {
                this._config = this.getDefaultConfig();
                LitUtils.dispatchCustomEvent(this, "cohortUpdate", this.cohort, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.cohort?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No cohort ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.cohort}"
                .config="${this._config}"
                .updateParams="${this.updateParams}"
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
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                helpMessage: this.cohort.creationDate? "Created on " + UtilsNew.dateFormatter(this.cohort.creationDate):"No creation date",
                                validation: {
                                }
                            }
                        },
                        {
                            title: "Sample IDs",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: samples => {
                                    const sampleIds = Array.isArray(samples) ?
                                        samples?.map(sample => sample.id).join(",") :
                                        samples;
                                    return html `
                                        <catalog-search-autocomplete
                                            .value="${sampleIds}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => this.onFieldChange(e, "samples.id")}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a cohort description...",
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <status-update
                                        .status="${status}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "status")}">
                                    </status-update>
                                `,
                            }
                        },
                        // {
                        //     title: "Cohort Type",
                        //     field: "type",
                        //     type: "select",
                        //     allowedValues: ["CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO", "COLLECTION"],
                        //     display: {
                        //         placeholder: "Select a cohort type..."
                        //     }
                        // },
                        // {
                        //     title: "Creation Date",
                        //     field: "creationDate",
                        //     type: "input-date",
                        //     display: {
                        //         render: date =>
                        //             moment(date, "YYYYMMDDHHmmss").format(
                        //                 "DD/MM/YYYY"
                        //             )
                        //     }
                        // },
                        // {
                        //     title: "Modification Date",
                        //     field: "modificationDate",
                        //     type: "input-date",
                        //     display: {
                        //         render: date =>
                        //             moment(date, "YYYYMMDDHHmmss").format(
                        //                 "DD/MM/YYYY"
                        //             )
                        //     }
                        // },
                    ]
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: cohort => html`
                //                     <annotation-set-update
                //                         .annotationSets="${cohort?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onSync(e, "annotationSets")}">
                //                     </annotation-set-update>
                //                 `
                //             }
                //         }
                //     ]
                // }
            ]
        });
    }

}

customElements.define("cohort-update", CohortUpdate);
