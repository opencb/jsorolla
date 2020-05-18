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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../../../utilsNew.js";
import "../../../commons/view/data-view.js";


export default class OpencgaFamilyView extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            familyId: {
                type: String
            },
            family: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "osv" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("family")) {
            this.familyObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
    }

    // TODO recheck
    familyIdObserver() {
        console.warn("familyIdObserver");
        if (this.file !== undefined && this.file !== "") {
            this.opencgaSession.opencgaClient.family().info(this.familyId, {})
                .then( response => {
                    if (response.response[0].id === undefined) {
                        response.response[0].id = response.response[0].name;
                    }
                    this.family = response.response[0].result[0];
                    console.log("_this.individual", this.family);
                    this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }

    }

    familyObserver() {
        console.log("familyObserver");

    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultVale: "-"
            },
            sections: [
                {
                    title: "General",
                    collapsed: false,
                    elements: [
                        {
                            name: "Family ID",
                            field: "id"
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Disorders",
                            field: "disorders",
                            type: "list",
                            display: {
                                template: "${name} (${id})",
                                contentLayout: "bullets",
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                template: "${name} (${id})",
                                contentLayout: "bullets",
                                defaultValue: "N/A"
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`<data-view .data=${this.family} .config="${this.getDefaultConfig()}"></data-view>`;
    }

}

customElements.define("opencga-family-view", OpencgaFamilyView);

