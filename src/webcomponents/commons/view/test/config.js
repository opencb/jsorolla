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

import {html} from "lit-html";

const individual = {
    title: "Summary",
    icon: "",
    display: {
        collapsable: true,
        showTitle: false,
        labelWidth: 2,
        labelAlign: "left",
        defaultValue: "-"
    },
    sections: [
        {
            title: "Two columns",
            collapsed: false,
            display: {
                // style: "border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #ddd",
                leftColumnWith: 4,
                columnSeparatorStyle: "border-right: 1px solid red"
            },
            elements: [
                [
                    {
                        name: "Name",
                        field: "name",
                        // type: "basic" (optional)
                    },
                    {
                        name: "Name",
                        field: "namelkjsaljksajksa",
                    },
                    {
                        name: "Father",
                        field: "father.id",
                        type: "basic",
                        display: {
                            format: {
                                style: "color: red"
                            }
                        }
                    },
                ],
                [
                    {
                        name: "Name",
                        field: "name",
                        // type: "basic" (optional)
                    },
                    {
                        name: "Name",
                        field: "namelkjsaljksajksa",
                    },
                    {
                        name: "Father",
                        field: "father.id",
                        type: "basic",
                        display: {
                            format: {
                                style: "color: red"
                            }
                        }
                    },
                ]
            ]
        },
        {
            title: "General",
            collapsed: false,
            display: {
                // style: "border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #ddd"
            },
            elements: [
                // available types: basic (optional/default), complex, list (horizontal and vertical), table, plot, custom
                {
                    name: "Individual ID",
                    type: "complex",
                    display: {
                        template: "${id} (UUID ${uuid}  - Undefined ${uuuuuuid})",
                        format: {
                            uuid: {
                                style: "color: red"
                            }
                        },
                        defaultValue: "NA"
                    }
                },
                {
                    name: "Name",
                    field: "name",
                    // type: "basic" (optional)
                },
                {
                    name: "Name",
                    field: "namelkjsaljksajksa",
                },
                {
                    name: "Father",
                    field: "father.id",
                    type: "basic",
                    display: {
                        format: {
                            style: "color: red"
                        }
                    }
                },
                {
                    name: "Mother of ${id}",
                    field: "mother.id",
                    type: "basic"
                },
                {
                    name: "Sex (Karyotypic Sex)",
                    type: "complex",
                    display: {
                        template: "${sex} (${karyotypicSex})",
                    }
                },
                {
                    name: "Sex (Karyotypic Sex)",
                    type: "custom",
                    // without the field "field" the param of render is data the whole config
                    display: {
                        render: data => {
                            return html`${data.sex} (<span style="color: red">${data.karyotypicSex}</span>)`;
                        },
                    }
                },
                {
                    type: "separator",
                    display: {
                        style: "width: 90%; border-width: 2px"
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "list",
                    display: {
                        template: "${name} (${id})",
                        contentLayout: "horizontal",
                        separator: ", "
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "list",
                    display: {
                        template: "${name} (${id})",
                        contentLayout: "vertical",
                        bullets: false,
                        format: {
                            id: {
                                link: "https://hpo.jax.org/app/browse/term/ID",
                            },
                            name: {
                                style: "font-weight: bold"
                            }
                        },
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "list",
                    display: {
                        layout: "horizontal",
                        template: "${name} (${id})",
                        contentLayout: "bullets",
                        format: {
                            id: {
                                link: "https://hpo.jax.org/app/browse/term/ID",
                            },
                            name: {
                                style: "font-weight: bold"
                            }
                        },
                        defaultValue: "N/A"
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "list",
                    display: {
                        layout: "vertical",
                        template: "${name} (${id})",
                        contentLayout: "bullets",
                        format: {
                            id: {
                                link: "https://hpo.jax.org/app/browse/term/ID",
                            },
                            name: {
                                style: "font-weight: bold"
                            }
                        },
                        defaultValue: "N/A"
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "table",
                    display: {
                        columns: [
                            {
                                name: "ID", field: "id", format: {
                                    link: "https://hpo.jax.org/app/browse/term/ID",
                                }
                            },
                            {
                                name: "Name", field: "name"
                            },
                            {
                                name: "Source", field: "source"
                            },
                            {
                                name: "Undefined Filed", field: "uf", defaultValue: "N/A", format: {
                                    style: "font-weight: bold"
                                }
                            }
                        ],
                        defaultValue: "Empty array found",
                        border: true
                    }
                },
                {
                    name: "Phenotypess",
                    field: "phenotypess",
                    type: "table",
                    display: {
                        columns: [
                            {
                                name: "ID", field: "id", format: {
                                    link: "https://hpo.jax.org/app/browse/term/ID",
                                    style: "color: red"
                                }
                            },
                            {
                                name: "Name", field: "name"
                            },
                            {
                                name: "Source", field: "source"
                            },
                            {
                                name: "Undefined Filed", field: "uf", defaultValue: "N/A", format: {
                                    style: "font-weight: bold"
                                }
                            }
                        ],
                        defaultValue: "Emtpy array found",
                        border: true
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "table",
                    display: {
                        layout: "vertical",
                        columns: [
                            {
                                name: "ID", field: "id", format: {
                                    link: "https://hpo.jax.org/app/browse/term/ID",
                                    style: "color: red"
                                }
                            },
                            {
                                name: "Name", field: "name"
                            },
                            {
                                name: "Source", field: "source"
                            },
                            {
                                name: "Undefined Filed", field: "uf", defaultValue: "N/A", format: {
                                    style: "font-weight: bold"
                                }
                            }
                        ],
                        border: true
                    }
                },
                {
                    name: "plotExample from Object",
                    field: "plotExample",
                    type: "plot",
                    display: {
                        chart: "column",
                    }
                },
                {
                    name: "plotExample from Array",
                    field: "plotExampleArray",
                    type: "plot",
                    display: {
                        data: {
                            key: "id",
                            value: "total"
                        },
                        chart: "column",
                    }
                },
                {
                    name: "Phenotypes",
                    field: "phenotypes",
                    type: "custom",
                    display: {
                        render: data => {
                            return html` <pre>${JSON.stringify(data, null, 2)}</pre>
                                    `;
                        }
                    }
                },
                {
                    name: "Chart",
                    // field: "phenotypes",
                    data: {"INSERTION": 1, "SNV": 165398, "DELETION": 1, "INDEL": 7218},
                    type: "plot",
                    display: {
                        chart: "column",
                    }
                },
            ]
        },
    ]
};
