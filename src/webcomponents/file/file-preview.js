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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/image-viewer.js";
import "../commons/json-viewer.js";
import "../commons/html-viewer.js";

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
        this.filesWithContent = this.files.map(file => {
            return {...file};
        });

        for (const fileWithContent of this.filesWithContent) {
            let format = fileWithContent.format;
            if (format === "UNKNOWN") {
                if (fileWithContent.name.endsWith(".html")) {
                    format = "HTML";
                }
            }

            switch (format) {
                case "PLAIN":
                case "VCF":
                case "UNKNOWN":
                case "TAB_SEPARATED_VALUES":
                    fileWithContent.contentType = "text";
                    this.opencgaSession.opencgaClient.files()
                        .head(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                            lines: 200,
                        })
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
                    this.opencgaSession.opencgaClient.files()
                        .download(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                        })
                        .then(response => {
                            try {
                                fileWithContent.content = JSON.parse(response);
                            } catch (error) {
                                console.error(error);
                                fileWithContent.content = {
                                    content: "Error parsing data from the Server",
                                };
                            }
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error(response);
                        });
                    break;
                case "BAM":
                    fileWithContent.contentType = "json";
                    this.opencgaSession.opencgaClient.files()
                        .info(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                        })
                        .then(response => {
                            const {attributes} = response.getResult(0);
                            fileWithContent.content = attributes?.alignmentHeader ?? {content: "No content"};
                            this.requestUpdate();
                        });
                    break;
                case "IMAGE":
                    fileWithContent.contentType = "image";
                    this.opencgaSession.opencgaClient.files()
                        .image(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                        })
                        .then(response => {
                            fileWithContent.content = response.responses[0].results[0].content;
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error(response);
                        });
                    break;
                case "HTML":
                    fileWithContent.contentType = "html";
                    this.opencgaSession.opencgaClient.files()
                        .download(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                        })
                        .then(response => {
                            // NOTE: this endpoint just returns the file content as a response string
                            fileWithContent.content = response;
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
        if (!this.filesWithContent || this.filesWithContent?.length === 0) {
            return nothing;
        }

        return html`
            <style>
                pre.cmd {
                    background: black;
                    font-family: "Courier New", monospace;
                    padding: 15px;
                    color: #a5a5a5;
                    font-size: .9em;
                    min-height: 150px;
                }
            </style>

            <div class="d-flex flex-column gap-4">
                ${this.filesWithContent.map(fileWithContent => html`
                    <div>
                        ${this._config.showFileTitle ? html `
                            <div class="fw-bold mb-2">
                                <span class="pe-3">${fileWithContent.name}</span>
                                ${this._config.showFileSize ? html`
                                    <span>${UtilsNew.getDiskUsage(fileWithContent.size)}</span>
                                ` : nothing}
                            </div>
                        ` : nothing}

                        ${fileWithContent.contentType === "unsupported" ? html`
                            <p class="alert alert-warning">${fileWithContent.content}</p>
                        ` : nothing}
                        ${fileWithContent.contentType === "text" ? html`
                            <pre class="cmd">${fileWithContent.content}</pre>
                        ` : nothing}
                        ${fileWithContent.contentType === "image" ? html`
                            <image-viewer
                                .data="${fileWithContent.content}">
                            </image-viewer>
                        ` : nothing}
                        ${fileWithContent.contentType === "json" ? html`
                            <json-viewer
                                .active="${this.active}"
                                .data="${fileWithContent.content || {}}">
                            </json-viewer>
                        ` : nothing}
                        ${fileWithContent.contentType === "html" ? html`
                            <html-viewer
                                .active="${this.active}"
                                .data="${fileWithContent.content}">
                            </html-viewer>
                        ` : nothing}
                    </div>
                `)}
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
