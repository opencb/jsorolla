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
import UtilsNew from "../../core/utilsNew.js";


export default class AnnotationSetsView extends LitElement {

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
            annotationSets: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
    }

    updated(changedProperties) {

    }

    renderVariableSet(variableSet) {
        return html`
            <div class="">
                <div class="">
                    <b>${variableSet.name}</b>
                        <!-- <span class="text-muted font-smaller"><i class="far fa-calendar-alt"></i>  ${UtilsNew.dateFormatter(variableSet.creationDate)} </span>-->
                </div>
                <div>
                    ${Object.entries(variableSet.annotations).map(([k, v]) => {
                        return html`
                            <div class="row detail-row">
                                <div class="col-md-4 text-left">
                                    <label>${k}</label>
                                </div>
                                <div class="col-md-8">
                                    ${v}
                                </div>
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
        <div>
            ${this.annotationSets?.map(annotationSet => this.renderVariableSet(annotationSet))}
        </div>
        `;
    }

}

customElements.define("annotation-sets-view", AnnotationSetsView);
