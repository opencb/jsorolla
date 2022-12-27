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
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/text-field-filter.js";
import "./annotation-create.js";
import "./annotation-update.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class AnnotationSetUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            annotationSets: {
                type: Array
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (UtilsNew.isUndefined(this.annotationSets)) {
            this.annotationSets = [];
        }
    }


    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.annotationSet = {};
        this.isAddItem = false;
    }


    onShowManager(e, isAdd, data) {
        this.isAddItem = isAdd;
        if (isAdd) {
            this.annotationSet = {};
        } else {
            this.annotationSet = data;
        }
        this.requestUpdate();
        $("#annotationSetManagerModal" + this._prefix).modal("show");
    }

    onAction(e) {
        e.stopPropagation();
        if (this.isAddItem) {
            this.addAnnotationSet(e.detail.value);
        } else {
            this.updateAnnotationSet(e.detail.value);
        }
        this.requestUpdate();
        $("#annotationSetManagerModal" + this._prefix).modal("hide");
    }

    addAnnotationSet(annotationSet) {
        this.annotationSets = [...this.annotationSets, annotationSet];
        LitUtils.dispatchCustomEvent(this, "changeAnnotationSets", this.annotationSets);
    }

    updateAnnotationSet(annotationSet) {
        const index = this.annotationSets.findIndex(ann => ann.variableSetId === this.annotationSet.variableSetId);
        this.annotationSets[index] = annotationSet;
        this.annotationSet = {};
        LitUtils.dispatchCustomEvent(this, "changeAnnotationSets", this.annotationSets);
        this.requestUpdate();
    }

    onRemoveAnnotationSet(e, item) {
        e.stopPropagation();
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Remove annotation set",
            message: "Are you sure? You won't be able to revert this.",
            display: {
                okButtonText: "Yes, delete it!",
            },
            ok: () => {
                this.annotationSets = this.annotationSets.filter(annotationSet => annotationSet !== item);
                LitUtils.dispatchCustomEvent(this, "changeAnnotationSets", this.annotationSets);

                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The annotationSet has been deleted.",
                });
            },
        });
    }

    onCloseForm(e) {
        e.stopPropagation();
        this.annotationSet = {};
        $("#annotationSetManagerModal"+ this._prefix).modal("hide");
    }

    renderAnnotationsSets(annotationSets) {
        if (UtilsNew.isEmptyArray(annotationSets)) {
            return html `
                <div class="alert alert-info">
                    <strong>Empty</strong>, create a new annotation set..
                </div>`;
        }
        return html`
            ${annotationSets?.map(item => html`
                <li>
                    <div class="row">
                        <div class="col-md-8">
                            <span style="margin-left:14px">${item.variableSetId}</span>
                        </div>
                        <div class="col-md-4">
                            <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                <button type="button" class="btn btn-primary btn-xs"
                                    @click="${e => this.onShowManager(e, false, item)}">Edit</button>
                                <button type="button" class="btn btn-danger btn-xs"
                                    @click="${e => this.onRemoveAnnotationSet(e, item)}">Delete</button>
                            </div>
                        </div>
                    </div>
                </li>
            `)}
        `;
    }

    render() {
        return html`

        <style>
            /* Remove default bullets */
            ul, #myUL {
                list-style-type: none;
            }

            /* Remove margins and padding from the parent ul */
            #myUL {
                margin: 0;
                padding: 0;
            }
        </style>

        <div class="col-md-12" style="padding: 10px 20px">
            <div class="container" style="width:100%">
                <ul id="myUL">
                    ${this.renderAnnotationsSets(this.annotationSets)}
                </ul>
                <button type="button" class="btn btn-primary btn-sm"
                    @click="${e => this.onShowManager(e, true)}">
                    Add AnnotationSet
                </button>
            </div>
        </div>
        <div id=${"annotationSetManagerModal"+this._prefix} class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Annotation Set Information</h4>
                    </div>
                    <div class="modal-body">
                        ${this.isAddItem? html `
                            <annotation-create
                                .annotationSet="${this.annotationSet}"
                                .variableSetIdsSelected="${this.annotationSets?.map(item => item.variableSetId)}"
                                .opencgaSession="${this.opencgaSession}"
                                @closeForm="${e => this.onCloseForm(e)}"
                                @addItem="${this.onAction}">
                            </annotation-create>
                        `:html`
                            <annotation-update
                                .annotationSet="${this.annotationSet}"
                                .opencgaSession="${this.opencgaSession}"
                                @closeForm="${e => this.onCloseForm(e)}"
                                @addItem="${this.onAction}">
                            </annotation-update>`}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("annotation-set-update", AnnotationSetUpdate);
