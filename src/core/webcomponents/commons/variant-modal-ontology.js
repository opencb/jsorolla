/**
 * Created by Antonio Altamura on 08/10/2019.
 */

import {LitElement, html} from '/web_modules/lit-element.js';

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
            ontologyFilter: {
                type: String
            },
            term: {
                type: String
            },
            prefix: {
                type: String
            },
            //todo add recheck listCurrentSelected

        };
    }
    
    updated(changedProperties) {
        if(changedProperties.has("ontologyFilter"))
            this.ontologyFilterObserver();
    }
    
    firstUpdated() {
        let _this = this;
        let typeahead_field = $("#" + this._prefix + "typeahead");
        typeahead_field.typeahead("destroy");
        typeahead_field.typeahead({
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
    }

    ontologyFilterObserver() {
        this.loadTermsTree();
        this.selectedTerm = {};
        this.listCurrentSelected = [];
        PolymerUtils.setValue(this._prefix + "typeahead", "");
        if (UtilsNew.isNotEmptyArray(this.selectedTerms)) {
            this.listCurrentSelected = this.selectedTerms.slice();
        }
        this.requestUpdate();
    }

    selectTerm(selected) {
        if (UtilsNew.isNotUndefinedOrNull(this.fullTerms)) {
            this.selectedTerm = this.fullTerms.find((elem) => {
                return elem.label === selected.label;
            });
        }
    }

    addSelectedTermToList(e) {
        let selectedTerm = JSON.parse(e.target.getAttribute("data-selected-term"));
        if (UtilsNew.isUndefinedOrNull(this.listCurrentSelected)) {
            this.listCurrentSelected = [];
        }

        let containsSelectedElement = this.listCurrentSelected.find((element) => {
            return element.label === selectedTerm.label;
        });

        if (UtilsNew.isUndefinedOrNull(containsSelectedElement)) {
            this.listCurrentSelected.push(selectedTerm);
        }
        this.requestUpdate();

    }

    deletedTermFromList(e) {
        let deletedTerm = JSON.parse(e.target.getAttribute("data-selected-term"));
        this.listCurrentSelected = this.listCurrentSelected.filter((element) => {
            return element.label !== deletedTerm.label;
        });
    }

    clickOkModal(e) {
        let result = [];
        if (UtilsNew.isNotEmptyArray(this.listCurrentSelected)) {
            result = this.listCurrentSelected.map((element) => {
                return element.obo_id;
            });
        }

        this.dispatchEvent(new CustomEvent("propagateok", {
            detail: {result: result, originalResult: this.listCurrentSelected},
            bubbles: true,
            composed: true
        }));
    }

    searchTerm(query, process) {

        debugger;
        let rowsPerPage = 15;
        let _this = this;
        let queryEncoded = query;
        return fetch(this.ebiConfig.root + this.ebiConfig.search + "?q=*" + queryEncoded + "*&ontology=" + this.ontologyFilter + "&rows=" + rowsPerPage + "&queryFields=label,obo_id")
            .then((response) => {
                return response.json().then((json) => {
                    _this.fullTerms = json.response.docs;
                    let arraySearch = [];
                    json.response.docs.forEach((elem) => {
                        arraySearch.push({name: elem.label + " - (" + elem.obo_id + ")", label: elem.label, id: elem.obo_id});
                    });
                    process(arraySearch);
                });
            })
            .catch((error) => {
                console.error(error);
            });

    }

    drawTree(data) {
        let _this = this;
        $(PolymerUtils.getElementById(this._prefix + "TermsTree")).treeview({
            data: data,
            onNodeSelected: function (event, node) {
                _this.selectedTerm = _this.fullTree.find((elem) => {
                    return elem.label == node.text
                });
                if (UtilsNew.isNotUndefinedOrNull(_this.selectedTerm)) {
                    PolymerUtils.setValue(_this._prefix + "typeahead", node.text);
                }
            },
            onNodeUnselected: function (event, node) {

            },
            onNodeExpanded: function (event, node) {
                if (UtilsNew.isEmptyArray(node.nodes)) {
                    let currentNodeInTree = _this.rootTree[0];
                    node.path.forEach((elem) => {
                        currentNodeInTree = currentNodeInTree.nodes[elem];
                    });
                    fetch(node.children)
                        .then((response) => {
                            response.json().then((json) => {
                                json._embedded.terms.forEach((elem) => {
                                    _this.fullTree.push(elem);
                                    let path = currentNodeInTree.path.slice();
                                    path.push(currentNodeInTree.nodes.length);
                                    currentNodeInTree.nodes.push({
                                        text: elem.label,
                                        selectable: true,
                                        iri: elem.iri,
                                        has_children: elem.has_children,
                                        children: elem.has_children ? elem._links.children.href : "",
                                        nodes: elem.has_children ? [] : null,
                                        path: path,
                                        state: {expanded: false},
                                    });
                                });
                                currentNodeInTree.state.expanded = true;
                                _this.drawTree(data);
                            });
                        })
                        .catch((error) => {
                            console.error("ERROR: ", error);
                        });
                }
            }
        });
    }

    loadTermsTree() {
        this.rootTree = [{text: "All", nodes: [], selectable: false}];
        this.fullTree = [];

        let _this = this;
        let defaultsNodes = this.ebiConfig.tree[this.ontologyFilter];
        if (UtilsNew.isNotEmptyArray(defaultsNodes)) {
            defaultsNodes.forEach((nodeUrl) => {
                fetch(this.ebiConfig.root + nodeUrl)
                    .then((response) => {
                        response.json().then((json) => {
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
                                state: {expanded: false},
                            });
//                            });
                            _this.drawTree(_this.rootTree);
                        });
                    })
                    .catch((error) => {
                        console.error("ERROR: ", error);
                    });
            });
        }

        return [];
    }


    render() {
        return html`
        <style include="jso-styles"></style>

        <div class="modal fade" id="${this._prefix}ontologyModal" tabindex="-1" role="dialog"
             aria-labelledby="ontologyLabel" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog modal-sm" role="document" style="width: 1300px;">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="${this._prefix}EditorLabel">${this.term} terms selector</h4>
                    </div>
                    <div class="modal-body" style="height: 500px">
                        <div class="col-sm-12">
                            <label>Introduce an ${this.term} term</label>
                        </div>
                        <div class="col-sm-6" style="overflow-y: auto; height:400px;" id="${this._prefix}divDatalist">
                            <form>
                                <fieldset>
                                    <div class="form-group">
                                        <input matcher="${this.searchTerm}" class="form-control typeahead" name="query"  id="${this._prefix}typeahead" data-provide="typeahead" placeholder="Start typing something to search..." type="text">
                                    </div>
                                </fieldset>
                            </form>
                            ${this.selectedTerm ? html`
                                <ul class="list-group infoHpo">
                                    <li class="list-group-item"><strong>Label: </strong>${this.selectedTerm.label}</li>
                                    <li class="list-group-item"><strong>Short form: </strong>${this.selectedTerm.short_form}</li>
                                    <li class="list-group-item"><strong>Obo Id: </strong>${this.selectedTerm.obo_id}</li>
                                    <li class="list-group-item"><strong>IRI: </strong>${this.selectedTerm.iri}</li>
                                    <li class="list-group-item"><strong>Description: </strong>${this.selectedTerm.description}</li>
                                    <li class="list-group-item"><button type="button" class="btn btn-info" @click="${this.addSelectedTermToList}" data-selected-term="${this.selectedTerm}">Add Term</button></li>
                                </ul>
                            ` : null }

                            <ul class="list-group">
                                ${this.listCurrentSelected && this.listCurrentSelected.length && this.listCurrentSelected.map( item => html`
                                    <li class="list-group-item">${item.label}(${item.obo_id}) <button type="button" class="btn danger" @click="${this.deletedTermFromList}" data-selected-term="${item}">X</button></li>
                                `)}
                            </ul>
                        </div>

                        <div class="col-sm-6" style="overflow-y: auto; height:400px;">
                            <div id="${this._prefix}TermsTree"></div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="${this.clickOkModal}">OK</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("variant-modal-ontology", VariantModalOntology);