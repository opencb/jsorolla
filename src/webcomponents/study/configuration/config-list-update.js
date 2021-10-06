/**
 * Copyright 2015-2021 OpenCB
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
import "../../commons/forms/text-field-filter.js";
import UtilsNew from "../../../core/utilsNew.js";
import DetailTabs from "../../commons/view/detail-tabs.js";

export default class ClinicalListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            entity: {
                type: String
            },
            items: {
                type: Array
            },
            tabs: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.tabs) {
            this._config = {...this.getDefaultConfig()};
        }

        if (UtilsNew.isUndefined(this.items)) {
            this.items = [];
        }
    }

    _init() {
        this.status = {};
        this._prefix = UtilsNew.randomString(8);
    }

    renderConfig(itemConfigs, key) {

        if (itemConfigs.constructor === Array) {
            const title = this.config.edit.display.mode?.heading?.title || "id";
            const subtitle = this.config.edit.display.mode?.heading?.subtitle || "description";
            return html`
            ${itemConfigs?.map(item => {
                const status = {...item, parent: key? key : ""};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${status[title]}</b>
                                    <p class="text-muted">${status[subtitle]}</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                    <data-form
                                        .data="${status}"
                                        .config="${this.config.edit}">
                                    </data-form>
                            </div>
                        </div>
                    </div>
                `;
            })}
            <data-form
                .data="${this.status}"
                .config="${this.config.new}">
            </data-form>
        `;
        }

        if (itemConfigs.constructor === Object) {

            if ("populations" in itemConfigs && "thresholds" in itemConfigs) {
                return "Work in construction";
            }

            return html `
                <data-form
                    .data=${itemConfigs}
                    .config=${this.config.edit}>
                </data-form>
            `;
        }

        return "Others Configs";
    }

    getDefaultConfig() {
    // Object.keys(configsVariant).filter(key => configsVariant[key].constructor !== Object)
    // Object.keys(configsVariant).filter(key => configsVariant[key] instanceof Object)

        const configKeys = Object.keys(this.items).filter(key => this.items[key] instanceof Object);
        return {
            display: {
                contentStyle: "",
            },

            items: configKeys.map(key => {
                return {
                    id: key,
                    name: key,
                    render: () => {
                        return html`
                            <div class="col-md-6">
                                <div class="list-group">
                                    <!-- Edit Config -->
                                    ${this.renderConfig(this.items[key], key)}
                                    <!-- Add New Config -->

                                </div>
                            </div>`;
                    }
                };
            })
        };
    }

    render() {
        return html`
            ${this.tabs ? html `
                <detail-tabs
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_VERTICAL_MODE}">
                </detail-tabs>`:
                html `
                ${this.renderConfig(this.items)}
                `}
            `;
    }

}

customElements.define("config-list-update", ClinicalListUpdate);
