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
import UtilsNew from "./../../core/utilsNew.js";
import LitUtils from "./utils/lit-utils.js";
import NotificationUtils from "./utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import "./forms/select-token-filter";
import "../commons/filters/ontology-autocomplete-filter.js";


export default class VariantModalOntology extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            },
            selectedTerms: {
                type: String
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.ontologyConfig = {
            root: "https://ws.zettagenomics.com/cellbase/webservices/rest/v5/hsapiens/feature/ontology",
            tree: {
                "HP": [
                    "HP:0012823",
                    "HP:0040279",
                    "HP:0000005",
                    "HP:0040006",
                    "HP:0000118",
                ],
                "GO": [
                    "GO:0008150",
                    "GO:0005575",
                    "GO:0003674"
                ],
            },
            search: "/search",
        };
        this.rootTree = {text: "All", nodes: [], selectable: false};
        this.selectedTerms = null;
    }


    update(changedProperties) {
        if (changedProperties.has("selectedTerms")) {
            // selectedTerm observer to handle subsequent reopening of the modal after a first selection
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.ontologyFilterObserver();
        }
        super.update(changedProperties);
    }

    ontologyFilterObserver() {
        this.loadTermsTree();
    }

    updateTerms(e) {
        this.selectedTerms = e.detail.value;
        this.onFilterChange();
    }

    addTerm(ontologyId) {
        if (ontologyId) {
            const elms = this.selectedTerms ? this.selectedTerms.split(",") : [];
            const arr = [...new Set([...elms, ontologyId])];
            this.selectedTerms = arr.join(",");
        }
        this.onFilterChange();
    }

    onFilterChange() {
        LitUtils.dispatchCustomEvent(this, "filterChange", this.selectedTerms);
    }

    #getGoTerm(goTerm) {
        return this.ontologyConfig.root + this.ontologyConfig.search + "?id=" + goTerm + "&sort=name&order=ASCENDING&skip=0&limit=10";
    }

    #getOntologies(results, child) {
        return results.map((result, index) => {
            const hasChildren = UtilsNew.isNotEmptyArray(result?.children);
            return {
                name: result.name,
                description: result.description,
                comment: result.comment,
                synonyms: result?.synonyms,
                has_children: hasChildren,
                children_count: hasChildren ? result.children.length : 0,
                children: hasChildren ? this.#getGoTerm(result.children): "",
                nodes: hasChildren ? [] : null,
                obo_id: result.id,
                depth: !child? 0: child?.depth + 1,
                path: !child ? index : "000",
                selectable: true,
                state: {expanded: false},
            };
        });
    }

    async loadTermsTree() {
        const defaultsNodes = this.ontologyConfig.tree[this._config.ontologyFilter];
        if (UtilsNew.isNotEmptyArray(defaultsNodes)) {
            try {
                const fetchOntology = await fetch(this.#getGoTerm(defaultsNodes.join(",")));
                const ontologyTerms = await fetchOntology.json();
                const results = ontologyTerms.responses[0].results;
                this.rootTree.nodes = [...this.#getOntologies(results, false)];
                this.requestUpdate();
            } catch (e) {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            }
        }
    }

    async toggleNode(node) {
        node.state.expanded = !node.state.expanded;
        this.rootTree = {...this.rootTree};
        // this.requestUpdate(); Not necessary
        if (UtilsNew.isEmpty(node.nodes)) {
            node.state.loading = true;
            this.rootTree = {...this.rootTree};
            try {
                const fetchOntologyChildren = await fetch(node.children);
                const ontologyChildren = await fetchOntologyChildren.json();
                const results = ontologyChildren.responses[0].results;
                node.nodes = [...this.#getOntologies(results, node)];
                node.state.loading = false;
                this.rootTree = {...this.rootTree};
                this.requestUpdate();
            } catch (e) {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            }
        }
    }

    selectItem(node) {
        this.selectedItem = node;
        this.requestUpdate();
    }

    // * This config is not necessary because this component uses ontology-autocomplete-filter
    // * to provide the data depends on the source GO or HP.
    //  ! Deprecated
    getDefaultConfig() {
        return {
            limit: 10,
            fields: item => {
                return {
                    name: item.text,
                    id: item.id,
                    IRI: item.iri,
                };
            },
            select2Config: {
                ajax: {
                    transport: async (params, success, failure) => {
                        const _params = params;
                        _params.data.page = params.data.page || 1;
                        const q = _params?.data?.term ? _params.data.term : "";
                        try {
                            const request = await fetch(this.ontologyConfig.root + this.ontologyConfig.search + "?id=^"+
                                this.ontologyFilter + ":" + q + "&limit=" + this._config.limit + "&count=false");
                            const json = await request.json();
                            const results = json.responses[0].results;
                            success(results);
                        } catch (e) {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
                            failure(e);
                        }
                    },
                    processResults: (response, params) => {
                        const _params = params;
                        _params.page = _params.page || 1;
                        return {
                            results: response,
                        };
                    }
                },
            },
        };
    }

    drawNode(node) {

        const isLoading = flag => flag ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`:"";
        const isExpanded = flag => flag ? html`<i class="fas fa-plus"></i>` : html`<i class="fas fa-minus"></i>`;
        const isCollapsed = flag => flag ? "in" : "";
        const isChildrenExpanded = flag => flag ?html`${node.nodes.map(n => this.drawNode(n))}` : "";
        const childrenSize = node.has_children ?
            html`<span class="label label-primary"> Children: ${node.children_count}</span>`:"";

        return html`
            <div class="" role="tablist">
                <div class="ontology-node ${classMap({active: node.obo_id === this.selectedItem?.obo_id})}" role="tab" @click="${() => this.selectItem(node)}" data-obo-id="${node.obo_id}">
                    ${node.has_children ? html`
                        <span style="margin-left: ${node.depth}em">
                            <span @click="${() => this.toggleNode(node)}" class="" role="button" data-toggle="collapse" aria-expanded="true">
                                ${isExpanded(!node.state.expanded)}
                            </span>
                            ${node.name} ${childrenSize}
                            ${isLoading(node.state.loading)}
                        </span>`:
                        html` <span class="leaf" style="margin-left: ${node.depth}em;">${node.name}</span>`}
                </div>
                ${node.has_children ? html`
                    <div class="panel-collapse collapse ${isCollapsed(node.state.expanded)}" role="tabpanel">
                        ${isChildrenExpanded(node.state.expanded)}
                    </div>
                ` : ""}
            </div>`;
    }

    render() {

        return html`
            <div class="modal fade" id="${this._config.ontologyFilter}_ontologyModal" tabindex="-1" role="dialog"
                aria-labelledby="ontologyLabel">
                <div class="modal-dialog modal-sm" role="document" style="width: 1300px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title" id="${this._prefix}EditorLabel">${this.term} terms selector</h4>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-md-12">
                                        <ontology-autocomplete-filter
                                            source="${this._config.ontologyFilter}"
                                            .value="${this.selectedTerms}"
                                            @filterChange="${this.updateTerms}">
                                        </ontology-autocomplete-filter>
                                    </div>
                                </div>
                                <div class="row ontology-tree-wrapper">
                                    <div class="col-md-6 ontology-tree">
                                        ${this.rootTree?.nodes.map(node => this.drawNode(node))}
                                    </div>
                                    <div class="col-md-6">
                                        ${this.selectedItem ? html`
                                            <ul class="list-group infoHpo">
                                                <li class="list-group-item"><strong>Name: </strong>${this.selectedItem.name} </li>
                                                <li class="list-group-item"><strong>Id: </strong>${this.selectedItem.obo_id}</li>
                                                <li class="list-group-item"><strong>IRI: </strong>
                                                    <a href="${BioinfoUtils.getOboLink(this.selectedItem.obo_id)}" target="_blank">
                                                        ${BioinfoUtils.getOboLink(this.selectedItem.obo_id)}
                                                    </a>
                                                </li>
                                                <li class="list-group-item"><strong>Synonyms: </strong>${this.selectedItem.synonyms?.join(", ")}</li>
                                                <li class="list-group-item"><strong>Description: </strong>${this.selectedItem.description}</li>
                                                <li class="list-group-item"><strong>Comment: </strong>${this.selectedItem?.comment}</li>
                                            </ul>
                                            <button type="button" class="btn btn-default btn-small" @click="${() => this.addTerm(this.selectedItem.obo_id)}">Add Term</button>
                                        ` : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary ripple" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-modal-ontology", VariantModalOntology);
