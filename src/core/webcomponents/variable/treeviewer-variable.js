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


import {LitElement, html} from "/web_modules/lit-element.js";
import "../commons/tool-header.js";
import "../commons/filters/text-field-filter.js";
import LitUtils from "../commons/utils/lit-utils.js";

export default class TreeViewerVariable extends LitElement {

    constructor() {
        super();
    }

    static get properties() {
        return {
            variables: {
                type: Array
            }
        };
    }

    createRenderRoot() {
        return this;
    }

    updated(changedProperties) {
        if (changedProperties.has("variables")) {
            console.log("Updating elements tree");
            const toggler = document.getElementsByClassName("fa-caret-right");

            toggler.forEach(el => {
                el.addEventListener("click", function () {
                    this.parentElement.querySelector(".nested").classList.toggle("active");
                    this.classList.toggle("fa-caret-down");
                });
            });
        }
    }

    addVariable(e, item) {
        // Send to the variable-manager
        LitUtils.dispatchEventCustom(this, "addVariable", item);
    }

    removeVariable(e, item) {
        console.log(item);
        LitUtils.dispatchEventCustom(this, "removeVariable", item);
    }


    editVariable(e, item) {
        console.log("Edit Variable", item);
        LitUtils.dispatchEventCustom(this, "editVariable", item);
    }

    renderVariableTitle(item) {
        return html `${item.variables.length > 0 ? html`
        <span class="fas fa-caret-right">
            <span>${item.id} (${item.type})</span>
        </span>` :
        html `<span>${item.id} (${item.type})</span>`
        }`;
    }


    renderVariables(variables, parentItem) {
        console.log("Render variables");
        const itemParentOf = item => parentItem? `${parentItem}.${item.id}`: item.id;
        return html `
            ${variables.map(item => html`
                ${item.type === "OBJECT"? html `
                    <li class="tree-list">
                            ${this.renderVariableTitle(item)}
                            <button type="button" class="btn btn-primary btn-xs" @click="${e => this.addVariable(e, item)}">Add</button>
                            <button type="button" class="btn btn-primary btn-xs" @click="${e => this.editVariable(e, item)}">Edit</button>
                            <button type="button" class="btn btn-danger btn-xs" @click="${e => this.removeVariable(e, itemParentOf(item))}">Delete</button>
                        <ul class="nested">
                            ${this.renderVariables(item.variables, itemParentOf(item))}
                        </ul>
                    </li>
                    `: html`<li> <span >${item.id} (${item.type})</span>
                                <button type="button" class="btn btn-primary btn-xs" @click="${e => this.editVariable(e, item)}" >Edit</button>
                                <button type="button" class="btn btn-danger btn-xs" @click="${e => this.removeVariable(e, itemParentOf(item))}">Delete</button>
                            </li>`}
                `)}
            `;
    }

    render() {
        return html`

        <style>
            /* Remove default bullets */
            ul, #myUL {
                list-style-type: none;
            }

            .tree-list {
                padding-bottom:2px
            }

            /* Remove margins and padding from the parent ul */
            #myUL {
                margin: 0;
                padding: 0;
            }

            /* Style the caret/arrow */
            .fa-caret-right {
                cursor: pointer;
                user-select: none;
            }

            /* Create the caret/arrow with a unicode, and style it */
            .fa-caret-right::before {
                color: black;
                display: inline-block;
                margin-right: 6px;
                }

            /* Rotate the caret/arrow icon when clicked on (using JavaScript) */
            .fa-caret-down::before {
                transform: rotate(90deg);
            }

            /* Hide the nested list */
            .nested {
                display: none;
            }

            /* Show the nested list when the user clicks on the caret/arrow (with JavaScript) */
            .active {
                display: block;
            }
        </style>
        <div class="container" style="width:100%">
            <ul id="myUL">
                ${this.renderVariables(this.variables)}
            </ul>
            <button type="button" class="btn btn-primary btn-xs" @click="${e => this.addVariableChild(e)}">Add Variable</button>
        </div>
    `;
    }

}

customElements.define("treeviewer-variable", TreeViewerVariable);
