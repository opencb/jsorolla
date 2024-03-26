/*
 * Copyright 2015-2024 OpenCB
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
import "./genome-browser.js";

export default class SplitGenomeBrowser extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            regions: {
                type: Array,
            },
            species: {
                type: String,
            },
            tracks: {
                type: Array,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    render() {
        if (!this.opencgaSession || !this.regions) {
            return null;
        }

        return html`
            <div class="row">
                ${this.regions.map(region => html`
                    <div class="col-md-6">
                        <genome-browser
                            .opencgaSession="${this.opencgaSession}"
                            .region="${region}"
                            .active="${this.active}"
                            .species="${this.species}"
                            .tracks="${this.tracks}"
                            .config="${this.config}">
                        </genome-browser>
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("split-genome-browser", SplitGenomeBrowser);
