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
import UtilsNew from "../../../core/utils-new.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import "../../commons/list-update.js";

export default class ConfigListUpdate extends LitElement {

    static annotationConfig = {
        populationFrequency: "Population frequency",
        biotype: "Biotype",
        consequenceType: "Consequence type",
        clinicalSource: "Clinical source",
        clinicalSignificance: "Clinical significance",
        transcriptFlagIndexConfiguration: "Transcript flag"
    }

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
            items: {type: Object},
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (UtilsNew.isUndefined(this.items)) {
            this.items = [];
        }
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    configObserver() {
        // When user change the value of type the config.
        // it will be render with the new value.
        this._config = {...this.getDefaultConfig()};
    }


    getDefaultConfig() {

        let configKeys = [];
        if (this.items) {
            configKeys = Object?.keys(this.items).filter(key => this.items[key] instanceof Object);
        }

        return {
            display: {
                contentStyle: "",
            },
            items: configKeys.map(key => {
                const node = {parent: this.key, child: key};
                return {
                    id: key,
                    name: ConfigListUpdate.annotationConfig[key] || key,
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
            ${this.items && UtilsNew.isObject(this.items) ? html `
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
