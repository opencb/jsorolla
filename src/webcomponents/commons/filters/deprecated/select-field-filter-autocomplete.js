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
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../../../core/utils-new.js";

/**
 * @deprecated
 * Bootstrap3-typeahead autocomplete
 * Use select-token-filter instead.
 *
 * TODO DONE extract FileReader upload logic to a new component
 */

export default class SelectFieldFilterAutocomplete extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            /* opencgaSession: {
                type: Object
            },*/
            value: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sff-" + UtilsNew.randomString(6) + "_";
        this.selectionList = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated() {
        this.input = $(".typeahead", this);

        // MAP result => ({name: result.id, individual: result.attributes && result.attributes.OPENCGA_INDIVIDUAL ? result.attributes.OPENCGA_INDIVIDUAL.id : ""})
        this.input.typeahead({
            source: this._config.dataSource,
            // showHintOnFocus: true,
            /* source: (query, process) => {
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    ...this._config.query,
                    // include: "id,individual.id",
                    [this._config.searchOn || "id"]: "~^" + query.toUpperCase()
                };
                this.client().search(filters).then(restResponse => {
                    const results = restResponse.getResults();
                    console.log("results", results);
                    //process(results.map(result => ({name: result.id, individual: result.attributes && result.attributes.OPENCGA_INDIVIDUAL ? result.attributes.OPENCGA_INDIVIDUAL.id : ""})));
                    //process(results);
                    process(results.map(this._config.fields));
                });
            },*/
            minLength: this._config.searchMinLength,
            autoSelect: true,
            displayText: item => {
                const {name, ...rest} = item;
                return name + (rest ? Object.entries(rest).map(([label, value]) => `<p class="dropdown-item-extra"><label>${label}</label> ${value || "-"}</p>`).join("") : "");
            },
            highlighter: Object,
            afterSelect: item => {
                console.log("afterSelect input");
                // this.input.val(item.name).change();
            }
        });
        this.input.on("change", () => {
            const current = this.input.typeahead("getActive");
            if (current) {
                if (current.name === this.input.val()) {
                    // This means the exact match is found. Use toLowerCase() if you want case insensitive match.

                    // simple mode: no add button
                    if (!this._config.addButton) {
                        console.log("addButton");
                        this.addTerm();
                    }

                    // this.selection = this.input.val();
                    // this.filterChange();
                } else {
                    // This means it is only a partial match, you can either add a new item
                    // or take the active if you don't want new items
                    console.log("partial match", this.input.val());
                }
            } else {
                // Nothing is active so it is a new value (or maybe empty value)
                console.log("NO match", this.input.val());
            }
            // this.addTerm();
        });
        this.input.on("keypress", e => {
            if (e.which === 13) {
                this.addTerm();
            }
        });
    }

    updated(_changedProperties) {
        if (_changedProperties.has("disabled")) {
            $(".typeahead", this).attr("disabled", this.disabled);
        }
        if (_changedProperties.has("value")) {
            this.selectionList = this.value ? this.value.split(",") : [];
            if (!this._config.multiple) {
                this.input.val(this.value).change();
            }

            this.requestUpdate();
        }
    }

    filterChange() {
        this.value = this.selectionList.length ? this.selectionList.join(",") : null; // this allows the users to get the selected values using DOMElement.value
        console.log("select filterChange", this.value);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(event);
    }

    addTerm() {
        console.log("searching addTerm");
        if (this.input.val()) {
            if (this._config.multiple) {
                const selection = [...this.selectionList, ...this.input.val().split(new RegExp("[,;]")).filter(Boolean)];
                // selection without addButton (straight in the dropdown) in selectpicker causes duplicates
                this.selectionList = [...new Set(selection)];
                this.input.val("").change();
            } else {
                // single item
                this.selectionList = this.input.val().split(new RegExp("[,;]")).filter(Boolean);
            }
            this.filterChange();
            // this.requestUpdate();
        }
    }

    toggleList() {
        this.showAll = !this.showAll;
        this.requestUpdate();
    }

    readFile(e) {
        const reader = new FileReader();
        reader.onload = () => {
            const plain = reader.result;
            // it handles split on ",", ";", "CR", "LF" and "CRLF"
            this.selectionList.push(plain.split(/\r\n|\r|\n|,|;/).filter(Boolean));
            $("#file-form").collapse("toggle");
            this.filterChange();
        };
        reader.readAsText(e.target.files[0] /* || e.dataTransfer.files[0]*/);
    }

    onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).addClass("dragover");
    }

    onDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).removeClass("dragover");
    }

    remove(e) {
        const term = e.currentTarget.dataset.term;
        this.selectionList.splice(this.selectionList.indexOf(term), 1);
        this.filterChange();
        this.requestUpdate();
    }

    toggleCollapse(e) {
        $(e.currentTarget.dataset.collapse).collapse("toggle");
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 1,
            // maxItems: 0,
            limitToShow: 3,
            fileUpload: false,
            showList: false,
            addButton: true,
            multiple: true,
            fields: item => ({name: item.id}),
            dataSource: (query, process) => {
                throw new Error("dataSource not defined");
            }
        };
    }

    render() {
        return html`
            <div class="select-field-filter-autocomplete">
                <form autocomplete="off" action="javascript:void 0">
                    <div class="${classMap({"input-group": this._config.addButton})}">
                        <input name="sample" type="text" class="form-control typeahead" data-provide="typeahead" autocomplete="off" placeholder="${this._config.placeholder || "Start typing"}" />
                        ${this._config.addButton ? html`<span class="input-group-addon" @click="${this.addTerm}"><i class="fas fa-plus"></i></span>` : null}
                        ${this._config.fileUpload ? html`<span class="input-group-addon separator"></span>
                        <span class="input-group-addon" data-collapse="#${this._prefix}file-form" @click="${this.toggleCollapse}"><i class="fas fa-upload"></i></span>` : ""}
                    </div>
                </form>

                ${this._config.fileUpload ? html`
                    <!-- <a class="btn btn-small collapsed" role="button" data-collapse="#file-form" @click="\${this.toggleCollapse}"> <i class="fas fa-arrow-alt-circle-down"></i> Upload file</a> -->
                    <div class="collapse" id="${this._prefix}file-form">
                        <div class="">
                            <div class="">
                                <form action="" method="POST" enctype="multipart/form-data">
                                    <div class="form-group">
                                        <div class="dropzone-wrapper" @change="${this.readFile}" @drop="${this.readFile}" @dragover="${this.onDragOver}" @dragleave="${this.onDragLeave}">
                                            <div class="dropzone-desc">
                                                <i class="fa-solid fa-upload"></i>
                                                <div>Choose an text file or drag it here.</div>
                                            </div>
                                            <input type="file" class="dropzone" />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ` : null}

                ${this._config.showList && this.selectionList.length ? html`
                    <div class="selection-list">
                        <ul>
                            ${this.selectionList.slice(0, this._config.limitToShow).map(term => html`
                                <li><span class="badge break-spaces">${term} <span class="close-icon" data-term=${term} @click="${this.remove}"><i class="fas fa-times"></i></span></span></li>
                            `)}
                            ${this.showAll ? this.selectionList.slice(this._config.limitToShow).map(term => html`
                                <li><span class="badge break-spaces">${term} <span class="close-icon" @click="${this.remove}"><i class="fas fa-times"></i></span></span></li>
                            `) : ""}
                        </ul>
                        ${this.selectionList.length > this._config.limitToShow ? html`<button class="btn btn-small ripple" type="button" @click="${this.toggleList}">Show ${this.showAll ? "less" : "all"}</button>` : ""}
                    </div>` : null}
            </div>
        `;
    }

}

customElements.define("select-field-filter-autocomplete", SelectFieldFilterAutocomplete);
