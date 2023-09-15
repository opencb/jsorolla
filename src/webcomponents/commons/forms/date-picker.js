/*
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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-field-filter.js";
import Types from "../types.js";
import "./data-form.js";
import LitUtils from "../utils/lit-utils.js";

export default class DatePicker extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            filterDate: {
                type: String,
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.inputDates = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("filterDate")) {
            this.filterDateObserver();
        }
        super.update(changedProperties);
    }

    filterDateObserver() {
        console.log("FilterDate...", this.filterDate);
    }

    onFieldChange(e) {
        this.inputDates = {...e.detail.data};
        const invalidDate = "Invalid date";
        const inputDates = {
            from: this.inputDates?.from === invalidDate ? "" : this.inputDates?.from,
            to: this.inputDates?.to === invalidDate ? "" : this.inputDates?.to,
        };
        let date = "";
        switch (true) {
            case UtilsNew.isNotEmpty(inputDates?.from) && UtilsNew.isEmpty(inputDates?.to):
                date = `${inputDates?.from}`;
                break;
            case UtilsNew.isNotEmpty(inputDates?.from) && UtilsNew.isNotEmpty(inputDates?.to):
                date = `${inputDates?.from}-${inputDates?.to}`;
                break;
            case UtilsNew.isEmpty(inputDates?.from) && UtilsNew.isNotEmpty(inputDates?.to):
                date = `${moment(inputDates?.to, "YYYYMMDD").year()}-${inputDates?.to}`;
                break;
            default:
                break;
        }

        LitUtils.dispatchCustomEvent(this, "filterChange", date);
    }

    render() {
        return html`
            <data-form
                .data="${this.inputDates}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: {
                buttonsVisible: false,
                defaultLayout: "vertical",
            },
            sections: [
                {
                    display: {
                        className: "card p-2",
                    },
                    elements: [
                        {
                            title: "From",
                            field: "from",
                            type: "input-date",
                            save: value => moment(value, "YYYY-MM-DD").format("YYYYMMDD")
                        },
                        {
                            title: "To",
                            field: "to",
                            type: "input-date",
                            save: value => moment(value, "YYYY-MM-DD").format("YYYYMMDD")
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("date-picker", DatePicker);
