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

    dispatchSessionUpdateRequest() {
        LitUtils.dispatchEventCustom(this, "sessionUpdateRequest");
    }


    // TODO: Complete the attr to create a family.
    onFieldChange(e) {
        e.stopPropagation();
        const [field, prop] = e.detail.param.split(".");
        if (e.detail.value) {
            if (prop) {
                this.family[field] = {
                    ...this.family[field],
                    [prop]: e.detail.value
                };
            } else {
                this.family = {
                    ...this.family,
                    [field]: e.detail.value
                };
            }
        } else {
            prop ?
                delete this.family[field][prop] :
                delete this.family[field];
        }
        this.requestUpdate();
    }

    onSync(e, type) {
        e.stopPropagation();
        switch (type) {
            case "members":
                this.members = e.detail.value;
                break;
            case "annotationsets":
                this.family = {...this.family, annotationSets: e.detail.value};
                break;
        }

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
                FormUtils.showAlert(
                    "New Family",
                    "Family save correctly",
                    "success"
                );
            })
            .catch(err => {
                console.error(err);
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
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block",
                }
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Family ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    text: "short family id "
                                },
                                validation: {}
                            },
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a family name...",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a Family description...",
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: () => html`
                                    <individual-id-autocomplete
                                        .value="${this.members}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @filterChange="${e => this.onSync(e, "members")}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            name: "Creation Date",
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
                            name: "Modification Date",
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
                            name: "Expected Size",
                            field: "expectedSize",
                            type: "input-text",
                            display: {
                                placeholder: "Add a expected size...",
                            }
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add status name..."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a status description..."
                            }
                        },
                    ]
                },
                {
                    title: "Annotations Sets",
                    elements: [
                        {
                            field: "annotationSets",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: family => html`
                                    <annotation-set-update
                                        .annotationSets="${family?.annotationSets}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeAnnotationSets="${e => this.onSync(e, "annotationsets")}">
                                    </annotation-set-update>
                                `
                            }
                        }
                    ]
                }
            ]
        };
    }


}

customElements.define("family-create", FamilyCreate);
