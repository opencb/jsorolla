/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../html-utils.js";
import "../../text-icon.js";
import "./opencga-analysis-tool-form.js";

export default class JupyterNotebook extends LitElement {

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
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.config
            };
            // this.requestUpdate();
        }
        super.update(changedProperties);
    }

    onAnalysisRun(e) {
        // Execute function provided in the configuration
        /* if (this.analysisClass.execute) {
            this.analysisClass.execute(this.opencgaSession, e.detail.data, e.detail.params);
        } else {
            console.error(`No execute() function provided for analysis: ${this._config.id}`)
        }*/

        // TODO NOTE onAnalysisRun at the moment just forwards the `analysisRun` event fired in opencga-analysis-tool-form
        this.dispatchEvent(new CustomEvent("execute", {
            detail: e.detail
        }));
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.study) {
            return guardPage("No OpenCGA study available to run an analysis. Please login to continue.");
        }

        const userId = this.opencgaSession.user.id;
        const organizationId = this.opencgaSession.organization.id;
        const serverUrl = this.opencgaSession.server.host.replace("/opencga", "");
        const jupyterLoginUrl = serverUrl + "/jupyter/hub/login";
        const token = this.opencgaSession.token;
        debugger
        return html`
            <div class="opencga-analysis-tool">

            </div>

            <div class="m-4">
                <iframe src="https://test.app.zettagenomics.com/task-6757a/jupyter/hub/login?userId=${userId}&organizationId=${organizationId}&opencgaUrl=${serverUrl}&logoutUrl=https:%2F%2Fwww.google.com&token=${token}"
                        width="1440" height="800">
                </iframe>

            </div>
        `;
    }

}

customElements.define("jupyter-notebook", JupyterNotebook);
