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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../commons/view/data-form.js";


export default class VariantInterpreterGridConfig extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
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

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = this.config;
            this.requestUpdate();
        }
    }

    onFieldChange(e) {
        // switch (e.detail.param) {
        //     case "description":
        //         break;
        // }
        // this.requestUpdate();
    }

    getConfigForm() {
        return {
            id: "clinical-analysis",
            title: "Case Editor",
            icon: "fas fa-user-md",
            type: "form",
            display: {
                width: "10",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "4",
                defaultLayout: "vertical",
            },
            sections: [
                {
                    id: "ct",
                    title: "Consequence Type",
                    text: "You can filter which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        textClass: "help-block",
                        textStyle: "margin: 0px"
                    },
                    elements: [
                        {
                            name: "Select Transcripts",
                            type: "title",
                            display: {
                                labelStyle: "margin: 0px",
                            }
                        },
                        {
                            field: "consequenceType.canonical",
                            type: "checkbox",
                            text: "Canonical Transcript",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.gencodeBasic",
                            type: "checkbox",
                            text: "High Quality Transcript",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.proteinCodig",
                            type: "checkbox",
                            text: "High Quality Transcript",
                            display: {
                            }
                        },
                    ]
                },
                {
                    id: "ct",
                    title: "Sample Genotype",
                    text: "You can filter which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        titleStyle: "padding-top: 20px",
                        textClass: "help-block",
                        textStyle: "margin: 0px"
                    },
                    elements: [
                        {
                            name: "Select Render Mode",
                            field: "genotype.type",
                            type: "select",
                            allowedValues: ["circle", "bar", "vaf"],
                            display: {
                                width: "6"
                            }
                        },
                    ]
                },
            ],
        };
    }

    render() {
        return html`
            <data-form  .data="${this._config}" 
                        .config="${this.getConfigForm()}" 
                        @fieldChange="${e => this.onFieldChange(e)}" 
                        @clear="${this.onClear}" 
                        @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("variant-interpreter-grid-config", VariantInterpreterGridConfig);
