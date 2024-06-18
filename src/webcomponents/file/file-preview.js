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
import UtilsNew from "../../core/utils-new.js";
import "../commons/image-viewer.js";
import "../commons/json-viewer.js";

export default class FilePreview extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            file: {
                type: Object
            },
            fileId: {
                type: String
            },
            files: {
                type: Array
            },
            fileIds: {
                type: Array
            },
            opencgaSession: {
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

    #init() {
        this.file = {};
        this.files = [];
        this.filesWithContent = [];

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
        if ((changedProperties.has("fileId") || changedProperties.has("active")) && this.active) {
            this.fileIdObserver();
        }
        if (changedProperties.has("files")) {
            this.filesObserver();
        }
        if ((changedProperties.has("fileIds") || changedProperties.has("active")) && this.active) {
            this.fileIdsObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    fileIdObserver() {
        if (this.fileId) {
            this.fileIds = [this.fileId];
        }
    }

    fileIdsObserver() {
        if (this.opencgaSession && this.fileIds) {
            const ids = this.fileIds.map(fileId => fileId.replaceAll("/", ":")).join(",");
            this.opencgaSession.opencgaClient.files().info(ids, {
                study: this.opencgaSession.study.fqn,
            })
                .then(response => {
                    this.files = response.responses[0].results;
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    fileObserver() {
        if (this.file) {
            this.files = [this.file];
        }
    }

    filesObserver() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeIndividual: true,
            lines: 200,
        };

        this.filesWithContent = this.files.map(file => {
            return {...file};
        });

        for (const fileWithContent of this.filesWithContent) {
            switch (fileWithContent?.format) {
                case "PLAIN":
                case "VCF":
                case "UNKNOWN":
                case "TAB_SEPARATED_VALUES":
                    fileWithContent.contentType = "text";
                    this.opencgaSession.opencgaClient.files().head(fileWithContent.id, params)
                        .then(response => {
                            const {format, content} = response.getResult(0);
                            this.format = format;
                            fileWithContent.content = content ?? "No content";
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error(response);
                            fileWithContent.content = response.getEvents("ERROR").map(_ => _.message).join("\n");
                            this.requestUpdate();
                        });
                    break;
                case "JSON":
                    fileWithContent.contentType = "json";
                    this.opencgaSession.opencgaClient.files().head(fileWithContent.id, params)
                        .then(response => {
                            const {content} = response.getResult(0);
                            try {
                                fileWithContent.content = JSON.parse(content);
                            } catch (e) {
                                fileWithContent.content = {content: "Error parsing data from the Server"};
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
                    fileWithContent.contentType = "json";
                    this.opencgaSession.opencgaClient.files().info(fileWithContent.id, {study: this.opencgaSession.study.fqn})
                        .then(response => {
                            const {attributes} = response.getResult(0);
                            fileWithContent.content = attributes?.alignmentHeader ?? {content: "No content"};
                            this.requestUpdate();
                        });
                    break;
                case "IMAGE":
                    fileWithContent.contentType = "image";
                    this.opencgaSession.opencgaClient.files().image(fileWithContent.id, {study: this.opencgaSession.study.fqn})
                        .then(response => {
                            fileWithContent.content = response.responses[0].results[0].content;
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error(response);
                        });
                    break;
                default:
                    fileWithContent.contentType = "unsupported";
                    fileWithContent.content = "Format not recognized: " + fileWithContent.format;
            }
        }
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

            <div class="row">
                <div class="col-md-12">
                    ${this.filesWithContent?.length > 0 ? this.filesWithContent.map(fileWithContent => html`
                        ${this._config.showFileTitle ? html `
                            <div style="margin: 25px 0 5px 0">
                                <label>
                                    <span style="padding-right:20px;">${fileWithContent.name}</span>
                                    ${this._config.showFileSize ? html`
                                        <span>${UtilsNew.getDiskUsage(fileWithContent.size)}</span>
                                    ` : null}
                                </label>
                            </div>
                        ` : null}

                        ${fileWithContent.contentType === "unsupported" ? html`
                            <p class="alert alert-warning">${fileWithContent.content}</p>
                        ` : null}
                        ${fileWithContent.contentType === "text" ? html`
                            <pre class="cmd">${fileWithContent.content}</pre>
                        ` : null}
                        ${fileWithContent.contentType === "image" ? html`
                            <image-viewer
                                .data="${fileWithContent.content}">
                            </image-viewer>
                        ` : null}
                        ${fileWithContent.contentType === "json" ? html`
                            <json-viewer
                                .active="${this.active}"
                                .data="${fileWithContent.content || {}}">
                            </json-viewer>
                        ` : null}
                    `) : null}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showFileTitle: true,
            showFileSize: true,
        };
    }

}

customElements.define("file-preview", FilePreview);
