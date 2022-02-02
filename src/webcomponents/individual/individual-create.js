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
import UtilsNew from "./../../core/utilsNew.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../study/phenotype/phenotype-list-update.js";
import "../study/annotationset/annotation-set-update.js";
import "../individual/disorder/disorder-list-update.js";


export default class IndividualCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
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
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "phenotypes":
                this.individual = {...this.individual, phenotypes: e.detail.value};
                break;
            case "disorders":
                this.individual = {...this.individual, disorders: e.detail.value};
                break;
            case "annotationsets":
                this.individual = {...this.individual, annotationSets: e.detail.value};
                break;
            default:
                this.individual = {
                    ...FormUtils.createObject(
                        this.individual,
                        param,
                        e.detail.value,
                    )};
                break;
        }
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onClear(e) {
        console.log("onClear individual form", this);
        this.individual = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.individuals()
            .create(this.individual, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.individual = {};
                this.requestUpdate();
                // FormUtils.showAlert("New Individual", "New Individual created correctly.", "success");
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Individual",
                    message: "New Individual created correctly"
                });
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    render() {
        return html`
            <data-form
                .data=${this.individual}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Save",
                buttonClearText: "Cancel",
                titleWidth: 3,
                with: "8",
                defaultValue: "",
                defaultLayout: "horizontal"
            },
            validation: {
                validate: individual => (UtilsNew.isEmpty(individual.father) || UtilsNew.isEmpty(individual.mother)) || individual.father !== individual.mother,
                message: "The father and mother must be different individuals",
            },
            sections: [
                {
                    title: "Individual General Information",
                    elements: [
                        {
                            title: "Individual id",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add an ID"
                                }
                            }
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the Individual name..."
                            }
                        },
                        {
                            title: "Father id",
                            field: "father",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: () => html`
                                    <individual-id-autocomplete
                                        .value="${this.sample?.father}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            // This is the default value, but it is safe to leave it
                                            multiple: false,
                                        }}
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "father",
                                                value: e.detail.value
                                            }
                                        })}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            title: "Mother Id",
                            field: "mother",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: () => html`
                                    <individual-id-autocomplete
                                        .value="${this.sample?.mother}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            // This is the default value, but it is safe to leave it
                                            multiple: false,
                                        }}
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "mother",
                                                value: e.detail.value
                                            }
                                        })}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            title: "Sex",
                            field: "sex",
                            type: "select",
                            allowedValues: ["MALE", "FEMALE", "UNKNOWN", "UNDETERMINED"],
                            display: {
                                placeholder: "Select the sex..."
                            }
                        },
                        {
                            title: "Birth",
                            field: "dateOfBirth",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "input-text",
                            display: {
                                placeholder: "Add an Ethnicity..."
                            }
                        },
                        {
                            title: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            checked: false,
                            display: {}
                        },
                        {
                            title: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {
                                placeholder: "Select the Karyotypic Sex..."
                            }
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {
                                placeholder: "Select the life status..."
                            }
                        }
                    ]
                },
                {
                    title: "Location Info",
                    elements: [
                        {
                            title: "Address",
                            field: "location.address",
                            type: "input-text",
                            display: {
                                placeholder: "Add the location info..."
                            }
                        },
                        {
                            title: "Postal code",
                            field: "location.postalCode",
                            type: "input-text",
                            display: {
                                placeholder: "Add the postal code..."
                            }
                        },
                        {
                            title: "City",
                            field: "location.city",
                            type: "input-text",
                            display: {
                                placeholder: "Add the city name..."
                            }
                        },
                        {
                            title: "State",
                            field: "location.state",
                            type: "input-text",
                            display: {
                                placeholder: "Add the state name..."
                            }
                        },
                        {
                            title: "Country",
                            field: "location.country",
                            type: "input-text",
                            display: {
                                placeholder: "Add the country name..."
                            }
                        }
                    ]
                },
                {
                    title: "Population Info",
                    elements: [
                        {
                            title: "Population name",
                            field: "population.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the population name..."
                            }
                        },
                        {
                            title: "Subpopulation",
                            field: "population.subpopulation",
                            type: "input-text",
                            display: {
                                placeholder: "Add the sub-population name..."
                            }
                        },
                        {
                            title: "populaton description",
                            field: "population.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description about the population..."
                            }
                        }
                    ]
                },
                {
                    title: "Phenotype",
                    elements: [
                        {
                            title: "",
                            type: "notification",
                            text: "Empty, create a new phenotype",
                            display: {
                                visible: sample => !(sample?.phenotypes && sample?.phenotypes.length > 0),
                                notificationType: "info",
                            }
                        },
                        {
                            field: "phenotypes",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: individual => html`
                                    <phenotype-list-update
                                        .phenotypes="${individual?.phenotypes}"
                                        @changePhenotypes="${e => this.onFieldChange(e, "phenotypes")}">
                                    </phenotype-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Disorder",
                    elements: [
                        {
                            field: "disorders",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: individual => html`
                                <!-- Pass 'this.individual' to reflect the changes -->
                                    <disorder-list-update
                                        .disorders="${this.individual?.disorders}"
                                        .evidences="${this.individual?.phenotypes}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeDisorders="${e => this.onFieldChange(e, "disorders")}">
                                    </disorder-list-update>`
                            }
                        }
                    ]
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: individual => html`
                //                     <annotation-set-update
                //                         .annotationSets="${individual?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onFieldChange(e, "annotationsets")}">
                //                     </annotation-set-update>
                //                 `
                //             }
                //         }
                //     ]
                // }
            ]
        });
    }

}

customElements.define("individual-create", IndividualCreate);
