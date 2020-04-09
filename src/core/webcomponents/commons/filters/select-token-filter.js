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
import Utils from "./../../../utils.js";


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
        this._prefix = "tk-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        $(".tokenize", this).tokenize2({
            placeholder: this.placeholder || "Start typing",
            tokensMaxItems: this._config.maxItems,
            dropdownMaxItems: 10,
            searchMinLength: this._config.searchMinLength,
            dataSource: (term, object) => {
                console.log(term, object, this._config);
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    // include: "id",
                    id: "^" + term.toUpperCase()
                };
                this.client().search(filters).then( restResponse => {
                    const results = restResponse.getResults();
                    object.trigger("tokenize:dropdown:fill", [results.map( result => ({text: result.id, value: result.id}))]);
                });
            }
        });
        $(".tokenize", this).on("tokenize:tokens:added", (e, value, text) => {
            console.log("added", e, value, text);
            console.log("added list", $(e.target).val());
            this.filterChange(e);
        });
        $(".tokenize", this).on("tokenize:tokens:remove", (e, value) => {
            console.log("removed", e, value);
            console.log("removed list", $(e.target).val());
            this.filterChange(e);
        });
    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this.propertyObserver();
        }
        if (_changedProperties.has("value")) {
            if (this.value) {
                if (this.value.split(",").length) {
                    //$(".tokenize", this).tokenize2().trigger("tokenize:clear");
                    console.log("changing")
                    this.silentClear()
                    this.value.split(",").forEach( v => $(".tokenize", this).tokenize2().trigger("tokenize:tokens:add", [v, v, true]));
                }
            } else {
                $(".tokenize", this).tokenize2().trigger("tokenize:clear");
            }
        }

    }

    filterChange(e) {
        const selection = $(e.target).val();
        let val;
        if (selection && selection.length) {
            // val = this.multiple ? selection.join(",") : selection[0];
            val = selection.join(",");
        }
        this.value = val ? val : null; // this allow users to get the selected values using DOMElement.value
        // console.log("select filterChange", val);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(event);
    }

    client() {
        switch (this.resource) {
            case "files":
                return this.opencgaSession.opencgaClient.files();
            case "samples":
                return this.opencgaSession.opencgaClient.samples();
            case "individuals":
                return this.opencgaSession.opencgaClient.individuals();
            case "cohort":
                return this.opencgaSession.opencgaClient.cohorts();
            case "family":
                return this.opencgaSession.opencgaClient.families();
            case "clinical-analysis":
                return this.opencgaSession.opencgaClient.clinical();
            case "jobs":
                return this.opencgaSession.opencgaClient.jobs();
            default:
                console.error("Resource not recognized");
        }
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    readFile(event) {
        //console.log(event);
        const input = event.target;
        const reader = new FileReader();
        reader.readAsText(input.files[0]);
        reader.onload = function() {
            const dataURL = reader.result;
            console.log(dataURL);
        };
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

    // it silently clear the input field without triggering  tokenize:tokens:remove which fire the filterChange
    silentClear(){
        //$("select.tokenize").empty()
        $(".tokens-container li.token").remove();
        $(".tokens-container li.placeholder").show();

    }

    render() {
        return html`
            <style>
                .dropdown-item-extra {
                    font-size: .8em;
                }
                
                .dropdown-item-extra label {
                    width: 50%;
                }
                
                .selection-list ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                
                .selection-list {
                    border: #d0d0d0 solid 1px;
                    padding: 5px;
                    margin-top: 10px;
                }
                
                .dropzone-wrapper {
                    border: 2px dashed #91b0b3;
                    color: #92b0b3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100px;
                    position: relative;
                    cursor: pointer;
                }
                
                .dropzone-desc {
                    margin: 0 auto;
                    text-align: center;
                }
                
                .dropzone,
                .dropzone:focus {
                    position: absolute;
                    outline: none !important;
                    width: 100%;
                    height: 100px;
                    cursor: pointer;
                    opacity: 0;
                }
                
                .dropzone-wrapper:hover,
                .dropzone-wrapper.dragover {
                    background: #ecf0f5;
                }
            </style>

        <form action="" method="POST" enctype="multipart/form-data">
            <div class="form-group">
            <label class="control-label">Upload File</label>
            <div class="dropzone-wrapper" @change="${this.readFile}" @dragover="${this.onDragOver}" @dragleave="${this.onDragLeave}">
              <div class="dropzone-desc">
                <i class="glyphicon glyphicon-download-alt"></i>
                <div>Choose an text file or drag it here.</div>
              </div>
              <input type="file" class="dropzone" />
            </div>
            </div>
        </form>

        <button @click="${this.click}"> click</button>
        <div class="subsection-content">
            <select class="tokenize" multiple></select>
        </div>
        `;
    }

}

customElements.define("select-token-filter", SelectTokenFilter);
