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
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class JobDetailLog extends LitElement {

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
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.command = this._config.defaultCommand;
        this.type = this._config.defaultType;
        this.content = null;
    }

    async updated(changedProperties) {
        if (changedProperties.has("job")) {
            this.jobId = this.job.id;
            if (this.active) {
                this.fetchContent(this.job, {command: this.command, type: this.type});
            }
        }

        if (changedProperties.has("active")) {
            this.content = null;
            this.requestUpdate();
            await this.updateComplete;
            if (this.active) {
                this.fetchContent(this.job, {command: this.command, type: this.type});
            } else {
                this.clearReload();
            }
        }
    }

    setCommand(command) {
        this.command = command;
        this.clearReload();
        this.fetchContent(this.job, {command: this.command, type: this.type});
        this.setReloadInterval();
    }

    setType(type) {
        this.type = type;
        this.clearReload();
        this.fetchContent(this.job, {command: this.command, type: this.type});
        this.setReloadInterval();
    }

    // setInterval makes sense only in case of Tail log
    setReloadInterval() {
        if (this.active && this.command === "tail" && this.job.internal.status.name === "RUNNING") {
            this.requestUpdate();
            this.interval = setInterval(() => {
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
        this.loading = false;
        clearInterval(this.interval);
        this.requestUpdate();
    }

    async fetchContent(job, params = {}, append = false) {
        const statusWithoutLogs = ["PENDING", "QUEUED"];
        if (!append) {
            this.content = "";
        }
        this.loading = true;
        this.requestUpdate();
        await this.updateComplete;

        const command = params.command || this.command;
        if (!statusWithoutLogs?.includes(job?.internal?.status?.id?.toUpperCase())) {
            this.opencgaSession.opencgaClient.jobs()[command + "Log"](job.id, {
                study: this.opencgaSession.study.fqn,
                lines: this._config.lines,
                type: this.type,
                offset: params.offset || 0,
                ...params
            }).then(restResponse => {
                const result = restResponse.getResult(0);
                if (result.content) {
                    // if command=tail this is the first tail call (the subsequents will be head)
                    if (command === "tail") {
                        this.contentOffset = result.offset;
                    }
                    // append is true only in case of tail command
                    // (it has been kept as separate param to quickly have one-shot Tail call button (not live), just in case)
                    if (append) {
                        if (this.contentOffset !== result.offset) {
                            this.content = this.content + result.content;
                            this.contentOffset = result.offset;
                        }
                    } else {
                        this.content = result.content + "\n";
                    }
                }
            }).catch(response => {
                this.content = "An error occurred while fetching log.\n";
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            }).finally(() => {
                this.loading = false;
                this.requestUpdate();
            });
        } else {
            this.content = `Job is ${job?.internal?.status?.id}\n`;
            this.loading = false;
            this.requestUpdate();
        }
    }

    renderCursor() {
        return this.loading || (this.content && this.command === "tail") ? html`<div class="cursor"></div>` : "";
    }

    render() {
        return html`
            <style>
                .log-wrapper {
                    min-height: 150px;
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
            <div class="mb-3">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-light ${this.command === "head" ? "active" : ""}" @click="${() => this.setCommand("head")}">
                        <i class="fas fa-align-left me-1"></i> Head
                    </button>
                    <button type="button" class="btn btn-light ${this.command === "tail" ? "active" : ""}" @click="${() => this.setCommand("tail")}">
                        <i class="fas fa-align-left me-1"></i>
                        Tail
                        <i class="fas fa-sync-alt ${this.command === "tail" && this.job.internal.status.name === "RUNNING" ? "anim-rotate" : "text-secondary"} ms-2"></i>
                    </button>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-light ${this.type === "stderr" ? "active" : ""}" @click="${() => this.setType("stderr")}">
                        <i class="fas fa-exclamation me-1"></i> Stderr
                    </button>
                    <button type="button" class="btn btn-light ${this.type === "stdout" ? "active" : ""}" @click="${() => this.setType("stdout")}">
                        <i class="fas fa-info me-1"></i> Stdout
                    </button>
                </div>
            </div>
            <pre class="overflow-x-scroll cmd log-wrapper ${this.command} rounded">${this.content}\n${this.renderCursor()}</pre>
        `;
    }

    getDefaultConfig() {
        return {
            defaultCommand: "head",
            defaultType: "stderr",
            lines: 500,
        };
    }

}

customElements.define("job-detail-log", JobDetailLog);
