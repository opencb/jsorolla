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
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";

/*
 * @deprecated
 */

// TODO FIXME selectedTerms: reopening the modal they are wrong (array of strings)
export default class VariantModalOntologyOld extends LitElement {

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
            }
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("selectedTerms")) {
            // selectedTerm observer to handle subsequent reopening of the modal after a first selection
        }
        if (changedProperties.has("ontologyFilter")) {
            this.ontologyFilterObserver();
        }
    }

    firstUpdated() {
        const _this = this;
        const typeaheadField = $("#" + this._prefix + "typeahead");
        typeaheadField.typeahead("destroy");
        typeaheadField.typeahead({
            source: function (query, process) {
                return _this.searchTerm(query, process);
            },
            hint: true,
            highlight: true,
            minLength: 1,
            autoSelect: true,
            items: 15,
            afterSelect: this.selectTerm.bind(_this)
        });
    }

    process(data) {
        return data;
    }

    _init() {
        // this._prefix = "vmo-" + UtilsNew.randomString(6) + "_";
        this.ebiConfig = {
            root: "https://www.ebi.ac.uk/ols/api",
            tree: {
                "hp": ["/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0012823", "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040279",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000005", "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040006",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000118", "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FUPHENO_0001002"],
                "go": ["/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0008150", "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0005575",
                    "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0003674"]
            },
            search: "/search"
        };
        this.selectedTerms = [];
        this.selectedTermsFull = [];
    }

    ontologyFilterObserver() {
        this.loadTermsTree();
        this.selectedTerm = {};
        this.listCurrentSelected = [];
        PolymerUtils.setValue(this._prefix + "typeahead", "");
        /* if (UtilsNew.isNotEmptyArray(this.selectedTerms)) {
            this.listCurrentSelected = this.selectedTerms.slice();
        }*/
        this.requestUpdate();
    }

    selectTerm(selected) {
        if (UtilsNew.isNotUndefinedOrNull(this.fullTerms)) {
            this.selectedTerm = this.fullTerms.find(elem => elem.label === selected.label);
        }
        this.requestUpdate();

    }

    addSelectedTermToList(e) {
        // const selectedTerm = e.target.getAttribute("data-selected-term");
        const selectedTerm = this.selectedTerm;
        const isPresent = this.selectedTerms.find(id => id === selectedTerm.obo_id);
        if (!isPresent) {
            this.selectedTerms.push(selectedTerm.obo_id);
            this.selectedTermsFull.push(selectedTerm);
        }
        this.requestUpdate();

    }

    deleteTermFromList(e) {
        const deletedTermId = e.target.getAttribute("data-selected-term-id");
        const index = this.selectedTerms.indexOf(deletedTermId);
        if (index > -1) {
            this.selectedTerms.splice(index, 1);
            this.selectedTermsFull.splice(index, 1);
            this.selectedTerms = [...this.selectedTerms];
        }
        this.requestUpdate();
    }

    clickOkModal(e) {
        this.dispatchEvent(new CustomEvent("clickOkModal", {
            detail: {
                result: this.selectedTerms,
                resultFull: this.selectedTermsFull
            },
            bubbles: true,
            composed: true
        }));
    }

    searchTerm(query, process) {
        const rowsPerPage = 15;
        const _this = this;
        const queryEncoded = query;
        // TODO shouldn't this use encodeURIComponent()?
        return fetch(this.ebiConfig.root + this.ebiConfig.search + "?q=*" + queryEncoded + "*&ontology=" + this.ontologyFilter + "&rows=" + rowsPerPage + "&queryFields=label,obo_id")
            .then(response => {
                return response.json().then(json => {
                    _this.fullTerms = json.response.docs;
                    const arraySearch = [];
                    json.response.docs.forEach(elem => {
                        arraySearch.push({name: elem.label + " - (" + elem.obo_id + ")", label: elem.label, id: elem.obo_id});
                    });
                    process(arraySearch);
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    drawTree(data) {
        const _this = this;
        $(PolymerUtils.getElementById(this._prefix + "TermsTree")).treeview({
            data: data,
            onNodeSelected: function (event, node) {
                _this.selectedTerm = _this.fullTree.find(elem => {
                    return elem.label === node.text;
                });
                if (UtilsNew.isNotUndefinedOrNull(_this.selectedTerm)) {
                    PolymerUtils.setValue(_this._prefix + "typeahead", node.text);
                    _this.requestUpdate();
                }
            },
            onNodeUnselected: function (event, node) {

            },
            onNodeExpanded: function (event, node) {
                if (UtilsNew.isEmptyArray(node.nodes)) {
                    let currentNodeInTree = _this.rootTree[0];
                    node.path.forEach(elem => {
                        currentNodeInTree = currentNodeInTree.nodes[elem];
                        console.log("currentNodeInTree", currentNodeInTree);

                    });
                    fetch(node.children)
                        .then(response => {
                            response.json().then(json => {
                                json._embedded.terms.forEach(elem => {
                                    _this.fullTree.push(elem);
                                    const path = currentNodeInTree.path.slice();
                                    path.push(currentNodeInTree.nodes.length);
                                    currentNodeInTree.nodes.push({
                                        text: elem.label,
                                        selectable: true,
                                        iri: elem.iri,
                                        has_children: elem.has_children,
                                        children: elem.has_children ? elem._links.children.href : "",
                                        nodes: elem.has_children ? [] : null,
                                        path: path,
                                        state: {expanded: false}
                                    });
                                });
                                currentNodeInTree.state.expanded = true;
                                _this.drawTree(data);
                            });
                        })
                        .catch(error => {
                            console.error("Error fetching Tree data: ", error);
                        });
                }
            }
        });
    }

    loadTermsTree() {
        this.rootTree = [{text: "All", nodes: [], selectable: false}];
        this.fullTree = [];

        const _this = this;
        const defaultsNodes = this.ebiConfig.tree[this.ontologyFilter];
        if (UtilsNew.isNotEmptyArray(defaultsNodes)) {
            defaultsNodes.forEach(nodeUrl => {
                fetch(this.ebiConfig.root + nodeUrl)
                    .then(response => {
                        response.json().then(json => {
                            console.log(json);
                            //                                json._embedded.terms.forEach((elem) => {
                            _this.fullTree.push(json);
                            _this.rootTree[0].nodes.push({
                                text: json.label,
                                selectable: true,
                                iri: json.iri,
                                has_children: json.has_children,
                                children: json.has_children ? json._links.children.href : "",
                                nodes: json.has_children ? [] : null,
                                path: [_this.rootTree[0].nodes.length],
                                state: {expanded: false}
                            });
                            //                            });
                            _this.drawTree(_this.rootTree);
                        });
                    })
                    .catch(error => {
                        console.error("ERROR: ", error);
                    });
            });
        }
        return [];
    }

    render() {
        return html`
            <div class="modal fade" id="${this._prefix}ontologyModal" tabindex="-1" role="dialog"
                 aria-labelledby="ontologyLabel">
                <div class="modal-dialog modal-sm" role="document" style="width: 1300px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title" id="${this._prefix}EditorLabel">${this.term} terms selector</h4>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <label>Introduce an ${this.term} term</label>
                                        <form>
                                            <fieldset>
                                                <div class="form-group">
                                                    <input matcher="${this.searchTerm}" class="form-control typeahead" name="query"
                                                           id="${this._prefix}typeahead" data-provide="typeahead"
                                                           placeholder="Start typing something to search..." type="text"
                                                           autocomplete="off">
                                                </div>
                                            </fieldset>
                                        </form>
                                    </div>
                                    <div class="col-sm-6" style="overflow-y: auto; height:400px;">
                                        <div id="${this._prefix}TermsTree"></div>
                                    </div>
                                    <div class="col-sm-6" style="overflow-y: auto; height:400px;" id="${this._prefix}divDatalist">

                                        ${this.selectedTerm ? html`
                                            <ul class="list-group infoHpo">
                                                <li class="list-group-item"><strong>Label: </strong>${this.selectedTerm.label}</li>
                                                <li class="list-group-item"><strong>Short form: </strong>${this.selectedTerm.short_form}</li>
                                                <li class="list-group-item"><strong>Obo Id: </strong>${this.selectedTerm.obo_id}</li>
                                                <li class="list-group-item"><strong>IRI: </strong>${this.selectedTerm.iri}</li>
                                                <li class="list-group-item"><strong>Description: </strong>${this.selectedTerm.description}</li>
                                                <li class="list-group-item"><button type="button" class="btn btn-info" @click="${this.addSelectedTermToList}">Add Term</button></li>
                                            </ul>
                                        ` : null}

                                        <ul class="list-group">
                                            ${this.selectedTermsFull && this.selectedTermsFull.length ? this.selectedTermsFull.map(item => html`
                                                <li class="list-group-item">
                                                    ${item.label}(${item.obo_id})
                                                    <button type="button" class="btn danger" @click="${this.deleteTermFromList}" data-selected-term-id="${item.obo_id}">X</button>
                                                </li>
                                            `) : null}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" @click="${this.clickOkModal}">OK</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

}

customElements.define("variant-modal-ontology_old", VariantModalOntology_old);
