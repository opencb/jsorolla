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
            showTitle: false
        };
    }

    render() {
        return html`
        <style>
            .section-title {
                border-bottom: 2px solid #eee;
            }
            .label-title {
                text-align: left;
                padding-left: 5px;
                padding-right: 10px;
            }
        </style>

        ${this.file ? html`
            <div>
                ${this._config.showTitle ? html`<h3 class="section-title">Summary</h3>` : null}
                <div class="col-md-12">
                    <form class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-3 label-title">Id</label>
                            <span class="col-md-9">${this.file.id}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Name</label>
                            <span class="col-md-9">${this.file.name}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Creation Date</label>
                            <span class="col-md-9">${UtilsNew.dateFormatter(this.file.creationDate)}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Format</label>
                            <span class="col-md-9">${this.file.format}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Bioformat</label>
                            <span class="col-md-9">${this.file.bioformat}</span>
                        </div>
                        ${this.file?.internal?.status ? html`
                            <div class="form-group">
                                <label class="col-md-3 label-title">Status</label>
                                <span class="col-md-9">${this.file.internal.status.name} (${UtilsNew.dateFormatter(this.file.internal.status.date)})</span>
                            </div>
                        ` : null}
                    </form>
                </div>
            </div>
        ` : null }
        `;
    }

}

customElements.define("opencga-file-view", OpencgaFileView);

