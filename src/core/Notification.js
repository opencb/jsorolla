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

export class NotificationQueue {

    constructor(litElement) {
        if (!NotificationQueue.instance) {
            NotificationQueue.instance = this;
        }
        this.queue = [];
        this.litElement = litElement;
        return NotificationQueue.instance;

    }
    push(title, details = "", severity = "info", dismissible = true, autoDismiss = true) {
        this.queue = [...this.queue, {title, details, severity, dismissible, autoDismiss}];
        if (this.litElement) {
            this.litElement.requestUpdate().then( () => console.log("refreshed"));
        }
        if (autoDismiss) {
            setTimeout(() => {
                this.remove(title);
            }, 5000);
        }
    }

    remove(title) {
        this.queue = this.queue.filter( item => item.title !== title);
        if (this.litElement) {
            this.litElement.requestUpdate();
        }
    }

    get() {
        return this.queue;
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
                type: Object
            }
        };
    }

    _init() {
        this.iconMap = {
            info: "fa fa-info-circle fa-2x",
            success: "fa fa-thumbs-up fa-2x",
            warning: "fa fa-exclamation-triangle fa-2x",
            danger: "fa ffa fa-exclamation-circle fa-2x"
        };
    }

    render() {
        return html`
        <div id="notifications-queue" class="col-xs-11 col-sm-4">
        ${this.queue.map( item => html`
            <div class="alert animated slideInDown alert-${item.severity.toLowerCase()} ${item.dismissible ? "alert-dismissible" : ""}">
                <p class="title"><i class="${this.iconMap[item.severity]}"></i> ${item.title}</p>
                <p>${item.details}</p>
                ${item.dismissible ? html`<span class="close" data-dismiss="alert"><i class="fa fa-times-circle"></i></span>` : null}
            </div>
        `)}
        </div>
        `;
    }

}

customElements.define("notification-element", NotificationElement);
