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
import UtilsNew from "../../../utilsNew.js";
import "./phenotype-manager.js";

export default class PhenotypeListManager extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }


    static get properties() {
        return {
            phenotypes: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            readOnly: {
                type: Boolean
            },
            updateManager: {
                type: Boolean
            }
        };
    }


    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.isShow = false;
        this.phenotype = {};
        this._manager = {
            action: "",
            phenotype: ""
        };
        this.readOnly = false;
    }

    onShowPhenotypeManager(e, manager) {
        this._manager = manager;
        if (manager.action === "ADD") {
            this.phenotype = {};
        } else {
            this.phenotype = manager.phenotype;
            this.isShow = true;
        }
        this.requestUpdate();
        $("#phenotypeManagerModal"+ this._prefix).modal("show");
    }

    onActionPhenotype(e) {
        e.stopPropagation();
        if (this._manager.action === "ADD") {
            this._onAddPhenotype(e.detail.value);
        } else {
            this._onEditPhenotype(e.detail.value);
        }
        $("#phenotypeManagerModal" + this._prefix).modal("hide");
        this.requestUpdate();
    }

    _onAddPhenotype(phenotype) {
        this.isShow = false;
        this.phenotypes = [...this.phenotypes, phenotype];
        LitUtils.dispatchEventCustom(this, "changePhenotypes", this.phenotypes);
    }

    _onEditPhenotype(phenotype) {
        this.isShow = false;
        const indexPheno = this.phenotypes.findIndex(pheno => pheno.id === this.phenotype.id);
        this.phenotypes[indexPheno] = phenotype;
        this.phenotype = {};
        LitUtils.dispatchEventCustom(this, "changePhenotypes", this.phenotypes);
        this.requestUpdate();
    }


    onRemovePhenotype(e, item) {
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
                this.phenotypes = this.phenotypes.filter(pheno => pheno !== item);
                LitUtils.dispatchEventCustom(this, "changePhenotypes", this.phenotypes);
                Swal.fire(
                    "Deleted!",
                    "The phenotype has been deleted.",
                    "success"
                );
            }
        });
    }

    onCloseForm(e) {
        this.isShow = false;
        this.phenotype = {};
        $("#phenotypeManagerModal"+ this._prefix).modal("hide");
        e.stopPropagation();
    }

    renderPhenotypes(phenotypes) {
        return html`
            ${phenotypes?.map(item => html`
                    <li>
                        <div class="row">
                            <div class="col-md-8">
                                <span style="margin-left:14px">${item.name}</span>
                            </div>
                            <div class="col-md-4">
                                <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                    <button type="button" class="btn btn-primary btn-xs"
                                        @click="${e => this.onShowPhenotypeManager(e, {action: "EDIT", phenotype: item})}">Edit</button>
                                    <button type="button" class="btn btn-danger btn-xs"
                                        @click="${e => this.onRemovePhenotype(e, item)}">Delete</button>
                                </div>
                            </div>
                        </div>
                    </li>
            `)}
        `;
    }

    renderReadOnlyPhenotypes(phenotypes) {
        return html`
            ${phenotypes?.map(item => html`
                <li>
                    <div class="row">
                        <div class="col-md-8">
                            <span style="margin-left:14px">${item.name}</span>
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

        ${this.readOnly ?html `
            <div class="col-md-12" style="padding: 10px 20px">
                <div class="container" style="width:100%">
                    <ul id="myUL">
                        ${this.renderReadOnlyPhenotypes(this.phenotypes)}
                    </ul>
                </div>
            </div>
            `: html`
            <div class="col-md-12" style="padding: 10px 20px">
                <div class="container" style="width:100%">
                    <ul id="myUL">
                        ${this.renderPhenotypes(this.phenotypes)}
                    </ul>
                    ${!this.updateManager?html`
                        <button type="button" class="btn btn-primary btn-sm"
                            @click="${e => this.onShowPhenotypeManager(e, {action: "ADD"})}">
                            Add Phenotype
                        </button>`: ""}
                </div>
            </div>
            <div id=${"phenotypeManagerModal"+this._prefix} class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">Phenotype Information</h4>
                        </div>
                        <div class="modal-body">
                            <phenotype-manager
                                .phenotype="${this.phenotype}"
                                .updateManager="${this.updateManager}"
                                @closeForm="${e => this.onCloseForm(e)}"
                                @addItem="${this.onActionPhenotype}">
                            </phenotype-manager>
                        </div>
                    </div>
                </div>
            </div>`}`;
    }

}

customElements.define("phenotype-list-manager", PhenotypeListManager);
