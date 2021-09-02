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
import UtilsNew from "../../../core/utilsNew.js";

/**
 * Select2 version
 *
 * TODO support both static and dynamic data. Dynamic data only at the moment.
 */

export default class SelectTokenFilter2 extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            },
            value: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "select-" + UtilsNew.randomString(6) + "_";
        this.separator = ",";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.state = [];
    }

    firstUpdated(_changedProperties) {
        this.select = $("#" + this._prefix);
        this.select.select2({
            // tags: true,
            multiple: true,
            // placeholder: this._config.placeholder,
            ajax: {
                transport: async (params, success, failure) => this._config.source(params, success, failure),
                processResults: (restResponse, params) => {
                    params.page = params.page || 1;
                    return {
                        results: restResponse.getResults(),
                        pagination: {
                            more: (params.page * this._config.limit) < restResponse.getResponse().numMatches
                        }
                    };
                }
            },
            templateResult: item => {
                if (item.loading) {
                    return item.text;
                }
                // NOTE this function silently fails in case of errors if not wrapped in try/catch block
                try {
                    const {name, ...rest} = this._config.fields(item) ?? item.id;
                    return $(`<span>${name}</span> ${(rest ? Object.entries(rest).map(([label, value]) => `<p class="dropdown-item-extra"><label>${label}</label> ${value || "-"}</p>`).join("") : "") }`);
                } catch (e) {
                    console.error(e);
                }
            },
            templateSelection: repo => {
                return repo.id;
            }
        })
            .on("select2:select", e => {
                this.filterChange(e);
            })
            .on("select2:unselect", e => {
                this.filterChange(e);
            });

    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        if (_changedProperties.has("value")) {

            /* if (this.value) {
                this.state = this.value.split(",");
            }*/
            this.select.val(null).trigger("change");
            const selection = this.value ? this.value.split(",") : null;
            this.select.val(selection);
            this.select.trigger("change");

            // this.addOptions(this.value?.split(this.separator));
            // const selection = this.value ? this.value.split(this.separator) : null;
            // this.select.val(selection); // this wont work as options arent actually there since there is an ajax source
            // this.select.trigger('change');
            // this.requestUpdate();

        }

    }

    /* addOptions(ids) {
        if (ids) {
            for (const id of ids) {
                if (this.select.find("option[value='" + id + "']").length) {
                    this.select.val(id).trigger("change");
                } else {
                    // Create a DOM Option and pre-select by default
                    const newOption = new Option(id, id, true, true);
                    // Append it to the select
                    this.select.append(newOption).trigger("change");
                }
            }
            this.select.trigger("change");
        } else {
            this.select.val(null).trigger("change");

        }

    }*/

    filterChange(e) {
        const selection = this.select.select2("data").map(el => el.id).join(this.separator);
        console.log("filterChange", selection);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: selection
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0,
            placeholder: "Start typing",
            source: () => {
                throw new Error("Data source not defined");
            },
            fields: item => ({
                "name": item.id,
            }),
        };
    }

    render() {
        return html`
        <div class="">
            <select id="${this._prefix}" style="width: 100%" @change="${this.filterChange}"></select>
        </div>
        `;
    }

}

customElements.define("select-token-filter2", SelectTokenFilter2);
