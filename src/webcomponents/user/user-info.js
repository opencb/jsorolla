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
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";

export default class UserInfo extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            user: {
                type: Object
            },
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    render() {
        return html`
            <data-form
                .data="${this.user}"
                .config="${this.config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    // title: "General Info",
                    elements: [
                        {
                            type: "text",
                            text: "User Info",
                            display: {
                                icon: "user",
                                textClassName: "h3",
                                textStyle: "color: var(--main-bg-color);margin-bottom:24px;font-weight:bold;",
                            },
                        },
                        {
                            title: "id",
                            field: "id"
                        },
                        {
                            title: "Name",
                            field: "name"
                        },
                        {
                            title: "Email",
                            field: "email",
                        },
                        {
                            title: "Organization",
                            field: "organization",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Account type",
                            field: "account.type"
                        },
                        {
                            title: "Member since",
                            field: "account.creationDate",
                            display: {
                                defaultValue: "Not provided",
                                format: date => UtilsNew.dateFormatter(date)
                            }
                        },
                        {
                            title: "Synced from",
                            field: "account.authentication",
                            // CAUTION 20240229 VERO: bug in visible function:
                            //  the argument authentication is the entire data model, not the field account.authentication
                            display: {
                                visible: authentication => authentication.id === "internal",
                                format: authentication => authentication.id,
                            }
                        }
                    ]
                },
            ],
        };
    }

}

customElements.define("user-info", UserInfo);
