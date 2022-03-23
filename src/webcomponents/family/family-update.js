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
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utilsNew.js";
import "../study/status/status-update.js";

export default class FamilyUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            family: {
                type: Object
            },
            familyId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.family = {};
        this.updateParams = {};
        this.phenotype = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("family")) {
            this.familyObserver();
        }

        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    familyObserver() {
        if (this.family) {
            this._family = JSON.parse(JSON.stringify(this.family));
        }
    }

    familyIdObserver() {
        if (this.opencgaSession && this.familyId) {
            const query = {
                study: this.opencgaSession.study.fqn
            };
            this.opencgaSession.opencgaClient.families().info(this.familyId, query)
                .then(response => {
                    this.family = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "members.id":
                this.updateParams = FormUtils.updateObjectArray(
                    this._family,
                    this.family,
                    this.updateParams,
                    param,
                    e.detail.value
                );
                break;
            case "id":
            case "name":
            case "description":
            case "expectedSize":
            case "status":
                this.updateParams = FormUtils.updateScalar(
                    this._family,
                    this.family,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = this.getDefaultConfig();
        this.family = JSON.parse(JSON.stringify(this._family));
        this.updateParams = {};
        this.familyId = "";
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            annotationSetsAction: "SET",
            updateRoles: false,
        };
        console.log("Family update", this.updateParams);
        this.opencgaSession.opencgaClient.families().update(this.family.id, this.updateParams, params)
            .then(res => {
                this._family = JSON.parse(JSON.stringify(this.family));
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Update Family",
                    message: "family updated correctly"
                });
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    render() {
        return html`
            <data-form
                    .data=${this.family}
                    .config="${this._config}"
                    .updateParams=${this.updateParams}
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Update",
                style: "margin: 10px",
                titleWidth: 3,
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [
                {
                    title: "Family General Information",
                    elements: [
                        {
                            title: "",
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.updateParams).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Family ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: this.family.creationDate? "Created on " + UtilsNew.dateFormatter(this.family.creationDate):"No creation date",
                                validation: {}
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a family name...",
                            }
                        },
                        {
                            title: "Members",
                            field: "members",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                helpMessage: "Individual Ids",
                                render: members => {
                                    const membersIds = Array.isArray(members) ?
                                        members?.map(member => member.id).join(",") : members;
                                    return html`
                                        <individual-id-autocomplete
                                            .value="${membersIds}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => this.onFieldChange(e, "members.id")}">
                                        </individual-id-autocomplete>`;
                                }
                            },
                        },
                        // {
                        //     title: "Individual ID",
                        //     field: "individualId",
                        //     type: "custom",
                        //     display: {
                        //         placeholder: "e.g. Homo sapiens, ...",
                        //         render: () => html`
                        //             <individual-id-autocomplete
                        //                 .value="${this.members}"
                        //                 .opencgaSession="${this.opencgaSession}"
                        //                 @filterChange="${e => this.onSync(e, "members")}">
                        //             </individual-id-autocomplete>`
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
                        {
                            title: "Expected Size",
                            field: "expectedSize",
                            type: "input-num",
                            display: {
                                placeholder: "Add a expected size...",
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a Family description...",
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <status-update
                                        .status=${status}
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange=${e => this.onFieldChange(e, "status")}>
                                    </status-update>`
                            }
                        },
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
                //                 render: family => html`
                //                     <annotation-set-update
                //                         .annotationSets="${family?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onSync(e, "annotationsets")}">
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

customElements.define("family-update", FamilyUpdate);
