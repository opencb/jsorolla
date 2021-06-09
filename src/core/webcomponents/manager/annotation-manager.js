/**
 * Copyright 2015-2021 OpenCB
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
import {BaseManagerMixin} from "./base-manager.js";
import "../commons/tool-header.js";
import "../commons/filters/variableset-id-autocomplete.js";
import LitUtils from "../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
export default class AnnotationManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            variableSet: {
                type: Object
            }
        };
    }

    _init() {
        this.annotation = {};
        this.annotationsElements = [];
    }

    update(changedProperties) {
        if (changedProperties.has("variableSet")) {
            this.variablesObserver();
        }
        super.update(changedProperties);
    }

    variablesObserver() {
        const variableSorted = this.variableSet?.variables.sort((a, b) => a.rank > b.rank? 1 : -1);
        this.annotationsElements = variableSorted.map(item => {
            return {
                name: item.id,
                field: item.name,
                type: "input-text",
                display: {
                    placeholder: item.description,
                }
            };
        });
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    elements: this.annotationsElements
                }
            ]
        };
    }

    onFieldChangeAnnotation(e) {
        console.log("onFieldChangeannotation..", this);
        this.annotation = {
            ...this.annotation,
            [e.detail.param]: e.detail.value
        };
        LitUtils.dispatchEventCustom(this, "annotationFieldChange", this.annotation);
        e.stopPropagation();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h4>Annotation</h4>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px">
        </div>
        <div class="subform-test">
            <data-form
                .data=${this.annotation}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangeAnnotation(e)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("annotation-manager", AnnotationManager);
