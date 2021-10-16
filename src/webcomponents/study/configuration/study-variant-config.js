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
import "./config-list-update.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";

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
            variantEngineConfig: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        console.log("init study variant config");
        this.updateParams = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("variantEngineConfig")) {
            this.variantEngineConfigObserver();
        }
        super.update(changedProperties);
    }

    variantEngineConfigObserver() {
        if (this.variantEngineConfig) {
            this._variantEngineConfig = JSON.parse(JSON.stringify(this.variantEngineConfig));
        }
    }


    onSyncItem(e) {
        e.stopPropagation();
        const {index, item} = e.detail.value;
        if (index >= 0) {
            this.editItem(index, item);
        } else {
            this.addItem(e.detail.value);
        }
    }

    editItem(index, item) {
        this.variantEngineConfig.sampleIndex.fileIndexConfiguration.customFields[index] = item;
        this.variantEngineConfig = {
            ...this.variantEngineConfig
        };
        // it's not working with requestUpdate...
        // this.requestUpdate();
    }

    addItem(item) {
        // It's working this way.
        this.variantEngineConfig.sampleIndex.fileIndexConfiguration.customFields.push(item);
        this.variantEngineConfig = {
            ...this.variantEngineConfig
        };
        console.log("Add new item: ", this.variantEngineConfig.sampleIndex.fileIndexConfiguration.customFields);
    }

    onRemoveItem(e) {
        const item = e.detail.value;
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
                const customFields = this.variantEngineConfig.sampleIndex.fileIndexConfiguration.customFields;
                this.variantEngineConfig.sampleIndex
                    .fileIndexConfiguration.customFields = UtilsNew.removeArrayByIndex(customFields, item.index);
                this.variantEngineConfig = {
                    ...this.variantEngineConfig
                };
                console.log("Item removed: ", this.variantEngineConfig.sampleIndex.fileIndexConfiguration.customFields);
                Swal.fire(
                    "Deleted!",
                    "The config has been deleted. (Test UI)",
                    "success"
                );
            }
        });
    }

    onFieldChange(e) {
        console.log("on Field Change", e.detail);
    }

    onClear() {

    }

    onSubmit() {
        // operation/variant/configure

    }

    configVariant(key, item, modal) {

        // Type
        // RANGE_LT, RANGE_GT. CATEGORICAL, CATEGORICAL_MULTI_VALUE

        // Source
        // VARIANT, META, FILE, SAMPLE, ANNOTATION

        //  IndexFieldConfiguration
        /** Source, key,type, thresholds, values, valuesMapping, nullable
         **/

        const configModal = isNew => {
            return isNew ? {
                type: "modal",
                title: "Add Config",
                buttonStyle: "margin-top:6px"
            } : {
                type: "modal",
                title: "Edit Config",
                item: {
                    title: item?.title,
                    subtitle: item?.subtitle
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

        const configSection = key => {
            switch (key) {
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
                case "populations":
                    return {
                        elements: [
                            {
                                name: "Study",
                                field: "study",
                                type: "input-text",
                            },
                            {
                                name: "Population",
                                field: "population",
                                type: "input-text",
                            },
                        ]
                    };
                case "valuesMapping":
                    return {
                        elements: [
                            {
                                name: "key",
                                field: "key",
                                type: "input-text",
                            },
                            {
                                name: "Values",
                                field: "values",
                                type: "custom",
                                display: {
                                    render: data => {
                                        return html `
                                            <select-field-token
                                                .values="${data}">
                                            </select-field-token>
                                            `;
                                    }
                                }
                            }
                        ]
                    };
                case "populationFrequency":
                    return {
                        elements: [
                            {
                                name: "Populations",
                                field: "populations",
                                type: "custom",
                                display: {
                                    layout: "horizontal",
                                    defaultLayout: "horizontal",
                                    width: 12,
                                    style: "padding-left: 0px",
                                    render: variant => html`
                                        <list-update
                                            key="populationFrequency"
                                            .data="${{items: variant}}"
                                            .config=${this.configVariant("populations", {title: "study", subtitle: "population"}, true)}>
                                        </list-update>`
                                }
                            },
                            {
                                name: "thresholds",
                                field: "thresholds",
                                type: "custom",
                                display: {
                                    layout: "horizontal",
                                    defaultLayout: "horizontal",
                                    width: 12,
                                    style: "padding-left: 0px",
                                    render: data => html`
                                        <select-field-token
                                            .values="${data}">
                                        </select-field-token>`
                                }
                            },
                        ]
                    };
                case "biotype":
                case "consequenceType":
                case "clinicalSource":
                case "clinicalSignificance":
                case "transcriptFlagIndexConfiguration":
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
                                    render: valuesMapping => html`
                                        <list-update
                                            key="valuesMapping"
                                            .data="${{items: valuesMapping}}"
                                            .config=${this.configVariant("valuesMapping", {}, true)}>
                                        </list-update>`
                                }
                            },
                        ]
                    };
            }
        };

        const configForm = (key, isNew) => {
            return {
                title: "Edit",
                buttons: {
                    show: modal,
                    cancelText: "Cancel",
                    classes: modal ? "btn btn-primary ripple pull-right": "pull-right",
                    okText: isNew? "Add" : "Edit"
                },
                display: {
                    labelWidth: 3,
                    labelAlign: "right",
                    defaultLayout: "horizontal",
                    mode: modal ? configModal(isNew): {},
                    defaultValue: ""
                },
                sections: [configSection(key)]
            };
        };

        if (key.constructor === Array) {
            const configs = {};
            key.forEach(key => {
                configs[key] = {
                    ...configs[key],
                    edit: configForm(key, false),
                    new: configForm(key, true),
                };
            });
            return configs;
        }

        return {
            edit: configForm(key, false),
            new: configForm(key, true)
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
                            field: "sampleIndex.fileIndexConfiguration.customFields",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 8,
                                style: "padding-left: 0px",
                                render: customFields => html`
                                    <list-update
                                        key="fileIndexConfiguration"
                                        .data="${{items: customFields}}"
                                        .config=${this.configVariant("fileIndexConfiguration", {title: "source", subtitle: "key"}, true)}
                                        @changeItem=${e => this.onSyncItem(e)}
                                        @removeItem=${e => this.onRemoveItem(e)}>
                                    </list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Annotation Index Configuration",
                    elements: [
                        {
                            field: "sampleIndex.annotationIndexConfiguration",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: annotationIndexConfiguration => {
                                    const itemKeys = Object.keys(annotationIndexConfiguration)
                                        .filter(key => annotationIndexConfiguration[key] instanceof Object);
                                    return html`
                                        <config-list-update
                                            .items="${annotationIndexConfiguration}"
                                            .config=${this.configVariant(itemKeys, {}, false)}
                                            @editChange=${this.onEditItem}
                                            @removeItem=${this.onRemoveItem}>
                                        </config-list-update>`;
                                }
                            }
                        },
                        {
                            name: "Transcript Combination",
                            field: "sampleIndex.annotationIndexConfiguration.transcriptCombination",
                            type: "checkbox"
                        },
                    ]
                },
            ]
        };
    }

    render() {
        return html`
            <div style="margin: 25px 40px">
                <data-form
                    .data=${this.variantEngineConfig}
                    .config=${this._config}
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            </div>
        `;
    }

}

customElements.define("study-variant-config", StudyVariantConfig);
