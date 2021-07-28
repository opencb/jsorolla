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
import UtilsNew from "../core/utilsNew.js";

export class NotificationQueue {

    constructor() {
        if (!NotificationQueue.instance) {
            NotificationQueue.instance = this;
        }
        this.queue = [];
        return NotificationQueue.instance;
    }

    setContext(context) {
        this.context = context;
    }

    async push(title, details = "", severity = "info", dismissible = true, autoDismiss = true) {
        const id = UtilsNew.randomString(6);
        const msg = {id, title, details, severity, dismissible, autoDismiss};
        this.queue = [...this.queue, msg];
        await this.context.requestUpdate();
        if (autoDismiss) {
            await UtilsNew.sleep(5000);
            this.remove(id);
            await this.context.requestUpdate();
        }
    }

    // temp fix
    pushRemainingTime(remainingMinutes, opencgaClient) {
        const msg = html`Your session is close to expire. <strong>${remainingMinutes} minutes remaining</strong> <a href="javascript:void 0" @click="${() => {
 this.refreshToken(opencgaClient);
}}"> Click here to refresh </a>`;
        this.push(msg);
    }

    remove(id) {
        this.queue = this.queue.filter(item => item.id !== id);
        this.context.requestUpdate();
    }

    get() {
        return this.queue;
    }

    refreshToken(opencgaClient) {
        opencgaClient.refresh().then(response => {
            const sessionId = response.getResult(0).token;
            const decoded = jwt_decode(sessionId);
            const dateExpired = new Date(decoded.exp * 1000);
            const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss");
            const _message = "Your session is now valid until " + validTimeSessionId;
            this.push(_message, "", "info");
        });
    }

}

export class NotificationElement extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            queue: {
                type: Array
            }
        };
    }

    _init() {
        this.iconMap = {
            info: "fa fa-info-circle fa-2x",
            success: "fa fa-check fa-2x",
            warning: "fa fa-exclamation-triangle fa-2x",
            danger: "fa ffa fa-exclamation-circle fa-2x",
            error: "fa ffa fa-exclamation-circle fa-2x"
        };

    }

    render() {
        return html`
            <div id="notifications-queue" class="col-xs-11 col-sm-4">
            ${this.queue.map(item => {
                return html`
                    <div class="alert animated slideInDown alert-${item.severity.toLowerCase() || "info"} ${item.dismissible ? "alert-dismissible" : ""}" data-id="${item.id}">
                        <div class="icon"><i class="${this.iconMap[item.severity.toLowerCase() || "info"]}"></i></div>
                        <div class="content">
                            <p class="title">${item.title}</p>
                            <p class="details">${item.details}</p>
                        </div>
                        ${item.dismissible ? html`<span class="close" data-dismiss="alert"><i class="fa fa-times-circle"></i></span>` : null}
                    </div>`;
            })}
            </div>`;
    }

}

customElements.define("notification-element", NotificationElement);
