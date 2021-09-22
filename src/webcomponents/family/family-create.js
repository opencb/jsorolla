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
import UtilsNew from "./../../core/utilsNew.js";
import "../commons/tool-header.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import "../commons/filters/individual-id-autocomplete.js";

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
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {},
            bubbles: true,
            composed: true
        }));
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
            if (prop) {
                delete this.family[field][prop];
            } else {
                delete this.family[field];
            }
        }
        this.requestUpdate();
    }

    onSync(e) {
        e.stopPropagation();
        this.members = e.detail.value;
    }

    onClear(e) {
        console.log("OnClear family form", this);
    }

    onSubmit(e) {
        console.log("Testing");
        this.opencgaSession.opencgaClient
            .families()
            .create(this.family, {study: this.opencgaSession.study.fqn, members: this.members})
            .then(res => {
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
                                placeholder: "Family name...",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Family name...",
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
                                        @filterChange="${e => this.onSync(e)}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            name: "Expected Size",
                            field: "expectedSize",
                            type: "input-text"

                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample description...",
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample description...",
                            }
                        },
                    ]
                }
            ]
        };
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

}

customElements.define("family-create", FamilyCreate);
