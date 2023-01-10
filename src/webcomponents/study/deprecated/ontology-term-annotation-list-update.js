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
import "./ontology-term-annotation/ontology-term-annotation-create.js";
import "./ontology-term-annotation/ontology-term-annotation-update.js";

export default class OntologyTermAnnotationListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            ontologies: {
                type: Array
            },
            displayConfig: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (UtilsNew.isUndefined(this.ontologies)) {
            this.ontologies = [];
        }
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.ontology = {};
        this._manager = {
            action: "",
            ontology: ""
        };
    }

    onShowOntologyManager(e, manager) {
        this._manager = manager;
        if (manager.action === "ADD") {
            this.ontology = {};
        } else {
            this.ontology = this.ontologies[manager.indexItem];

        }
        this.requestUpdate();
        // $("#ontologyManagerModal"+ this._prefix).modal("show");
    }

    onActionOntology(e) {
        e.stopPropagation();
        if (this._manager.action === "ADD") {
            this.addOntology(e.detail.value);
        } else {
            this.editOntology(e.detail.value);
        }
        // $("#ontologyManagerModal" + this._prefix).modal("hide");
        this.requestUpdate();
    }

    addOntology(e) {
        this.ontologies = [...this.ontologies, e.detail.value];
        LitUtils.dispatchCustomEvent(this, "changeOntologies", this.ontologies);
    }

    editOntology(ontology) {
        const indexPheno = this.ontologies.findIndex(ontology => ontology.id === this.ontology.id);
        this.ontologies[indexPheno] = ontology;
        this.ontology = {};
        LitUtils.dispatchCustomEvent(this, "changeOntologies", this.ontologies);
        this.requestUpdate();
    }

    onRemoveOntology(e, i) {
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
                this.ontologies = UtilsNew.removeArrayByIndex(this.ontologies, i);
                LitUtils.dispatchCustomEvent(this, "changeOntologies", this.ontologies);
                Swal.fire(
                    "Deleted!",
                    "The item has been deleted.",
                    "success"
                );
            }
        });
    }

    onCloseForm(e) {
        e.stopPropagation();
        this.ontologies = {};
        // $("#ontologyManagerModal"+ this._prefix).modal("hide");
    }

    renderOntologies(ontologies) {
        return html`
            ${ontologies?.map((ontology, i) => html`
                <li>
                    <div class="row">
                        <div class="col-md-8">
                            <span style="margin-left:14px">${ontology.name} (${ontology.id})</span>
                        </div>
                        <div class="col-md-4">
                            <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                <button type="button" class="btn btn-primary btn-xs"
                                    @click="${e => this.onShowOntologyManager(e, {action: "EDIT", indexItem: i})}">Edit</button>
                                <button type="button" class="btn btn-danger btn-xs"
                                    @click="${e => this.onRemoveOntology(e, i)}">Delete</button>
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
                    ${this.renderOntologies(this.ontologies)}
                </ul>
                <!-- <button type="button" class="btn btn-primary btn-sm"
                    @click="${e => this.onShowOntologyManager(e, {action: "ADD"})}">
                    Add ${this.config?.title || "information"}
                </button> -->
            </div>
            <ontology-term-annotation-create
                .displayConfig="${this.displayConfig}"
                @closeForm=${e => this.onCloseForm(e)}
                @addItem=${this.addOntology}>
            </ontology-term-annotation-create>
        </div>


        <!-- <div id=${"ontologyManagerModal"+this._prefix} class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">${this.config?.title} Information</h4>
                    </div>
                    <div class="modal-body">
                        ${this._manager.action === "ADD" ? html`
                            <ontology-term-annotation-create
                                @closeForm=${e => this.onCloseForm(e)}
                                @addItem=${this.onActionOntology}
                            ></ontology-term-annotation-create>
                            ` : html `
                            <ontology-term-annotation-update
                                .phenotype=${this.ontology}
                                @closeForm=${e => this.onCloseForm(e)}
                                @addItem=${this.onActionOntology}>
                            </ontology-term-annotation-update>
                        `}
                    </div>
                </div>
            </div> -->
        </div>`;
    }

}

customElements.define("ontology-term-annotation-list-update", OntologyTermAnnotationListUpdate);
