/*
 * Copyright 2015-2016 OpenCB
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
import "../commons/filters/consequence-type-select-filter.js";
import "../commons/forms/select-field-filter.js";

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
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.fns = {avg: "Average", min: "Minimum", max: "Maxiumum", unique: "Uniques values", hll: "Distributed cardinality estimate", percentile: "Percentile estimate", sumsq: "Sum of squares of fields or function"};
        this.selectFns = Object.entries({range: "Range", ...this.fns}).map(([k, v]) => ({id: k, name: v}));

        // copy of selectedFacet in JSON string, to avoid unnecessary refresh
        this._JsonSelectedFacet = null;
        this.preparedQuery = {};

    }

    update(changedProperties) {
        if (changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
        super.update(changedProperties);
    }

    selectedFacetObserver() {

        // Helper for formatting the list of facets to show in opencga-active-filters
        const _valueFormatter = (k, v) => {
            let str = "";
            if (v.fn && v.fn in this.fns) {
                str = v.fn + "(" + k + ")";
            } else {
                // range type
                // str = k + (v.value ? "[" + v.value + "]" : "");
                str = k + (v.value ?? "");
            }
            if (v.nested) {
                str += ">>" + ((v.nested.fn && v.nested.fn in this.fns) ? v.nested.fn + "(" + v.nested.facet + ")" : v.nested.facet + (v.nested.value ?? ""));
            }
            return str;
        };

        // Fires `facetQueryChange` event iff this.electedFacet has actually changed
        if (!this._JsonSelectedFacet || !UtilsNew.objectCompare(this.selectedFacet, JSON.parse(this._JsonSelectedFacet))) {
            this._JsonSelectedFacet = JSON.stringify(this.selectedFacet); // this.selectedFacet is a complex object, {...this.selectedFacet} won't work

            // console.log("selectedFacetObserver", this.selectedFacet);
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
            UtilsNew.initTooltip(this);
            this.dispatchEvent(event);
            // this.requestUpdate();
        } else {
            // console.log("same facet")
        }
    }

    addDefaultFacet() {
        // NOTE default values for facet can be defined in config both in `aggregation.default` array in each browser config (list of default facets) and `fields` array too in `defaultValue` prop for each field.
        // NOTE default values of type Avg() or Percentile() can be defined in `default` array only at the moment

        for (const defaultFacetId of this.config.default) {
            const facet = defaultFacetId.split(">>");
            // extract key, value and function from string
            const {key, value, fn} = this.parseFacet(facet[0]);
            // console.log({key, value, fn})
            const mainFacet = this._recFind(this.config.sections, key);
            this.selectedFacet[key] = {
                ...mainFacet,
                facet: key,
                value: value ?? mainFacet?.defaultValue ?? "",
                fn
            };
            // in case of nested facets
            if (facet.length > 1) {
                const {key: nestedFacetKey, value: nestedFacetValue, fn} = this.parseFacet(facet[1]);
                const nestedFacet = this._recFind(this.config.sections, nestedFacetKey);
                this.selectedFacet[key].nested = {...nestedFacet, facet: nestedFacetKey, value: nestedFacetValue ?? nestedFacet.defaultValue ?? "", fn};
            }

        }
        this.selectedFacet = {...this.selectedFacet};
        UtilsNew.initTooltip(this);
    }

    // Extracts facet field name, value and function (Avg or Percentile) from default list (or saved facet, in future)
    parseFacet(str) {
        const fnMatch = [...str.matchAll(/(avg|min|max|unique|hll|percentile|sumsq)\((\w+)\)/gi)];
        // range values
        const valMatch = [...str.matchAll(/(\w+)((\[[^\s]+])?(:\d+)?)?/gi)];
        if (fnMatch.length) {
            const [, fn, key] = fnMatch[0];
            return {key, fn, value: ""};
        } else if (valMatch.length) {
            const [, key, value] = valMatch[0];
            return {key, value};
        }
    }

    async onFacetFieldChange(e) {
        /**
         *  <select-field-filter> fires a filterChange event with all the selected values. Here we need just the new selected (deselected) item, so we compute the difference between the 2 sets.
        */

        const currentSelectionNames = e.detail.value ? e.detail.value.split(",") : [];
        // compute the symmetric difference between this.selectedFacet and currentSelectionNames
        const differences = Object.keys(this.selectedFacet)
            .filter(a => !currentSelectionNames.includes(a))
            .concat(currentSelectionNames.filter(name => !Object.keys(this.selectedFacet).includes(name)));

        // the difference involves one item at a time
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
            this.requestUpdate();
            await this.updateComplete;
            $(".bootstrap-select", this).selectpicker();
        } else {
            console.log("deletion of", difference);
            // deletion
            delete this.selectedFacet[difference];
        }
        this.selectedFacet = {...this.selectedFacet};
        UtilsNew.initTooltip(this);
        // await this.requestUpdate();

    }

    onFacetRangeChange(e) {
        console.log("onFacetValueChange", e);
        const {id, type} = e.target.dataset;
        const start = this.querySelector("#" + this._prefix + id + "_range_start").value;
        const stop = this.querySelector("#" + this._prefix + id + "_range_stop").value;
        const step = this.querySelector("#" + this._prefix + id + "_range_step").value;
        const value = start && stop && step ? `[${start}..${stop}]:${step}` : null;
        this.selectedFacet[id].value = value ?? "";
        this.selectedFacet = {...this.selectedFacet};
        // NOTE this is commented this to avoid immediate reset of all 3 fields in case one is changed to be empty
        // So onFacetRangeChange() the data model changes, but it is not immediately reflected to the view IF one of start, stop, step is undefined
        // this.requestUpdate();
    }

    onNestedFacetRangeChange(e) {
        const {parentFacet} = e.target.dataset;
        const start = this.querySelector("#" + this._prefix + parentFacet + "_Nested_range_start").value;
        const stop = this.querySelector("#" + this._prefix + parentFacet + "_Nested_range_stop").value;
        const step = this.querySelector("#" + this._prefix + parentFacet + "_Nested_range_step").value;
        const value = start && stop && step ? `[${start}..${stop}]:${step}` : null;
        this.selectedFacet[parentFacet].nested.value = value ?? "";
        this.selectedFacet = {...this.selectedFacet};
        // NOTE this is commented to avoid immediate reset of all 3 fields in case one is changed to be empty
        // So onFacetRangeChange() the data model changes, but it is not immediately reflected to the view IF one of start, stop, step is undefined
        // this.requestUpdate();
    }

    // CAUTION: possibly not needed
    // onFacetSelectChange(e) {
    //
    //     // e.stopPropagation();
    //     console.log("onFacetSelectChange", e);
    //     const id = e.target.dataset.id;
    //     // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
    //     this.selectedFacet[id].value = e.detail.value ? `[${e.detail.value}]` : "";
    //     this.selectedFacet = {...this.selectedFacet};
    //     this.requestUpdate();
    // }

    onFacetValueChange(e) {
        const id = e.target.dataset.id;
        // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? `[${e.target.value}]` : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetChange(e, facetId) {
        this.selectedFacet[facetId].value = e.detail.value ? `[${e.detail.value}]` : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.facet;
        if (value && value in this.fns) {
            this.selectedFacet[facet]["fn"] = value;
            this.querySelector("#" + this._prefix + facet + "_range_start").disabled = true;
            this.querySelector("#" + this._prefix + facet + "_range_stop").disabled = true;
            this.querySelector("#" + this._prefix + facet + "_range_step").disabled = true;
        } else {
            delete this.selectedFacet[facet]["fn"];
            this.querySelector("#" + this._prefix + facet + "_range_start").disabled = false;
            this.querySelector("#" + this._prefix + facet + "_range_stop").disabled = false;
            this.querySelector("#" + this._prefix + facet + "_range_step").disabled = false;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetSelectChange(e) {
        e.stopPropagation();
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.detail.value ? `[${e.detail.value}]` : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetValueChange(e) {
        console.log("onNestedFacetValueChange", e);
        e.stopPropagation();
        const value = e.target.value ?? "";
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = `[${value}]`;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFieldChange(e, parent) {
        const selected = e.detail.value;
        if (selected) {
            const newField = this._recFind(this.config.sections, selected);
            this.selectedFacet[parent].nested = {...newField, facet: selected, value: newField?.defaultValue || ""};
        } else {
            delete this.selectedFacet[parent].nested;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.parentFacet;
        if (value && value in this.fns) {
            if (this.selectedFacet[facet].nested) {
                this.selectedFacet[facet].nested.fn = value;
                /* this.querySelector("#" + this._prefix + facet + "_Nested_range_start").disabled = true;
                this.querySelector("#" + this._prefix + facet + "_Nested_range_stop").disabled = true;
                this.querySelector("#" + this._prefix + facet + "_Nested_range_step").disabled = true;*/

            } else {
                console.error("function selected before facet!");
            }
        } else {
            /* this.querySelector("#" + this._prefix + facet + "_Nested_range_start").disabled = false;
            this.querySelector("#" + this._prefix + facet + "_Nested_range_stop").disabled = false;
            this.querySelector("#" + this._prefix + facet + "_Nested_range_step").disabled = false;*/
            delete this.selectedFacet[facet].nested.fn;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    toggleCollapse(e) {
        $(e.target.dataset.collapse).collapse("toggle");
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
            <div class="row">
                <div class="text-center">
                    <a class="btn btn-small collapsed" role="button" data-collapse="#${facet.id}_nested" @click="${this.toggleCollapse}">
                        <i class="fas fa-arrow-alt-circle-down"></i> Nested Facet (optional)
                    </a>
                    <div class="collapse ${this.selectedFacet[facet.id].nested ? "in" : ""}" id="${facet.id}_nested">
                        <select-field-filter
                            .data="${this.config.sections.map(section => ({...section, fields: section.fields.map(item => ({...item, disabled: item.id === facet.id}))}))}"
                            .value=${this.selectedFacet[facet.id].nested ? this.selectedFacet[facet.id].nested.id : null}
                            @filterChange="${e => this.onNestedFacetFieldChange(e, facet.id)}">
                        </select-field-filter>
                        <div class="pt-1 pb-2">
                            ${this.renderNestedField(this.selectedFacet[facet.id].nested, facet.id)}
                        </div>
                    </div>
                </div>
            </div>
            <!-- /nested facet -->
        `;

        switch (facet.type) {
            case "consequence-type":
                return html `
                    <div class="row">
                        <div class="col-md-12">
                            <consequence-type-select-filter
                                .ct="${this.preparedQuery.ct}"
                                .config="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                                @filterChange="${e => this.onFacetChange(e, facet.id)}">
                            </consequence-type-select-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "category":
                const [, value] = facet.value ? [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                return html`
                    <div class="row">
                        <div class="col-md-12">
                            <select-field-filter
                                .data="${facet.allowedValues}"
                                .value="${value ?? facet.defaultValue ?? ""}"
                                .config="${{
                                    multiple: facet.multiple === undefined || facet.multiple,
                                }}"
                                id="${facet.id}_Select"
                                data-id="${facet.id}"
                                @filterChange="${e => this.onFacetChange(e, facet.id)}">
                            </select-field-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "number":
            case "integer":
            case "float":
                const [, numValue] = facet.value ? [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                const [, nstart, nstop, nstep] = facet.value ? [...facet.value.matchAll(/\[(.*)\.\.(.*)]:(.*)/gim)][0] : "";
                return html `
                    <div class="row row-cols-auto g-1">
                        <!-- Start Stop Step for Range -->
                        <div class="col-8">
                            <div class="row g-1">
                                <div class="col">
                                <input type="text" class="form-control" placeholder="Start"
                                        id="${this._prefix}${facet.id}_range_start" .disabled="${facet.fn}"
                                        data-id="${facet.id}" data-type="range_start" .value="${nstart || ""}"
                                        @input="${this.onFacetRangeChange}" />
                                </div>
                                <div class="col">
                                    <input type="text" class="form-control" placeholder="Stop"
                                            id="${this._prefix}${facet.id}_range_stop" .disabled="${facet.fn}"
                                            data-id="${facet.id}" data-type="range_stop" .value="${nstop || ""}"
                                            @input="${this.onFacetRangeChange}" />
                                </div>
                                <div class="col">
                                    <input type="text" class="form-control" placeholder="Step"
                                            id="${this._prefix}${facet.id}_range_step" .disabled="${facet.fn}"
                                            data-id="${facet.id}" data-type="range_step" .value="${nstep || ""}"
                                            @input="${this.onFacetRangeChange}" />
                                </div>
                            </div>
                        </div>
                            <!-- this.fncs -->
                        <div class="col-4">
                            <div class="col">
                                <select-field-filter
                                    .data="${this.selectFns || {}}"
                                    .value="${facet.fn ?? "range"}"
                                    id="${this._prefix}${facet.id}_FnSelect"
                                    data-facet="${facet.id}"
                                    @filterChange="${this.onFacetFnChange}">
                                </select-field-filter>
                            </div>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "string":
                const [, strvalue] = facet.value ? [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                return html`
                    <div class="row">
                        <div class="col-md-12">
                            <input
                                type="text"
                                class="form-control"
                                placeholder="Include values"
                                @input="${this.onFacetValueChange}"
                                data-id="${facet.id}"
                                .value="${strvalue ?? facet.defaultValue ?? ""}"
                                id="${facet.id}_NestedFnSelect"  />
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "boolean":
                return html`
                    <div class="row">
                        <div class="col-md-12">
                            <fieldset>
                                <div class="switch-toggle text-white">
                                    <input id="${this._prefix}-true" class="form-group-sm" type="radio" name="${this._prefix}-options" value="True" data-id="${facet.id}" @change="${this.onFacetValueChange}">
                                    <label for="${this._prefix}-true"><span class="small">True</span></label>
                                    <input id="${this._prefix}-false" class="form-group-sm" type="radio" name="${this._prefix}-options" value="False" data-id="${facet.id}" @change="${this.onFacetValueChange}">
                                    <label for="${this._prefix}-false"><span class="small">False</span></label>
                                    <a class="btn btn-primary ripple"></a>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    `;
            default:
                console.log("no type recognized", facet);
                return html`<div class="alert alert-danger">Type not recognized: ${JSON.stringify(facet)}</div>`;
        }
    }

    renderNestedField(facet, parent) {
        if (!facet || !facet.type) return null;
        switch (facet.type) {
            case "consequence-type":
                // return facet.render(facet.id);
                // console.log("renderNestedField");
                return html `
                    <consequence-type-select-filter
                        .ct="${this.preparedQuery.ct}"
                        .config="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                        @filterChange="${e => this.onFacetChange(e, facet.id)}">
                    </consequence-type-select-filter>
                `;
            case "category":
                const [, value] = facet.value ?
                    [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                return html`
                    <div class="col-md-12">
                        <select-field-filter
                            .data="${facet.allowedValues}"
                            .value="${value}"
                            .config="${{
                                multiple: facet.multiple === undefined || facet.multiple
                            }}"
                            id="${facet.id}_NestedSelect"
                            data-parent-facet="${parent}"
                            @filterChange="${this.onNestedFacetSelectChange}">
                        </select-field-filter>
                    </div>
                `;
            case "number":
            case "integer":
            case "float":
                const [, numvalue] = facet.value ? [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                const [, nstart, nstop, nstep] = facet.value ? [...facet.value.matchAll(/\[(.*)\.\.(.*)]:(.*)/gim)][0] : "";

                return html`
                    <div class="row g-1">
                        <div class="col-md-8">
                            <div class="row g-1">
                                <div class="col-md-4">
                                    <input type="text" class="form-control" placeholder="Start" data-parent-facet="${parent}"
                                        id="${this._prefix}${parent}_Nested_range_start" .disabled="${facet.fn}"
                                        data-id="${facet.id}" data-type="range_start" .value="${nstart || ""}"
                                        @input="${this.onNestedFacetRangeChange}" />
                                </div>
                                <div class="col-md-4">
                                    <input type="text" class="form-control" placeholder="Stop" data-parent-facet="${parent}"
                                        id="${this._prefix}${parent}_Nested_range_stop" .disabled="${facet.fn}"
                                        data-id="${facet.id}" data-type="range_stop" .value="${nstop || ""}"
                                        @input="${this.onNestedFacetRangeChange}" />
                                </div>
                                <div class="col-md-4">
                                    <input type="text" class="form-control" placeholder="Step" data-parent-facet="${parent}"
                                        id="${this._prefix}${parent}_Nested_range_step" .disabled="${facet.fn}"
                                        data-id="${facet.id}" data-type="range_step" .value="${nstep || ""}"
                                        @input="${this.onNestedFacetRangeChange}" />
                                </div>
                            </div>
                            <!--<input type="text" class="form-control" placeholder="Include values or set range" data-parent-facet="\${parent}"
                            .disabled="\${!(facet.facet)}" id="\${this._prefix}\${parent}_NestedValue"
                            .value="\${num_value || ""}"  @input="\${this.onNestedFacetValueChange}"  />-->
                        </div>
                        <div class="col-md-4">
                            <select-field-filter
                                .data="${this.selectFns || {}}"
                                .value="${facet.fn ?? "range"}"
                                .config="${{
                                    disabled: false
                                }}"
                                id="${parent}_NestedFnSelect"
                                data-parent-facet="${parent}"
                                @filterChange="${this.onNestedFacetFnChange}">
                            </select-field-filter>
                        </div>
                    </div>
                `;
            case "string":
                const [, strvalue] = facet.value ? [...facet.value.matchAll(/\[([^\s]+)]/gim)][0] : "";
                return html`
                    <div class="col-md-12">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Include values"
                            data-parent-facet="${parent}"
                            id="${this._prefix}${facet.id}_Nested_text"
                            .value="${strvalue || ""}"
                            @input="${this.onNestedFacetValueChange}"  />
                    </div>`;
            case "boolean":
                return html`
                    <div class="row">
                        <div class="col-md-12">
                            <fieldset>
                                <div class="switch-toggle text-white">
                                    <input id="${this._prefix}-true" class="form-group-sm" type="radio" name="${this._prefix}-options" value="True" data-id="${facet.id}" @change="${this.onNestedFacetValueChange}">
                                    <label for="${this._prefix}-true"><span class="small">True</span></label>
                                    <input id="${this._prefix}-false" class="form-group-sm" type="radio" name="${this._prefix}-options" value="False" data-id="${facet.id}" @change="${this.onNestedFacetValueChange}">
                                    <label for="${this._prefix}-false"><span class="small">False</span></label>
                                    <a class="btn btn-primary ripple"></a>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    `;
            default:
                return html`no type recognized`;
        }
    }

    render() {
        return this.config ? html`
            <div class="mb-3 cy-facet-selector">
                <label class="form-label fw-bold">
                    Select a Term or Range Facet
                </label>
                <select-field-filter
                    .data="${this.config.sections}"
                    .value="${Object.keys(this.selectedFacet).join(",")}"
                    .config="${{
                        multiple: true,
                    }}"
                    @filterChange="${this.onFacetFieldChange}">
                </select-field-filter>
                <div class="text-center">
                    <div>- or -</div>
                    <button class="btn btn-light btn-small cy-default-facets-button" @click="${this.addDefaultFacet}">
                        Add default fields
                    </button>
                </div>
            </div>

            <div class="pt-2 border-top">
                <label class="form-label fw-bold">
                    Selected facets
                </label>
                <div>
                    <!-- this.selectedFacet <pre>\${JSON.stringify(this.selectedFacet, null, "  ")}</pre> -->
                    ${Object.keys(this.selectedFacet).length > 0 ? Object.entries(this.selectedFacet).map(([, facet], i) => html `
                        <div class="pt-2 ${i > 0?"border-top":""}" id="${this._prefix}Heading">
                            <div class="subsection-content form-group">
                                <label class="form-label fw-bold browser-subsection">
                                    ${facet.name}
                                    ${facet.description ? html`
                                        <a tooltip-title="${facet.name}" tooltip-text="${facet.description}">
                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                        </a>
                                        ` : null}
                                </label>
                                <div class="container"  id="${this._prefix}${facet.id}" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                    ${this.renderField(facet)}
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
