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
import UtilsNew from "../../../../core/utils-new.js";

/* TODO check functionality Polymer refs in it */

export default class OpencgaAnnotationComparator extends LitElement {

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
                type: Object,
            },
            opencgaClient: {
                type: Object
            },
            entryIds: {
                type: Array,
            },
            entity: {
                // Allowed values are SAMPLE,INDIVIDUAL,COHORT,FAMILY
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // super.ready();
        this._prefix = "oac-" + UtilsNew.randomString(6);
        this._config = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("entryIds")) {
            this.entryIdsObserver();
        }
    }

    opencgaSessionObserver() {

        this.variableSets = [];
        this.variables = [];

        if (typeof this.opencgaSession.study === "undefined") {
            return;
        }

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
        } else {
            let _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(function(response) {
                    _this._updateVariableSets(response.response[0].result[0]);
                })
                .catch(function() {
                    _this.multipleVariableSets = false;

                    // Hide all selectpicker selectors
                    $(`#${this._prefix}-variableSetSelect`).selectpicker("hide");

                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
                });
        }
    }

    entryIdsObserver() {
        if (this.entryIds.length === 0 || UtilsNew.isEmpty(this.entity)) {
            $(`#${this._prefix}-ac-table`).bootstrapTable("destroy");
            return;
        }

        let client = undefined;
        switch (this.entity) {
        case "SAMPLE":
            client = this.opencgaClient.samples();
            break;
        case "INDIVIDUAL":
            client = this.opencgaClient.individuals();
            break;
        case "COHORT":
            client = this.opencgaClient.cohorts();
            break;
        case "FAMILY":
            client = this.opencgaClient.families();
            break;
        case "FILE":
            client = this.opencgaClient.files();
            break;
        default:
            console.error("Unexpected entity value passed to annotation-comparator webcomponent");
            return;
        }

        // Extract sample ids
        let entryIds = [];
        for (let i in this.entryIds) {
            entryIds.push(this.entryIds[i].id);
        }

        let _this = this;
        client.info(entryIds.join(","), {
            study: this.opencgaSession.study.id,
            include: "annotationSets,id",
            flattenAnnotations: true
        })
            .then(function(response) {
                // Get the selected variableSet
                let variableSet = $(`button[data-id=${_this._prefix}-variableSetSelect]`)[0].title;
                for (let i in _this.variableSets) {
                    if (_this.variableSets[i].id === variableSet) {
                        _this.selectedVariableSet = _this.variableSets[i];
                        break;
                    }
                }

                let variables = _this.flattenVariableArray(_this.selectedVariableSet.variables);
                // We create a temporal map to be able to update each variable with the annotation values directly
                let variableMap = {};
                for (let i in variables) {
                    variableMap[variables[i].id] = variables[i];
                }

                let samples = [];
                for (let i in response.response) {
                    let tmpSample = {};
                    for (let j in response.response[i].result) {
                        let sample = response.response[i].result[j];
                        tmpSample["id"] = sample.id;
                        tmpSample["annotations"] = [];

                        // We check all the different annotations
                        for (let w in sample.annotationSets) {
                            let annotationSet = sample.annotationSets[w];
                            if (annotationSet.variableSetId !== _this.selectedVariableSet.id) {
                                // The current annotation set does not annotate the selected variable set
                                continue;
                            }

                            tmpSample["annotations"].push(annotationSet.id);
                            let id = `${sample.id}:${annotationSet.id}`;
                            for (let z in annotationSet.annotations) {
                                _this._processAnnotations(variableMap,
                                    {id: z, value: annotationSet.annotations[z]}, id);
                                // variableMap[annotationSet.annotations[z].name].annotations[id] = annotationSet.annotations[z].value;
                            }

                        }
                    }

                    if (tmpSample.annotations.length > 0) {
                        samples.push(tmpSample);
                    }
                }

                _this.buildNewTable(samples, variables);
            })
            .catch(function(response) {
                $(`#${_this._prefix}-ac-table`).bootstrapTable("destroy");
                debugger
            });
    }

    _processAnnotations(variableMap, annotation, id) {
        if (variableMap[annotation.id].type !== "OBJECT") {
            variableMap[annotation.id].annotations[id] = annotation.value;
            return;
        }

        if (typeof variableMap[annotation.id].variableSet === "undefined"
            || variableMap[annotation.id].variableSet.length === 0) {
            // We don't expect more annotations
            variableMap[annotation.id].annotations[id] = `${JSON.stringify(annotation.value).substring(0, 30)}...`;
        }

        // We are processing a complex annotation.
        let annotations = {};
        if (variableMap[annotation.id].multiValue) {
            // We expect an array
            for (let i in annotation.value) {
                this._processComplexAnnotations(annotations, variableMap, annotation.value[i], annotation.id, true);
            }
        } else {
            this._processComplexAnnotations(annotations, variableMap, annotation.value, annotation.id, false);
        }

        for (let key in annotations) {
            if (Array.isArray(annotations[key])) {
                variableMap[key].annotations[id] = annotations[key].join(", ");
            } else {
                variableMap[key].annotations[id] = annotations[key];
            }
        }
        // debugger
    }

    _processComplexAnnotations(returnedAnnotation, variableMap, annotation, fullAnnotationId, isArray) {
        for (let key in annotation) {
            let currentVariable = `${fullAnnotationId}.${key}`;

            if (variableMap[currentVariable].type !== "OBJECT") {
                this._addAnnotationValue(returnedAnnotation, currentVariable, annotation[key], isArray);
                continue;
            }

            if (typeof variableMap[currentVariable].variableSet === "undefined"
                || variableMap[currentVariable].variableSet.length === 0) {
                let value = `${JSON.stringify(annotation[key]).substring(0, 30)}...`;

                this._addAnnotationValue(returnedAnnotation, currentVariable, value, isArray);
                continue;
            }

            // We are processing a complex annotation
            if (Array.isArray(annotation[key])) {
                for (let i in annotation[key]) {
                    this._processComplexAnnotations(returnedAnnotation, variableMap, annotation[key][i],
                        currentVariable, isArray || variableMap[currentVariable].multiValue);
                }
            } else {
                this._processComplexAnnotations(returnedAnnotation, variableMap, annotation[key],
                    currentVariable, isArray || variableMap[currentVariable].multiValue);
            }
        }
    }

    _addAnnotationValue(returnedAnnotation, currentVariable, value, isArray) {
        if (isArray) {
            if (typeof returnedAnnotation[currentVariable] === "undefined") {
                returnedAnnotation[currentVariable] = [];
            }
            returnedAnnotation[currentVariable].push(value);
        } else {
            returnedAnnotation[currentVariable] = value;
        }
    }

    buildNewTable(samples, variables) {
        $(`#${this._prefix}-ac-table`).bootstrapTable("destroy");

        if (samples.length === 0) {
            return;
        }

        let columnsFirstLevel = [
            {
                title: "Variable",
                field: "variable",
                rowspan: 2
            }
        ];
        let columnsSecondLevel = [];

        for (let i in samples) {
            if (samples[i].annotations.length > 1) {
                columnsFirstLevel.push({
                    title: samples[i].id,
                    colspan: samples[i].annotations.length
                });

                for (let j in samples[i].annotations) {
                    columnsSecondLevel.push({
                        title: samples[i].annotations[j],
                        field: `${samples[i].id}:${samples[i].annotations[j]}`
                    });
                }
            } else {
                columnsFirstLevel.push({
                    title: samples[i].id,
                    colspan: 1,
                    rowspan: 2,
                    field: `${samples[i].id}:${samples[i].annotations[0]}`
                });
            }
        }
        let columns = [columnsFirstLevel, columnsSecondLevel];

        let data = [];
        for (let i in variables) {
            data.push(variables[i].annotations);
        }

        $(`#${this._prefix}-ac-table`).bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: columns,
            data: data
        });
    }

    flattenVariableArray(variables) {
        return this._flattenVariableArray(variables, []);
    }

    _flattenVariableArray(variables, tags) {
        let displayVariables = [];

        for (let i in variables) {
            let variable = variables[i];

            if (variable.type !== "OBJECT") {
                // Add variable
                displayVariables.push({
                    id: tags.concat(variable.id).join("."),
                    name: variable.name,
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    annotations: {
                        variable: tags.concat(variable.id).join(".")
                    }
                });
            } else {
                // Add variable
                displayVariables.push({
                    id: tags.concat(variable.id).join("."),
                    name: variable.name,
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    annotations: {
                        variable: tags.concat(variable.id).join(".")
                    },
                    variableSet: variable.variableSet
                });

                displayVariables = displayVariables.concat(this._flattenVariableArray(variable.variableSet,
                    tags.concat(variable.id)));
            }
        }

        return displayVariables;
    }

    _updateVariableSets(study) {
        if (typeof study.variableSets === "undefined") {
            this.variableSets = [];
        } else {
            this.variableSets = study.variableSets;
        }

        if (this.variableSets.length > 0) {
            // this.variables = this.parseVariableForDisplay(this.variableSets[0].variables); // select first one by default

            // Show selectpicker selector
            $(`#${this._prefix}-variableSetSelect`).selectpicker("show");

            this.multipleVariableSets = this.variableSets.length > 1;
        } else {
            this.multipleVariableSets = false;

            // Hide selectpicker selector
            $(`#${this._prefix}-variableSetSelect`).selectpicker("hide");
        }
    }

    renderDomRepeat(e) {
        $("select.selectpicker", this).selectpicker("refresh");
        $("select.selectpicker", this).selectpicker("deselectAll");
    }

    getDefaultConfig() {
        return {
            variableSelector: {
                marginLeft: 20,
                marginStep: 15
            },
            class: "",
            buttonClass: "",
            inputClass: ""
        };
    }

    render() {
        return html`
        <style>
            .plus-button {
                color: #00AA33;
                cursor: pointer;
            }

            .plus-button:hover {
                color: #009c2c;
            }
        </style>

        <div id="${this._prefix}-main-annotation-comparator-div">
            ${this.variableSets.length ? html`
                <!-- Annotations -->
                ${this.multipleVariableSets ? html`
                    <label for="${this._prefix}-variableSetSelect">Select Variable Set</label>
                    <select class="selectpicker" id="${this._prefix}-variableSetSelect" @change="${this.entryIdsObserver}"
                            on-dom-change="renderDomRepeat" data-width="auto">
                        <!--<select class="form-control" id="variableSetSelect" style="width: 100%"-->
                        <!--on-change="onSelectedVariableSetChange">-->
                        ${this.variableSets && this.variableSets.length && this.variableSets.map( item => html`
                            <option data-variable="{{item}}">{{item.id}}</option>
                        `)}
                    </select>
                ` : null}
                <table id="${this._prefix}-ac-table" data-test-id="variant-sample-grid-sample-selector" data-show-columns="true" data-show-export="true"
                       data-page-size="100">
                </table>
            ` : html`
                <p>No variableSets defined in the study</p>
            `}


        </div>
        `;
    }
}

customElements.define("opencga-annotation-comparator", OpencgaAnnotationComparator);
