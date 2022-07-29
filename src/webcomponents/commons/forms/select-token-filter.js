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
import "../forms/file-upload.js";

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
            value: {
                type: String
            },
            classes: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
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
            multiple: this._config.multiple ?? true,
            width: "style",
            allowClear: true,
            placeholder: this._config.placeholder,
            minimumInputLength: this._config.minimumInputLength,
            ajax: {
                transport: async (params, success, failure) => this._config.source(params, success, failure),
                // NOTE processResults() expects a RestResponse instance, override the whole ajax() method in case of external data source (not Opencga)
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
                    // if name is not defined it means tags=true, _config.fields() mapper function is defined but the user is typing a non existing word (in data source). This avoids printing `undefined` in dropdown.
                    if (name) {
                        return $(`<span>${name}</span> ${(rest ? Object.entries(rest).map(([label, value]) => `<p class="dropdown-item-extra"><label>${label}</label> ${value || "-"}</p>`).join("") : "") }`);
                    } else {
                        return item.id;
                    }

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

        if (_changedProperties.has("classes")) {
            if (this.classes) {
                this.select.data("select2").$selection.addClass(this.classes);
            } else {
                this.select.data("select2").$selection.removeClass("");
            }
        }

        if (_changedProperties.has("value")) {
            // manual addition of <option> elements is needed when tags=true in select2. We do it in any case.
            this.select.empty();
            const regExpSeparators = new RegExp("[" + this._config.separator.join("") + "]");
            this.addOptions(UtilsNew.isNotEmpty(this.value) ? this.value?.split(regExpSeparators) : "");
        }

    }

    addOptions(ids) {
        if (ids) {
            const _ids = [...new Set(ids)];
            for (const id of _ids) {
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

    fileUploaded(e) {
        if (e.detail.value) {
            const list = e.detail.value.join(",");
            // TODO this.value could be a string separated by other chars than commas
            this.value = this.value ? this.value + "," + list : list;
        }
    }

    filterChange(e) {
        // join by "," only as the operator (, or ;) is not a concern of this component.
        // this component only needs to split by all separators (defined in config) in updated() fn,
        // but it doesn't need to reckon which one is being used at the moment (some tokens can contain commas (e.g. in HPO))
        const selection = this.select.select2("data").map(el => el.id).join(",");
        const event = new CustomEvent("filterChange", {
            detail: {
                value: selection
            }
        });
        this.dispatchEvent(event);
    }

    toggleFileUpload(e) {
        $(`#${this._prefix}-select-wrapper .file-drop-area`).collapse("toggle");
    }

    getDefaultConfig() {
        return {
            separator: [","],
            limit: 10,
            minimumInputLength: 0,
            maxItems: 0,
            placeholder: "Start typing",
            freeTag: false,
            fileUpload: false,
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
        if (this._config.fileUpload) {
            return html`
                <form>
                    <div id="${this._prefix}-select-wrapper">
                        <div class="input-group">
                            <select class="form-control"  id="${this._prefix}" @change="${this.filterChange}"></select>
                            <span class="input-group-addon file-upload-toggle" @click="${this.toggleFileUpload}">
                                <i class="fas fa-upload"></i>
                            </span>
                        </div>
                        <file-upload @filterChange="${this.fileUploaded}"></file-upload>
                    </div>
                </form>
            `;
        }

        return html`
            <div>
                <select class="form-control"  id="${this._prefix}" @change="${this.filterChange}"></select>
            </div>
        `;
    }

}

customElements.define("select-token-filter", SelectTokenFilter);
