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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "../commons/image-viewer.js";
import "../commons/json-viewer.js";
import "../commons/html-viewer.js";
import "../commons/pdf-viewer.js";

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

        // list with the known binary extensions that we can not fetch the content
        this._binaryExtensions = new Set(["tbi", "bai", "zip", "bigWig", "pbi"]);

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
        if (this.fileIds?.length > 0 && this.opencgaSession ) {
            const ids = this.fileIds.map(fileId => fileId.replaceAll("/", ":")).join(",");
            this.opencgaSession.opencgaClient.files()
                .info(ids, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this.files = response.responses[0].results;
                })
                .catch(response => {
                    console.error(response);
                });
        } else {
            this.files = [];
        }
    }

    fileObserver() {
        if (this.file) {
            this.files = [this.file];
        }
    }

    filesObserver() {
        if (this.files?.length === 0) {
            this.filesWithContent = [];
            this.requestUpdate();
        }

        // 1. We deeply clone the files array to avoid modifying the original array
        this.filesWithContent = this.files.map(file => {
            return {...file};
        });

        // 2. Fetch the content of each file and extend the file object with the format and content
        for (const fileWithContent of this.filesWithContent) {
            let format = fileWithContent.format;
            // Note: the PLAIN format has been included also as bigWig files are being returned as PLAIN
            if (format === "UNKNOWN" || format === "PLAIN") {
                if (fileWithContent.name.endsWith(".html")) {
                    format = "HTML";
                } else if (fileWithContent.name.endsWith(".pdf")) {
                    format = "PDF";
                } else if (this._binaryExtensions.has(fileWithContent.name.split(".").pop())) {
                    format = "BINARY";
                }
            }

            switch (format) {
                case "UNKNOWN":
                case "PLAIN":
                case "FASTA":
                case "FASTQ":
                case "VCF":
                case "GVCF":
                case "PED":
                case "XML":
                case "TAB_SEPARATED_VALUES":
                case "COMMA_SEPARATED_VALUES":
                    fileWithContent.contentType = "text";
                    this.opencgaSession.opencgaClient.files()
                        .head(fileWithContent.id, {
                            study: this.opencgaSession.study.fqn,
                            lines: 500,
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
                            fileWithContent.imageType = UtilsNew.getMimeType(fileWithContent.name.split(".").pop());
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
                case "PDF":
                    // Josemi 20250304 NOTE: we can not fetch the content of the PDF file, as it is binary
                    // we have to provide the fileId to the pdf-viewer component, so this component will use the pdf.js
                    // library to fetch the file content and render it
                    fileWithContent.contentType = "pdf";
                    break;
                case "BINARY":
                    fileWithContent.contentType = "binary";
                    fileWithContent.content = {
                        icon: "fa-file-archive",
                        message: "Binary files can not be displayed.",
                    };
                    break;
                default:
                    fileWithContent.contentType = "unsupported";
                    fileWithContent.content = {
                        icon: "fa-exclamation-triangle",
                        message: `Format not recognized: ${fileWithContent.format || "UNKNOWN"}.`,
                    };
            }
        }
    }

    renderFilePreview(fileWithContent) {
        switch (fileWithContent.contentType) {
            case "unsupported":
            case "binary":
                return html`
                    <div class="alert alert-warning d-flex flex-column align-items-center justify-content-center py-4">
                        <i class="fas ${fileWithContent.content?.icon || "fa-exclamation-triangle"} me-2 fs-1 mb-2"></i>
                        <div class="fw-bold fs-5 text-center mb-1">${fileWithContent.content?.message || "Format not recognized."}</div>
                        <div class="text-center">
                            Sorry but we can not display the content of the file <b>${fileWithContent.name}</b>.<br>Please download it to view its content.
                        </div>
                    </div>
                `;
            case "text":
                return html`
                    <pre class="${this._config?.display?.textContentClass}" style="${this._config?.display?.textContentStyle}">${fileWithContent.content}</pre>
                `;
            case "image":
                return html`
                    <image-viewer
                        .type="${fileWithContent.imageType}"
                        .data="${fileWithContent.content}">
                    </image-viewer>
                `;
            case "json":
                return html`
                    <json-viewer
                        .active="${this.active}"
                        .data="${fileWithContent.content || {}}">
                    </json-viewer>
                `;
            case "html":
                return html`
                    <html-viewer
                        .active="${this.active}"
                        .data="${fileWithContent.content}">
                    </html-viewer>
                `;
            case "pdf":
                return html`
                    <pdf-viewer
                        .fileId="${fileWithContent.id}"
                        .data="${fileWithContent.content}"
                        .opencgaSession="${this.opencgaSession}">
                    </pdf-viewer>
                `;
            default:
                return nothing;
        }
    }

    render() {
        if (this.filesWithContent?.length === 0) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-column gap-5">
                ${this.filesWithContent.map(fileWithContent => html`
                    <div class="mx-2">
                        <!-- File information -->
                        <div class="d-flex align-items-center mb-3">
                            <div>
                                ${this._config.showFileName ? html`
                                    <div class="">
                                        <span class="fw-bold fs-5">${fileWithContent.name}</span>
                                        ${this._config.showFileSize ? html`
                                            <span class="p-2">(${UtilsNew.getDiskUsage(fileWithContent.size)})</span>
                                        ` : nothing}
                                    </div>
                                ` : nothing}
                                ${this._config.showFilePath ? html`
                                    <div class="text-muted">/${fileWithContent.path}</div>
                                ` : nothing}
                            </div>
                            ${this._config.showDownload ? html`
                                <div class="ms-auto">
                                    <a href="${OpencgaCatalogUtils.getDownloadFileUrl(this.opencgaSession, fileWithContent.id)}" target="_blank" class="btn btn-light">
                                        <i class="fas fa-download pe-2"></i> Download
                                    </a>
                                </div>
                            ` : nothing}
                        </div>

                        <!-- File preview -->
                        <div class="">
                            ${this.renderFilePreview(fileWithContent)}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                textContentStyle: "min-height:160px;max-height:640px;",
                textContentClass: "bg-gray-900 text-gray-100 p-4 rounded-2",
            },
            showFileName: true,
            showFileSize: true,
            showFilePath: true,
            showDownload: true,
        };
    }

}

customElements.define("file-preview", FilePreview);
