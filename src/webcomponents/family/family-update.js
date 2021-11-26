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
    }

    connectedCallback() {
        super.connectedCallback();

        this.updateParams = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("family")) {
            this.familyObserver();
        }

        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
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

    onFieldChange(e) {
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
            case "expectedSize":
                this.updateParams = FormUtils.updateScalar(
                    this._family,
                    this.family,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                break;
            case "status.name":
            case "status.description":
                this.updateParams = FormUtils.updateObjectWithProps(
                    this._family,
                    this.family,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );
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
            // incVersion: false
        };

        this.opencgaSession.opencgaClient.families().update(this.family.id, this.updateParams, params)
            .then(res => {
                this._family = JSON.parse(JSON.stringify(this.family));
                this.updateParams = {};
                FormUtils.showAlert("Update Family", "Family updated correctly", "success");
            })
            .catch(err => {
                console.error(err);
                FormUtils.showAlert("Update Family", "Family not updated correctly", "error");
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
                    title: "Family General Information",
                    elements: [
                        {
                            name: "Family ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
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
        };
    }

}

customElements.define("family-update", FamilyUpdate);
