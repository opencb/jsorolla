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
import "./opencga-rest-endpoint.js";
// import "./cellbase-rest-endpoint.js";

export default class RestEndpoint extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            apiInfo: {
                type: Object,
            },
            endpoint: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.restEndpointComponentSelected = "";
        this.restEndpointComponent = {
            "opencga": {
                render: () => {
                    return html`
                        <opencga-rest-endpoint
                                .endpoint="${this.endpoint}"
                                .opencgaSession="${this.opencgaSession}">
                        </opencga-rest-endpoint>
                    `;
                }
            },
            // "cellbase": {
            //     render: () => {
            //         return html`
            //             <cellbase-rest-endpoint
            //                     .endpoint="${this.endpoint}">
            //             </cellbase-rest-endpoint>
            //         `;
            //     }
            // },
        };
    }

    update(changedProperties) {
        if (changedProperties.has("apiInfo")) {
            this.apiInfoObserver(this.apiInfo?.id);
        }
        super.update(changedProperties);
    }

    apiInfoObserver(id) {
        return this.restEndpointComponentSelected = this.restEndpointComponent[id];
    }

    render() {
        return this.restEndpointComponentSelected.render();
    }

}

customElements.define("rest-endpoint", RestEndpoint);
