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
        // Build the query parameters for the OpenAPI URL
        // We need to pass the study and the full path to the OpenCGA server
        const queryParams = new URLSearchParams({
            url: this.opencgaSession.server.host,
            study: this.opencgaSession.study.fqn,
        });

        // Construct the OpenAPI URL
        const serverUrl = `${this.opencgaSession.server.host}/webservices/rest/${this.opencgaSession.server.version || "v2"}/meta/openapi?${queryParams.toString()}`;

        // Create an instance of the SwaggerUIBundle
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
