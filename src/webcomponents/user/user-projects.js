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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";

export default class UserProjects extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            projects: {
                type: Array,
            },
        };
    }

    #init() {
        this.projects = [];
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("projects")) {
            this.config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    generateProjectSection(project) {
        return {
            display: {
                style: `border-left:4px solid var(--main-bg-color);padding:16px 24px;`,
            },
            elements: [
                {
                    type: "text",
                    text: project.name || project.id,
                    display: {
                        icon: "folder",
                        textClassName: "h4",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                },
                {
                    type: "text",
                    text: "Project Info",
                    display: {
                        icon: "info-circle",
                        textClassName: "h5",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                },
                {
                    title: "Project ID",
                    type: "text",
                    text: project.id,
                    display: {
                        defaultValue: "-",
                    },
                },
                {
                    title: "Project Description",
                    type: "text",
                    text: project.description,
                    display: {
                        defaultValue: "-",
                    },
                },
                {
                    title: "Data Release",
                    text: project.attributes.release,
                    type: "text",
                    display: {
                        visible: !!project?.attributes?.release,
                    },
                },
                {
                    title: "Species",
                    text: `${project.organism?.scientificName || "-"} (${project.organism?.assembly || "-"})`,
                    type: "text",
                },
                {
                    title: "CellBase",
                    text: `${project.cellbase?.url || "-"} (${project.cellbase?.version || "-"}, Data Release: ${project.cellbase?.dataRelease || "-"})`,
                    type: "text",
                },
                // Generate a table with all studies of this project of this user
                {
                    type: "text",
                    text: "Project Studies",
                    display: {
                        icon: "flask",
                        textClassName: "h5",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                },
                {
                    type: "table",
                    // title: "Studies",
                    display: {
                        defaultLayout: "vertical",
                        headerStyle: {
                            background: "#f5f5f5",
                            lineHeight: "0.5"
                        },
                        getData: () => project.studies,
                        columns: [
                            {
                                title: "ID",
                                field: "id",
                            },
                            {
                                title: "Name",
                                field: "name",
                            },
                            {
                                title: "Description",
                                field: "description",
                                display: {
                                    defaultValue: "-",
                                },
                            },
                            {
                                title: "Creation",
                                field: "creationDate",
                                display: {
                                    format: date => UtilsNew.dateFormatter(date),
                                },
                            },
                            {
                                title: "FQN",
                                field: "fqn",
                            },
                            {
                                title: "Links",
                                field: "fqn",
                                type: "custom",
                                display: {
                                    render: fqn => {
                                        const match = fqn.match(/^[^@]+@([^:]+):(.*)$/);
                                        if (match) {
                                            const [, project, study] = match;
                                            return html`
                                                <a href="#variant-browser/${project}/${study}" title="Variant Browser"
                                                   style="white-space:nowrap;">
                                                    <i class="fas fa-external-link-alt icon-padding"></i> VB
                                                </a>
                                            `;
                                        }
                                        return nothing;
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        };
    }

    render() {
        return html`
            <data-form
                .config="${this.config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const projectsSections = (this.projects || []).map(project => {
            return this.generateProjectSection(project);
        });

        return {
            icon: "",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    elements: [
                        {
                            type: "text",
                            text: "Projects and Studies",
                            display: {
                                icon: "archive",
                                textClassName: "h2",
                                textStyle: "color: var(--main-bg-color);margin-bottom:24px;font-weight:bold;",
                            },
                        }
                    ],
                },
                {
                    display: {
                        visible: projectsSections.length === 0,
                    },
                    elements: [
                        {
                            type: "notification",
                            text: "You do not have access to any project on this organization.",
                            display: {
                                notificationType: "warning",
                            },
                        }
                    ],
                },
                ...projectsSections,
            ],
        };
    }

}

customElements.define("user-projects", UserProjects);
