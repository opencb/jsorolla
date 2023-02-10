
/**
 * Copyright 2015-2023 OpenCB
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


import "../../../webcomponents/commons/forms/data-form.js";
import {DATA_FORM_EXAMPLE} from "../conf/data-form.js";
import UtilsNew from "../../../core/utils-new.js";
import UtilsTest from "../../../../cypress/support/utils-test.js";
import opencgaSession from "../../../webcomponents/opencga/catalog/variableSets/test/opencgaSession";

class VariantBrowserGridTest extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.variants = [];
        this._dataFormConfig = DATA_FORM_EXAMPLE;
        this.configVariantGrid = {
            pageSize: 10,
            pageList: [10, 25, 50],
            multiSelection: false,
            showSelectCheckbox: false,
            toolbar: {
                // showNew: true,
                showColumns: true,
                showDownload: false,
                showExport: false,
                showSettings: false,
                exportTabs: ["download", "link", "code"]
                // columns list for the dropdown will be added in grid webcomponents based on settings.table.columns
            },
        };
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        fetch("http://reports.test.zettagenomics.com/iva/tests/2.7/variant-browser-data.json")
            .then(content => {
                return content.json();
            })
            .then(json => {
                this.variants = json;

                this.mutate();

                this.requestUpdate();
            })
            .catch((err => {
                this.variants = [];
                console.log(err);
            }));
    }

    mutate() {
        // 1. no CT array
        this.variants[0].annotation.consequenceTypes.forEach(ct => ct.geneName = null);

    }

    render() {
        return html`
            <variant-browser-grid
                .variants="${this.variants}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.configVariantGrid}"
                .populationFrequencies="${this.config.populationFrequencies}">
            </variant-browser-grid>
        `;
    }

}

customElements.define("variant-browser-grid-test", VariantBrowserGridTest);
