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

/* TODO check functionality Polymer refs in it */

export default class OpencgaPanelEditor extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            panel: {
                type: Object
            },
            eventNotifyName: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "OpencgaPanelEditor" + UtilsNew.randomString(6);
        this.genesPanelEditor = [];
        this.mutationsPanelEditor = [];
        this.eventNotifyName = "messageevent";
    }

    updated(changedProperties) {
        if (changedProperties.has("panel")) {
            this.panelObserver();
        }
    }

    // it was connectedCallback()
    firstUpdated(_changedProperties) {
        this.renderPanelTableDiseases();
        this.renderPanelTableGenes();
        this.renderPanelTableMutations();
        $("select.selectpicker", this).selectpicker("render");

    }

    panelObserver(e) {
        this.diseasesSelected = [];
        if (UtilsNew.isNotUndefinedOrNull(this.panel.phenotypes) && UtilsNew.isNotEmptyArray(this.panel.phenotypes )) {
            this.diseasesSelected = this.panel.phenotypes.map(disease => {
                return {trait: disease.name, source: disease.source};
            });
        }
        this.genesPanelEditor = [];
        if (UtilsNew.isNotUndefinedOrNull(this.panel.genes) && UtilsNew.isNotEmptyArray(this.panel.genes)) {
            const genesPanelEditor = this.panel.genes.map(gene => {
                return gene.name;
            });
            this.addGene(genesPanelEditor);
        }

        this.mutationsPanelEditor = [];
        if (UtilsNew.isNotUndefinedOrNull(this.panel.variants) && UtilsNew.isNotEmptyArray(this.panel.variants)) {
            this.panel.variants.forEach(mutation => {
                this.addMutations({region: mutation.id}, mutation.phenotype);
            });
        }

        this.panelName = this.panel.name;
        this.panelId = this.panel.id;
        this.panelAuthor = this.panel.author;
        this.panelDescription = this.panel.description;
        this.panelSource = this.panel.source;

        this.renderPanelTableDiseases();
        this.renderPanelTableGenes();
        this.renderPanelTableMutations();
    }

    renderPanelTableDiseases() {
        // Check that HTTP protocol is present and complete the URL
        let host = this.cellbaseClient._config.hosts[0];
        // By default we assume https protocol instead of http
        if (!host.startsWith("https://") && !host.startsWith("http://")) {
            host = "https://" + this.cellbaseClient._config.hosts[0];
        }

        const cellbaseHostUrl = host + "/webservices/rest/v4-dev/hsapiens/clinical/variant/diseases";

        const _this = this;
        $("#" + this._prefix + "PanelDiseasesGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelDiseasesGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            url: cellbaseHostUrl,
            columns: _this._createDefaultColumnsDiseases(),
            method: "get",
            sidePagination: "server",
            filterControl: true,
            queryParams: function(params) {
                const auxParams = {
                    // version: "v4-dev",
                    // species: "hsapiens",
                    sort: params.sort,
                    limit: params.limit,
                    skip: params.offset,
                    source: "clinvar",
                    // include: "annotation.traitAssociation,chromosome,start,end,reference,alternate",
                    trait: params.search
                };

                return Object.assign({}, auxParams);
            },
            responseHandler: function(response) {
                if (!_this.hasOwnProperty("numTotalResults")) {
                    _this.numTotalResults = 0;
                }
                if (_this.numTotalResults !== response.response[0].numTotalResults &&
                    response.queryOptions.skip === 0) {
                    _this.numTotalResults = response.response[0].numTotalResults;
                }

                _this.numTotalResultsText = _this.numTotalResults.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (response.queryOptions.skip === 0 && _this.numTotalResults < response.queryOptions.limit) {
                    _this.from = 1;
                    _this.to = _this.numTotalResults;
                }

                return {
                    total: _this.numTotalResults,
                    rows: response.response[0].result
                };
            },
            onCheck: function(row, elem) {
                let disease = "-";
                if (UtilsNew.isNotUndefinedOrNull(row) && UtilsNew.isNotUndefinedOrNull(row._id) && UtilsNew.isNotUndefinedOrNull(row._id.trait)) {
                    const diseaseExist = _this.diseasesSelected.find(disease => {
                        return disease.trait === row._id.trait;
                    });

                    if (UtilsNew.isUndefinedOrNull(diseaseExist)) {
                        disease = row._id;
                        _this.diseasesSelected.push(disease);
                        _this.addMutations({traitExactMatch: disease.trait, source: disease.source}, disease.trait, true);
                    }

                }

                // _this.set('diseasesSelected', _this.diseasesSelected.slice());
                _this.diseasesSelected =_this.diseasesSelected.slice();
            },
            onUncheck: function(row, elem) {
                _this.diseasesSelected = _this.diseasesSelected.filter(disease => {
                    return disease.trait !== row._id.trait;
                });

                // Remove all mutations and genes and we calculate again from remaining diseases
                // _this.set('mutationsPanelEditor', []);
                _this.mutationsPanelEditor = [];
                _this.renderPanelTableMutations();
                // _this.set('genesPanelEditor', []);
                _this.genesPanelEditor = [];
                _this.renderPanelTableGenes();
                _this.diseasesSelected.forEach(disease=> {
                    _this.addMutations({traitExactMatch: disease.trait, source: disease.source}, disease.trait, true);
                });

                // _this.set('diseasesSelected', _this.diseasesSelected.slice());
                _this.diseasesSelected =_this.diseasesSelected.slice();
            },
            onCheckAll: function(rows) {
                // _this.diseasesSelected = [];
                rows.map(row => {
                    const existDisease = _this.diseasesSelected.find(disease => {
                        return disease.trait === row._id.trait;
                    });

                    if (UtilsNew.isUndefinedOrNull(existDisease)) {
                        const disease = row._id;
                        _this.diseasesSelected.push(row._id);
                        _this.addMutations({traitExactMatch: disease.trait, source: "clinvar"}, disease.trait, true);
                    }
                });

                // _this.set('diseasesSelected', _this.diseasesSelected.slice());
                _this.diseasesSelected = _this.diseasesSelected.slice();
            },
            onUncheckAll: function(rows) {
                rows.forEach(row => {
                    _this.diseasesSelected = _this.diseasesSelected.filter(disease => {
                        return disease.trait !== row._id.trait;
                    });
                });
                // Remove all mutations and genes and we calculate again from remaining diseases
                // _this.set('mutationsPanelEditor', []);
                _this.mutationsPanelEditor = [];
                _this.renderPanelTableMutations();
                _this.set("genesPanelEditor", []);
                _this.genesPanelEditor = [];
                _this.renderPanelTableGenes();
                _this.diseasesSelected.forEach(disease=> {
                    _this.addMutations({traitExactMatch: disease.trait, source: "clinvar"}, disease.trait, true);
                });
                // _this.set('diseasesSelected', _this.diseasesSelected.slice());
                _this.diseasesSelected = _this.diseasesSelected.slice();
            },
            onLoadSuccess: function(data) {
                for (const j in data.rows) {
                    const existsDisease = _this.diseasesSelected.find(disease => {
                        return disease.trait === data.rows[j]._id.trait;
                    });

                    if (UtilsNew.isNotUndefinedOrNull(existsDisease)) {
                        $(PolymerUtils.getElementById(_this._prefix + "PanelDiseasesGrid")).bootstrapTable("check", j);
                    }
                }
            },
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            }
        });
    }

    renderPanelTableGenes() {
        const _this = this;
        $("#" + this._prefix + "PanelGenesGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelGenesGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: _this._createDefaultColumnsGenes(),
            data: _this.genesPanelEditor,
            filterControl: true,
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            }
        });
    }

    renderPanelTableMutations() {
        // Check that HTTP protocol is present and complete the URL
        const _this = this;
        $("#" + this._prefix + "PanelMutationsGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelMutationsGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: _this._createDefaultColumnsMutations(),
            data: _this.mutationsPanelEditor
        });
    }

    addGenes(e) {
        console.log(this.geneValue);
        const genesToAdd = this.geneValue.split(",");
        this.addGene(genesToAdd);
    }

    addGene(genes, mutationInfo) {
        const _this = this;
        const assembly = this.opencgaSession.project.organism.assembly;
        const promises = [];
        let numGenesAdded = 0;
        genes.map(gene => {
            if (UtilsNew.isNotUndefinedOrNull(gene)) {
                const existsGene = _this.genesPanelEditor.find(geneAdded => {
                    return geneAdded.name === gene;
                });
                if (UtilsNew.isUndefinedOrNull(existsGene)) {

                    promises.push(this.cellbaseClient.get("feature", "gene", gene, "info", {assembly: assembly}, {})
                        .then(function(response) {
                            if (UtilsNew.isNotUndefinedOrNull(response.response) && response.response) {
                                response.response.forEach(geneResponse => {
                                    if (response.response[0].numTotalResults === 1) {
                                        const geneInfo = geneResponse.result[0];
                                        const existsGene = _this.genesPanelEditor.find(gene => {
                                            return gene.name === geneInfo.name;
                                        });
                                        if (UtilsNew.isUndefinedOrNull(existsGene)) {
                                            _this.genesPanelEditor.push(geneInfo);
                                            numGenesAdded++;
                                        }
                                    }
                                });
                            }
                        }));
                } else {
                    // _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                    //     detail: {
                    //         message: "Gene already exists: " + gene,
                    //         type: UtilsNew.MESSAGE_INFO
                    //     },
                    //     bubbles: true,
                    //     composed: true
                    // }));
                }
            }
        });
        Promise.all(promises).then(values => {
            let message = "Added " + numGenesAdded + " genes. ";
            if (UtilsNew.isNotUndefinedOrNull(mutationInfo)) {
                message += mutationInfo.chromosome + ":" + mutationInfo.start + "-" + mutationInfo.end;
            }
            _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                detail: {
                    message: message,
                    type: UtilsNew.MESSAGE_INFO
                },
                bubbles: true,
                composed: true
            }));
            _this.renderPanelTableGenes();
            _this.geneValue = "";
        });
    }

    deleteGenes(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        const _this = this;
        const names = $.map($(PolymerUtils.getElementById(this._prefix + "PanelGenesGrid")).bootstrapTable("getSelections"), function(row) {
            return row.name;
        });

        $(PolymerUtils.getElementById(this._prefix + "PanelGenesGrid")).bootstrapTable("remove", {
            field: "name",
            values: names
        });
    }

    addMutationsOnclick(e) {
        if (UtilsNew.isNotUndefinedOrNull(this.diseaseMutation)) {
            // console.log(this.geneValue);
            this.addMutations({region: this.regionValue});
            this.regionValue = "";
        } else {
            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                detail: {
                    message: "Disease is required",
                    type: UtilsNew.MESSAGE_ERROR
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    addMutations(_query, diseaseName, addGenes = false) {
        const _this = this;
        const assembly = this.opencgaSession.project.organism.assembly;
        let query = {assembly: assembly};
        query = Object.assign({}, query, _query);

        this.cellbaseClient.get("clinical", "variant", null, "search", query, {})
            .then(function(response) {
                if (UtilsNew.isNotUndefinedOrNull(response.response) && response.response ) {
                    let numVariantsAdded = 0;
                    response.response[0].result.forEach(mutationResponse => {
                        const mutationInfo = mutationResponse;
                        const existsMutation = _this.mutationsPanelEditor.find(mutationAdded => {
                            return mutationAdded.chromosome + ":" + mutationAdded.start + "-" + mutationAdded.end === mutationInfo.chromosome + ":" + mutationInfo.start + "-" + mutationInfo.end;
                        });
                        if (UtilsNew.isUndefinedOrNull(existsMutation)) {
                            // let mutation = {mutation: mutationInfo}
                            mutationInfo.phenotype = UtilsNew.isNotUndefinedOrNull(diseaseName) ? diseaseName : _this.diseaseMutation;
                            _this.mutationsPanelEditor.push(mutationInfo);
                            numVariantsAdded++;
                            _this.renderPanelTableMutations();

                            // if we are adding mutations from a disease we add genes as well.
                            if (addGenes) {
                                const genesDisease = mutationInfo.annotation.consequenceTypes.map(gene => {
                                    return gene.geneName;
                                });
                                _this.addGene(genesDisease, mutationInfo);
                            }
                        }
                    });

                    let message = "Added " + numVariantsAdded + " variants. ";
                    if (UtilsNew.isNotUndefinedOrNull(diseaseName)) {
                        message += "Disease " + diseaseName;
                    }
                    _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                        detail: {
                            message: message,
                            type: UtilsNew.MESSAGE_INFO
                        },
                        bubbles: true,
                        composed: true
                    }));
                }
            });
    }

    deleteMutationsOnclick(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        const rows = $.map($(PolymerUtils.getElementById(this._prefix + "PanelMutationsGrid")).bootstrapTable("getSelections"), function(row) {
            return row.chromosome + ":" + row.start + "-" + row.end;
        });
        this.deleteMutations(rows);
    }

    deleteMutations(ids, geneNameRemoved = null) {
        if (UtilsNew.isNotUndefinedOrNull(geneNameRemoved)) {
            // Deleted mutation by gene which was added
            this.mutationsPanelEditor = this.mutationsPanelEditor.filter(mutation => {
                let existGeneInMutation = undefined;
                if (UtilsNew.isNotUndefinedOrNull(mutation.genes) && UtilsNew.isNotEmptyArray(mutation.genes)) {
                    existGeneInMutation = mutation.genes.find(geneName => {
                        return geneName === geneNameRemoved;
                    });
                }
                return UtilsNew.isUndefinedOrNull(existGeneInMutation);
            });
        } else {
            // Deleted mutation by chromosome:start-end
            this.mutationsPanelEditor = this.mutationsPanelEditor.filter(mutation => {
                const existMutation = ids.find(mutationPos => {
                    return mutation.chromosome + ":" + mutation.start + "-" + mutation.end === mutationPos;
                });
                return UtilsNew.isUndefinedOrNull(existMutation);
            });
        }
        this.renderPanelTableMutations();
    }

    savePanel() {
        const _this = this;
        const params = {
            study: this.opencgaSession.study.fqn
        };
        if (UtilsNew.isUndefinedOrNull(this.panelName)) {
            _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                detail: {
                    message: "Name is required",
                    type: UtilsNew.MESSAGE_INFO
                },
                bubbles: true,
                composed: true
            }));
        }
        this.panelId = this.panelName.replace(/\s/g, "");

        const panel = {
            "id": this.panelId,
            "name": this.panelName,
            "description": this.panelDescription,
            "author": this.panelAuthor,
            "source": this.panelSource,
            "phenotypes": this.diseasesSelected.map(disease => {
                return {"id": disease.trait, "name": disease.trait, "source": disease.source};
            }),
            "genes": this.genesPanelEditor.map(geneInfo => {
                return {"id": geneInfo.id, "name": geneInfo.name, "confidence": ""};
            }),
            "variants": this.mutationsPanelEditor.map(mutationInfo => {
                return {"id": UtilsNew.isUndefinedOrNull(mutationInfo.id) ? mutationInfo.chromosome + ":" + mutationInfo.start + "-" + mutationInfo.end: mutationInfo.id,
                    "phenotype": mutationInfo.phenotype};
            })

        };

        this.opencgaClient.panels().create(panel, params)
            .then(response => {
                _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                    detail: {
                        message: "Created Panel " + this.panelName,
                        type: UtilsNew.MESSAGE_SUCCESS
                    },
                    bubbles: true,
                    composed: true
                }));
                _this.panel = {};
            })
            .catch(function(responseError) {
                const _message = responseError.error;
                _this.dispatchEvent(new CustomEvent(_this.eventNotifyName, {
                    detail: {
                        message: _message,
                        type: UtilsNew.MESSAGE_ERROR
                    },
                    bubbles: true,
                    composed: true
                }));
            });
    }

    sourceFormatter(value, row, index) {
        let source = "-";
        if (UtilsNew.isNotUndefinedOrNull(row) && UtilsNew.isNotUndefinedOrNull(row._id) && UtilsNew.isNotUndefinedOrNull(row._id.source)) {
            source = row._id.source;
        }
        return "<span style='white-space: nowrap'>" + source + "</span>";
    }


    diseaseFormatter(value, row, index) {
        let disease = "-";
        if (UtilsNew.isNotUndefinedOrNull(row) && UtilsNew.isNotUndefinedOrNull(row._id) && UtilsNew.isNotUndefinedOrNull(row._id.trait)) {
            disease = row._id.trait;
        }
        return "<span style='white-space: nowrap'>" + disease + "</span>";
    }

    locationFormatter(value, row, index) {
        return row.chromosome + ":" + row.start + "-" + row.end;
    }

    idMutationFormatter(value, row, index) {
        let id = "-";
        if (UtilsNew.isNotUndefinedOrNull(row.chromosome) && UtilsNew.isNotUndefinedOrNull(row.start) && UtilsNew.isNotUndefinedOrNull(row.end)) {
            id = row.chromosome + ":" + row.start + "-" + row.end;
        } else if (UtilsNew.isNotUndefinedOrNull(row.id)) {
            id = row.id;
        }
        return id;
    }

    _createDefaultColumnsDiseases() {
        return [
            [
                {
                    //                            title: 'Select',
                    //                            field: {source: 'state', context: this},
                    field: "stateCheckBox",
                    checkbox: true,
                    colspan: 1,
                    rowspan: 1
                    // formatter: this.stateFormatter
                },
                {
                    title: "Disease",
                    formatter: this.diseaseFormatter,
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Source",
                    formatter: this.sourceFormatter,
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                }
            ]
        ];
    }

    _createDefaultColumnsGenes() {
        return [
            [
                {
                    field: "stateCheckBox",
                    checkbox: true,
                    colspan: 1,
                    rowspan: 1
                },
                {
                    title: "ID",
                    field: "id",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Name",
                    field: "name",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Location",
                    field: "chromosome",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    formatter: this.locationFormatter
                },
                {
                    title: "Confidence",
                    field: "confidence",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Biotype",
                    field: "biotype",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                }
            ]
        ];
    }

    _createDefaultColumnsMutations() {
        return [
            [
                {
                    field: "stateCheckBox",
                    checkbox: true,
                    colspan: 1,
                    rowspan: 1
                },

                {
                    title: "Id",
                    formatter: this.idMutationFormatter,
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Ref",
                    field: "reference",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Alternate",
                    field: "alternate",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Phenotype",
                    field: "phenotype",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                }
            ]
        ];
    }

    _createDefaultColumns() {
        return [
            [
                {
                    title: "Genes",
                    field: "name",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                }
            ]
        ];
    }

    render() {
        return html`
        <div style="padding-top: 20px" >
            <h3>Editor</h3>
            <div style="padding-top: 20px">
                <ul id="${this._prefix}panelSteps" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active">
                        <a href="#${this._prefix}Diseases" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                            Diseases
                        </a>
                    </li>
                    <li role="presentation">
                        <a href="#${this._prefix}Genes" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                            Genes
                        </a>
                    </li>
                    <li role="presentation">
                        <a href="#${this._prefix}Mutations" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                            Mutations
                        </a>
                    </li>
                    <li role="presentation">
                        <a href="#${this._prefix}Info" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                            Info
                        </a>
                    </li>
                </ul>

                <div class="tab-content">
                    <!--Diseases Tab-->
                    <div role="tabpanel" class="tab-pane active" id="${this._prefix}Diseases">
                        <div class="col-md-6">
                            <div id="${this._prefix}PanelDiseases" style="">
                                <table id="${this._prefix}PanelDiseasesGrid" data-pagination="true" data-page-list="[10, 25, 50]"
                                       data-click-to-select="true" data-search="true">
                                </table>
                            </div>
                        </div>
                        <div class="col-md-6" style="margin-top: 5%">
                            <ul class="list-group">
                                ${this.diseasesSelected && this.diseasesSelected.length ? this.diseasesSelected.map( item => html`
                                    <li class="list-group-item">${item.trait}
                                        <span class="badge">${item.source}</span>
                                    </li>
                                `) : null }
                            </ul>
                        </div>
                    </div>

                    <!-- Genes Tab -->
                    <div id="${this._prefix}Genes" role="tabpanel" class="tab-pane">
                        <div class="col-md-4" style="margin-top: 2%">
                            <div class="form-group has-feedback">
                                <label for="${this._prefix}FeatureTextarea" class="col-label">Genes</label>
                                <textarea id="${this._prefix}FeatureTextarea" name="geneSnp" class="form-control clearable"
                                          rows="3" placeholder="BRCA2,PPL" style="margin-top: 5px" value="{{geneValue::input}}"></textarea>
                                <button id="${this._prefix}addGenes" type="button" @click="${this.addGenes}" class="btn btn-primary variant-prioritization-view-buttons" style="margin-top: 1%;">
                                    <i class="fa fa-plus icon-padding" aria-hidden="true" ></i> Add
                                </button>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div id="${this._prefix}PanelGenes" style="">
                                <button id="${this._prefix}DeleteGeneButton" style="margin: 1% 1%; float: right;" class="btn btn-danger" @click="${this.deleteGenes}">
                                    <i class="fa fa-times"></i>&nbsp;Delete
                                </button>
                                <table id="${this._prefix}PanelGenesGrid" data-pagination="true" data-page-list="[10, 25, 50]">
                                </table>
                            </div>
                        </div>
                    </div>

                    <!--Mutations network-->
                    <div role="tabpanel" class="tab-pane" id="${this._prefix}Mutations">
                        <div class="col-md-4" style="margin-top: 2%">
                            <div class="form-group has-feedback">
                                <label for="${this._prefix}LocationTextarea" class="col-label">Genomic Pos</label>
                                <textarea id="${this._prefix}LocationTextarea" name="location" class="form-control clearable"
                                          rows="3" placeholder="3:444-55555,1:1-100000" value="{{regionValue::input}}"></textarea>
                            </div>
                            <div class="form-group has-feedback">
                                <label for="${this._prefix}diseaseMutation" class="col-label">Disease</label>
                                <select class="form-control" id="${this._prefix}diseaseMutation"
                                        name="diseaseMutation" required data-required-error="This field is required" value="{{diseaseMutation::input}}">
                                    <option value="">Select...</option>
                                    ${this.diseasesSelected && this.diseasesSelected.length ? this.diseasesSelected.map( item => html`
                                        <option value="{{item.trait}}">{{item.trait}}</option>
                                    `) : null}
                                </select>
                            </div>
                            <button id="${this._prefix}addMutation" type="button" @click="${this.addMutationsOnclick}" class="btn btn-primary variant-prioritization-view-buttons" style="margin-top: 1%;">
                                <i class="fa fa-plus icon-padding" aria-hidden="true"></i> Add
                            </button>
                        </div>
                        <div class="col-md-8">
                            <div id="${this._prefix}PanelMutations" style="">
                                <button id="${this._prefix}DeleteMutationsButton" style="margin: 1% 1%; float: right;" class="btn btn-danger" @click="${this.deleteMutationsOnclick}">
                                    <i class="fa fa-times"></i>&nbsp;Delete
                                </button>
                                <table id="${this._prefix}PanelMutationsGrid" data-pagination="true" data-page-list="[10, 25, 50]"
                                       data-click-to-select="true" >
                                </table>
                            </div>
                        </div>
                    </div>
                    <!--Info panel-->
                    <div role="tabpanel" class="tab-pane" id="${this._prefix}Info">
                        <form id="${this._prefix}uploadForm" class="form-horizontal" data-toggle="validator" data-feedback='{"success": "fa-check", "error": "fa-times"}' role="form">
                            <div class="col-md-4" style="margin-top: 2%">
                                <div class="form-group has-feedback">
                                    <label for="${this._prefix}PanelName" class="col-label">Name</label>
                                    <input id="${this._prefix}PanelName" name="panelName" class="form-control clearable"
                                              placeholder="Panel..." value="{{panelName::input}}" required>
                                </div>
                                <div class="form-group has-feedback">
                                    <label for="${this._prefix}PanelAuthor" class="col-label">Author</label>
                                    <input id="${this._prefix}PanelAuthor" name="panelAuthor" class="form-control clearable"
                                           placeholder="Author..." value="{{panelAuthor::input}}">
                                </div>
                                <div class="form-group has-feedback">
                                    <label for="${this._prefix}PanelDescription" class="col-label">Description</label>
                                    <textarea id="${this._prefix}PanelDescription" name="location" class="form-control clearable"
                                              rows="3" placeholder="Description" value="{{panelDescription::input}}"></textarea>
                                </div>
                                <button id="${this._prefix}SavePanel" type="button" class="btn btn-primary variant-prioritization-view-buttons" @click="${this.savePanel}" style="margin-top: 1%;">
                                    <i class="fa fa-floppy-o icon-padding" aria-hidden="true"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


        </div>
        `;
    }

}

customElements.define("opencga-panel-editor", OpencgaPanelEditor);
