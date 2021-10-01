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
import "../../commons/forms/text-field-filter.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import DetailTabs from "../../commons/view/detail-tabs.js";

export default class ClinicalListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            items: {
                type: Array
            },
            tabs: {
                type: Boolean
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.tabs) {
            this._config = {...this.getDefaultConfig()};
        }

        if (UtilsNew.isUndefined(this.items)) {
            this.items = [];
        }
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    onShowPhenotypeManager(e, manager) {
        this._manager = manager;
        if (manager.action === "ADD") {
            this.phenotype = {};
        } else {
            this.phenotype = manager.phenotype;
        }
        this.requestUpdate();
        $("#phenotypeManagerModal"+ this._prefix).modal("show");
    }

    onActionPhenotype(e) {
        e.stopPropagation();
        if (this._manager.action === "ADD") {
            this.addPhenotype(e.detail.value);
        } else {
            this.editPhenotype(e.detail.value);
        }
        $("#phenotypeManagerModal" + this._prefix).modal("hide");
        this.requestUpdate();
    }

    addPhenotype(phenotype) {
        this.phenotypes = [...this.phenotypes, phenotype];
        LitUtils.dispatchEventCustom(this, "changePhenotypes", this.phenotypes);
    }

    editPhenotype(phenotype) {
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
        e.stopPropagation();
        this.phenotype = {};
        $("#phenotypeManagerModal"+ this._prefix).modal("hide");
    }

    renderConfig(itemConfigs) {
        return html`
            ${itemConfigs?.map(item => html`
                <div class="list-group-item">
                    <div class="row">
                        <div class="col-md-8">
                            <div style="padding-bottom:2px">
                                <b>${item.id}</b>
                                <p class="text-muted">${item.description}</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                <button type="button" class="btn btn-primary btn-xs">Edit</button>
                                <button type="button" class="btn btn-danger btn-xs">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `)}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                contentStyle: "",
            },
            items: Object.keys(this.items).map(key => {
                return {
                    id: key,
                    name: key,
                    render: () => {
                        return html`
                            <div class="col-md-6">
                                <div class="list-group">
                                ${this.renderConfig(this.items[key])}
                                    <button type="button" style="margin-top:6px" class="btn btn-primary btn-sm">
                                        Add
                                    </button>
                                </div>
                            </div>`;
                    }
                };
            })
        };
    }

    render() {
        return html`
            ${this.tabs ? html `
                <detail-tabs
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_VERTICAL_MODE}">
                </detail-tabs>`:
                html `
                ${this.renderConfig(this.items)}
                <button type="button" style="margin-top:6px" class="btn btn-primary btn-sm">
                    Add
                </button>
                `}
            `;
    }

}

customElements.define("clinical-list-update", ClinicalListUpdate);
