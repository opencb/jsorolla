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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "../../../utils.js";


export default class FacetFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            },
            // selectedFacet is a prop to keep the chance in the future to preselect fields
            selectedFacet: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + Utils.randomString(6) + "_";

    }

    updated(changedProperties) {
        if(changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
    }

    selectedFacetObserver() {
        /**
         * Helper for formatting the list of facets to show in opencga-active-filters
         */
        const _valueFormatter = (k, v) => {
            let str = "";
            if (v.fn && (v.fn === "Avg" || v.fn === "Percentile")) {
                str = v.fn + "(" + k + ")";
            } else {
                str = k + v.value;
            }
            if (v.nested) {
                str += ">>" + ((v.nested.fn && (v.nested.fn === "Avg" || v.nested.fn === "Percentile")) ? v.nested.fn + "(" + v.nested.facet + ")" : v.nested.facet + v.nested.value);
            }
            return str;
        };
        if (Object.keys(this.selectedFacet).length) {
            // Object property spreading cannot be used here as it creates an Object with numeric indexes in Chrome 78...
            this.selectedFacetFormatted = Object.assign({}, ...Object.keys(this.selectedFacet).map(k => ({
                [k]: {
                    ...this.selectedFacet[k],
                    formatted: _valueFormatter(k, this.selectedFacet[k])
                }
            })));
        } else {
            this.selectedFacetFormatted = {};
        }
        const event = new CustomEvent("facetQueryChange", {
            detail: {
                value: this.selectedFacetFormatted
            }
        });
        this.dispatchEvent(event);
        this.requestUpdate();
    }

    addDefaultFacet() {
        for (const defaultFacetId of this.config.default) {
            const facet = defaultFacetId.split(">>");
            console.log(facet);
            // in case of nested facets
            if (facet.length > 1) {
                const mainFacet = this._recFind(this.config.sections, facet[0]);
                const nestedFacet = this._recFind(this.config.sections, facet[1]);
                console.log("nestedFacet", nestedFacet);
                this.selectedFacet[facet[0]] = {
                    ...mainFacet,
                    value: mainFacet && mainFacet.defaultValue ? mainFacet.defaultValue : "",
                    nested: {...nestedFacet, facet: facet[1], value: nestedFacet.defaultValue || ""}
                };
            } else {
                const mainFacet = this._recFind(this.config.sections, facet[0]);
                this.selectedFacet[defaultFacetId] = {...mainFacet, value: mainFacet && mainFacet.defaultValue ? mainFacet.defaultValue : ""};
            }
        }
        this.selectedFacet = {...this.selectedFacet};
    }

    async onFacetFieldChange(e) {
        const currentSelectionNames = e.detail.value ? e.detail.value.split(",") : [];
        // compute the symmetric difference between this.selectedFacet and currentSelectionNames
        const differences = Object.keys(this.selectedFacet)
            .filter(a => !currentSelectionNames.includes(a))
            .concat(currentSelectionNames.filter(name => !Object.keys(this.selectedFacet).includes(name)));

        // the difference involves one item a time
        if (differences.length > 1) console.error("Difference error!", this.selectedFacet, currentSelectionNames);

        const difference = differences[0];
        // addition
        if (currentSelectionNames.length > Object.keys(this.selectedFacet).length) {
            console.log("addition of", difference);
            // Array.find() cannot be nested.. let newField = this.config.sections.find(field => field.fields ? field.fields.find(nested => nested === difference) : field.name === difference);
            // console.log(this.config.sections, difference)
            const newField = this._recFind(this.config.sections, difference);
            // console.log("newField", newField)
            this.selectedFacet[difference] = {...newField, value: newField && newField.defaultValue ? newField.defaultValue : ""};
            await this.requestUpdate();
            $(".bootstrap-select", this).selectpicker();
        } else {
            console.log("deletion of", difference);
            // deletion
            delete this.selectedFacet[difference];
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetValueChange(e) {
        // console.log("onFacetValueChange",e);
        const id = e.target.dataset.id;
        // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? e.target.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetSelectChange(e) {
        // console.log("onFacetSelectChange",e);
        const id = e.target.dataset.id;
        // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.detail.value ? e.detail.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.facet;
        if (value && (value === "Avg" || value === "Percentile")) {
            this.selectedFacet[facet]["fn"] = value;
            this.querySelector("#" + this._prefix + facet + "_text").disabled = true;
        } else {
            delete this.selectedFacet[facet]["fn"];
            this.querySelector("#" + this._prefix + facet + "_text").disabled = false;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    toggleCollapse(e) {
        $(e.target.dataset.collapse).collapse("toggle");
    }

    onNestedFacetValueChange(e) {
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.target.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFieldChange(e, parent) {
        const selected = e.detail.value;
        if (selected) {
            const newField = this._recFind(this.config.sections, selected);
            this.selectedFacet[parent].nested = {...newField, facet: selected, value: newField.defaultValue || ""};
        } else {
            delete this.selectedFacet[parent].nested;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.parentFacet;
        console.log("nestedFacetFNCHANGE", "#" + this._prefix + facet + "_NestedValue");
        if (value && (value === "Avg" || value === "Percentile")) {
            if (this.selectedFacet[facet].nested) {
                this.selectedFacet[facet].nested.fn = value;
                this.querySelector("#" + this._prefix + facet + "_NestedValue").disabled = true;
            } else {
                console.error("function selected before facet!");
            }
        } else {
            this.querySelector("#" + this._prefix + facet + "_NestedValue").disabled = false;
            delete this.selectedFacet[facet].nested.fn;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    _recFind(array, value) {
        for (const f of array) {
            if (f.fields) {
                const r = this._recFind(f.fields, value);
                if (r) return r;
            } else {
                if (f.id === value) {
                    // console.log("found", f);
                    return f;
                }
            }
        }
    }

    renderField(facet) {
        const renderNestedFieldWrapper = facet => html`
                    <!-- nested facet -->
                    <div class="row facet-row nested">
                        <div class="col-md-12 text-center">
                            <a class="btn btn-small collapsed" role="button" data-collapse="#${facet.id}_nested" @click="${this.toggleCollapse}"> <i class="fas fa-arrow-alt-circle-down"></i> Nested Facet (optional) </a>
                            <div class="collapse ${this.selectedFacet[facet.id].nested ? "in" : ""}" id="${facet.id}_nested"> 
                                <div class="">
                                    <select-field-filter multiple .data="${this.config.sections.map(section => ({...section, fields: section.fields.map(item => ({...item, disabled: item.id === facet.id})) }))}" .value=${this.selectedFacet[facet.id].nested ? this.selectedFacet[facet.id].nested.id : null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet.id)}"></select-field-filter>
                                    <div class="row facet-row nested">
                                        ${this.renderNestedField(this.selectedFacet[facet.id].nested, facet.id)}
                                    </div>                                
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- /nested facet -->
        `;

        switch (facet.type) {
            case "category":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <select-field-filter ?multiple="${facet.multiple === undefined || facet.multiple}" .data="${facet.allowedValues}" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_Select" data-id="${facet.id}" @filterChange="${this.onFacetSelectChange}"></select-field-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                    `;
            case "number":
            case "integer":
            case "float":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="Include values or set range" id="${this._prefix}${facet.id}_text" data-id="${facet.id}" .value="${facet.value || ""}" @input="${this.onFacetValueChange}" />
                        </div>
                        <div class="col-md-6">
                            <select-field-filter .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${this._prefix}${facet.id}_FnSelect" data-facet="${facet.id}" @filterChange="${this.onFacetFnChange}"></select-field-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "string":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <input type="text" class="form-control" placeholder="Include values" @input="${this.onFacetValueChange}" data-id="${facet.id}" type="text" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_NestedFnSelect"  />
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            default:
                console.log("no type recognized", facet)
                return html`no type recognized: ${facet.type}`;
        }
    }

    renderNestedField(facet, parent) {
        if (!facet || !facet.type) return null;
        console.log("renderNestedField", facet);
        switch (facet.type) {
            case "category":
                return html`
                    <div class="col-md-12">
                        <select-field-filter ?multiple="${!!facet.multiple}" .data="${facet.values}" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_NestedSelect" data-parent-facet="${parent}" @filterChange="${this.onNestedFacetValueChange}"></select-field-filter>
                    </div>
                `;
            case "number":
            case "integer":
            case "float":
                return html`
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Include values or set range" data-parent-facet="${parent}" .disabled="${!(facet.facet)}" id="${this._prefix}${parent}_NestedValue" .value="${facet.value || ""}"  @input="${this.onNestedFacetValueChange}"  />
                    </div>
                    <div class="col-md-6">
                        <select-field-filter .disabled="${false}" .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${parent}_NestedFnSelect" data-parent-facet="${parent}" @filterChange="${this.onNestedFacetFnChange}"></select-field-filter>
                    </div>
                `;
            case "string":
                return html`
                    <div class="col-md-12">
                        <input type="text" class="form-control" placeholder="Include values" data-parent-facet="${parent}" id="${this._prefix}${facet.id}_Nested_text" .value="${facet.value || ""}"  @input="${this.onNestedFacetValueChange}"  />
                    </div>`;
            default:
                return html`no type recognized`;
        }
    }


    render() {
        return this.config ? html`
                <div class="facet-selector">
                    <label>Select a Term or Range Facet</label>
                    <select-field-filter multiple .data="${this.config.sections}" .value=${Object.keys(this.selectedFacet).join(",")} @filterChange="${this.onFacetFieldChange}"></select-field-filter>
                    <div class="text-center">
                        <p class="or-text">- or -</p>
                        <button class="btn btn-default btn-small ripple" @click="${this.addDefaultFacet}">Add default fields</button>
                    </div> 
                </div>
            
                <div class="facet-list-container">
                    <label>Selected facets</label>
                    <div class="facet-list">
                        <!-- this.selectedFacet <pre>${JSON.stringify(this.selectedFacet, null, "  ")}</pre> --> 
                        
                        ${Object.keys(this.selectedFacet).length > 0 ? Object.entries(this.selectedFacet).map(([, facet]) => html`
                            <div class="facet-box" id="${this._prefix}Heading">
                                <div class="subsection-content form-group">
                                    <div class="browser-subsection">
                                        ${facet.name}
                                        ${facet.description ? html`
                                            <div class="tooltip-div pull-right">
                                                <a tooltip-title="${facet.name}" tooltip-text="${facet.description}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                                            </div>` : null }
                                    </div>
                                    <div id="${this._prefix}${facet.id}" class="" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                        <div class="">
                                        ${this.renderField(facet)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `) : html`
                            <div class="alert alert-info text-center" role="alert"><i class="fas fa-3x fa-info-circle"></i><br><small>No aggregation field has been selected yet.</small></div>
                        `}
                    </div>
                </div>
        ` : "no config";
    }
}

customElements.define("facet-filter", FacetFilter);
