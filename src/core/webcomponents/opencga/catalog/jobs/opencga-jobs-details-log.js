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


export default class OpencgaJobsDetailsLog extends LitElement {

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
        console.log("connectedCallback")
    }

    async updated(changedProperties) {
        if (changedProperties.has("job")) {
            if (this.active) {
                this.fetchContent(this.job);
            }

        }
        if (changedProperties.has("active")) {
            console.log("active", this.active);
            this.content = null;
            await this.requestUpdate();
            // todo this should call fetchContent iff the job has changed
            if (this.active) {
                this.fetchContent(this.job);
            } else {
                this.clearReload();
            }
        }
    }

    setCommand(command) {
        this._config.command = command;
        this.clearReload();
        this.fetchContent(this.job);
        this.toggleReloadInterval();
    }

    setType(type) {
        this._config.type = type;
        this.fetchContent(this.job);
        this.clearReload();
    }

    setAutoreload(e) {
        console.log(e.currentTarget)

        if(this._config.autoreload) {
            this._config.autoreload = false;
            $(e.currentTarget).removeClass("active");
            this.clearReload();
        } else {
            this._config.autoreload = true;
            $(e.currentTarget).addClass("active");
            this.toggleReloadInterval();
        }
        //this._config.autoreload = e.target.value === "true";
        //this.clearReload();

    }

    toggleReloadInterval() {
        if (this.active && this._config.autoreload && this._config.command === "tail") {
            console.log("setting interval")
            this.interval = setInterval(() => {
                //this.content += "\n" + Utils.randomString(6);
                this.fetchContent(this.job, {offset: this.contentOffset}, true);
                this.requestUpdate();
            }, 1000);
        }
    }

    clearReload() {
        this._config.autoreload = false;
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
        this.opencgaSession.opencgaClient.jobs()[this._config.command + "Log"](job.id, {
            study: this.opencgaSession.study.fqn,
            lines: this._config.lines,
            type: this._config.type,
            ...params
        }).then( restResponse => {
            const result = restResponse.getResult(0);
            console.log(result)
            this.contentOffset = result.offset;
            if (result.content) {
                if(append) {
                    this.content += result.content;
                    console.log("appended");
                } else {
                    this.content = result.content;
                }
            } else {
                //this.content = "No content";
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
            lines: 20,
            autoreload: false
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
            
            .wrapper fieldset.autoreload {
                float: right;
                width: 150px;

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
                        <i class="fa fa-table icon-padding" aria-hidden="true"></i> Head
                    </button>
                    <button type="button" class="btn btn-default btn-small ripple ${this._config.command === "tail" ? "active" : ""}" @click="${() => this.setCommand("tail")}">
                        <i class="fa fa-table icon-padding" aria-hidden="true"></i> Tail
                    </button>
                </div>
            </div>
            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                <div class="btn-group" role="group" style="margin-left: 0px">

                    <button type="button" class="btn btn-default btn-small ripple ${this._config.type === "stderr" ? "active" : ""}" @click="${() => this.setType("stderr")}">
                        <i class="fa fa-table icon-padding" aria-hidden="true"></i> Stderr
                    </button>
                    <button type="button" class="btn btn-default btn-small ripple ${this._config.type === "stdout" ? "active" : ""}" @click="${() => this.setType("stdout")}">
                        <i class="fa fa-table icon-padding" aria-hidden="true"></i> Stout
                    </button>
                </div>
            </div>    
           
            ${this._config.command === "tail" ? html`
            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                <button type="button" class="btn btn-default btn-small ripple ${this._config.autoreload ? "active" : ""}" @click="${this.setAutoreload}">
                       <i class="fas fa-sync-alt ${this._config.autoreload ? "anim-rotate" : ""}"></i> Autoreload
                </button>
            </div>` : null}
                 
        </div>
        command ${this._config.command} - type ${this._config.type} - autoreload ${this._config.autoreload}
        <pre class="cmd">${this.content}\n${this.loading || (this.content && this._config.command === "tail" && this._config.autoreload) ? html`<div class="cursor"></div>` : ""}</pre>
        `;
    }

}

customElements.define("opencga-jobs-details-log", OpencgaJobsDetailsLog);
