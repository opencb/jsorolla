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
import UtilsNew from "../../../utilsNew.js";

export default class DetailTabs extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            },
            data: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    _changeBottomTab(e) {
        const tabId = e.currentTarget.dataset.id;
        $(".nav-tabs", this).removeClass("active");
        $(".tab-content div[role=tabpanel]", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $("#" + tabId + "-tab", this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "",
            showTitle: true
        }
    }

    render() {
        return html`
            ${this._config.showTitle 
                ? html`
                    <div class="panel">
                        <h2>&nbsp;${this._config.title} ${this.data.id}</h2>
                    </div>` 
                : null
            }
            
            <div class="detail-tabs">
                <ul class="nav nav-tabs" role="tablist">
                    ${this._config.items.length && this._config.items.map(item => 
                        html`
                            <li role="presentation" class="${classMap({active: item.active})}">
                                <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}" @click="${this._changeBottomTab}">
                                    <span>${item.name}</span>
                                </a>
                            </li>
                        `)
                    }
                </ul>
                <div class="tab-content">
                    ${this._config.items.length ? this._config.items.map(item =>
                        html`
                            <div id="${item.id}-tab" class="tab-pane ${classMap({active: item.active})}" role="tabpanel">
                                ${item.render(this.data, this.activeTab[item.id], this.opencgaSession )}
                            </div>
                        `)
                    : null}
                </div>
            </div>
            
            
        `;
    }
}

customElements.define("detail-tabs", DetailTabs);
