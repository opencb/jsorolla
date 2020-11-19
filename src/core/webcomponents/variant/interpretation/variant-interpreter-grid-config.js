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
            // this._config = {...this.config};
            // this.requestUpdate();
        }
    }

    onFieldChange(e) {
        // console.log(e)
        // debugger

        switch (e.detail.param) {
            case "consequenceType.canonicalTranscript":
            case "consequenceType.highQualityTranscripts":
            case "consequenceType.proteinCodingTranscripts":
            case "consequenceType.worstConsequenceTypes":
            case "consequenceType.showNegativeConsequenceTypes":
                let field = e.detail.param.split(".")[1];
                this.config.consequenceType[field] = e.detail.value;
                break;
            case "genotype.type":
                this.config.genotype.type = e.detail.value;
                break;
        }
        // this.config = {...this.config};
        // this.requestUpdate();

        this.dispatchEvent(new CustomEvent("configChange", {
            detail: {
                value: this.config
            },
            bubbles: true,
            composed: true
        }));
    }

    getConfigForm() {
        return {
            id: "interpreter-grid-config",
            title: "",
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
                        titleStyle: "margin: 0px 5px",
                        textClass: "help-block",
                        textStyle: "margin: 0px 10px"
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
                            field: "consequenceType.canonicalTranscript",
                            type: "checkbox",
                            text: "Add canonical transcript",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.highQualityTranscripts",
                            type: "checkbox",
                            text: "Add high-quality transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.proteinCodingTranscripts",
                            type: "checkbox",
                            text: "Add protein coding transcripts",
                            display: {
                            }
                        },
                        {
                            field: "consequenceType.worstConsequenceTypes",
                            type: "checkbox",
                            text: "Add transcripts with high impact consequence types",
                            display: {
                            }
                        },
                        {
                            name: "Consequence Options",
                            type: "title",
                            display: {
                                labelStyle: "margin: 10px 0px 0px 0px",
                            }
                        },
                        {
                            field: "consequenceType.showNegativeConsequenceTypes",
                            type: "checkbox",
                            text: "Show filtered consequence types",
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
                        titleStyle: "margin: 20px 5px 0px 5px",
                        textClass: "help-block",
                        textStyle: "margin: 0px 10px"
                    },
                    elements: [
                        {
                            name: "Select Render Mode",
                            field: "genotype.type",
                            type: "select",
                            allowedValues: ["ALLELES", "CIRCLE", "VAF", "ALLELE_FREQUENCY"],
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
            <data-form  .data="${this.config}" 
                        .config="${this.getConfigForm()}" 
                        @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

}

customElements.define("variant-interpreter-grid-config", VariantInterpreterGridConfig);
