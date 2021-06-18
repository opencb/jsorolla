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

export default class TreeViewerVariable extends LitElement {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            variables: {
                type: Array
            }
        };
    }

    _init() {
        this.isShow = "";
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // console.log("Try basic tree viewer", this);
        // const toggler = this.getElementsByClassName("fa-caret-right");
        // const self = this;
        // console.log("Toggler ", toggler);
        // toggler.forEach(el => {

        //     el.addEventListener("click", () => {
        //         self.querySelector(".nested").classList.toggle("active");
        //         self.classList.toggle("fa-caret-down");
        //     });
        // });
        const toggler = document.getElementsByClassName("fa-caret-right");
        let i;
        for (i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function () {
                const self = this;
                console.log("I'm this: ", self);
                console.log("I'm this: ", self.parentElement);
                console.log("I'm this: ", self.parentElement.querySelector(".nested"));
                this.parentElement.querySelector(".nested").classList.toggle("active");
                this.classList.toggle("fa-caret-down");
            });
        }
    }

    _openChildNode(e, el) {
        // TODO: if this a object, display all the child node
        console.log("Child", el);
        // this.parentElement.querySelector(".nested").classList.toggle("active");
        // this.classList.toggle("fa-caret-down");
    }

    closeChildNode() {
        //
    }


    renderVariables(variables) {
        console.log("Render variables");
        return html `
            ${variables.map(item => html`
                ${item.type === "OBJECT"? html `
                    <li><span class="fas fa-caret-right">${item.id} (${item.type})</span>
                        <button type="button" class="btn btn-primary btn-xs">Add</button>
                        <button type="button" class="btn btn-primary btn-xs">Edit</button>
                        <button type="button" class="btn btn-danger btn-xs">Delete</button>
                        <ul class="nested">
                            ${this.renderVariables(item.variables)}
                        </ul>
                    </li>
                    `:
                    html`
                    <li>${item.id} (${item.type})</li>`}
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

        <ul id="myUL">
        ${this.renderVariables(this.variables)}
        </ul>
        <button type="button" class="btn btn-primary btn-xs">Add Variable</button>
        <!-- <ul id="myUL">
        <li>Sencha</li>
        <li>Gyokuro</li>
        <li>Matcha</li>
        <li>Pi Lo Chun</li>
        <li><span class="fas fa-caret-right">Beverages</span>
            <ul class="nested">
            <li>Water</li>
            <li>Coffee</li>
            <li><span class="fas fa-caret-right">Tea</span>
                <ul class="nested">
                <li>Black Tea</li>
                <li>White Tea</li>
                <li><span class="fas fa-caret-right">Green Tea</span>
                    <ul class="nested">
                    <li>Sencha</li>
                    <li>Gyokuro</li>
                    <li>Matcha</li>
                    <li>Pi Lo Chun</li>
                    </ul>
                </li>
                </ul>
            </li>
            </ul>
        </li>
        <li><span class="fas fa-caret-right">Green Tea</span>
            <ul class="nested">
                <li>Sencha</li>
                <li>Gyokuro</li>
                <li>Matcha</li>
                <li>Pi Lo Chun</li>
            </ul>
        </li>
        <li>Sencha</li>
        <li>Gyokuro</li>
        <li>Matcha</li>
        <li>Pi Lo Chun</li>
        </ul> -->
    `;
    }

}

customElements.define("treeviewer-variable", TreeViewerVariable);
