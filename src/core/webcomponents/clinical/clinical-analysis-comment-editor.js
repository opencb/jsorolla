/*
 * Copyright 2015-2016 OpenCB
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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";

class ClinicalAnalysisCommentEditor extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            comments: {
                type: Array
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
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            // this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            edit: true,
            add: true
        };
    }

    render() {
        // if (!this.comments) {
        //     return html`
        //         <div>
        //             <h3><i class="fas fa-lock"></i> No available comments</h3>
        //         </div>`;
        // }

        return html`
            ${this.comments?.map(comment => html`
                <div style="border-left: 2px solid #0c2f4c; margin: 15px 0px">
                    <div style="margin: 5px 10px">
                        <span style="font-weight: bold">${comment.author}</span>
                        <span style="color: darkgrey; margin: 0px 10px">${UtilsNew.dateFormatter(comment.date)}</span>
                        <div style="float: right">
                            ${comment.tags && comment.tags.includes("example") 
                                ? html`<span style="color: darkgoldenrod"><i class="fas fa-star"></i></span>`
                                : html`<span><i class="far fa-star"></i></span>`
                            }
                        </div>
                    </div>
                    <div style="margin: 5px 10px">
                        <div style="margin: 10px 0px">${comment.message}</div>
                        <div style="margin: 10px 0px">${comment.tags && comment.tags.map(tag => html`
                                <span class="label label-info" style="font-size: 95%">${tag}</span>`
                            )}
                        </div>
                    </div>
                    <div style="margin: 5px 10px">
                        <span>
                            <a style="color: darkgrey; cursor: pointer">Edit</a>
                        </span>
                        <span> - </span>
                        <span>
                            <a style="color: darkgrey; cursor: pointer">Delete</a>
                        </span>
                    </div>
                </div>
            `)}
            
            ${this._config.add 
                ? html`
                    <div style="border-left: 2px solid #0c2f4c; margin: 15px 0px">
                        <div style="margin: 5px 10px">
                            <span style="font-weight: bold">New comment</span>
                        </div>
                        <div style="margin: 5px 10px">
                            <text-field-filter placeholder="Add comment..." .rows=${2} @filterChange="${e => this.onFilterChange(e)}"></text-field-filter>
                        </div>
                        <div style="margin: 5px 10px">
                            <text-field-filter placeholder="Add tags..." .rows=${1} @filterChange="${e => this.onFilterChange(e)}"></text-field-filter>
                        </div>
                        <div style="margin: 5px 10px; float: right">
                            <span>
                                <button type="button" class="btn btn-default">Cancel</button>
                            </span>
                            <span>
                                <button type="button" class="btn btn-primary">Add</button>
                            </span>
                        </div>
                    </div>` 
                : null
            }
        `;
    }
}

customElements.define("clinical-analysis-comment-editor", ClinicalAnalysisCommentEditor);
