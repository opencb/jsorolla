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
import Utils from "./../../utils.js";


export default class OpencgaInterpretationVariantReview extends LitElement {

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
            variant: {
                type: Object,
                //observer: "variantObserver"
            },
            // active: {
            //     type: Boolean,
            //     value: false,
            //     observer: "activeObserver"
            // }
        }
    }

    _init(){
        this._prefix = "ovcs" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("variant")) {
            this.variantObserver();
        }
    }

    variantObserver() {
        // this._fetchCohortStats(e);
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        <span>${this.variant ? this.variant.id : ""}</span>
        <div class="form-horizontal" data-toggle="validator" role="form">

            <div class="form-group">
                <label class="control-label col-md-1 jso-label-title">Interpretation ID</label>
                <div class="col-md-3">
                    <input type="text" id="${this._prefix}IDInterpretation" class="${this._prefix}TextInput form-control"
                           placeholder="ID of the interpretation" data-field="id" @input="${this.onInputChange}"
                           value="">
                </div>
            </div>

            <div class="form-group">
                <label class="control-label col-md-1 jso-label-title">Comment</label>
                <div class="col-md-3">
                    <input type="text" id="${this._prefix}CommentInterpretation" class="${this._prefix}TextInput form-control"
                           placeholder="Add a comment" data-field="comment">
                </div>
            </div>

            <div class="form-group">
                <label class="control-label col-md-1 jso-label-title">Description</label>
                <div class="col-md-3">
                    <textarea id="${this._prefix}DescriptionInterpretation" class="${this._prefix}TextInput form-control"
                              placeholder="Description of the interpretation" data-field="description"
                              @input="${this.onInputChange}"></textarea>
                </div>
            </div>

        </div>
        `;
    }
}

customElements.define("opencga-interpretation-variant-review", OpencgaInterpretationVariantReview);

