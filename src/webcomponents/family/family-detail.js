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
import UtilsNew from "../../core/utilsNew.js";
import "./family-view.js";
import "../commons/view/detail-tabs.js";

export default class FamilyDetail extends LitElement {

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

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.family = null;
        }

        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    familyIdObserver() {
        if (this.opencgaSession) {
            if (this.familyId) {
                this.opencgaSession.opencgaClient.families().info(this.familyId, {study: this.opencgaSession.study.fqn})
                    .then(restResponse => {
                        this.family = restResponse.getResult(0);
                        this.requestUpdate();
                    })
                    .catch(restResponse => {
                        console.error(restResponse);
                    });
            } else {
                this.family = null;
            }

        }
    }

    getDefaultConfig() {
        return {
            // details config in family-browser
        };
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
            </detail-tabs>`;
    }

}

customElements.define("family-detail", FamilyDetail);
