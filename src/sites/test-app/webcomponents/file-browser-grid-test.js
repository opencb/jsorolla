
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
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/loading-spinner.js";
import "../../../webcomponents/file/file-grid.js";
import "../../../webcomponents/file/file-detail.js";
// import "../../../webcomponents/file/file-create.js";
// import "../../../webcomponents/file/file-update.js";


class FileBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            testFile: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
            config: {
                type: Object
            },
            _selectRow: {
                type: Object,
                state: true
            },
        };
    }

    #init() {
        this.isLoading = false;
        this.data = [];
        this._config = {};
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testFile}.json`)
            .then(content => {
                this.files = content;
                this.mutate();
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }


    mutate() {
        return null;
    }

    selectRow(e) {
        this._selectRow = {...e.detail.row};
    }

    onSettingsUpdate() {
        this._config = {...this.opencgaSession?.user?.configs?.IVA?.settings?.fileBrowser?.grid};
        this.opencgaSessionObserver();
    }


    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Catalog Browser Grid (${this.testFile})
            </h2>
            <file-grid
                .files="${this.files}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @settingsUpdate="${() => this.onSettingsUpdate()}"
                @selectrow="${e => this.selectRow(e)}">
            </file-grid>
            <file-detail
                .file="${this._selectRow}"
                .opencgaSession="${this.opencgaSession}">
            </file-detail>

        `;
    }

}

customElements.define("file-browser-grid-test", FileBrowserGridTest);
