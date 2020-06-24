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
import UtilsNew from "../../utilsNew.js";
import {classMap} from "/web_modules/lit-html/directives/class-map.js";

export default class GeneCoverageView extends LitElement {

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
            geneCoverageStat: {
                type: Object
            },
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if(changedProperties.has("geneCoverageStat")) {
            console.log("this.geneCoverageStat", this.geneCoverageStat)
        }
    }

    onClickRow(e, geneId) {
        this.transcriptCoverageStats = e.detail.row;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
            <gene-coverage-grid .opencgaSession="${this.opencgaSession}"
                                .config="${this._config?.filter?.grid}"
                                .transcriptCoverageStats="${this.geneCoverageStat.stats}"
                                @selectrow="${e => this.onClickRow(e)}">
            </gene-coverage-grid>
            <gene-coverage-detail   .transcriptCoverageStats="${this.transcriptCoverageStats}" 
                                    .config="${this._config.filter.detail}" .opencgaSession="${this.opencgaSession}">
            </gene-coverage-detail>
        `;
    }

}

customElements.define("gene-coverage-view", GeneCoverageView);
