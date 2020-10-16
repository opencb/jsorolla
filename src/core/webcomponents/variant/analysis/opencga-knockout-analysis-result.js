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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../../utilsNew.js";
import "../../commons/analysis/opencga-analysis-tool.js";
import AnalysisRegistry from "./analysis-registry.js";


export default class OpencgaKnockoutAnalysisResult extends LitElement {

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
            config: {
                type: Object
            },
            job: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oga-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.job = null;
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return AnalysisRegistry.get("knockout").config;
    }

    render() {
        return html`
            <table class="table table-bordered table-condensed">
                <thead>
                    <tr>
                        <th></th>
                        <th>h1</th>
                        <th>h2</th>
                        <th>h3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td>v1</td>
                        <td>v2</td>
                        <td>v3</td>
                    </tr>
                    <tr>
                        <th scope="row">2</th>
                        <td>v4</td>
                        <td>v5</td>
                        <td>v6</td>
                    </tr>
                    <tr>
                        <th scope="row">3</th>
                        <td>v7</td>
                        <td>v8</td>
                        <td>v9</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}

customElements.define("opencga-knockout-analysis-result", OpencgaKnockoutAnalysisResult);
