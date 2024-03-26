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

import {html, LitElement} from "lit";

import ProteinLollipopViz from "../../../core/visualisation/protein-lollipop.js";
import UtilsNew from "../../../core/utils-new.js";


class ProteinLollipopTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._data = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("testDataVersion")) {
            this.testDataVersionObserver();
        }
    }

    testDataVersionObserver() {
        const filesToImport = [
            "protein-lollipop-mtm1-protein.json",
            "protein-lollipop-mtm1-transcript.json",
            "protein-lollipop-mtm1-variants-platinum.json",
            "protein-lollipop-mtm1-variants-cosmic.json",
            "protein-lollipop-mtm1-variants-clinvar.json",
        ];
        const promises = filesToImport.map(file => {
            return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
        });

        // Import all files
        Promise.all(promises)
            .then(data => {
                this._data = {
                    protein: data[0],
                    transcript: data[1],
                    platinumVariants: data[2],
                    cosmicVariants: data[3],
                    clinvarVariants: data[4],
                };
                // Mutate data and draw protein lollipop
                this.mutate();
                this.drawProteinLollipop();
            })
            .catch(error => {
                console.error(error);
            });
    }

    mutate() {
        return null;
    }

    drawProteinLollipop() {
        const target = this.querySelector(`div#${this._prefix}`);

        // Draw protein lollipop
        ProteinLollipopViz.draw(target, this._data.transcript, this._data.protein, this._data.platinumVariants, {
            title: "TEST_STUDY",
            tracks: [
                {
                    type: ProteinLollipopViz.TRACK_TYPES.VARIANTS,
                    title: "Clinvar",
                    data: this._data.clinvarVariants,
                    tooltip: ProteinLollipopViz.clinvarTooltipFormatter,
                    tooltipWidth: "360px",
                },
                {
                    type: ProteinLollipopViz.TRACK_TYPES.VARIANTS,
                    title: "Cosmic",
                    data: this._data.cosmicVariants,
                    tooltip: ProteinLollipopViz.cosmicTooltipFormatter,
                    tooltipWidth: "280px",
                },
            ],
            highlights: [
                {
                    variants: ["X:150638967:G:-"],
                    style: {
                        strokeColor: "#fd984399",
                        strokeWidth: "4px",
                    },
                }
            ],
        });
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <h2 style="font-weight: bold;">
                        Protein Lollipop Test
                    </h2>
                    <div
                        id="${this._prefix}"
                        data-cy="protein-lollipop-container"
                        style="margin-bottom:4rem;">
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("protein-lollipop-test", ProteinLollipopTest);
