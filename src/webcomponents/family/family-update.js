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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
// import "../commons/manager/phenotype-manager.js";
import "../annotations/annotationSet-form.js";
import FormUtils from "../../form-utils.js";

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
        // this.annotationSets = {};
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
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    // TODO move to a generic Utils class
    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
                if (this._family[e.detail.param] !== e.detail.value && e.detail.value !== null) {
                    this.family[e.detail.param] = e.detail.value;
                    this.updateParams[e.detail.param] = e.detail.value;
                } else {
                    // this.sample[e.detail.param] = this._family[e.detail.param];
                    delete this.updateParams[e.detail.param];
                }
                break;
        }
    }

    onClear() {
        console.log("OnClear family form");
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.families().update(this.family.id, this.updateParams, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this._family = JSON.parse(JSON.stringify(this.family));
                this.updateParams = {};

                // this.dispatchSessionUpdateRequest();
                FormUtils.showAlert("Edit Family", "Family updated correctly", "success");
            })
            .catch(err => {
                console.error(err);
            });
    }

    // https://github.com/opencb/opencga/blob/develop/opencga-core/src/main/java/org/opencb/opencga/core/models/sample/SampleUpdateParams.java
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

customElements.define("family-update", FamilyUpdate);
