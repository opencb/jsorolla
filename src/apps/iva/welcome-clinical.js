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
import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "./../../core/utilsNew.js";

export default class WelcomeClinical extends LitElement {

    constructor() {
        super();
        this.checkProjects = false;
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            version: {
                type: String
            },
            cellbaseClient: {
                type: Object
            },
            checkProjects: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._checkProjects();
    }

    _checkProjects() {
        return !!(UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project));

    }

    render() {
        return html`
            <div>

            Welcome Clinical
            </div>
            `;
    }

}

customElements.define("welcome-clinical", WelcomeClinical);
