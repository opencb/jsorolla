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
import "../commons/empty-state.js";
import "../commons/forms/static-autocomplete.js";
import "../file/directory-preview.js";
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
        this._selectedDirectory = null;
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
        this._selectedDirectory = this.job.outDir; // select by default the output directory
    }

    jobIdObserver() {
        if (this.jobId && this.opencgaSession) {
            this.job = null;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, {
                    study: this.opencgaSession.study.fqn,
                    include: "outDir,output",
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

    getFilesInDirectory(directory) {
        return (this.job.output || [])
            .filter(file => file.path.startsWith(directory.path))
            .filter(file => file.type === "FILE" && !file.id.replace(directory.id, "").includes(":"))
            .map(file => file.id);
    }

    onSelectFile(event) {
        this._selectedFile = null;
        this._selectedDirectory = null;

        if (event.detail?.type === "FILE") {
            this._selectedFile = event.detail;
            this.requestUpdate();
        }

        if (event.detail?.type === "DIRECTORY") {
            this._selectedDirectory = event.detail;
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
        } else if (this._selectedDirectory) {
            return html`
                <directory-preview
                    .directoryId="${this._selectedDirectory.id}"
                    .active="${true}"
                    .opencgaSession="${this.opencgaSession}"
                    @fileClick="${event => this.onSelectFile(event)}">
                </directory-preview>
            `;
        } else {
            return nothing;
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

        // if the job does not have any output files, for example when it is on queue or pending,
        // we will display an empty state
        if (!this.job.output || this.job.output.length === 0) {
            return html`
                <empty-state
                    .icon="${"fa-folder-open"}"
                    .title="${"No output files available"}"
                    .description="${"This job does not have any output files yet. Maybe the job is still running or it did not produce any output files."}">
                </empty-state>
            `;
        }

        return html`
            ${this._config.title ? html`
                <h3 class="mb-3">${this._config.title}</h3>
            ` : nothing}
            <div class="row" style="min-height:480px;">
                <div class="col-md-3">
                    <div class="mb-2">
                        <static-autocomplete
                            .values="${this.job.output.filter(file => file.type === "FILE")}"
                            .config="${this._config.search}"
                            @filterChange="${event => this.onSelectFile({detail: event.detail.value})}">
                        </static-autocomplete>
                    </div>
                    <file-tree
                        .opencgaSession="${this.opencgaSession}"
                        .rootDirectoryId="${this.job.outDir.id}"
                        .currentPath="${this._selectedFile?.path || this._selectedDirectory?.path || null}"
                        .config="${{
                            rootDirectoryName: this.job.outDir.name,
                            rootDirectoryIcon: "fa-folder-open",
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
        return {
            title: "Execution Result Explorer",
            search: {
                filter: (file, value) => {
                    return file.name.toLowerCase().includes(value.toLowerCase());
                },
                renderItem: file => {
                    return file.name;
                },
            },
        };
    }

}

customElements.define("job-result", JobResult);

