/**
 * Copyright 2015-2019 OpenCB
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
import Utils from "../../../core/utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import "../../../webcomponents/commons/tool-header.js";
import "../../../webcomponents/text-icon.js";

// TODO the property "disabled" in config have to be renamed in active (boolean for an user or an usergroup)

export default class CategoryPage extends LitElement {

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
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this._config = {...this.getDefaultConfig(), ...this.config};

    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    isVisible(item) {
        switch (item.visibility) {
            case "public":
                return true;
            case "private":
                return UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotEmpty(this.opencgaSession.token);
            case "none":
            default:
                return false;
        }
    }

    renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }

    getDefaultConfig() {

    }

    render() {
        return html`
        <style>
            #category-page {
                padding: 10px;
            }
            #category-page > a.item{
                padding: 10px;
                display: inline-block;
                color: #fff;
                background-color: #42424E;
                width: 400px;
                min-height: 120px;
                position: relative;
                margin: 10px;
            }

            #category-page > a.item:hover{
                text-decoration: none;
            }


            #category-page .icon {
                width: 100px;
                vertical-align: bottom;
            }

            #category-page .content {
                float: left;
                width: 255px;
            }

            #category-page .description {
                color: #b6c1c9;
            }

            #category-page .section-title {
                font-size: 1.6em;
                font-weight: 500;
                letter-spacing: 5px;
                margin: 10px 0 0 10px;
                color: #000966;
                font-family: "Roboto",serif;
                text-transform: uppercase;
            }

            #category-page .lock-overlay {
                position: absolute;
                background-image: linear-gradient(45deg, #4d4d4d80 25%, #47474780 25%, #47474780 50%, #4d4d4d80 50%, #4d4d4d80 75%, #47474780 75%, #47474780 100%);
                background-size: 40px 40px;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: -10px;
            }
        </style>
        <tool-header title="${this.config?.name}" icon="${this.config?.icon}"></tool-header>

        <div id="category-page">
            ${this.config?.submenu?.length > 0 ? this.config.submenu.filter(this.isVisible).map((item, i) => item.category ? html`
                <div class="section-title">${item.name}</div>` :
                    item.separator ? null :
                        html`
                            <a class="item ${item.disabled ? "disabled" : ""}" href="${ !item.disabled ? `#${item.id}` : "javascript: void 0"}">
                                ${item.disabled ? html`
                                    <div class="lock-overlay">
                                        <i class="fas fa-4x fa-lock"></i>
                                    </div>
                                ` :
                                null}
                                <div class="text-icon-wrapper">
                                    <text-icon title="${item.name}" color="${i % 2 === 0 ? "green" : i % 3 === 0 ? "red": ""}" acronym="${item.acronym ?? item.name[0] + item.name[1] + item.name[2].toLowerCase()}"></text-icon>
                                </div>
                                <div class="content">
                                    <div class="title uppercase">${item.name}</div>
                                    <div class="description">${this.renderHTML(item.description || "")}</div>
                                </div>
                            </a>
                    `) : null}
        </div>
        `;
    }

}

customElements.define("category-page", CategoryPage);
