/**
 * Copyright 2015-present OpenCB
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

import UtilsNew from "../../../core/utils-new.js";


class GenomeBrowserTest extends LitElement {

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
        // const filesToImport = [
        // ];
        // const promises = filesToImport.map(file => {
        //     return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
        // });

        // // Import all files
        // Promise.all(promises)
        //     .then(data => {
        //         this._data = data;
        //         // Mutate data and draw protein lollipop
        //         this.mutate();
        //         this.drawGenomeBrowser();
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });
    }

    mutate() {
        return null;
    }

    drawGenomeBrowser() {
        const target = this.querySelector(`div#${this._prefix}`);
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <h2 style="font-weight: bold;">
                        Genome Browser Test
                    </h2>
                    <div
                        id="${this._prefix}"
                        data-cy="genome-browser-container"
                        style="margin-bottom:4rem;">
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("genome-browser-test", GenomeBrowserTest);
