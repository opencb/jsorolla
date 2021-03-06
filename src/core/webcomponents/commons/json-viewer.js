/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../utilsNew.js";
import "../download-button.js";

export default class JsonViewer extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            active: {
                type: Boolean
            },
            title: {
                type: String
            },
            data: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "json-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if ((changedProperties.has("data") || changedProperties.has("active")) && this.active) {
            if (this.data) {
                $(".json-renderer", this).jsonViewer(this.data);
            }
        }
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
            <div class="text-right">
                <download-button class="btn-sm" .json="${this.data}"></download-button>
            </div>
            <div class="json-renderer"></div>
        `;
    }

}

customElements.define("json-viewer", JsonViewer);
