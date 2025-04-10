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
import PolymerUtils from "../../../PolymerUtils.js";

// TODO check functionality and table _generateTable!

import "./opencga-variable-selector.js";

export default class OpencgaAnnotationViewer extends LitElement {

    constructor() {
        super();

        this._init();
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            entryIds: {
                type: Array
            },
            entity: {
                // Allowed values are SAMPLE,INDIVIDUAL,COHORT,FAMILY,FILE
                type: String
            }
        };
    }

    _init() {
        // super.ready();
        this._prefix = "oac-" + UtilsNew.randomString(6);

        this.selectedVariables = [];

        this.ovsConfig = {
            title: "Select variables",
            multiSelection: true,
            onlyAllowLeafSelection: false,
            showResetButton: true
        };
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

        this._annotations = {};

        if (typeof this.opencgaSession.study === "undefined") {
            return;
        }

        if (typeof this.opencgaSession.study.variableSets !== "undefined") {
            this._updateVariableSets(this.opencgaSession.study);
            this.requestUpdate()
        } else {
            const _this = this;

            this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
                .then(function(response) {
                    _this._updateVariableSets(response.response[0].result[0]);
                })
                .catch(function() {
                    _this.multipleVariableSets = false;

                    // Hide all selectpicker selectors
                    $(`#${this._prefix}-variableSetSelect`).selectpicker("hide");

                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
                    this.requestUpdate()

                });
        }
    }

    // TODO refactor
    entryIdsObserver(e) {
        // Get the selected variableSet
        if (e === undefined || typeof e.target === "undefined") {
            const variableSet = $(`button[data-id=${this._prefix}-variableSetSelect]`)[0];
            if (typeof variableSet !== "undefined") {
                const variableSetId = variableSet.title;
                for (const i in this.variableSets) {
                    if (this.variableSets[i].id === variableSetId) {
                        this.selectedVariableSet = this.variableSets[i];
                        break;
                    }
                }
            }
        } else {
            for (const i in this.variableSets) {
                if (this.variableSets[i].id === e.target.value) {
                    this.selectedVariableSet = this.variableSets[i];
                    break;
                }
            }
        }
        console.log("this.variableSets",this.variableSets)

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
        const entryIds = [];
        for (const i in this.entryIds) {
            if (!(this.entryIds[i].id in this._annotations)) {
                entryIds.push(this.entryIds[i].id);
            }
        }

        const _this = this;
        if (entryIds.length > 0) {
            client.info(entryIds.join(","), {
                study: this.opencgaSession.study.id,
                include: "annotationSets,id"
            })
                .then(function(response) {
                    _this._storeAnnotations(response);
                    _this._renderNewTable();
                });
        } else {
            this._storeAnnotations(undefined);
            this._renderNewTable();
        }
    }

    onSelectedVariablesChange(e) {
        const selectedVariables = [];
        for (let i = 0; i < e.detail.value.length; i++) {
            selectedVariables.push(e.detail.value[i].tags);
        }

        this.selectedVariables = selectedVariables;
        this._renderNewTable();
    }

    _renderNewTable() {
        const annotations = {};
        for (const entry in this._annotations) {
            for (let i = 0; i < this._annotations[entry].length; i++) {
                if (this._annotations[entry][i]["variableSetId"] === this.selectedVariableSet.id) {
                    if (!(entry in annotations)) {
                        annotations[entry] = [];
                    }
                    annotations[entry].push(this._annotations[entry][i]);
                }
            }
        }
        console.log("this._annotations",annotations)
        this._generateTable(annotations);
    }

    // TODO urgent refactor
    _generateTable(annotations) {
        console.warn("_generateTable needs to be refactored in lit-element");
        /*
        * <table class="table">
            <thead>
            <tr>
                <th>#</th>
                <th>Firstname</th>
                <th>Lastname</th>
                <th>Age</th>
                <th>City</th>
                <th>Country</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td><span>1</span></td>
                <td><br>Anna</td>
                <td>Pitt</td>
                <td>35</td>
                <td>New York</td>
                <td>USA</td>
            </tr>
            </tbody>
        </table>
        * */

        if (Object.keys(annotations).length === 0) {
            // If the user hasn't selected any sample
            if (this.entryIds.length === 0) {
                PolymerUtils.innerHTML(this._prefix + "-table", "");
            } else {
                PolymerUtils.innerHTML(this._prefix + "-table", "No annotations found in the variable set");
            }
            return;
        }

        let head = "";
        let body = "";

        const filteredAnnotations = {};
        const annotationIds = [];

        console.log("annotations", annotations);
        //TODO continue migration table
/*        const head1 = annotations.map( sampleKey => html`<th> ${sampleKey} ${annotations[sampleKey].map( el => {
            const key = this._prefix + "-" + sampleKey + "-"+ el["variableSetId"] + "-" + el["id"];
            const annotationId = sampleKey + "-"+ el["variableSetId"] + "-" + el["id"] + ".json";
            // We filter the current annotation
            filteredAnnotations[key] = this.getFilteredAnnotations(el);
            const annotationString = JSON.stringify(filteredAnnotations[key]);
            // We generate a button to be able to download the filtered annotation
            return html`<a data-annotation='${annotationString}' data-title='${annotationId}'
                                    title='Download ${annotationId}' style='cursor: pointer; margin-left: 5px'>
                                     <i class='fa fa-download fa-lg' aria-hidden='true'></i>
                                </a>`;

            }).join("") }` ).join("");*/

        for (const sampleKey in annotations) {
            head += "<th>" + sampleKey;

            let annotationHtml = "";
            for (let i = 0; i < annotations[sampleKey].length; i++) {
                const key = this._prefix + "-" + sampleKey + "-"+ annotations[sampleKey][i]["variableSetId"] + "-" +
                    annotations[sampleKey][i]["id"];
                const annotationId = sampleKey + "-"+ annotations[sampleKey][i]["variableSetId"] + "-" +
                    annotations[sampleKey][i]["id"] + ".json";

                // We filter the current annotation
                filteredAnnotations[key] = this.getFilteredAnnotations(annotations[sampleKey][i]);
                const annotationString = JSON.stringify(filteredAnnotations[key]);

                // We generate a button to be able to download the filtered annotation
                head += `<a data-annotation='${annotationString}' data-title='${annotationId}'
                                    title='Download ${annotationId}' style='cursor: pointer; margin-left: 5px'>
                                     <i class='fa fa-download fa-lg' aria-hidden='true'></i>
                                </a>`;
                annotationIds.push(annotationId);

                annotationHtml += "<div id=\"" + key + "\"></div>";
            }

            head += "</th>";
            body += "<td>" + annotationHtml + "</td>";
        }

        let html = "<table class=\"table\">";
        html += "<thead class='table-light'><tr>" + head + "</tr></thead>";
        html += "<tbody><tr>" + body + "</tr></tbody>";
        html += "</table>";

        console.log(html)
        PolymerUtils.innerHTML(this._prefix + "-table", html);
        // We now add the on-click event (it was impossible adding it to the html directly)
        for (let i = 0; i < annotationIds.length; i++) {
            $(`a[data-title='${annotationIds[i]}']`)[0].addEventListener("click", this.downloadFile);
        }

        // Now we iterate again to view the jsons in the table
        for (const sampleKey in annotations) {
            for (let i = 0; i < annotations[sampleKey].length; i++) {
                const key = this._prefix + "-" + sampleKey + "-"+ annotations[sampleKey][i]["variableSetId"] + "-" +
                    annotations[sampleKey][i]["id"];
                $("#" + key).jsonViewer(filteredAnnotations[key]);
            }
        }
    }

    downloadFile(e) {
        const mime_type = "text/plain";

        const name = e.currentTarget.dataset.title;
        const contents = e.currentTarget.dataset.annotation;

        const blob = new Blob([contents], {type: mime_type});

        const dlink = document.createElement("a");
        dlink.download = name;
        dlink.href = window.URL.createObjectURL(blob);
        dlink.onclick = function(e) {
            // revokeObjectURL needs a delay to work properly
            const that = this;
            setTimeout(function() {
                window.URL.revokeObjectURL(that.href);
            }, 1500);
        };

        dlink.click();
        dlink.remove();
    }

    _storeAnnotations(response) {
        // Add the new samples
        if (typeof response !== "undefined") {
            for (let i = 0; i < response.response.length; i++) {
                for (let j = 0; j < response.response[i].result.length; j++) {
                    const entry = response.response[i].result[j];
                    if (UtilsNew.isNotUndefinedOrNull(entry.annotationSets)) {
                        this._annotations[entry.id] = entry.annotationSets;
                    }
                }
            }
        }

        // Remove unselected samples
        const selectedEntries = [];
        for (let i = 0; i < this.entryIds.length; i++) {
            selectedEntries.push(this.entryIds[i].id);
        }

        for (const entry in this._annotations) {
            if (selectedEntries.indexOf(entry) === -1) {
                delete this._annotations[entry];
            }
        }
    }

    getFilteredAnnotations(annotationSet) {
        // If the user hasn't filtered, we will show all the information
        if (this.selectedVariables.length === 0) {
            return annotationSet;
        }

        const annotationSetCopy = {};
        Object.assign(annotationSetCopy, annotationSet);

        const annotations = {};
        for (let i = 0; i < this.selectedVariables.length; i++) {
            const keys = this.selectedVariables[i].split(".");
            this._addFilteredAnnotation(keys, annotations, annotationSet.annotations);
        }

        annotationSetCopy["annotations"] = annotations;

        return annotationSetCopy;
    }

    // This method will clone in 'annotationClone' the object keys 'keys' read from 'annotation'
    _addFilteredAnnotation(keys, annotationClone, annotation) {
        const myKey = keys[0];

        if (keys.length === 1) {
            if (typeof annotation !== "undefined" && typeof annotation[myKey] !== "undefined") {
                annotationClone[myKey] = annotation[myKey];
            }
        } else {
            if (Array.isArray(annotation[myKey])) {
                if (!(myKey in annotationClone)) {
                    annotationClone[myKey] = [];
                }
                for (let i = 0; i < annotation[myKey].length; i++) {
                    let myObject;
                    if (annotationClone[myKey].length === annotation[myKey].length) {
                        // The array was already defined
                        myObject = annotationClone[myKey][i];
                    } else {
                        myObject = {};
                        annotationClone[myKey].push(myObject);
                    }

                    this._addFilteredAnnotation(keys.slice(1), myObject, annotation[myKey][i]);
                }
            } else if (typeof annotation[myKey] !== "undefined") {
                // It is an object
                if (!(myKey in annotationClone)) {
                    annotationClone[myKey] = {};
                }
                this._addFilteredAnnotation(keys.slice(1), annotationClone[myKey], annotation[myKey]);
            }
        }
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
        $("select.selectpicker").selectpicker("refresh");
        $("select.selectpicker").selectpicker("deselectAll");
    }

    render() {
        return html`
        <div style="padding: 15px 20px">
            <div id="${this._prefix}-main-annotation-comparator-div">

                ${this.variableSets && this.variableSets.length ? html`
                <!-- Annotations -->
                    ${this.multipleVariableSets ? html`
                        <div style="width: 40%">
                            <label for="${this._prefix}-variableSetSelect">Select Variable Set</label>
                            <select class="selectpicker" id="${this._prefix}-variableSetSelect" @change="${this.entryIdsObserver}" data-width="40%">
                                <!--<select class="form-control" id="variableSetSelect" style="width: 100%"-->
                                <!--on-change="onSelectedVariableSetChange">-->
                                ${this.variableSets && this.variableSets.length && this.variableSets.map( item => html`
                                    <option data-variable="${item}">${item.id}</option>
                                `) }
                            </select>
                        </div>
                        <div style="width: 50%">
                            <opencga-variable-selector .variableSet="${this.selectedVariableSet}" .config="${this.ovsConfig}"
                                                       @variablechange="${this.onSelectedVariablesChange}">
                            </opencga-variable-selector>
                        </div>

                    ` : null }

                    <div id="${this._prefix}-table" style="padding: 25px 10px; max-height: 500px; overflow-x: auto; overflow-y: auto;"></div>

                ` : html`
                    <p>No variableSets defined in the study</p>
                `}
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-annotation-viewer", OpencgaAnnotationViewer);
