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
import LitUtils from "../commons/utils/lit-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "../commons/forms/data-form.js";
import "./job-detail-log.js";
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
            // search: {
            //     type: Boolean,
            // },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.job = {};
        // this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            collapsable: true,
            titleVisible: false,
            titleWidth: 3,
            defaultValue: "-",
            defaultLayout: "horizontal",
            buttonsVisible: false,
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("job")) {
            this.jobObserver();
        }
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async jobObserver() {
        const params = {
            study: this.opencgaSession.study.fqn
        };
        await this.opencgaSession.opencgaClient.files()
            .tree(this.job.outDir.id, params)
            .then(response => {
                this.tree = response.responses[0].results[0];
                // this.#prepareData();
            })
            .catch(reason => {
                console.error(reason);
            });

        this.createDataFormConfig();
    }

    jobIdObserver() {
        if (this.jobId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, params)
                .then(response => {
                    this.job = response.responses[0].results[0];
                    // this.#prepareData();
                })
                .catch(reason => {
                    this.job = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "jobSearch", this.job, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.job = {};
        }
    }

    createX(files) {
        const elements = [];
        for (const f of files) {
            const file = f.file;

            switch (file.format) {

                case "JSON":
                    elements.push({
                        name: file.name,
                        field: file.id,
                        type: "file-preview",
                        display: {

                        }
                    });
                    break;
                case "IMAGE":
                    elements.push({
                        name: file.name,
                        field: file.id,
                        type: "image",
                        display: {

                        }
                    });
                    break;
                default:
                    debugger
                    elements.push({
                        name: file.name,
                        field: file.id,
                        type: "file-preview",
                        display: {

                        }
                    });
                    break;
            }
        }
        return elements;
    }

    createDataFormConfig() {
        // 1.
        const outputMap = {};
        this.job.output.forEach(file => outputMap[file.id] = file);



        const dataFormConfig = {
            title: "Results",
            display: {
                mode: "page",
                type: "PILLS"
            },
            sections: [
            ]
        };

        const firstLevelDirectories = this.tree.children.filter(f => f.file.type === "DIRECTORY");
        if (firstLevelDirectories?.length === 0) {
            // this.job.outDir = this.tree.children.find(f => f.file.type === "DIRECTORY");
        } else {
            debugger
            for (const directory of firstLevelDirectories) {

                const section = {
                    title: directory.file.name,
                    elements: []
                };

                const files = directory.children.filter(f => f.file.type === "FILE");
                section.elements.push(...this.createX(files));

                const secondLevelDirectories = directory.children.filter(f => f.file.type === "DIRECTORY");
                for (const subDirectory of secondLevelDirectories) {
                    const files = subDirectory.children.filter(f => f.file.type === "FILE");

                    if (files.length > 0) {
                        section.elements.push({
                            title: subDirectory.file.name,
                            type: "title",
                            display: {
                                titleStyle: "color:red; margin-top: 20px",
                            }
                        });
                        section.elements.push(...this.createX(files));
                    } else {

                    }

                }

                dataFormConfig.sections.push(section);
            }
        }

        this._data = outputMap;
        this._config = {...dataFormConfig};
        debugger

        this.requestUpdate();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.job?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Job ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this._data}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Results",
            icon: "",
            nullData: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                ]
        };
    }

}

customElements.define("job-result", JobResult);

