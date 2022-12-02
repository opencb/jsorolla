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
import "../../commons/view/signature-view.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/select-field-filter.js";
import "../../commons/simple-chart.js";

class MutationalSignatureView extends LitElement {

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
                type: Object,
            },
            signatures: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.selectedSignature = null;
        this.selectedSignatureId = null;
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("signatures") || changedProperties.has("config")) {
            this.selectedSignature = null;
            this.selectedSignatureId = null;
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
    }

    onChangeSignature(signatureId) {
        this.selectedSignatureId = signatureId;
        this.selectedSignature = null;
        const [type, id] = (signatureId || "").split(":");
        if (type && id) {
            this.selectedSignature = this.signatures.find(signature => {
                return signature.id === id && signature.type === type;
            });
        }
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.requestUpdate();
    }

    generateSignaturesDropdown() {
        if (this.signatures?.length > 0) {
            const signaturesbyType = {};
            this.signatures.forEach(signature => {
                const type = signature.type?.toUpperCase();
                if (type && signature.id) {
                    if (!signaturesbyType[type]) {
                        signaturesbyType[type] = [];
                    }
                    signaturesbyType[type].push({
                        id: `${signature.type}:${signature.id}`,
                        name: signature.id,
                    });
                }
            });

            return Object.keys(signaturesbyType)
                .map(type => {
                    return {
                        id: type,
                        fields: signaturesbyType[type],
                    };
                });

        } else {
            return [];
        }
    }

    render() {
        if (!this.signatures || this.signatures.length === 0) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i> No Signatures available.
                </div>
            `;
        }

        return html`
            <data-form
                .data=${{}}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "Mutational Signature",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Select Signature",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <select-field-filter
                                        .data="${this.generateSignaturesDropdown()}"
                                        .value=${this.selectedSignatureId || ""}
                                        ?multiple="${false}"
                                        ?liveSearch=${false}
                                        @filterChange="${e => this.onChangeSignature(e.detail.value)}">
                                    </select-field-filter>
                                `,
                            },
                        }
                    ],
                },
                {
                    title: "Catalogue",
                    display: {
                        visible: !!this.selectedSignature,
                    },
                    elements: [
                        {
                            name: "Catalogue Query",
                            type: "custom",
                            display: {
                                render: () => {
                                    if (this.selectedSignature?.query) {
                                        return Object.keys(this.selectedSignature.query).map(key => html`
                                            <span class="badge">
                                                ${key}: ${this.selectedSignature.query[key]}
                                            </span>
                                        `);
                                    }
                                    return "-";
                                },
                            },
                        },
                        {
                            title: "Catalogue Plot",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <signature-view
                                        .signature="${this.selectedSignature}"
                                        .plots="${["counts"]}"
                                        .mode="${this.selectedSignature.type.toUpperCase() === "SV" ? "SV" : "SBS"}"
                                        ?active="${true}">
                                    </signature-view>
                                `,
                            },
                        },
                    ]
                },
                {
                    title: "Fittings",
                    display: {
                        visible: !!this.selectedSignature,
                    },
                    elements: [
                        {
                            type: "notification",
                            text: "No fittings ddata to display.",
                            display: {
                                visible: (this.selectedSignature?.fittings || []).length === 0,
                            },
                        },
                        ...(this.selectedSignature?.fittings || []).map(fitting => ({
                            title: fitting.id,
                            type: "custom",
                            display: {
                                render: () => html`
                                    <signature-view
                                        .signature="${this.selectedSignature}"
                                        .plots="${["fitting"]}"
                                        .fittingId="${fitting.id}"
                                        ?active="${true}">
                                    </signature-view>
                                `,
                            },
                        })),
                    ],
                },
            ]
        };
    }

}

customElements.define("mutational-signature-view", MutationalSignatureView);
