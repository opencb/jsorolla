import {html} from "lit";

export const DATA_FORM_ELEMENTS = {
    test: {
        prefix: "test",
        active: true,
    },
    sections: [
        {
            title: "Text Element",
            elements: [
                {
                    title: "Text Element: text",
                    type: "text",
                    text: "Text Element - Type text",
                    field: "fieldTextText",
                    display: {
                        icon: "user",
                        textClassName: "h4",
                        textStyle: "color: var(--main-bg-color);margin-bottom:24px;font-weight:bold;",
                    },
                },
                {
                    title: "Text Element: title",
                    type: "title",
                    text: "Text Element - Type title",
                    field: "fieldTextTitle",
                    display: {
                        textClassName: "h4",
                        textStyle: "font-size:24px;font-weight: bold;",
                    },
                },
                {
                    title: "Text Element: notification",
                    type: "notification",
                    text: "Text Element - Type notification",
                    field: "fieldTextNotification",
                    display: {
                        textClassName: "h4",
                        notificationType: "warning",
                    }
                },
            ],
        },
        {
            title: "Input Element: text-field-filter",
            elements: [
                {
                    title: "Input Element: text",
                    type: "input-text",
                    field: "fieldInputText",
                    defaultValue: "This is a default value",
                    display: {
                        disabled: true,
                        rows: 3,
                        placeholder: "This is a placeholder",
                        helpMessage: "This is a help message",
                        // QUESTION: What is help for
                        help: {
                            text: "Short individual ID for..."
                        }
                    }
                },
                {
                    name: "Input Element: number",
                    type: "input-num",
                    field: "fieldInputNum",
                    defaultValue: "",
                },
                {
                    title: "Input Element: password",
                    type: "input-password",
                    field: "fieldInputPassword",
                    defaultValue: "",
                },
            ],
        },
        {
            title: "Input Number: number-field-filter",
            elements: [
                {
                    title: "Input Number Element",
                    type: "input-number",
                    field: "fieldInputNumber",
                    defaultValue: "",
                },
            ],
        },
        {
            title: "Input Date",
            elements: [
                {
                    title: "Input Date Element",
                    type: "input-date",
                    field: "fieldInputDate",
                    display: {
                        render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                    },
                },
            ],
        },
        {
            title: "Checkbox",
            elements: [
                {
                    title: "Checkbox Element",
                    type: "checkbox",
                    field: "fieldCheckbox",
                    defaultValue: "1,2",
                    allowedValues:
                        [{id: 0, name: "Number 0"}, {id: 1, name: "Number 1"}, {id: 2, name: "Number 2"}]
                },
            ],
        },
        {
            title: "Toggle-switch Element",
            elements: [
                {
                    title: "Toggle-switch type",
                    field: "fieldToggleSwitch",
                    type: "toggle-switch",
                    display: {
                        helpMessage: "Help message toggle switch",
                        disabled: false,
                    },
                },
            ]
        },
        {
            title: "Toggle-buttons Element",
            elements: [
                {
                    title: "Toggle-buttons type",
                    field: "fieldToggleButtons",
                    type: "toggle-buttons",
                    allowedValues: ["YES", "NO", "UNKNOWN"],
                    display: {
                        helpMessage: "Help message toggle buttons",
                        disabled: false,
                    },
                },
            ]
        },
        {
            title: "Select Element",
            elements: [
                {
                    title: "Select type",
                    field: "fieldSelect",
                    type: "select",
                    allowedValues: ["VALUE1", "VALUE2", "VALUE3"],
                    display: {
                        placeholder: "Placeholder select",
                        helpMessage: "Help message select",
                        disabled: false,
                    },
                },
            ]
        },
        {
            title: "Complex Element",
            elements: [
                {
                    title: "Complex type",
                    field: "fieldComplex",
                    type: "complex",
                    display: {
                        template: "Template: ${id} - ${somatic}",
                        placeholder: "Placeholder complex template...",
                        helpMessage: "This is a complex type help message",
                    },
                },
            ]
        },
        {
            title: "List Element",
            elements: [
                {
                    name: "List type",
                    field: "fieldList",
                    type: "list",
                    display: {
                        template: "${name} (${id})",
                        contentLayout: "horizontal",
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
            ]
        },
        {
            title: "Table Element",
            elements: [
                {
                    name: "Table type",
                    field: "fieldTable",
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
                        border: true,
                    }
                },
            ]
        },
        {
            title: "Chart Element",
            elements: [
                {
                    title: "Chart type",
                    field: "fieldChart",
                    type: "chart",
                },
            ]
        },
        {
            title: "Plot Element",
            elements: [
                {
                    title: "Plot type",
                    field: "fieldPlot",
                    type: "plot",
                },
            ]
        },
        // Caution: not in use?
        // {
        //     title: "Json Element",
        //     elements: [
        //         {
        //             title: "Json type",
        //             field: "fieldJson",
        //             type: "json",
        //         },
        //     ]
        // },
        // Fixme Vero 20230224: it gives me an error, test properly
        // {
        //     title: "Json Editor Element",
        //     elements: [
        //         {
        //             title: "Json editor type",
        //             field: "fieldJsonEditor",
        //             type: "json-editor",
        //             display: {
        //                 placeholder: "write json",
        //                 readOnly: true,
        //                 help: {
        //                     text: "Must be a valid json, please remove empty fields if you don't need them."
        //                 },
        //             }
        //         },
        //     ]
        // },
        // Caution: not in use?
        // {
        //     title: "Tree Element",
        //     elements: [
        //         {
        //             title: "Tree type",
        //             field: "fieldTree",
        //             type: "tree",
        //         },
        //     ]
        // },
        {
            title: "Custom Element",
            elements: [
                {
                    name: "Custom type",
                    field: "fieldCustom",
                    type: "custom",
                    display: {
                        width: 6,
                        render: () => {
                            // .config="${fieldConfig}"
                            return html`I am rendering a content`;
                        }
                    }

                },
            ]
        },
        // Caution: not in use
        // {
        //     title: "Download Element",
        //     elements: [
        //         {
        //             title: "Download type",
        //             field: "fieldDownload",
        //             type: "download",
        //         },
        //     ]
        // },
        {
            title: "Object Element",
            elements: [
                {
                    title: "Object type",
                    field: "fieldObject",
                    type: "object",
                    elements: [
                        {
                            title: "Input 1",
                            field: "",
                            type: "input-text",
                            display: {
                                placeholder: "Add an input 1...",
                            }
                        },
                        {
                            title: "Input 2",
                            field: "",
                            type: "input-text",
                            display: {
                                placeholder: "Add an input 2..."
                            }
                        },
                        {
                            title: "Input 3",
                            field: "",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add an input 3..."
                            }
                        },
                    ],
                },
            ]
        },
        {
            title: "Object List Element",
            elements: [
                {
                    title: "Object List type",
                    field: "fieldObjectList",
                    type: "object-list",
                    display: {
                        style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                        // collapsable: false,
                        // maxNumItems: 5,
                        showAddItemListButton: true,
                        showAddBatchListButton: true,
                        showEditItemListButton: false,
                        showDeleteItemListButton: false,
                    },
                    elements: [
                        {
                            title: "Input 1",
                            field: "",
                            type: "input-text",
                            display: {
                                placeholder: "Add an input 1...",
                            },
                        },
                        {
                            title: "Input 2",
                            field: "",
                            type: "input-text",
                            display: {
                                placeholder: "Add an input 2...",
                            },
                        },
                        {
                            title: "Input 3",
                            field: "",
                            type: "input-text",
                            display: {
                                placeholder: "Add an input 3...",
                            },
                        },
                        {
                            title: "Input 4",
                            field: "",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add an input 4..."
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
