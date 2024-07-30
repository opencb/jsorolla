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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../../loading-spinner.js";

export default class CircosView extends LitElement {

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
            query: {
                type: Object
            },
            queries: {
                type: Object
            },
            sampleId: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if ((changedProperties.has("query") || changedProperties.has("active")) && this.active) {
        //     this.queryObserver();
        // }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    queryObserver() {
        // Show loading gif and message
        this.circosImage = null;
        this.requestUpdate();

        const query = {
            title: this.sampleId,
            density: "MEDIUM",
            query: {
                sample: this.sampleId,
            },
            tracks: [
                {
                    id: "snv",
                    type: "SNV",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        ...this.query,
                        ...this.queries?.["SNV"],
                        type: "SNV",
                    }
                },
                {
                    id: "indel",
                    type: "INDEL",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        ...this.query,
                        ...this.queries?.["INDEL"],
                        type: "INDEL,INSERTION,DELETION",
                    }
                },
                {
                    id: "cnv1",
                    type: "COPY-NUMBER",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        ...this.query,
                        ...this.queries?.["COPY_NUMBER"],
                        type: "COPY_NUMBER",
                    }
                },
                {
                    id: "rearr1",
                    type: "REARRANGEMENT",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        ...this.query,
                        ...this.queries?.["BREAKEND"],
                        type: "SV",
                    }
                }
            ],
        };

        this.opencgaSession.opencgaClient.variants().runCircos(query, {study: this.opencgaSession.study.fqn})
            .then(restResult => {
                this.circosImage = "data:image/png;base64," + restResult.getResult(0);
                LitUtils.dispatchCustomEvent(this, "changeCircosPlot", null, {
                    circosPlot: this.circosImage,
                    circosConfig: query,
                });
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    render() {
        return html`
            <div>
                ${this.circosImage ? html`
                    <img class="img-fluid" src="${this.circosImage}">
                ` : html`
                    <loading-spinner description="Fetching image data, this can take few seconds..."></loading-spinner>
                `}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("circos-view", CircosView);
