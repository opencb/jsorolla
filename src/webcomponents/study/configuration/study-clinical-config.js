/**
 * Copyright 2015-2021 OpenCB
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
import UtilsNew from "../../../core/utilsNew.js";
import FormUtils from "../../commons/forms/form-utils.js";
import "./clinical-list-update.js";

export default class StudyClinicalConfig extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    _init() {
        console.log("init study clinical config");
        // console.log("study selected ", this.study);
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateParams = {};
        this._config = {...this.getDefaultConfig()};
        console.log("config study", this.study.internal.configuration.clinical);
    }

    update(changedProperties) {
        // if (changedProperties.has("study")) {
        // }
        super.update(changedProperties);
    }


    onFieldChange(e) {

    }

    onSubmit() {

    }

    onClear() {

    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Update"
            },
            display: {
                // width: "8",
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block" // icon
                }
            },
            sections: [
                {
                    title: "Clinical Status",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <clinical-list-update
                                        .items="${clinical.status}"
                                        .tabs="${true}">
                                    </clinical-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Interpretation Status",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <clinical-list-update
                                        .items="${clinical.interpretation.status}"
                                        .tabs="${true}">
                                    </clinical-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Priorities",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <clinical-list-update
                                        .items="${clinical.priorities}"
                                        .tabs="${false}">
                                    </clinical-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "flags",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <clinical-list-update
                                        .items="${clinical.flags}"
                                        .tabs="${true}">
                                    </clinical-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "consent",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: clinical => html`
                                    <clinical-list-update
                                        .items="${clinical.consent.consents}"
                                        .tabs="${false}">
                                    </clinical-list-update>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <!-- <div class="guard-page">
                <i class="fas fa-pencil-ruler fa-5x"></i>
                <h3>Clinial Config under construction</h3>
                <h3>(Coming Soon)</h3>
            </div> -->

            <data-form
                .data=${this.study.internal.configuration.clinical}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

}

customElements.define("study-clinical-config", StudyClinicalConfig);
