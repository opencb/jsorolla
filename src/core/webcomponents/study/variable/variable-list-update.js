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
import "../../commons/filters/text-field-filter.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variable-manager.js";

export default class VariableListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            variables: {
                type: Array
            },
        };
    }

    createRenderRoot() {
        return this;
    }

    _init() {
        this.isShow = false;
        this.variable = {};
        this._manager = {
            parent: "",
            action: "",
            variable: ""
        };
    }

    onShowVariableManager(e, manager) {
        if (manager.action === "ADD") {
            if (manager.parent) {
                this.isShow = true;
                this.parentVarId = manager.parent;
            }

            if (manager.parent === "") {
                this.isShow = !this.isShow;
            }
            this.variable = {};
        } else {
            console.log("Edit Variable", manager.variable);
            this.variable = manager.variable;
            this.parentVarId = manager.parent;
            this.isShow = true;
        }
        this._manager = manager;
        this.requestUpdate();

        $("#variableManagerModal").modal("show");
    }

    onActionVariable(e) {
        e.stopPropagation();
        if (this._manager.action === "ADD") {
            console.log("Add new variable");
            this.addVariable(e.detail.value);

        } else {
            console.log("Edit info variable");
            this.editVariable(e.detail.value);
        }
        console.log("results: ", this.variables);
        $("#variableManagerModal").modal("hide");
        this.requestUpdate();
    }

    buildVariable(variable) {
        return variable.type === "OBJECT"? {...variable, variables: []} : variable;
    }

    addVariable(variable) {
        console.log("onAddVariableList", this.parentVarId, variable);
        this.isShow = false;
        // debugger;
        if (this.parentVarId) {
            console.log("Add child variable to the list", this.parentVarId);
            const parentVarIds = this.parentVarId.split(".");
            this.addChildVariable(this.variables, parentVarIds, variable);
            this.parentVarId = "";
        } else {
            console.log("Add variable to the list");
            const newVar = this.buildVariable(variable);
            this.variables = [...this.variables, newVar];
        }
        LitUtils.dispatchEventCustom(this, "changeVariables", this.variables);
    }

    addChildVariable(variables, parentVarIds, childVariable) {
        parentVarIds.forEach(parentVar => {
            variables.forEach(variable => {
                if (variable.id === parentVar) {
                    if (parentVarIds.length === 1) {
                        const newVar = this.buildVariable(childVariable);
                        variable.variables.push(newVar);
                        return variables;
                    }
                    parentVarIds.shift();
                    return {...variable, variables: this.addChildVariable(variable.variables, parentVarIds, childVariable)};
                }
            });
        });
    }
    // review this function parentVarId
    editVariable(variable) {
        console.log("onEditVariableList", this.parentVarId, variable);
        this.isShow = false;
        if (this.parentVarId) {
            console.log("Edit variable to the list", this.parentVar);
            const parentVarIds = this.parentVarId.split(".");
            this.variables = this.editChildVariable(this.variables, parentVarIds, variable);
            this.parentVarId = "";
            LitUtils.dispatchEventCustom(this, "changeVariables", this.variables);
        } else {
            // Deprecated
            console.log("Add variable to the list");
            this.variables = [...this.variables, variable];
        }
    }

    editChildVariable(variables, parentVarIds, childVariable) {
        let result = [];

        if (parentVarIds.length === 1) {
            // const vars = variables.filter(item => item.id !== parentVars[0]);
            // vars.push(childVariable);
            const findIndexVariable = variables.findIndex(item => item.id === parentVarIds[0]);

            const variablesEdited = variables;
            variablesEdited[findIndexVariable] = this.buildVariable(childVariable);
            return variablesEdited;
        }

        parentVarIds.forEach(parentVar => {
            result = variables.map(item => {
                if (item.id === parentVar) {
                    parentVarIds.shift();
                    return {...item, variables: this.editChildVariable(item.variables, parentVarIds, childVariable)};
                } else {
                    return item;
                }
            });
        });
        return result;
    }

    onRemoveVariable(e, item) {
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
                console.log("onRemoveVariable ", item);
                const removeVariable = item.split(".");
                this.variables = this.removalVariable(this.variables, removeVariable);
                console.log("result: ", this.variables);
                LitUtils.dispatchEventCustom(this, "changeVariables", this.variables);
                Swal.fire(
                    "Deleted!",
                    "The variable has been deleted.",
                    "success"
                );
            }
        });
    }

    removalVariable(variables, removeVariables) {
        let result = [];

        if (removeVariables.length === 1) {
            return variables.filter(item => item.id !== removeVariables[0]);
        }

        removeVariables.forEach(removeVariable => {
            result = variables.map(item => {
                if (item.id === removeVariable) {
                    if (removeVariables.length > 1) {
                        removeVariables.shift();
                        return {...item, variables: this.removalVariable(item.variables, removeVariables)};
                    }
                } else {
                    return item;
                }
            });
        });
        return result;
    }

    onShowNode(e) {
        const findParentTreeList = child => child.parentElement.className === "tree-list"? child.parentElement : findParentTreeList(child.parentElement);

        const childTreeList = e.currentTarget;
        const parentTreeList = findParentTreeList(childTreeList);
        console.log("TreeList", childTreeList, "parentList", parentTreeList);
        parentTreeList.querySelector(".nested").classList.toggle("active");
        childTreeList.classList.toggle("fa-caret-down");
    }

    onCloseForm(e) {
        e.stopPropagation();
        this.isShow = false;
        this.variable = {};
        $("#variableManagerModal").modal("hide");
        this.requestUpdate();
    }

    renderVariableTitle(item) {
        return html `${item?.variables?.length > 0 ? html`
        <span class="fas fa-caret-right" @click="${this.onShowNode}">
            <span>${item.id} (${item.type})</span>
        </span>` :
        html `<span style="margin-left:14px">${item.id} (${item.type})</span>`
        }`;
    }

    renderVariables(variables, parentId) {
        const parentVariableId = variable => parentId? `${parentId}.${variable.id}`: variable.id;
        return html`
            ${variables?.map(variable => html`
                ${variable.type === "OBJECT"? html`
                    <li class="tree-list">
                        <div class="row">
                            <div class="col-md-8">
                                ${this.renderVariableTitle(variable)}
                            </div>
                            <div class="col-md-4">
                                <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                    <button type="button" class="btn btn-primary btn-xs"
                                        @click="${e => this.onShowVariableManager(e, {parent: parentVariableId(variable), action: "ADD", variable: variable})}">Add</button>
                                    <button type="button" class="btn btn-primary btn-xs"
                                        @click="${e => this.onShowVariableManager(e, {parent: parentVariableId(variable), action: "EDIT", variable: variable})}">Edit</button>
                                    <button type="button" class="btn btn-danger btn-xs"
                                        @click="${e => this.onRemoveVariable(e, parentVariableId(variable))}">Delete</button>
                                </div>
                            </div>
                            <ul class="nested">
                                ${this.renderVariables(variable.variables, parentVariableId(variable))}
                            </ul>
                        </div>
                    </li>
                    `: html`
                    <li>
                        <div class="row">
                            <div class="col-md-8">
                                <span style="margin-left:14px">${variable.id} (${variable.type})</span>
                            </div>
                            <div class="col-md-4" >
                                <div class="btn-group pull-right" style="padding-bottom:5px" role="group">
                                    <button type="button" class="btn btn-primary btn-xs"
                                        @click="${e => this.onShowVariableManager(e, {parent: parentVariableId(variable), action: "EDIT", variable: variable})}">Edit</button>
                                    <button type="button" class="btn btn-danger btn-xs"
                                        @click="${e => this.onRemoveVariable(e, parentVariableId(variable))}">Delete</button>
                                </div>
                            </div>
                        </div>
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

        <div class="col-md-12" style="padding: 10px 20px">
            <div class="container" style="width:100%">
                <ul id="myUL">
                    ${this.renderVariables(this.variables)}
                </ul>
                <button type="button" class="btn btn-primary btn-sm"
                @click="${e => this.onShowVariableManager(e, {parent: "", action: "ADD"})}">
                Add Variable</button>
            </div>
        </div>
        <div id="variableManagerModal" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Variable Information</h4>
                    </div>
                    <div class="modal-body">
                        <variable-manager
                            .variable="${this.variable}"
                            .dependsOn="${this.variables}"
                            @closeForm="${e => this.onCloseForm(e)}"
                            @addItem="${this.onActionVariable}">
                        </variable-manager>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

}

customElements.define("variable-list-update", VariableListUpdate);
