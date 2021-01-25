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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../utilsNew.js";


export default class OpencgaExport extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.activeTab = {url: true};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    getDefaultConfig() {
        return {
        };
    }

    _changeTab(e) {
        const tabId = e.currentTarget.dataset.id;
        $("#code > .content-pills", this).removeClass("active");
        $("#code > .content-tab-wrapper > .content-tab", this).hide();
        $("#" + this._prefix + tabId, this).show();
        $("#" + this._prefix + tabId, this).addClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
        this.activeTab[tabId] = true;
        this.requestUpdate();

    }

    render() {
        return html`
            <style>

                .export-buttons {
                    width: 100px;
                    height: 100px;
                    margin: 0 10px 0 0;
                    flex-direction: column;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                }

                .export-buttons i{
                    color: grey;
                }
                .export-buttons-text {
                    
                }
            </style>
        <div>
            <ul class="nav nav-tabs">
                <li class="active"><a data-toggle="tab" href="#plain_text">Home</a></li>
                <li><a data-toggle="tab" href="#code">Code</a></li>
            </ul>
        </div>

        <div class="tab-content">
            <div id="plain_text" class="tab-pane active">
                <h3>Plain text</h3>
                <p></p>
                <div class="export-buttons ripple">
                    <i class="fas fa-file-export fa-2x"></i>
                    <span class="export-buttons-text">
                        CSV
                    </span>
                </div>
                <div class="export-buttons ripple">
                    <i class="fas fa-file-export fa-2x"></i>
                    <span class="export-buttons-text">
                        JSON
                    </span>
                </div>
            </div>
            <div id="code" class="tab-pane">
                <h3>Code</h3>
                <div class="btn-group" role="toolbar" aria-label="toolbar">
                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["url"]})}" @click="${this._changeTab}" data-id="url">
                        <i class="fas fa-table icon-padding" aria-hidden="true"></i> URL
                    </button>
                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["curl"]})}" @click="${this._changeTab}" data-id="curl">
                        <i class="fas fa-table icon-padding" aria-hidden="true"></i> cURL
                    </button>
                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["wget"]})}" @click="${this._changeTab}" data-id="wget">
                        <i class="fas fa-table icon-padding" aria-hidden="true"></i> wGET
                    </button>
                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["r"]})}" @click="${this._changeTab}" data-id="r">
                        <i class="fas fa-table icon-padding" aria-hidden="true"></i> R
                    </button>
                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["python"]})}" @click="${this._changeTab}" data-id="python">
                        <i class="fas fa-table icon-padding" aria-hidden="true"></i> Python
                    </button>
                </div>

                <div class="content-tab-wrapper">
                    <div id="${this._prefix}url" class="content-tab active">
                        url
                    </div>
                    <div id="${this._prefix}curl" class="content-tab">
                        curl
                    </div>
                    <div id="${this._prefix}wget" class="content-tab">
                        wget
                    </div>
                    <div id="${this._prefix}r" class="content-tab">
                        r
                    </div>
                    <div id="${this._prefix}python" class="content-tab">
                        python
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-export", OpencgaExport);
