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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types.js";
import "../commons/filters/individual-id-autocomplete.js";
import "../study/annotationset/annotation-set-update.js";
import "../commons/tool-header.js";


export default class FamilyCreate extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.family = {};
        this.members = "";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        switch (param) {
            case "members":
                this.members = e.detail.value;
                break;
            case "annotationSets":
                this.family = {...this.family, annotationSets: e.detail.value};
                break;
            default:
                this.family = {
                    ...FormUtils.createObject(
                        this.family,
                        param,
                        e.detail.value
                    )
                };
                break;
        }
        this.requestUpdate();
    }

    onClear(e) {
        this.family = {};
        this.requestUpdate();
    }

    // https://ws.opencb.org/opencga-prod/webservices/#!/Families/createFamilyPOST
    onSubmit(e) {
        this.opencgaSession.opencgaClient
            .families()
            .create(this.family, {study: this.opencgaSession.study.fqn, members: this.members})
            .then(res => {
                // TODO: Add a condition to confirm if the information has been saved to the server.
                this.family = {};
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Family",
                    message: "family created correctly"
                });
                // FormUtils.showAlert(
                //     "New Family",
                //     "Family save correctly",
                //     "success"
                // );
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
                // console.error(err);
            });
    }

    render() {
        return html`
            <data-form
                .data=${this.family}
                .config="${this._config}"
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
                buttonClearText: "Cancel",
                buttonOkText: "Save",
                style: "margin: 10px",
                titleWidth: 3,
                // labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                // help: {
                //     mode: "block",
                // }
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Family ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "short family id ",
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
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a Family description...",
                            }
                        },
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: () => html`
                                    <individual-id-autocomplete
                                        .value="${this.members}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @filterChange="${e => this.onFieldChange(e, "members")}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            title: "Expected Size",
                            field: "expectedSize",
                            type: "input-text",
                            display: {
                                placeholder: "Add a expected size...",
                            }
                        },
                        {
                            title: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add status name..."
                            }
                        },
                        {
                            title: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a status description..."
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

customElements.define("family-create", FamilyCreate);
