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
import ExtensionsManager from "../extensions-manager.js";
import "./family-view.js";
import "../commons/view/detail-tabs.js";

export default class FamilyDetail extends LitElement {

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
            familyId: {
                type: String
            },
            family: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "family-detail";
        this._prefix = "sf-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.#updateDetailTabs();
        }

        super.update(changedProperties);
    }

    familyIdObserver() {
        if (this.opencgaSession) {
            if (this.familyId) {
                this.opencgaSession.opencgaClient.families().info(this.familyId, {study: this.opencgaSession.study.fqn})
                    .then(restResponse => {
                        this.family = restResponse.getResult(0);
                    })
                    .catch(restResponse => {
                        console.error(restResponse);
                    });
            } else {
                this.family = null;
            }
        }
    }

    #updateDetailTabs() {
        this._config.items = [
            ...this._config.items,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this.family}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            items: [],
        };
    }

}

customElements.define("family-detail", FamilyDetail);
