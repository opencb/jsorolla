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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "./../../core/utilsNew.js";
import "./opencga-export.js";
import LitUtils from "./utils/lit-utils";

export default class OpencbGridToolbar extends LitElement {

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
            rightToolbar: {
                type: Array
            },
            query: {
                type: Object
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


    update(changedProperties) {
        /* if (changedProperties.has("query")) {
        }*/
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    onDownloadFile(e) {
        this.dispatchEvent(new CustomEvent("download", {
            detail: {
                option: e.target.dataset.downloadOption
            }
        }));
    }

    // not used as changes to exportFields is not propagated outside opencga-export anymore (exportFields is now sent on click on download button via `export` event)
    onChangeExportField(e) {
        // simply forwarding from opencga-export to grid components
        LitUtils.dispatchCustomEvent(this, "changeExportField", e.detail, {});
    }

    onExport(e) {
        // simply forwarding from opencga-export to grid components
        this.dispatchEvent(new CustomEvent("export", {
            detail: {
                ...e.detail
            }
        }));
    }

    checkboxToggle(e) {
        // We undo the checkbox action. We will toggle it on a different event
        e.currentTarget.checked = !e.currentTarget.checked;
    }

    onColumnClick(e) {
        // We do this call to avoid the dropdown to be closed after the click
        e.stopPropagation();

        // Toggle the checkbox
        e.currentTarget.firstElementChild.checked = !e.currentTarget.firstElementChild.checked;
        this.dispatchEvent(new CustomEvent("columnChange", {
            detail: {
                id: e.currentTarget.dataset.columnId,
                selected: e.currentTarget.firstElementChild.checked
            }, bubbles: true, composed: true
        }));

    }

    onShareLink() {
        this.dispatchEvent(new CustomEvent("sharelink", {
            detail: {
            }, bubbles: true, composed: true
        }));
    }

    isTrue(value) {
        return UtilsNew.isUndefinedOrNull(value) || value;
    }

    openModal() {
        $(`#${this._prefix}export-modal`, this).modal("show");
    }

    render() {
        const rightButtons = [];
        if (this.rightToolbar && this.rightToolbar.length > 0) {
            for (const rightButton of this.rightToolbar) {
                rightButtons.push(rightButton.render());
            }
        }

        return html`
            <style>
                .opencb-grid-toolbar .checkbox-container label:before {
                    margin-top: 5px;
                }
                .opencb-grid-toolbar {
                    margin-bottom: ${~this._config.buttons.indexOf("new") ? 10 : 5}px;
                }
            </style>

            <div class="opencb-grid-toolbar">
                <div class="row">
                    <div id="${this._prefix}ToolbarLeft" class="col-md-6">
                        ${this._config.showCreate &&
                        (!this.opencgaSession || (this.opencgaSession && OpencgaCatalogUtils.checkPermissions(this.opencgaSession?.study, this.opencgaSession?.user?.id, "WRITE_CLINICAL_ANALYSIS"))) ? html`
                            <a type="button" class="btn btn-default btn-sm text-black" href="${this._config.newButtonLink}">
                                <i id="${this._prefix}ColumnIcon" class="fa fa-columns icon-padding" aria-hidden="true"></i> New </span>
                            </a>
                        ` : null}
                    </div>
                    <div id="${this._prefix}toolbar" class="col-md-6">
                        <div class="form-inline text-right pull-right">
                            ${this._config.showColumns && this._config.columns.length ? html`
                                <div class="btn-group columns-toggle-wrapper">
                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i id="${this._prefix}ColumnIcon" class="fa fa-columns icon-padding" aria-hidden="true"></i> Columns <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu btn-sm checkbox-container">
                                        ${this._config.columns.length ?
                                            this._config.columns.filter(item => item.eligible ?? true).map(item => html`
                                                <li>
                                                    <a data-column-id="${item.field}" @click="${this.onColumnClick}" style="cursor: pointer;">
                                                        <input type="checkbox" @click="${this.checkboxToggle}" .checked="${this.isTrue(item.visible)}"/>
                                                        <label class="checkmark-label">${item.columnTitle || item.title}</label>
                                                    </a>
                                                </li>`) :
                                            null}
                                    </ul>
                                </div>
                            ` : null
                            }

                            ${this._config.showDownload ? html`
                                <div class="btn-group">
                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"
                                            aria-haspopup="true" aria-expanded="false">
                                        ${this.config?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                                        <i id="${this._prefix}DownloadIcon" class="fa fa-download icon-padding" aria-hidden="true"></i> Download <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu btn-sm">
                                        ${this._config.download.length ? this._config.download.map(item => html`
                                            <li><a href="javascript:;" data-download-option="${item}" @click="${this.onDownloadFile}">${item}</a></li>
                                        `) : null}
                                    </ul>
                                </div>
                            ` : null
                            }

                            ${this._config.showExport ? html`
                                <div class="btn-group">
                                    <button type="button" class="btn btn-default btn-sm" @click="${this.openModal}">
                                        ${this.config?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                                        <i class="fa fa-download icon-padding" aria-hidden="true"></i> Export
                                    </button>
                                </div>
                            ` : null}


                            <!--Share URL-->
                            ${this._config.showShareLink ? html`
                                <button type="button" class="btn btn-default btn-sm" data-toggle="popover" data-placement="bottom" @click="${this.onShareLink}">
                                    <i class="fa fa-share-alt icon-padding" aria-hidden="true"></i> Share
                                </button>
                            ` : null
                            }

                            ${rightButtons && rightButtons.length > 0 ? rightButtons.map(rightButton => html`
                                <div class="btn-group">
                                        ${rightButton}
                                </div>`
                                ) : null
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" tabindex="-1" id="${this._prefix}export-modal" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        ${this._config.downloading ? html`<div class="overlay"><loading-spinner></loading-spinner></div>` : null}
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">Export</h4>
                        </div>
                        <div class="modal-body">
                            <opencga-export .config="${this._config}" .query=${this.query} .opencgaSession="${this.opencgaSession}" @export="${this.onExport}" @changeExportField="${this.onChangeExportField}"></opencga-export>
                        </div>
                    </div>
                </div>
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            label: "records",
            columns: [], // [{field: "fieldname", title: "title", visible: true, eligible: true}]
            download: ["Tab", "JSON"],
            showShareLink: false,
            buttons: ["columns", "download"],
            rightToolbar: {
                // render
            }
        };
    }

}
customElements.define("opencb-grid-toolbar", OpencbGridToolbar);
