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

export default class StudyVariantConfig extends LitElement {

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
        console.log("init study variant config");
        // console.log("study selected ", this.study);
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateParams = {};
        this._config = {...this.getDefaultConfig()};
        console.log("config study", this.study.internal.configuration.variantEngine);
    }

    update(changedProperties) {
        // if (changedProperties.has("study")) {
        // }

        super.update(changedProperties);
    }

    removeItem(e) {
        console.log("Execute remove buttons:", e.detail.value);
        e.stopPropagation();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            reverseButtons: true
        }).then(result => {
            if (result.isConfirmed) {
                // TODO: add remove conditions by entity
                Swal.fire(
                    "Deleted!",
                    "The config has been deleted. (Test UI)",
                    "success"
                );
            }
        });
    }

    onFieldChange(e) {

    }

    onClear() {


    }

    onSubmit() {

    }

    configVariant(entity, heading, modal) {

        const configModal = isNew => {
            return isNew ? {
                type: "modal",
                title: "Add Config",
                buttonStyle: "margin-top:6px"
            } : {
                type: "modal",
                title: "Edit Config",
                heading: {
                    title: heading?.title,
                    subtitle: heading?.subtitle
                },
                buttonClass: "pull-right",
                btnGroups: [
                    {
                        title: "Edit",
                        openModal: true,
                    },
                    {
                        title: "Delete",
                        btnClass: "btn-danger",
                        event: "removeItem"
                    }
                ]
            };
        };
        // Type
        // RANGE_LT, RANGE_GT. CATEGORICAL, CATEGORICAL_MULTI_VALUE

        // Source
        // VARIANT, META, FILE, SAMPLE, ANNOTATION

        //  IndexFieldConfiguration
        /** Source, key,type, thresholds, values, valuesMapping, nullable
        **/

        const configSection = entity => {
            switch (entity) {
                case "fileIndexConfiguration":
                    return {
                        elements: [
                            {
                                name: "Source",
                                field: "source",
                                type: "input-text",
                            },
                            {
                                name: "Key",
                                field: "key",
                                type: "input-text",
                            },
                            {
                                name: "Type",
                                field: "type",
                                type: "input-text",
                            },
                            {
                                name: "Nullable",
                                field: "nullable",
                                type: "checkbox",
                            },
                        ]
                    };
                case "annotationIndexConfiguration":
                    return {
                        elements: [
                            {
                                name: "Source",
                                field: "source",
                                type: "input-text",
                            },
                            {
                                name: "Key",
                                field: "key",
                                type: "input-text",
                            },
                            {
                                name: "Type",
                                field: "type",
                                type: "input-text",
                            },
                            {
                                name: "Nullable",
                                field: "nullable",
                                type: "checkbox",
                            },
                            {
                                name: "Values",
                                field: "values",
                                type: "custom",
                                display: {
                                    layout: "horizontal",
                                    defaultLayout: "horizontal",
                                    width: 12,
                                    style: "padding-left: 0px",
                                    render: variant => html`
                                        <select-field-token
                                            .values="${variant}">
                                        </select-field-token>`
                                }
                            },
                            {
                                name: "ValuesMapping",
                                field: "valuesMapping",
                                type: "custom",
                                display: {
                                    layout: "horizontal",
                                    defaultLayout: "horizontal",
                                    width: 12,
                                    style: "padding-left: 0px",
                                    render: variant => {
                                        return variant ?
                                            Object.keys(variant).map(key =>
                                                html `
                                                    <b>${key}</b>
                                                    <select-field-token
                                                        .values="${variant[key]}">
                                                    </select-field-token>
                                            `) : html`
                                            <select-field-token
                                                    .values="${variant}">
                                            </select-field-token>
                                            `;
                                    }
                                }
                            }
                        ]
                    };
            }
        };

        const configStatus = isNew => {
            return {
                title: "Edit",
                buttons: {
                    show: true,
                    cancelText: "Cancel",
                    classes: modal ? "btn btn-primary ripple pull-right": "pull-right",
                    okText: "Save"
                },
                display: {
                    labelWidth: 3,
                    labelAlign: "right",
                    defaultLayout: "horizontal",
                    mode: modal ? configModal(isNew): {},
                    defaultValue: ""
                },
                sections: [configSection(entity)]
            };
        };

        return {
            edit: configStatus(false),
            new: configStatus(true)
        };
    }


    getDefaultConfig() {
        return {
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
                    title: "File Index Configuration",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: variantEngine => html`
                                    <config-list-update
                                        entity="fileIndex"
                                        .items="${variantEngine.sampleIndex.fileIndexConfiguration.customFields}"
                                        .tabs=${false}
                                        .config=${this.configVariant("fileIndexConfiguration", {title: "source", subtitle: "key"}, true)}
                                        @removeItem=${this.removeItem}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Annotation Index Configuration",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: variantEngine => html`
                                    <config-list-update
                                        entity="annotationIndex"
                                        .items="${variantEngine.sampleIndex.annotationIndexConfiguration}"
                                        .tabs=${true}
                                        .config=${this.configVariant("annotationIndexConfiguration", {title: "source", subtitle: "key"}, false)}
                                        @removeItem=${this.removeItem}>
                                    </config-list-update>`
                            }
                        },
                    ]
                },
            ]
        };
    }

    render() {
        return html`
            <!-- <div class="guard-page">
                <i class="fas fa-pencil-ruler fa-5x"></i>
                <h3>Variant Engine Config under construction</h3>
                <h3>(Coming Soon)</h3>
            </div> -->
            <div style="margin: 25px 40px">
                <data-form
                    .data=${this.study.internal.configuration.variantEngine}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            </div>
        `;
    }

}

customElements.define("study-variant-config", StudyVariantConfig);
