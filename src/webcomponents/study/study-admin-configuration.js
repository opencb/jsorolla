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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "../../core/utilsNew.js";
import DetailTabs from "../commons/view/detail-tabs.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js"

export default class StudyAdminConfiguration extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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

        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // Note: WE NEED this function because we are rendering using JQuery not lit-element API
    firstUpdated(changedProperties) {

    }

    update(changedProperties) {

        // if (changedProperties.has("study")) {
        // }

        super.update(changedProperties);
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
                            <div class="guard-page">
                                <i class="fas fa-pencil-ruler fa-5x"></i>
                                <h3>Component under construction</h3>
                                <h3>(Coming Soon)</h3>
                            </div>`;
                    }
                },
                {
                    id: "variants",
                    name: "Variants",
                    icon: "fas fa-dna",
                    // active: false,
                    render: () => {
                        return html`
                            <div class="guard-page">
                                <i class="fas fa-pencil-ruler fa-5x"></i>
                                <h3>Component under construction</h3>
                                <h3>(Coming Soon)</h3>
                            </div>`;
                    }
                }
            ]
    };
}


render() {


    if(!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study,this.opencgaSession.user.id)){
        return html`
        <div class="guard-page">
            <i class="fas fa-lock fa-5x"></i>
            <h3>No permission to view this page</h3>
        </div>`
    }

    return html`
        <div style="margin: 20px">
            <detail-tabs
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_MODE}"
                    .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        </div>

        `;
}
}

customElements.define("study-admin-configuration", StudyAdminConfiguration);
