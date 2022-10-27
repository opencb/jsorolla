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
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
import "../study/status/status-update.js";
import "../commons/filters/catalog-search-autocomplete.js";
import LitUtils from "../commons/utils/lit-utils";

export default class FamilyUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            family: {
                type: Object
            },
            familyId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.family = {};
        this.phenotype = {};
        this.updateParams = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Update",
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            defaultValue: "",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("family")) {
            this.initOriginalObject();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    initOriginalObject() {
        if (this.family) {
            this._family = UtilsNew.objectClone(this.family);
        }
    }

    familyIdObserver() {
        if (this.familyId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.families()
                .info(this.familyId, params)
                .then(response => {
                    this.family = response.responses[0].results[0];
                    this.initOriginalObject();
                })
                .catch(reason => {
                    this.family = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    // CAUTION: two new lines, double-check if needed
                    LitUtils.dispatchCustomEvent(this, "familySearch", this.family, {query: {...params}}, error);
                    this.#setLoading(false);
                });
        } else {
            this.family = {};
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "members.id":
                this.updateParams = FormUtils.updateObjectArray(
                    this._family,
                    this.family,
                    this.updateParams,
                    param,
                    e.detail.value
                );
                break;
            case "id":
            case "name":
            case "description":
            case "expectedSize":
                this.updateParams = FormUtils.updateObjectParams(
                    this._family,
                    this.family,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "status":
                this.updateParams = FormUtils.updateObjectWithObj(
                    this._family,
                    this.family,
                    this.updateParams,
                    // e.detail.param,
                    param,
                    e.detail.value);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = this.getDefaultConfig();
        this.updateParams = {};
        this.familyId = "";
        this.family = UtilsNew.objectClone(this._family);
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            annotationSetsAction: "SET",
            updateRoles: false,
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        // CAUTION: workaround for avoiding overwrite non updated keys in an object.
        //  Remove when form-utils.js revisited
        Object.keys(this.updateParams).forEach(key => this.updateParams[key] = this.family[key]);
        this.opencgaSession.opencgaClient.families()
            .update(this.family.id, this.updateParams, params)
            .then(response => {
                this._family = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Family Update",
                    message: "Family updated correctly"
                });
            })
            .catch(reason => {
                this.family = {};
                error = reason;
                console.error(reason);
            })
            .finally(() => {
                this._config = this.getDefaultConfig();
                LitUtils.dispatchCustomEvent(this, "familyUpdate", this.family, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.family?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Family ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.family}"
                .config="${this._config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Family ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: this.family.creationDate? "Created on " + UtilsNew.dateFormatter(this.family.creationDate):"No creation date",
                                validation: {}
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a family name...",
                            }
                        },
                        {
                            title: "Members",
                            field: "members",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                helpMessage: "Individual Ids",
                                render: members => {
                                    const membersIds = Array.isArray(members) ?
                                        members?.map(member => member.id).join(",") : members;
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${membersIds}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .classes="${this.updateParams.individualId ? "selection-updated" : ""}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => this.onFieldChange(e, "members.id")}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            },
                        },
                        // {
                        //     title: "Individual ID",
                        //     field: "individualId",
                        //     type: "custom",
                        //     display: {
                        //         placeholder: "e.g. Homo sapiens, ...",
                        //         render: () => html`
                        //             <individual-id-autocomplete
                        //                 .value="${this.members}"
                        //                 .opencgaSession="${this.opencgaSession}"
                        //                 @filterChange="${e => this.onSync(e, "members")}">
                        //             </individual-id-autocomplete>`
                        //     }
                        // },
                        // {
                        //     title: "Creation Date",
                        //     field: "creationDate",
                        //     type: "input-date",
                        //     display: {
                        //         render: date =>
                        //             moment(date, "YYYYMMDDHHmmss").format(
                        //                 "DD/MM/YYYY"
                        //             )
                        //     }
                        // },
                        // {
                        //     title: "Modification Date",
                        //     field: "modificationDate",
                        //     type: "input-date",
                        //     display: {
                        //         render: date =>
                        //             moment(date, "YYYYMMDDHHmmss").format(
                        //                 "DD/MM/YYYY"
                        //             )
                        //     }
                        // },
                        {
                            title: "Expected Size",
                            field: "expectedSize",
                            type: "input-num",
                            allowedValues: [0],
                            display: {
                                placeholder: "Add a expected size...",
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a Family description...",
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <status-update
                                        .status="${status}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "status")}">
                                    </status-update>
                                `,
                            }
                        },
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
                //                 render: family => html`
                //                     <annotation-set-update
                //                         .annotationSets="${family?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onSync(e, "annotationsets")}">
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

customElements.define("family-update", FamilyUpdate);
