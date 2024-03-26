/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/file-name-autocomplete.js";


export default class OpencgaAlignmentStatsAnalysis extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ota-" + UtilsNew.randomString(6);

        this.data = {
            job: {
                id: `alignment-stats-${new Date().getTime()}`
            }
        };
        this.params = {},

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    onFileChange(e) {
        if (e.detail.value) {
            this.data.file = e.detail.value;
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            // case "file":
            //     this.data.file = e.detail.value;
            //     break;
            case "job.id":
            case "job.tags":
            case "job.description":
                let f = e.detail.param.split(".")[1];
                this.data.job[f] = e.detail.value;
                break;
            default:
                // this.clinicalAnalysis[e.detail.param] = e.detail.value;
                break;
        }

        this.data = {...this.data};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Alignment Stats",
            requires: "2.0.0",
            description: "",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Genome-Wide+Association+Study",
                    icon: ""
                }
            ],
            display: {
                title: {
                    class: "list-item-arrow"
                },
                showTitle: true,
                labelAlign: "left",
                defaultLayout: "vertical",
                buttons: {
                    show: true,
                    clearText: "Clear",
                    submitText: "Run"
                }
            },
            sections: [
                {
                    title: "Input Parameters",
                    display: {
                        class: "",
                        title: {
                            icon: "",
                            class: ""
                        },
                        collapsed: false,
                    },
                    elements: [
                        {
                            name: "Input File",
                            // id: "file",
                            type: "custom",
                            display: {
                                width: 6,
                                render: data => {
                                    // .config="${fieldConfig}"
                                    return html`<file-name-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFileChange(e)}"></file-name-autocomplete>`
                                }
                            }
                        }
                    ]
                },
                {
                    title: "Job Info",
                    display: {
                        collapsed: false,
                    },
                    elements: [
                        {
                            name: "Job ID",
                            field: "job.id",
                            type: "input-text",
                            // defaultValue: `alignment-stats-${new Date().getTime()}`,
                            display: {
                                width: 6
                            }
                        },
                        {
                            name: "Add Tags",
                            field: "job.tags",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                width: 6,
                            }
                        },
                        {
                            name: "Description",
                            field: "job.description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                width: 6,
                                rows: 2
                            }
                        },
                    ]
                },
            ],
            execute: (opencgaSession, data) => {
                debugger
                // opencgaSession.opencgaClient.alignments().runStats(data, params);
            },
            result: {
            }
        };
    }

    onClear() {
        this.data = {};
        this.requestUpdate();
    }

    onRun() {
        this._config.execute(this.opencgaSession, this.data);
    }

    render() {
        return html`
            <data-form .data=${this.data} .config="${this._config}" @fieldChange="${e => this.onFieldChange(e)}"  @clear="${this.onClear}" @submit="${this.onRun}"></data-form>
        `;
        // return html`
        //    <opencga-analysis-tool .opencgaSession="${this.opencgaSession}" .config="${this._config}" ></opencga-analysis-tool>
        // `;
    }
}

customElements.define("opencga-alignment-stats-analysis", OpencgaAlignmentStatsAnalysis);
