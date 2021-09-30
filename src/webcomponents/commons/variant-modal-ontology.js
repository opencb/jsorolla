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
import "./forms/select-token-filter";

export default class VariantModalOntology extends LitElement {

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
            // there will be 2 instances of this component, so it inherit the prefix from the related father (hpo-accessions-filter/go-accessions-filter)
            _prefix: {
                type: String
            },
            ontologyFilter: {
                type: String
            },
            term: {
                type: String
            },
            selectedTerms: {
                type: Array
            },
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    _init() {
        this._prefix = "vmo-" + UtilsNew.randomString(6) + "_";
        this.ebiConfig = {
            root: "https://www.ebi.ac.uk/ols/api",
            tree: {
                "hp": ["/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0012823",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040279",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000005",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040006",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000118",
                    /* "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FUPHENO_0001002"*/],
                "go": ["/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0008150",
                    "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0005575",
                    "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0003674"],
            },
            search: "/search",
        };
        this.rootTree = [{text: "All", nodes: [], selectable: false}];

        this.selectedTerms = [];
        this.selectedTermsFull = [];
    }


    updated(changedProperties) {
        if (changedProperties.has("selectedTerms")) {
            // selectedTerm observer to handle subsequent reopening of the modal after a first selection
        }
        if (changedProperties.has("ontologyFilter")) {
            this.ontologyFilterObserver();
        }
    }

    ontologyFilterObserver() {
        this.loadTermsTree();
        this.requestUpdate();
    }

    selectTerm(selected) {
    }

    filterChange(e) {
        this.selectedTerms = e.detail.value ? e.detail.value.split(",") : [];
    }

    addTerm(oboId) {
        if (oboId) {
            this.selectedTerms = [...new Set([...this.selectedTerms, oboId])];
        }
        this.selectedTerms = [...this.selectedTerms];
        this.requestUpdate();
    }

    clickOkModal() {
        this.dispatchEvent(new CustomEvent("clickOkModal", {
            detail: {
                result: this.selectedTerms,
                resultFull: this.selectedTermsFull,
            },
        }));
    }

    async loadTermsTree() {
        const defaultsNodes = this.ebiConfig.tree[this.ontologyFilter];
        if (defaultsNodes?.length) {
            const requests = defaultsNodes.map(nodeUrl => fetch(this.ebiConfig.root + nodeUrl));
            try {
                const responses = await Promise.all(requests);
                let i = 0;
                for (const response of responses) {
                    const json = await response.json();
                    this.rootTree[0].nodes.push({
                        text: json.label,
                        short_form: json.short_form,
                        selectable: true,
                        iri: json.iri,
                        has_children: json.has_children,
                        children: json.has_children ? json._links.children.href : "",
                        nodes: json.has_children ? [] : null,
                        path: [i++],
                        depth: 0,
                        obo_id: json.obo_id,
                        state: {expanded: false},
                    });
                }
                this.requestUpdate();
            } catch (e) {
                console.error(e);
                UtilsNew.notifyError(e);
            }
        }
    }

    toggleNode(node) {

        node.state.expanded = !node.state.expanded;
        this.rootTree = {...this.rootTree};
        this.requestUpdate();

        if (!node.nodes?.length) {
            node.state.loading = true;
            this.rootTree = {...this.rootTree};
            this.requestUpdate();
            fetch(node.children)
                .then(response => {
                    response.json().then(json => {
                        if (json._embedded) {
                            json._embedded.terms.forEach(elem => {
                                // const path = currentNodeInTree.path.slice();
                                // path.push(currentNodeInTree.nodes.length);
                                node.nodes.push({
                                    text: elem.label,
                                    short_form: elem.short_form,
                                    selectable: true,
                                    iri: elem.iri,
                                    has_children: elem.has_children,
                                    children: elem.has_children ? elem._links.children.href : "",
                                    nodes: elem.has_children ? [] : null,
                                    path: "000",
                                    depth: node.depth + 1,
                                    obo_id: elem.obo_id,
                                    state: {expanded: false},
                                });
                            });
                        } else {
                            console.warn("no _embedded elements", json);
                        }
                        node.state.loading = false;
                        this.rootTree = {...this.rootTree};
                        this.requestUpdate();
                    });
                })
                .catch(error => {
                    console.error("Error fetching Tree data: ", error);
                });
        }
    }

    selectItem(node) {
        this.selectedItem = node;
        this.requestUpdate();
    }

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
                            const request = await fetch(this.ebiConfig.root + this.ebiConfig.search + "?q=*" + q + "*&ontology=" + this.ontologyFilter + "&rows=" + this._config.limit + "&queryFields=label,obo_id");
                            const json = await request.json();
                            const results = json.response.docs.map(i => ({text: i.label, id: i.obo_id, iri: i.iri}));
                            success(results);
                        } catch (e) {
                            console.error(e);
                            UtilsNew.notifyError(e);
                            failure(e);
                        }
                    },
                    processResults: (response, params) => {
                        const _params = params;
                        _params.page = _params.page || 1;
                        return {
                            results: response,
                            /* pagination: {
                                more: (_params.page * this._config.limit) < restResponse.getResponse().numMatches
                            }*/
                        };
                    }
                },
            }
        };
    }


    drawNode(node) {
        return html`
            <div class="" role="tablist">
                <div class="ontology-node ${classMap({active: node.obo_id === this.selectedItem?.obo_id})}" role="tab" @click="${e => this.selectItem(node)}" data-obo-id="${node.obo_id}">
                    ${node.has_children ? html`
                        <span style="margin-left: ${node.depth}em">
                            <span @click="${e => this.toggleNode(node)}" class="" role="button" data-toggle="collapse" aria-expanded="true">
                                ${!node.state.expanded ? html`<i class="fas fa-plus"></i>` : html`<i class="fas fa-minus"></i>`}
                            </span>
                            ${node.text}
                            ${node.state.loading ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : ""}
                        </span>
                    ` : html`<span class="leaf" style="margin-left: ${node.depth}em;">${node.text}</span>`}
                </div>
                ${node.has_children ? html`
                    <div class="panel-collapse collapse ${node.state.expanded ? "in" : ""}" role="tabpanel">
                    ${node.state.expanded ? html`${node.nodes.map(n => this.drawNode(n))}` : ""}
                </div>
                ` : ""}

            </div>`;
    }

    render() {
        return html`
            <div class="modal fade" id="${this._prefix}ontologyModal" tabindex="-1" role="dialog"
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
                                        <select-token-filter
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${this._config}
                                                .value="${this.selectedTerms?.join(",")}"
                                                @filterChange="${this.filterChange}">
                                        </select-token-filter>
                                    </div>
                                </div>
                                <div class="row ontology-tree-wrapper">
                                    <div class="col-md-6 ontology-tree">
                                        ${this.rootTree[0].nodes.map(node => this.drawNode(node))}
                                    </div>
                                    <div class="col-md-6">
                                        ${this.selectedItem ? html`
                                            <ul class="list-group infoHpo">
                                                <li class="list-group-item"><strong>Label: </strong>${this.selectedItem.text}</li>
                                                <li class="list-group-item"><strong>Short form: </strong>${this.selectedItem.short_form}</li>
                                                <li class="list-group-item"><strong>Obo Id: </strong>${this.selectedItem.obo_id}</li>
                                                <li class="list-group-item"><strong>IRI: </strong>${this.selectedItem.iri}</li>
                                                <li class="list-group-item"><strong>Description: </strong>${this.selectedItem.description}</li>
                                                <li class="list-group-item">
                                                    <button type="button" class="btn btn-default btn-small ripple" @click="${e => this.addTerm(this.selectedItem.obo_id)}">Add Term</button>
                                                </li>
                                            </ul>
                                        ` : ""}
                                    </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary ripple" @click="${this.clickOkModal}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-modal-ontology", VariantModalOntology);
