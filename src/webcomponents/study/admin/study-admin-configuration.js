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
import UtilsNew from "../../../core/utils-new.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import {guardPage} from "../../commons/html-utils.js";
import "../configuration/study-variant-config.js";
import "../configuration/study-clinical-config.js";

export default class StudyAdminConfiguration extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    getDefaultConfig() {

        return {
            items: [
                {
                    id: "clinical",
                    name: "Clinical",
                    icon: "fas fa-notes-medical",
                    active: true,
                    render: () => {
                        return html`
                        <study-clinical-config
                            .clinicalConfig=${this.study.internal?.configuration?.clinical}
                            .opencgaSession=${this.opencgaSession}>
                        </study-clinical-config>`;
                    }
                },
                {
                    id: "variants",
                    name: "Variants",
                    icon: "fas fa-dna",
                    render: () => {
                        return html`
                        <study-variant-config
                            .variantEngineConfig=${this.study.internal?.configuration?.variantEngine}
                            .opencgaSession=${this.opencgaSession}>
                        </study-variant-config>
                    `;
                    }
                }
            ]
        };
    }

    render() {
        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
        <div style="margin: 20px">
            <detail-tabs
                    .data="${{}}"
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_MODE}"
                    .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        </div>

        `;
    }

}

customElements.define("study-admin-configuration", StudyAdminConfiguration);
