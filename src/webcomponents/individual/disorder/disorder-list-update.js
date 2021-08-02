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


import {LitElement, html} from "/web_modules/lit-element.js";
import "../../commons/filters/text-field-filter.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import "./disorder-manager.js";

export default class DisorderListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }


    static get properties() {
        return {
            disorders: {
                type: Array
            },
            evidences: {
                type: Array
            },
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (UtilsNew.isUndefined(this.disorders)) {
            this.disorders = [];
        }

        if (UtilsNew.isUndefined(this.evidences)) {
            this.evidences = [];
        }
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.disorder = {};
        this._manager = {
            action: "",
            disorder: ""
        };
    }

    onShowDisorderManager(e, manager) {
        if (UtilsNew.isEmptyArray(this.evidences)) {
            return Swal.fire(
                "Message",
                "You must create phenotype first!",
                "warning"
            );
        }

        this._manager = manager;
        if (manager.action === "ADD") {
            this.disorder = {};
        } else {
            this.disorder = manager.disorder;
        }
        this.requestUpdate();
        $("#disorderManagerModal"+ this._prefix).modal("show");
    }

    onActionDisorder(e) {
        e.stopPropagation();
        if (this._manager.action === "ADD") {
            // TODO: rename addEvidenceAsObject
            const disorder = this.addEvidencesAsObject(e.detail.value);
            this.addDisorder(disorder);
        } else {
            this.editDisorders(e.detail.value);
        }
        $("#disorderManagerModal" + this._prefix).modal("hide");
        this.requestUpdate();
    }

    addEvidencesAsObject(oldDisorder) {
        const disorder = oldDisorder;
        const evidencesIds = oldDisorder.evidences.split(",");
        const evidences = evidencesIds.map(evidenceId => this.evidences.find(evidence => evidence.id === evidenceId));
        disorder.evidences = evidences;
        return disorder;
    }

    addDisorder(disorder) {
        console.log("AddDiosrder with evidences object", disorder);
        this.disorders = [...this.disorders, disorder];
        LitUtils.dispatchEventCustom(this, "changeDisorders", this.disorders);
    }

    editDisorders(disorder) {
        const indexItem = this.disorders.findIndex(item => item.id === this.disorder.id);
        this.disorders[indexItem] = disorder;
        this.disorder = {};
        LitUtils.dispatchEventCustom(this, "changeDisorders", this.disorders);
        this.requestUpdate();
    }

    onRemoveDisorder(e, item) {
        e.stopPropagation();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            reverseButtons: true
        }).then(result => {
            if (result.isConfirmed) {
                this.disorders = this.disorders.filter(pheno => pheno !== item);
                LitUtils.dispatchEventCustom(this, "changeDisorders", this.disorders);
                Swal.fire(
                    "Deleted!",
                    "The disorder has been deleted.",
                    "success"
                );
            }
        });
    }

    onCloseForm(e) {
        e.stopPropagation();
        this.disorder = {};
        $("#disorderManagerModal"+ this._prefix).modal("hide");
    }

    renderItems(disorders) {
        return html`
            ${disorders?.map(item => html`
                    <li>
                        <div class="row">
                            <div class="col-md-8">
                                <span style="margin-left:14px">${item.description}</span>
                            </div>
                            <div class="col-md-4">
                                <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                    <button type="button" class="btn btn-primary btn-xs"
                                        @click="${e => this.onShowDisorderManager(e, {action: "EDIT", disorder: item})}">Edit</button>
                                    <button type="button" class="btn btn-danger btn-xs"
                                        @click="${e => this.onRemoveDisorder(e, item)}">Delete</button>
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
                    ${this.renderItems(this.disorders)}
                </ul>
                <button type="button" class="btn btn-primary btn-sm"
                    @click="${e => this.onShowDisorderManager(e, {action: "ADD"})}">
                    Add Disorder
                </button>
            </div>
        </div>

        <div id=${"disorderManagerModal"+this._prefix} class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Disorder Information</h4>
                    </div>
                    <div class="modal-body">
                        <disorder-manager
                            .disorder="${this.disorder}"
                            .evidences="${this.evidences}"
                            @closeForm="${e => this.onCloseForm(e)}"
                            @addItem="${this.onActionDisorder}">
                        </disorder-manager>
                    </div>
                </div>
            </div>
        </div>
            `;
    }

}

customElements.define("disorder-list-update", DisorderListUpdate);
