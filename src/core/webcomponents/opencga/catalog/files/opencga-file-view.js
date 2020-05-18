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
import UtilsNew from "../../../../utilsNew.js";
import "../../../commons/view/data-view.js";


export default class OpencgaFileView extends LitElement {

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
            fileId: {
                type: String
            },
            file: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // this.prefix = "osv" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {

        }
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
    }

    // TODO recheck
    fileIdObserver() {
        console.warn("fileIdObserver");
        if (this.file !== undefined && this.file !== "") {
            const params = {
                study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                includeIndividual: true
            };
            const _this = this;
            this.opencgaSession.opencgaClient.files().info(this.file, params)
                .then(function(response) {
                    if (response.response[0].id === undefined) {
                        response.response[0].id = response.response[0].name;
                    }
                    _this.file = response.response[0].result[0];
                    console.log("_this.file", _this.file);
                    _this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }

    }

    fileObserver() {
        console.log("fileObserver");

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
                            name: "File Id",
                            field: "id"
                        },
                        {
                            name: "Name",
                            field: "name"
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
                            name: "Format",
                            field: "format"
                        },
                        {
                            name: "Bioformat",
                            field: "bioformat"
                        },
                        {
                            name: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => html`${field.name} (${UtilsNew.dateFormatter(field.date)})`
                            }
                        },
                        {
                            name: "Index",
                            field: "internal.index.status",
                            type: "custom",
                            display: {
                                render: field => field?.name ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : ""
                            }
                        }
                    ]
                }
            ]
        };

    }

    render() {
        return html`
            <data-view .data=${this.file} .config="${this.getDefaultConfig()}"></data-view>
        `;
    }

}

customElements.define("opencga-file-view", OpencgaFileView);

