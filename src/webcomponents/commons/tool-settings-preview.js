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
import "../disease-panel/disease-panel-browser.js";

import "../individual/individual-browser.js";
import "../cohort/cohort-browser.js";
import "../family/family-browser.js";
import "../sample/sample-browser.js";
import "../file/file-browser.js";
import "../job/job-browser.js";
import "../variant/variant-browser.js";
import "../disease-panel/disease-panel-browser.js";
import "../clinical/clinical-analysis-browser.js";
import "../clinical/clinical-analysis-portal.js";


export default class ToolSettingsPreview extends LitElement {

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
                type: Object,
            },
            settings: {
                type: Object,
            },
            tool: {
                type: String,
            }
        };
    }

    #init() {

        this.map = {
            "INDIVIDUAL_BROWSER": {
                render: settings => {
                    return html `
                        <individual-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </individual-browser>
                    `;
                }
            },
            "COHORT_BROWSER": {
                render: settings => {
                    return html `
                        <cohort-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </cohort-browser>
                    `;
                }
            },
            "FAMILY_BROWSER": {
                render: settings => {
                    return html `
                        <family-browser
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${settings}">
                        </family-browser>
                    `;
                }
            },
            "SAMPLE_BROWSER": {
                render: settings => {
                    return html `
                        <sample-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </sample-browser>
                    `;
                }
            },
            /*
            "FILE_BROWSER": {
                render: settings => {
                    return html `
                        <file-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </file-browser>
                    `;
                }
            },
            "JOB_BROWSER": {
                render: settings => {
                    return html `
                        <job-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </job-browser>
                    `;
                }
            },
            "VARIANT_BROWSER": {
                render: settings => {
                    return html `
                        <variant-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </variant-browser>
                    `;
                }
            },
            "DISEASE_PANEL_BROWSER": {
                render: settings => {
                    return html `
                        <disease-panel-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </disease-panel-browser>
                    `;
                }
            },
            "CLINICAL_ANALYSIS_BROWSER": {
                render: settings => {
                    return html `
                        <clinical-analysis-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </clinical-analysis-browser>
                    `;
                }
            },
            "CLINICAL_ANALYSIS_PORTAL_BROWSER": {
                render: settings => {
                    return html `
                        <clinical-analysis-portal-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </clinical-analysis-portal-browser>
                    `;
                }
            },
            "RGA_BROWSER": {
                render: settings => {
                    return html `
                        <rga-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </rga-browser>
                    `;
                }
            },*/
        };
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    // --- EVENTS ---

    // --- RENDER ---
    render() {
        return html `
            <div id="#tool-settings-preview">
                ${this.map[this.tool].render(this.settings)}
            </div>
        `;
    }

    getDefaultConfig() {}

}

customElements.define("tool-settings-preview", ToolSettingsPreview);

