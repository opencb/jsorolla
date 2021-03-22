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
import "../file/opencga-file-preview.js";


export default class SampleFilesView extends LitElement {

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
            sample: {
                type: Object
            },
            sampleId: {
                type: String
            },
            title: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.files = [];
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("sample")) {
            this.fetchFiles(this.sample.id);
        }
        if (changedProperties.has("sampleId")) {
            this.fetchFiles(this.sampleId);
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    fetchFiles(sampleId) {
        if (this.opencgaSession && sampleId) {
            const query = {
                study: this.opencgaSession.study.fqn,
                sampleIds: sampleId,
                // format: "IMAGE"
            }
            this.opencgaSession.opencgaClient.files().search(query)
                .then(response => {
                    this.files = response.responses[0].results;
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    getDefaultConfig() {
        return {
            imageOrder: ["sunrise.png", "rawprofile.png", "ASCATprofile.png", "ASPCF.png", "germline.png", "tumour.png"]
        };
    }

    render() {
        let images = this.files.filter(file => file.format === "IMAGE");

        // Sort images using config order
        if (images?.length > 0 && this._config?.imageOrder) {
            images.sort((a, b) => {
                let left = this._config.imageOrder.findIndex(value => a.name.includes(value));
                let right = this._config.imageOrder.findIndex(value => b.name.includes(value));
                // Not found images must be displayed at the end
                left = left !== -1 ? left : 10;
                right = right !== -1 ? right : 10;
                return left - right;
            });
        }

        return html`
            ${this.title ? html`<h3>${this.title} <span class="badge">${images.length > 0 ? images.length : ""}</span></h3>` : ""}
            ${images && images.map(file => html`
                <div class="col-md-12" style="padding: 15px 5px">
                    <h4>${file.name} ${file.software?.name ? html` - <span style="font-style: italic">${file.software.name.toUpperCase()}</span>` : ""}</h4>
                    <div style="padding: 5px 20px">
                        <opencga-file-preview .opencgaSession=${this.opencgaSession} .file=${file} .active="${true}"></opencga-file-preview>
                    </div>
                </div>
            `)}
        `;
    }

}

customElements.define("sample-files-view", SampleFilesView);
