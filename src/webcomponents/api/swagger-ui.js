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

import {html, LitElement} from "lit";
import "../commons/forms/data-form.js";

export default class SwaggerUi extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
        };
    }

    updated() {
        // 1. Get the OpenAPI URL. We need to append the environment to the URL ONLY if it is a task environment.
        // Task environment name format supported are like task-0001, TASK-0002f, xeta-24os, etc.
        const taskMatch = this.opencgaSession.server.host.match(/task-\d{4}[a-zA-Z]?/i);
        const xetaMatch = this.opencgaSession.server.host.match(/xeta-\d{2}[a-zA-Z]{0,2}/i);
        let environment = "";
        if (taskMatch) {
            environment = "/" + taskMatch[0];
        } else {
            if (xetaMatch) {
                environment = "/" + xetaMatch[0];
            }
        }
        const serverUrl = this.opencgaSession.server.host + "/webservices/rest/v2/meta/openapi" + "?environment=" + environment;

        // 2. Create an instance of the SwaggerUIBundle
        const ui = SwaggerUIBundle({
            url: serverUrl,
            dom_id: "#iva-swagger-ui",
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
            docExpansion: "none",
            filter: true,
            operationsSorter: "method",
            tryItOutEnabled: true,
            onComplete: () => {
                // Default Bearer token
                ui.preauthorizeApiKey("BearerAuth", "Bearer " + this.opencgaSession.token);
            }
        });
    }

    render() {
        return html`
            <div id="iva-swagger-ui"></div>
        `;
    }

}

customElements.define("swagger-ui", SwaggerUi);
