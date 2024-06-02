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

import {LitElement, html, nothing} from "lit";
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../core/utils-new.js";
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
            cellbaseClient: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
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

    #getTerm(term, isParent = false, skip = 0) {
        const query = {
            [!isParent ? "id" : "parents"]: term,
            sort: "name",
            order: "ASCENDING",
            skip: !isParent? 0:skip,
            limit: 50,
            assembly: "GRCh38",
        };
        return this.cellbaseClient.get("feature", "ontology", undefined, "search", query, {});
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
                children: hasChildren ? () => this.#getTerm(result.id, true, 0): "",
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
        const defaultsNodes = this._config.tree[this._config.ontologyFilter];
        if (UtilsNew.isNotEmptyArray(defaultsNodes)) {
            try {
                const fetchOntology = await this.#getTerm(defaultsNodes.join(","));
                const results = fetchOntology.responses[0].results;
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
        if (UtilsNew.isEmpty(node.nodes)) {
            node.state.loading = true;
            this.rootTree = {...this.rootTree};
            try {
                const fetchOntologyChildren = await node.children();
                const results = fetchOntologyChildren.responses[0].results;
                node.nodes = [...this.#getOntologies(results, node)];
                node.state.loading = false;
                this.rootTree = {...this.rootTree};
                this.requestUpdate();
            } catch (e) {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            }
        }
    }

    async showMoreItems(node, lastIndex) {
        try {
            const fetchOntologyChildren = await this.#getTerm(node.obo_id, true, lastIndex);
            const results = fetchOntologyChildren.responses[0].results;
            node.nodes = [...node.nodes, ...this.#getOntologies(results, node)];
            this.requestUpdate();
        } catch (e) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
        }
    }

    selectItem(node) {
        this.selectedItem = node;
        this.requestUpdate();
    }

    renderShowMore(showMore, index, lastIndex, node, parent) {
        if (showMore && ((index+1) >= lastIndex) && ((index+1) <= parent.children_count)) {
            return html`
                <li class="list-group-item list-group-item-action">
                    <span class="text-primary" style="cursor:pointer"
                        @click="${() => this.showMoreItems(parent, lastIndex)}">
                        Show More...
                    </span>
                </li>`;
        }
    }

    drawNode(node, index, parent, showMore) {
        const isLoading = flag => flag ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`:"";
        const isExpanded = flag => flag ? html`<i class="fas fa-plus"></i>` : html`<i class="fas fa-minus"></i>`;
        const isCollapsed = flag => flag ? "show" : "";
        const isChildrenExpanded = flag => flag ?
            html`${node.nodes.map((nodeChild, i) => this.drawNode(nodeChild, i, node, node?.children_count > node?.nodes?.length))}` : nothing;
        const childrenSize = node.has_children ? html`<span class="badge text-bg-primary">${node.children_count} Terms</span>`: nothing;
        const lastIndex = parent?.nodes?.length;
        return html`
            <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start ${classMap({"list-group-item-success": node.obo_id === this.selectedItem?.obo_id})}"
                @click="${() => this.selectItem(node)}" data-obo-id="${node.obo_id}">
                ${node.has_children ? html`
                    <div class="ms-${node.depth} me-auto">
                        <span style="cursor:pointer" @click="${() => this.toggleNode(node)}" aria-expanded="true">
                            ${isExpanded(!node.state.expanded)} ${node.name} ${isLoading(node.state.loading)}
                        </span>
                    </div>
                    ${childrenSize}
                `: html`
                    <div class="ms-${node.depth}">
                        ${node.name}
                    </div>
                `}
            </li>
            ${node.has_children ? html`
                <div class="tab-pane fade ${isCollapsed(node.state.expanded)}" role="tabpanel">
                    ${isChildrenExpanded(node.state.expanded)}
                </div>
            ` : nothing}
            ${this.renderShowMore(showMore, index, lastIndex, node, parent)}
        `;
    }

    render() {
        return html`
            <div class="modal fade" id="${this._config.ontologyFilter}_ontologyModal" tabindex="-1" role="dialog"
                aria-labelledby="ontologyLabel">
                <div class="modal-dialog modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="${this._prefix}EditorLabel">${this.term} terms selector</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <ontology-autocomplete-filter
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .value="${this.selectedTerms}"
                                        .config="${this._config}"
                                        @filterChange="${this.updateTerms}">
                                    </ontology-autocomplete-filter>
                                </div>

                                <div class="col-md-6 overflow-auto" style="height:600px">
                                    <div class="card">
                                        <ul class="list-group list-group-flush">
                                            ${this.rootTree?.nodes.map(node => this.drawNode(node, false))}
                                        </ul>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    ${this.selectedItem ? html`
                                        <ul class="list-group">
                                            <li class="list-group-item">
                                                <strong>Name: </strong>${this.selectedItem.name}
                                            </li>
                                            <li class="list-group-item">
                                                <strong>ID: </strong>${this.selectedItem.obo_id}
                                            </li>
                                            <li class="list-group-item"><strong>IRI: </strong>
                                                <a href="${BioinfoUtils.getOboLink(this.selectedItem.obo_id)}" target="_blank">
                                                    ${BioinfoUtils.getOboLink(this.selectedItem.obo_id)}
                                                </a>
                                            </li>
                                            <li class="list-group-item">
                                                <strong>Synonyms: </strong>${this.selectedItem.synonyms?.join(", ")}
                                            </li>
                                            <li class="list-group-item">
                                                <strong>Description: </strong>${this.selectedItem.description}
                                            </li>
                                            <li class="list-group-item">
                                                <strong>Comment: </strong>${this.selectedItem?.comment}
                                            </li>
                                        </ul>
                                        <button type="button" class="btn btn-light mt-3" @click="${() => this.addTerm(this.selectedItem.obo_id)}">Add Term</button>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
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
        };
    }

}

customElements.define("variant-modal-ontology", VariantModalOntology);
