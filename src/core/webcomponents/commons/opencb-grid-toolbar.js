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

import {LitElement, html} from '/web_modules/lit-element.js';
import {checkBoxContainer} from "/src/styles/styles.js"

export default class OpencbGridToolbar extends LitElement {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            from: {
                type: String
            },
            to: {
                type: String
            },
            numTotalResultsText: {
                type: String
            },
            config: {
                type: Object
            },
            _prefix: {
                type:String
            }
            /*_config: {
                type: Object
            },*/
        }
    }

    createRenderRoot() {
        return this;
    }

    _init() {
        this._prefix = "dialog" + Utils.randomString(6);
        this._config = this.getDefaultConfig();
        this.numTotalResultsText = "0"
    }

    updated(changedProperties) {
        console.log("changedProperties");
        console.log(changedProperties); // logs previous values
        if(changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate(); //NOTE to avoid _config as prop!
        }
    }

    onDownloadFile(e) {
        console.log("onDownloadFile")
        this.dispatchEvent(new CustomEvent('download', {
            detail: {
                option: e.target.dataset.downloadOption
            }, bubbles: true, composed: true
        }));
    }

    checkboxToggle(e) {
        // We undo the checkbox action. We will toggle it on a different event
        e.currentTarget.checked = !e.currentTarget.checked;
    }

    onColumnClick(e) {
        // Toggle the checkbox
        e.currentTarget.firstElementChild.checked = !e.currentTarget.firstElementChild.checked;
        this.dispatchEvent(new CustomEvent('columnchange', {
            detail: {
                id: e.currentTarget.dataset.columnId,
                selected: e.currentTarget.firstElementChild.checked
            }, bubbles: true, composed: true
        }));

        // We do this call to avoid the dropdown to be closed after the click
        e.stopPropagation();
    }

    onShareLink(e) {
        this.dispatchEvent(new CustomEvent('sharelink', {
            detail: {
            }, bubbles: true, composed: true
        }));
    }

    isTrue(value) {
        return UtilsNew.isUndefinedOrNull(value) || value;
    }

    getDefaultConfig() {
        return {
            label: "records",
            columns: [], // [{field: "blabla", title: "Blabla", visible: true, eligible: true}]
            download: ["Tab", "JSON"],
            showShareLink: false
        };
    }

    render(){
        return html`
        <style>
            ${checkBoxContainer}
        </style>
        <div class="col-md-12" style="padding: 5px 0px 0px 0px">
            <div id="${this._prefix}ToolbarLeft" class="col-md-6" style="padding: 15px 0px 0px 0px">
                <span style="padding: 0px">
                    new toolbar - Showing <label>${this.from}-${this.to}</label> of <label>${this.numTotalResultsText}</label> ${this._config.label}
                </span>
            </div>

            <div id="${this._prefix}toolbar" class="col-md-6" style="padding: 0px">

                <div class="form-inline" style="padding: 0px; float: right">

                    ${this.config.columns.length ? html`
                        <div class="btn-group">
                            <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i id="${this._prefix}ColumnIcon" class="fa fa-columns" aria-hidden="true" style="padding-right: 5px"></i> Columns <span class="caret"></span>
                            </button>
                            <div class="dropdown-menu btn-sm checkbox-container">
                                
                                            <a>
                                                <input type="checkbox" />
                                                <span class="checkmark-label">aaa</span>
                                                <span class="checkmark"></span>
                                            </a>
                            </div>
                            
                            <ul class="dropdown-menu btn-sm checkbox-container">
                                ${this._config.columns.length ?
                                    this._config.columns.map(item => this.isTrue(item.eligible) ? html`
                                        <li>
                                            <a data-column-id="${item.field}" @click="${this.onColumnClick}" style="cursor: pointer;">
                                                <input type="checkbox" @click="${this.checkboxToggle}" ?checked="${this.isTrue(item.visible)}"/>
                                                <span class="checkmark-label">${item.title}</span>
                                                <span class="checkmark"></span>
                                            </a>
                                        </li>` : null)
                                : null}
                            </ul>
                        </div>`
                    : null }

                    <div class="btn-group">
                        <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i id="${this._prefix}DownloadRefresh" class="fa fa-refresh fa-spin" aria-hidden="true" style="font-size:14px;display: none"></i>
                            <i id="${this._prefix}DownloadIcon" class="fa fa-download" aria-hidden="true" style="padding-right: 5px"></i> Download <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu btn-sm">
                            ${this._config.download.length && this._config.download.map(item => html`
                                <li><a data-download-option="${item}" @click="${this.onDownloadFile}">${item}</a></li>
`                           )}
                        </ul>
                    </div>

                    <!--Share URL-->
                    ${this.showShareLink ? html`
                        <button type="button" class="btn btn-default btn-sm" data-toggle="popover" data-placement="bottom" @click="onShareLink">
                            <i class="fa fa-share-alt" aria-hidden="true" style="padding-right: 5px"></i> Share
                        </button>
                        ` : null }
                </div>
            </div>
        </div>`;
    }

}
customElements.define("opencb-grid-toolbar", OpencbGridToolbar);