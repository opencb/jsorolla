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
import LitUtils from "../../commons/utils/lit-utils.js";
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
        return html`
            ${itemConfigs?.map(item => {
                const status = {...item, parent: key? key : ""};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${status.id}</b>
                                    <p class="text-muted">${status.description}</p>
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
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                contentStyle: "",
            },
            items: Object.keys(this.items).map(key => {
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
                                    <data-form
                                        .data="${this.status}"
                                        .config="${this.config.new}">
                                    </data-form>
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
                <!-- Edit Config -->
                ${this.renderConfig(this.items)}
                <!-- Add New Config -->
                <div class="btn-groups">
                    <data-form
                        .data="${this.status}"
                        .config="${this.config.new}">
                    </data-form>
                </div>
                `}
            `;
    }

}

customElements.define("clinical-list-update", ClinicalListUpdate);
