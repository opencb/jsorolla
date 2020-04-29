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
import "./opencga-individual-view.js";

export default class OpencgaIndividualDetail extends LitElement {

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
            },
            // this is not actually used at the moment
            individualId: {
                type: Object
            },
            individual: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("individual")) {

        }

        if (changedProperties.has("activeTab")) {
            console.log("activeTab")
        }
    }

    _changeBottomTab(e) {
        const tabId = e.currentTarget.dataset.id;
        console.log(tabId)
        $(".nav-tabs", this).removeClass("active");
        $(".tab-content div[role=tabpanel]", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $("#" + tabId + "-tab", this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }

    getDefaultConfig() {
        return {
            title: "Individual",
            showTitle: true
        };
    }

    render() {
        return this.individual ? html`
            <style>
                .detail-row{
                    padding: 5px;
                }
            </style>
            <div>
                ${this._config.showTitle ? html`
                    <div class="panel" style="margin-bottom: 10px">
                        <h2 >&nbsp;${this._config.title}: ${this.individual.id}</h2>
                    </div>
                ` : null}
                <ul class="nav nav-tabs" role="tablist">
                    ${this.config.detail.length && this.config.detail.map(item => html`
                        <li role="presentation" class="${item.active ? "active" : ""}">
                                <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                                   data-id="${item.id}"
                                   class=""
                                   @click="${this._changeBottomTab}">${item.title}</a>
                        </li>
                    `)}
                </ul>
               
                <div class="tab-content">
                    <div id="file-view-tab" class="tab-pane active" role="tabpanel">
                        <div id="${this._prefix}sample-view">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group detail-row">
                                            <opencga-individual-view .opencgaSession="${this.opencgaSession}" .individual="${this.individual}">
                                            </opencga-individual-view>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="log-tab" class="tab-pane" role="tabpanel">
                        second tab
                    </div>
                </div>
                
            </div>
        ` : null;
    }

}

customElements.define("opencga-individual-detail", OpencgaIndividualDetail);
