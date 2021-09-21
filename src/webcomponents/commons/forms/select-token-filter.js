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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utilsNew.js";
import {classMap} from "lit/directives/class-map.js";

/**
 * Token filter. Select2 version with opencga dynamic datasource
 *
 */

export default class SelectTokenFilter extends LitElement {

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

    firstUpdated() {
        this.select = $("#" + this._prefix);
        this.select.select2({
            tags: this._config.freeTag === true,
            multiple: true,
            width: "style",
            placeholder: this._config.placeholder,
            minimumInputLength: this._config.minimumInputLength,
            ajax: {
                transport: async (params, success, failure) => this._config.source(params, success, failure),
                processResults: (restResponse, params) => {
                    const _params = params;
                    _params.page = _params.page || 1;
                    return {
                        results: this._config.preprocessResults(restResponse.getResults()),
                        pagination: {
                            more: (_params.page * this._config.limit) < restResponse.getResponse().numMatches
                        }
                    };
                }
            },
            /* dropdown template */
            templateResult: item => {
                if (item.loading) {
                    return $(`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> <span>${item.text}</span>`);
                }
                // NOTE this function silently fails in case of errors if not wrapped in try/catch block
                try {
                    const {name, ...rest} = this._config.fields(item) ?? item.id;
                    return $(`<span>${name}</span> ${(rest ? Object.entries(rest).map(([label, value]) => `<p class="dropdown-item-extra"><label>${label}</label> ${value || "-"}</p>`).join("") : "") }`);
                } catch (e) {
                    console.error(e);
                }
            },
            /* selection template. At this stage select2 assumes item as an {id,text} pair or a string. */
            templateSelection: item => {
                return item.id ?? item.text;
            },
            ...this._config.select2Config
        })
            .on("select2:select", e => {
                this.filterChange(e);
                /* dynamic width. DONE in css */
                /* if (this._config.dynamicWidth) {
                    let width = 200;
                    $(".select2-selection__choice", this).each(function () {
                        const token = $(this);
                        const tokenWidth = token.outerWidth();
                        width += tokenWidth;
                    });
                    console.log("$(this).find(\"span.select2-selection\")", $(this).find("span.select2-selection"))
                    $(this).find("span.select2-selection").css("max-width", width);
                }*/
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

            /* this.select.val(null).trigger("change");
            const selection = this.value ? this.value.split(",") : null;
            this.select.val(selection);
            this.select.trigger("change");
            */

            // manual addition of <option> elements is needed when tags=true in select2. We do it in any case.
            this.select.empty();
            this.addOptions(UtilsNew.isNotEmpty(this.value) ? this.value?.split(this.separator) : "");

            // const selection = this.value ? this.value.split(this.separator) : null;
            // this.select.val(selection); // this wont work as options arent actually there since there is an ajax source
            // this.select.trigger('change');
            // this.requestUpdate();

        }

    }

    addOptions(ids) {
        if (ids) {
            for (const id of ids) {
                // Create a DOM Option and pre-select by default
                const newOption = new Option(id, id, true, true);
                // Append it to the select
                this.select.append(newOption).trigger("change");
            }
            this.select.trigger("change");
        } else {
            this.select.val(null).trigger("change");

        }
    }

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
            minimumInputLength: 0,
            maxItems: 0,
            placeholder: "Start typing",
            freeTag: false,
            source: () => {
                throw new Error("Data source not defined");
            },
            fields: item => ({
                "name": item.id,
            }),
            /* remap results coming from opencga */
            preprocessResults(results) {
                if (results.length) {
                    if ("string" === typeof results[0]) {
                        return results.map(s => ({id: s}));
                    }
                }
                return results;
            }
        };
    }

    render() {
        return html`
        <div>
            <select class="form-control"  id="${this._prefix}" @change="${this.filterChange}"></select>
        </div>
        `;
    }

}

customElements.define("select-token-filter", SelectTokenFilter);
