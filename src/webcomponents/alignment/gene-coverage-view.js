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
import "../alignment/gene-coverage-grid.js";
import "../alignment/gene-coverage-detail.js";


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
            geneCoverageStats: {
                type: Object
            },
            config: {
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
        if (changedProperties.has("geneCoverageStats")) {
            this.transcriptCoverageStats = this.geneCoverageStats.stats[0];
            this.requestUpdate();
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
        // this.geneCoverageStats
        // this.transcriptCoverageStats
        // debugger
        return html`
            <gene-coverage-grid .opencgaSession="${this.opencgaSession}"
                                .config="${this._config?.filter?.grid}"
                                .transcriptCoverageStats="${this.geneCoverageStats?.stats}"
                                @selectrow="${e => this.onClickRow(e)}">
            </gene-coverage-grid>
            <gene-coverage-detail   .transcriptCoverageStats="${this.transcriptCoverageStats}"
                                    .config="${this._config}" .opencgaSession="${this.opencgaSession}">
            </gene-coverage-detail>
        `;
    }

}

customElements.define("gene-coverage-view", GeneCoverageView);
