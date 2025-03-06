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
import "../file/file-preview.js";
import "../file/file-tree.js";
import "../loading-spinner.js";

export default class JobResult extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            job: {
                type: Object,
            },
            jobId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._loading = false;
        this._selectedFile = null;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this._loading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("job") || changedProperties.has("opencgaSession")) {
            this.jobObserver();
        }

        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        super.update(changedProperties);
    }

    jobObserver() {
        this._selectedFile = null; // clear selected file
    }

    jobIdObserver() {
        if (this.jobId && this.opencgaSession) {
            this.job = null;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, {
                    study: this.opencgaSession.study.fqn,
                    include: "outDir",
                })
                .then(response => {
                    this.job = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                })
                .finally(() => {
                    this.#setLoading(false);
                });
        }
    }

    onSelectFile(event) {
        if (event.detail?.type === "FILE") {
            this._selectedFile = event.detail;
            this.requestUpdate();
        }

        if (event.detail?.type === "DIRECTORY") {
            const files = this.job.output
                .filter(file => file.path.startsWith(event.detail.path))
                .filter(file => file.type === "FILE")
                .filter(file => !file.id.replace(event.detail.id, "").includes(":"))
                .map(file => file.id);
            this._selectedFiles = files;
            this.requestUpdate();
        }
    }

    renderFilePreview() {
        if (this._selectedFile) {
            return html`
                <file-preview
                    .fileId="${this._selectedFile.id}"
                    .active="${true}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${{
                        showFilePath: true,
                        showDownload: true,
                    }}">
                </file-preview>
            `;
        } else {
            if (this._selectedFiles?.length > 0) {
                return html`
                    <file-preview
                        .fileIds="${this._selectedFiles}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${{
                            showFilePath: true,
                            showDownload: true,
                        }}">
                    </file-preview>
                `;
            } else {
                return html`
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle pe-2"></i>
                        <span>Please select a file on the tree to display the content here.</span>
                    </div>
                `;
            }
        }
    }

    render() {
        if (this._loading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        if (!this.opencgaSession || !this.job?.id) {
            return nothing;
        }

        return html`
            <h3 class="mb-3">Job Result Explorer</h3>
            <div class="row">
                <div class="col-md-3">
                    <file-tree
                        .opencgaSession="${this.opencgaSession}"
                        .rootDirectoryId="${this.job.outDir.id}"
                        .currentPath="${this._selectedFile?.path || null}"
                        .config="${{
                            rootDirectoryName: this.job.outDir.name,
                            rootDirectoryIcon: "fa-folder",
                            showFiles: true,
                        }}"
                        @pathChange="${event => this.onSelectFile(event)}">
                    </file-tree>
                </div>

                <div class="col-md-9 ps-5">
                    ${this.renderFilePreview()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("job-result", JobResult);

