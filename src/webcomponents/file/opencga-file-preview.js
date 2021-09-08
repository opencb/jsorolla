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

import {LitElement, html} from "lit";
import "../commons/json-viewer.js";
import UtilsNew from "../../core/utilsNew.js";


export default class OpencgaFilePreview extends LitElement {

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
            file: {
                type: Object
            },
            active: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // this.prefix = "osv" + UtilsNew.randomString(6);
        this.file = {};
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if ((changedProperties.has("file") || changedProperties.has("active")) && this.active) {
            this.fileObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    async fileObserver() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeIndividual: true,
            lines: 200
        };
        this.content = null;
        // this.title = "";
        this.contentType = null;
        await this.updateComplete;
        switch (this.file.format) {
            case "PLAIN":
            case "VCF":
            case "UNKNOWN":
            case "TAB_SEPARATED_VALUES":
                this.contentType = "text";
                // this.title = "Head";
                this.opencgaSession.opencgaClient.files().head(this.file.id, params)
                    .then(response => {
                        const {format, content} = response.getResult(0);
                        this.format = format;
                        this.content = content ?? "No content";
                        this.requestUpdate();
                    })
                    .catch(response => {
                        console.error(response);
                        this.content = response.getEvents("ERROR").map(_ => _.message).join("\n");
                        this.requestUpdate();
                    });
                break;
            case "JSON":
                this.contentType = "json";
                this.opencgaSession.opencgaClient.files().head(this.file.id, params)
                    .then(response => {
                        const {content} = response.getResult(0);
                        try {
                            this.content = JSON.parse(content);
                        } catch (e) {
                            this.content = {content: "Error parsing data from the Server"};
                        }
                        this.requestUpdate();
                    })
                    .catch(response => {
                        console.error(response);
                        this.content = response.getEvents("ERROR").map(_ => _.message).join("\n");
                        this.requestUpdate();
                    });
                break;
            case "BAM":
                this.contentType = "json";
                this.opencgaSession.opencgaClient.files().info(this.file.id, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        const {attributes} = response.getResult(0);
                        this.content = attributes?.alignmentHeader ?? {content: "No content"};
                        this.requestUpdate();
                    });
                break;
            case "IMAGE":
                this.contentType = "image";
                // this.title = "Image";
                this.opencgaSession.opencgaClient.files().image(this.file.id, params)
                    .then(response => {
                        this.updateComplete.then(() => this.querySelector("#thumbnail").src = "data:image/png;base64, " + response.getResult(0).content);
                    })
                    .catch(response => {
                        console.error(response);
                        // this.content = response.getEvents("ERROR").map( _ => _.message).join("\n");
                        // this.requestUpdate();
                    });
                break;
            default:
                this.contentType = "unsupported";
                this.content = "Format not recognized: " + this.file.format;
        }
        this.requestUpdate();
    }

    fileIdObserver() {
        console.log("fileObserver");
    }

    getDefaultConfig() {
        return {};
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
            pre.cmd {
                background: black;
                font-family: "Courier New", monospace;
                padding: 15px;
                color: #a5a5a5;
                font-size: .9em;
                min-height: 150px;
            }
        </style>


        ${this.file ? html`
            <div class="row">
                <div class="col-md-12">
<!--                    ${this.title ? html`<h4>${this.title}</h4>` : ""}-->

                    ${this.contentType === "unsupported" ? html`
                        <p class="alert alert-warning">${this.content}</p>` : null}
                    ${this.contentType === "text" ? html`
                        <pre class="cmd">${this.content}</pre>` : null}
                    ${this.contentType === "image" ? html`
                        <img class="img-thumbnail" id="thumbnail" />` : null}
                    ${this.contentType === "json" ? html`<json-viewer .data="${this.content}"></json-viewer>` : null}
                </div>
            </div>
        ` : null }
        `;
    }

}

customElements.define("opencga-file-preview", OpencgaFilePreview);

