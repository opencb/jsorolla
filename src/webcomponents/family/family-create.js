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

import {LitElement, html} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/tool-header.js";


export default class FamilyCreate extends LitElement {

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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.family = {};
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
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

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.family = {...this.family};
        this.requestUpdate();
    }

    onClear(e) {
        this.family = {};
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    // https://ws.opencb.org/opencga-prod/webservices/#!/Families/createFamilyPOST
    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            members: "" + this.family?.members,
            includeResult: true
        };
        let error;
        delete this.family.members;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.families()
            .create(this.family, params)
            .then(() => {
                this.family = {};
                this._config = this.getDefaultConfig();
                // TODO: Add a condition to confirm if the information has been saved to the server.
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Family Create",
                    message: "New family created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "familyCreate", this.family, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.family}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            // type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
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
                            title: "Members",
                            field: "members",
                            type: "custom",
                            required: true,
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                helpMessage: "Individual Ids",
                                render: (members, dataFormFilterChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${members}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            }
                        },
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
                                placeholder: "Add a description..."
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
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
