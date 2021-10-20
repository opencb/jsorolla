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
import UtilsNew from "../../../core/utilsNew.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/list-update.js";

export default class ConfigListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            key: {
                type: String
            },
            items: {},
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig()};


        if (UtilsNew.isUndefined(this.items)) {
            this.items = [];
        }
    }

    // update(changedProperties) {
    //     console.log("Updating ...config-list-update");
    //     // Updating....
    //     // this._config = {...this.getDefaultConfig()};
    //     super.update(changedProperties);
    // }

    _init() {
        this.status = {};
        this._prefix = UtilsNew.randomString(8);
    }


    getDefaultConfig() {
        const configKeys = Object.keys(this.items).filter(key => this.items[key] instanceof Object);
        return {
            display: {
                contentStyle: "",
            },
            items: configKeys.map(key => {
                const node = {parent: this.key, child: key};
                return {
                    id: key,
                    name: key,
                    render: () => {
                        return html`
                            <div class="col-md-6">
                                <div class="list-group">
                                    <list-update
                                        .node=${node}
                                        .data=${{items: this.items[key]}}
                                        .config=${this.config[key]||this.config}>
                                    </list-update>
                                </div>
                            </div>`;
                    }
                };
            })
        };
    }

    render() {
        const node = {parent: this.key, child: ""};
        return html`
            ${this.items.constructor === Object ? html `
                <detail-tabs
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_VERTICAL_MODE}">
                </detail-tabs>`:
                html `
                <list-update
                    .node=${node}
                    .data=${{items: this.items}}
                    .config=${this.config[this.key] || this.config}>
                </list-update>
                `}
        `;
    }

}

customElements.define("config-list-update", ConfigListUpdate);
