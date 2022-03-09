/**
 * Copyright 2015-2021 OpenCB
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
import "../commons/tool-header.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/status/status-create.js";


export default class CohortCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            mode: {
                type: String
            },
            display: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.cohort = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;

        switch (param) {
            case "samples":
                let samples = [];
                if (e.detail.value) {
                    samples = e.detail.value.split(",").map(sample => {
                        return {id: sample};
                    });
                }
                this.cohort = {...this.cohort, samples: samples};
                break;
            case "annotationSets":
                this.cohort = {...this.cohort, annotationSets: e.detail.value};
                break;
            default:
                this.cohort = {
                    ...FormUtils.createObject(
                        this.cohort,
                        param,
                        e.detail.value
                    )
                };
                break;
        }
        // We need this for validation
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        console.log("Cohort Saved", this.cohort);
        this.opencgaSession.opencgaClient.cohorts().create(this.cohort, {study: this.opencgaSession.study.fqn})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Cohort",
                    message: "cohort created correctly"
                });
                this.onClear();
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    onClear() {
        this.cohort = {};
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data=${this.cohort}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear=${this.onClear}
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Create",
                style: "margin: 10px",
                titleWidth: 3,
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [
                {
                    title: "Cohort General Information",
                    elements: [
                        {
                            title: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "short Sample id",
                            }
                        },
                        // TODO we need first to support ID copy into the autocomplete elements.
                        {
                            title: "Sample IDs",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: samples => html `
                                <sample-id-autocomplete
                                    .value=${samples?.map(sample => sample.id).join(",")}
                                    .opencgaSession=${this.opencgaSession}
                                    @filterChange="${e => this.onFieldChange(e, "samples")}">
                                </sample-id-autocomplete>`
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
                                render: () => html`
                                    <status-create
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange=${e => this.onFieldChange(e, "status")}>
                                    </status-create>`
                            }
                        },
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
                        // {
                        //     title: "Status Name",
                        //     field: "status.name",
                        //     type: "input-text",
                        //     display: {
                        //         placeholder: "Add status name..."
                        //     }
                        // },
                        // {
                        //     title: "Status Description",
                        //     field: "status.description",
                        //     type: "input-text",
                        //     validation: {
                        //         validate: () => this.cohort?.status?.description ? !!this.cohort?.status?.name : true,
                        //         message: "The status name must be filled",
                        //     },
                        //     display: {
                        //         rows: 3,
                        //         placeholder: "Add a status description..."
                        //     }
                        // }
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
                //                         @changeAnnotationSets="${e => this.onFieldChange(e, "annotationSets")}">
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

customElements.define("cohort-create", CohortCreate);
