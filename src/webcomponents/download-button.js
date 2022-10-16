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
import UtilsNew from "../core/utils-new.js";

export default class DownloadButton extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            name: {
                type: String
            },
            title: {
                type: String
            },
            json: {
                type: Object
            },
            class: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
    }

    download() {
        const dataString = JSON.stringify(this.json || {}, null, "\t");
        const data = new Blob([dataString], {type: "application/json"});
        const file = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = file;
        a.download = (this.json?.id || this.json?.name || "download") + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
        }, 0);
    }

    render() {
        return html`<button class="btn btn-default ripple ${this.class ?? ""}" title="${this.title || ""}" @click="${this.download}"><i class="fa fa-download" aria-hidden="true"></i> ${this.name || "Download"}</button>`;
    }
}

customElements.define("download-button", DownloadButton);
