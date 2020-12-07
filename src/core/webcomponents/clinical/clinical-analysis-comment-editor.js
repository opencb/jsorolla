/*
 * Copyright 2015-2016 OpenCB
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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";

class ClinicalAnalysisCommentEditor extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            comments: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.commentStatus = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("comments")) {
            this.commentsObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    commentsObserver() {
        if (!this.comments || this.comments.length === 0) {
            this.comments = [{message: "", tags: []}];
        }

        if (this.comments) {
            // Keep a internal copy to reset vales
            this._comments = JSON.parse(JSON.stringify(this.comments));

            // Init the status with status NONE
            this.commentStatus = {};
            for (let comment of this.comments) {
                this.commentStatus[comment.date] = "NONE";
            }
            this.requestUpdate();
        }
    }

    onAddChange(field, e) {
        // Only one new Comment allowed, it is added at the end of the comments array. No date is set for the new comment.
        // If last element contains a 'date' then we need to add a new comment.
        if (this.comments[this.comments.length - 1].date) {
            this.comments.push({
                message: "",
                tags: []
            })
        }

        if (field === "message") {
            this.comments[this.comments.length - 1].message = e.detail.value;
        } else {
            this.comments[this.comments.length - 1].tags = e.detail.value?.split(" ") ?? [];
        }

        if (this.comments[this.comments.length - 1].message || this.comments[this.comments.length - 1].tags.length > 0) {
            this.commentStatus["ADD"] = "ADD";
        } else {
            delete this.commentStatus["ADD"];
        }

        this.requestUpdate();
        this.notify();
    }

    onAddDelete(e) {
        // Delete the new ADDED comment
        this.comments.splice(this.comments.length - 1, 1);
        delete this.commentStatus["ADD"];
        this.requestUpdate();
        this.notify();
    }

    onEditChange(comment, field, e) {
        // Store the comment being UPDATED
        let editIndex = this.comments.findIndex(c => c.date === comment.date);
        if (field === "message") {
            this.comments[editIndex].message = e.detail.value;
        } else {
            this.comments[editIndex].tags = e.detail.value?.split(" ") ?? [];
        }
        this.notify();
    }

    onActionClick(comment, status, reset, e) {
        // Reset value in case it was UPDATED
        if (reset) {
            let index = this.comments.findIndex(c => c.date === comment.date);
            this.comments[index] = {...this._comments[index]};
        }

        // Set new status and refresh
        this.commentStatus[comment.date] = status;
        this.requestUpdate();
        this.notify();
    }

    onStarClick(comment, action, e) {
        if (action === "REMOVE") {
            let index = comment.tags?.indexOf("STARRED");
            comment.tags.splice(index, 1);
        } else {
            comment.tags ? comment.tags.push("STARRED") : comment.tags = ["STARRED"];
        }
        this.commentStatus[comment.date] = "UPDATED";
        this.requestUpdate();
        this.notify();
    }

    notify() {
        // Process all changes
        let newComments = [];
        let addedComments = [];
        let updatedComments = [];
        let deletedComments = [];
        for (let comment of this.comments) {
            if (comment.date) {
                switch (this.commentStatus[comment.date]) {
                    case "NONE":
                        newComments.push(comment);
                        break;
                    case "UPDATED":
                        newComments.push(comment);
                        updatedComments.push(
                            {
                                date: comment.date,
                                message: comment.message,
                                tags: comment.tags
                            }
                        );
                        break;
                    case "DELETED":
                        deletedComments.push(
                            {
                                date: comment.date
                            }
                        );
                        break;
                }
            } else {
                newComments.push(comment);
                addedComments.push(comment);
            }
        }

        this.dispatchEvent(new CustomEvent("commentChange", {
            detail: {
                value: this.comments,
                newComments: newComments,
                added: addedComments,
                updated: updatedComments,
                deleted: deletedComments,
            },
        }));
    }

    getDefaultConfig() {
        return {
            add: true,
            styles: {
                NONE: "border-left: 2px solid #0c2f4c",
                ADD: "border-left: 2px solid green",
                UPDATED: "border-left: 2px solid darkorange",
                DELETED: "border-left: 2px solid red; color: grey"
            }
        };
    }

    render() {
        // if (!this.comments) {
        //     return html`
        //         <div>
        //             <h3><i class="fas fa-lock"></i> No available comments</h3>
        //         </div>`;
        // }

        return html`
            ${this.comments?.filter(c => c.date)?.map(comment => html`
                <div style="${this._config.styles[this.commentStatus[comment.date]]}; margin: 15px 0px">
                    <div style="margin: 5px 10px">
                        <span style="font-weight: bold">${comment.author}</span>
                        <span style="color: darkgrey; margin: 0px 10px">${UtilsNew.dateFormatter(comment.date)}</span>
                        <div style="float: right">
                            ${comment.tags && comment.tags.includes("STARRED") 
                                ? html`                                        
                                        <span style="color: darkgoldenrod" @click="${e => this.onStarClick(comment, "REMOVE", e)}">
                                            <i class="fas fa-star"></i>
                                        </span>`
                                : html`
                                        <span @click="${e => this.onStarClick(comment, "ADD", e)}">
                                            <i class="far fa-star"></i>
                                        </span>`
                            }
                        </div>
                    </div>
                    <div style="margin: 5px 10px">
                        ${this.commentStatus[comment.date] === "UPDATED" ? html`
                            <div style="margin: 10px 0px">
                                <text-field-filter .value="${comment.message}" .rows=${2} @filterChange="${e => this.onEditChange(comment, "message", e)}"></text-field-filter>
                            </div>
                            <div style="margin: 10px 0px">
                                <text-field-filter .value="${comment.tags?.filter(t => t !== "STARRED").join(" ")}" .rows=${1} @filterChange="${e => this.onEditChange(comment, "tags", e)}"></text-field-filter>
                            </div>
                        ` : html`
                            <div style="margin: 10px 0px">${comment.message}</div>
                            <div style="margin: 10px 0px">
                                ${comment.tags?.filter(t => t !== "STARRED").map(tag => html`
                                    <span class="label label-info" style="font-size: 95%">${tag}</span>`
                                )}
                            </div>`
                        }
                    </div>
                    <div style="margin: 5px 10px">
                        <span>
                            <a style="color: darkgrey; cursor: pointer" @click="${e => this.onActionClick(comment, "UPDATED", false, e)}">Edit</a>
                        </span>
                        <span> - </span>
                        <span>
                            <a style="color: darkgrey; cursor: pointer" @click="${e => this.onActionClick(comment, "DELETED", true, e)}">Delete</a>
                        </span>
                        ${this.commentStatus[comment.date] === "UPDATED" || this.commentStatus[comment.date] === "DELETED"? html`
                            <span> - </span>
                            <span>
                                <a style="color: darkgrey; cursor: pointer" @click="${e => this.onActionClick(comment, "NONE", true, e)}">Cancel</a>
                            </span>
                        ` : null}
                    </div>
                </div>
            `)}
            
            ${this._config.add 
                ? html`
                    <div style="${this.commentStatus["ADD"] === "ADD" ? this._config.styles.ADD : this._config.styles.NONE}; margin: 15px 0px">
                        <div style="margin: 5px 10px">
                            <span style="font-weight: bold">New comment</span>
                        </div>
                        <div style="margin: 5px 10px">
                            <text-field-filter .value="${this.comments[this.comments.length - 1]?.date ? "" : this.comments[this.comments.length - 1]?.message}" 
                                               placeholder="Add comment..." .rows=${2} 
                                               @filterChange="${e => this.onAddChange("message", e)}">
                            </text-field-filter>
                        </div>
                        <div style="margin: 5px 10px">
                            <text-field-filter .value="${this.comments[this.comments.length - 1]?.date ? "" : this.comments[this.comments.length - 1]?.tags.join(" ")}" 
                                               placeholder="Add tags..." .rows=${1} 
                                               @filterChange="${e => this.onAddChange("tags", e)}">
                            </text-field-filter>
                        </div>
                        ${this.commentStatus["ADD"] === "ADD" ? html`
                            <div style="margin: 5px 10px">
                                <span>
                                    <a style="color: darkgrey; cursor: pointer" @click="${e => this.onAddDelete(e)}">Cancel</a>
                                </span>
                        ` : null
                        }
                        <div style="margin: 5px 10px; float: right; display: none">
                            <span>
                                <button type="button" class="btn btn-default">Cancel</button>
                            </span>
                            <span>
                                <button type="button" class="btn btn-primary">Add</button>
                            </span>
                        </div>
                    </div>` 
                : null
            }
        `;
    }
}

customElements.define("clinical-analysis-comment-editor", ClinicalAnalysisCommentEditor);
