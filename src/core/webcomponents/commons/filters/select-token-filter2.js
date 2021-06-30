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
import UtilsNew from "../../../utilsNew.js";

/**
 * Select2 version
 *
 * TODO FIXME Update from active-filters lead to an inconsistent state.
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
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
            placeholder: {
                type: String
            },
            resource: {
                type: String
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
        $("#" + this._prefix).select2({
            multiple: true,
            ajax: {
                transport: (params, success, failure) => {
                    params.data.page = params.data.page || 1;
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: this._config.limit,
                        count: true,
                        skip: (params.data.page - 1) * this._config.limit,
                        include: "id",
                        id: "~^" + params?.data?.term?.toUpperCase()
                    };
                    this.opencgaSession.opencgaClient.samples().search(filters).then(restResponse => {
                        const results = restResponse.getResults();
                        success(restResponse);
                    });
                },
                processResults: (restResponse, params) => {
                    params.page = params.page || 1;
                    return {
                        results: restResponse.getResults().map(r => ({id: r.id, text: r.id})),
                        pagination: {
                            more: (params.page * this._config.limit) < restResponse.getResponse().numMatches
                        }
                    };
                }
            },
            templateResult: r => {
                return $("<span>" + r.id + "<p class='dropdown-item-extra'><label>ID</label>" + r.id + "</p></span>");
            }

        })
            .on("select2:select", e => {
                console.log("adding", e.params.data.id);
                console.log($("#" + this._prefix).select2("data"));
                this.state = [...this.state, e.params.data.id];
                this.value = this.state.join(",");
                this.filterChange(e);
            })
            .on("select2:unselect", e => {
                console.log("removing", e.params.data.id);
                console.log($("#" + this._prefix).select2("data"));
                this.state = this.state.filter(el => el.id === e.params.data.id);
                this.value = this.state.join(",");
                this.filterChange(e);
            });

    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        if (_changedProperties.has("value")) {
            console.log("this.value", this.value)
            //const selection = this.value ? this.value.split(this.separator) : null;
            //$("#" + this._prefix).val(selection); // this wont work as options arent actually there since there is an ajax source
            // $("#" + this._prefix).trigger('change');
            //this.requestUpdate();
        }

    }

    filterChange(e) {
        const selection = $("#" + this._prefix).select2("data");
        console.log("filterChange", selection)
        const event = new CustomEvent("filterChange", {
            detail: {
                value: selection.map(el => el.id).join(this.separator)
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    render() {
        return html`
        ${JSON.stringify(this.value)}
        <div class="">
            <select id="${this._prefix}" style="width: 100%" @change="${this.filterChange}">
                ${this.value?.split(this.separator)?.map(el => html`<option>${el}</option>`)}
            </select>
        </div>
        `;
    }

}

customElements.define("select-token-filter2", SelectTokenFilter2);
