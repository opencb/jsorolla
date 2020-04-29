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
import Utils from "../../../../utils.js";

export default class OpencgaJobsDetailLog extends LitElement {

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
            job: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.content = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    async updated(changedProperties) {
        if (changedProperties.has("job")) {
            this.jobId = this.job.id;
            if (this.active) {
                this.fetchContent(this.job, {command: this._config.command, type: this._config.type});
            }
        }

        if (changedProperties.has("active")) {
            console.log("active", this.active);
            this.content = null;

            await this.requestUpdate();
            // todo this should call fetchContent iff the job has changed
            // console.log("new job = old job ", this.active && this.jobId === this.job.id)
            if (this.active) {
                this.fetchContent(this.job, {command: this._config.command, type: this._config.type});
            } else {
                this.clearReload();
            }
        }
    }

    setCommand(command) {
        this._config.command = command;
        this.clearReload();
        this.fetchContent(this.job, {command: this._config.command, type: this._config.type});
        this.setReloadInterval();
    }

    setType(type) {
        this._config.type = type;
        this.clearReload();
        this.fetchContent(this.job, {command: this._config.command, type: this._config.type});
        this.setReloadInterval();
    }

    // setInterval makes sense only in case of Tail log
    setReloadInterval() {
        console.log(this.job)
        if (this.active && this._config.command === "tail" && this.job.internal.status.name === "RUNNING") {
            console.log("setting interval");
            this.requestUpdate();
            this.interval = setInterval(() => {
                // this.content += "\n" + Utils.randomString(6);
                if ($(".jobs-details-log", this).is(":visible")) {
                    // tail call is actually head (after the first tail call)
                    this.fetchContent(this.job, {command: "head", offset: this.contentOffset}, true);
                } else {
                    this.clearReload();
                }
                this.requestUpdate();
            }, 10000);
        }
    }

    clearReload() {
        this.contentOffset = 0;
        clearInterval(this.interval);
        this.requestUpdate();
        console.log("cleared")
    }

    async fetchContent(job, params = {}, append = false) {
        if (!append) {
            this.content = "";
        }
        this.loading = true;
        await this.requestUpdate();

        const command = params.command || this._config.command;
        const offset = params.offset || 0;
        console.log("request ", "command", command, "params", params, "offset", offset, "append", append);

        this.opencgaSession.opencgaClient.jobs()[command + "Log"](job.id, {
            study: this.opencgaSession.study.fqn,
            lines: this._config.lines,
            type: this._config.type,
            ...params,
            offset
        }).then( restResponse => {
            const result = restResponse.getResult(0);
            if (result.content) {
                // if command=tail this is the first tail call (the subsequents will be head)
                if (command === "tail") {
                    this.contentOffset = result.offset;
                }
                // append is true only in case of tail command (it has been kept as separate param to quickly have one-shot Tail call button (not live), just in case)
                if (append) {
                    if (this.contentOffset !== result.offset) {
                        this.content = this.content + result.content;
                        this.contentOffset = result.offset;
                    }
                } else {
                    this.content = result.content + "\n";
                }
            } else {
                // this.content = "No content";
            }
        }).catch( restResponse => {
            if (restResponse.getEvents("ERROR").length) {
                this.content = restResponse.getEvents("ERROR").map(error => error.message).join("\n");
            } else {
                this.content = "Unknown error";
            }
        }).finally( () => {
            this.loading = false;
            this.requestUpdate();
        });
    }

    getDefaultConfig() {
        return {
            command: "head",
            type: "stderr",
            lines: 5
        };
    }

    render() {
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
            
            .wrapper {
                height: 35px;
                margin-top: 5px;
            }
            
            .wrapper fieldset.log-type {
                float: left;
                width: 200px;
            }
            
            .wrapper-label {
                color: grey;
                vertical-align: text-bottom;
            }
            
            .jobs-details-log .content-pills {
                margin: 10px 30px 10px 0;
            }
            
            .cursor {
                width: 7px;
                height: 16px;
                display: inline-block;
                vertical-align: bottom;
                background-color: #fff;
                -webkit-animation: blink 1s infinite;
                -moz-animation: blink 1s infinite;
                animation: blink 1s infinite;
            }
            
            .jobs-details-log .fa-sync-alt {
                margin-left: 10px;
            }
            
            .jobs-details-log .fa-sync-alt.disabled {
                color: #c5c5c5;
            }
            
            @keyframes blink {
              0% {
                opacity: 0;
              }
              50% {
                opacity: 0;
              }
              51% {
                opacity: 1;
              }
            }
        </style>
        <div class="jobs-details-log">
            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                <div class="btn-group command-buttons" role="group">
                    <button type="button" class="btn btn-default btn-small ripple ${this._config.command === "head" ? "active" : ""}" @click="${() => this.setCommand("head")}">
                        <i class="fas fa-align-left"></i> Head
                    </button>
                    <button type="button" class="btn btn-default btn-small ripple ${this._config.command === "tail" ? "active" : ""}" @click="${() => this.setCommand("tail")}">
                        <i class="fas fa-align-left"></i> Tail <i class="fas fa-sync-alt ${this._config.command === "tail" && this.job.internal.status.name === "RUNNING" ? "anim-rotate" : "disabled"}"></i> 
                    </button>
                </div>
            </div>
            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                <div class="btn-group" role="group" style="margin-left: 0px">

                    <button type="button" class="btn btn-default btn-small ripple ${this._config.type === "stderr" ? "active" : ""}" @click="${() => this.setType("stderr")}">
                        <i class="fas fa-exclamation"></i> Stderr
                    </button>
                    <button type="button" class="btn btn-default btn-small ripple ${this._config.type === "stdout" ? "active" : ""}" @click="${() => this.setType("stdout")}">
                        <i class="fas fa-info"></i> Stout
                    </button>
                </div>
            </div>                    
        </div>
        command ${this._config.command} - type ${this._config.type}
        <pre class="cmd ${this._config.command}">${this.content}\n${this.loading || (this.content && this._config.command === "tail") ? html`<div class="cursor"></div>` : ""}</pre>
        `;
    }

}

customElements.define("opencga-jobs-detail-log", OpencgaJobsDetailLog);
