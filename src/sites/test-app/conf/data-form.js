
import {html} from "lit";

const defaultHighchartConfig = {
    chart: {
        backgroundColor: {
            // linearGradient: [0, 0, 500, 500],
            stops: [
                [0, "rgb(255, 255, 255)"],
                [1, "rgb(240, 240, 255)"]
            ]
        },
        borderWidth: 0,
        // plotBackgroundColor: "rgba(255, 255, 255, .9)",
        plotShadow: true,
        plotBorderWidth: 1
    },
    tooltip: {
        headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
        pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
            "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
        footerFormat: "</table>",
        shared: true,
        useHTML: true
    }
};
// empty,data,disabled,validation
export const DATA_FORM_EXAMPLE = {
    test: {
        prefix: "test1",
        active: true,
    },
    display: {
        mode: "page",
    },
    sections: [
        {
            title: "Input Text Field",
            elements: [
                {
                    title: "String Field Empty",
                    field: "inputTextEmpty",
                    type: "input-text",
                    display: {
                        placeholder: "Add a short ID...",
                        helpMessage: "Created on ...",
                    },
                },
                {
                    title: "String Field Filled",
                    field: "inputTextFilled",
                    type: "input-text",
                    required: true,
                    display: {
                        placeholder: "Add a short ID...",
                        helpMessage: "Created on ...",
                    },
                },
                {
                    title: "String Field Disabled",
                    field: "inputTextDisabled",
                    type: "input-text",
                    display: {
                        placeholder: "Add a short ID...",
                        disabled: true
                    },
                },
                {
                    title: "String Field Validation",
                    field: "inputTextVal",
                    type: "input-text",
                    required: true,
                    display: {
                        validation: {
                            message: "must not contain spaces",
                            validate: inputTextVal => inputTextVal && !inputTextVal.includes(" ")
                        },
                    },
                },
            ],
        },
        {
            title: "Input TextArea Field",
            elements: [
                {
                    title: "String Field Multiline Empty",
                    field: "inputDescEmpty",
                    type: "input-text",
                    display: {
                        rows: 2,
                        placeholder: "Add a large text...",
                    },
                },
                {
                    title: "String Field Multiline Filled",
                    field: "inputDescFilled",
                    type: "input-text",
                    display: {
                        rows: 2,
                        placeholder: "Add a large text...",
                    },
                },
                {
                    title: "String Field Multiline Disabled",
                    field: "inputDescDisabled",
                    type: "input-text",
                    display: {
                        disabled: true,
                        rows: 2,
                        placeholder: "Add a large text...",
                    },
                },
                {
                    title: "String Field Multiline Validation",
                    field: "inputDescVal",
                    type: "input-text",
                    display: {
                        rows: 2,
                        placeholder: "Add a large text...",
                    },
                },
            ]
        },
        {
            title: "Input Number Field",
            elements: [
                {
                    title: "Number Field Empty",
                    field: "inputNumEmpty",
                    type: "input-num",
                    display: {
                        helpMessage: "Add number"
                    }
                },
                {
                    title: "Number Field Filled",
                    field: "inputNumFilled",
                    type: "input-num",
                    display: {
                        helpMessage: "Add number"
                    }
                },
                {
                    title: "Number Field Disabled",
                    field: "inputNumDisabled",
                    type: "input-num",
                    display: {
                        helpMessage: "Add number",
                        disabled: true
                    }
                },
                {
                    title: "Number Field Validation",
                    field: "inputNumVal",
                    type: "input-num",
                    display: {
                        helpMessage: "Add number"
                    }
                },
            ]
        },
        {
            title: "Input Date Field",
            elements: [
                {
                    title: "Date Field Empty",
                    field: "inputDateEmpty",
                    type: "input-date",
                },
                {
                    title: "Date Field Filled",
                    field: "inputDateFilled",
                    type: "input-date",
                },
                {
                    title: "Date Field Disabled",
                    field: "inputDateDisabled",
                    type: "input-date",
                    display: {
                        disabled: true
                    }
                },
            ]
        },
        {
            title: "Select Field",
            elements: [
                {
                    title: "Select Field Empty",
                    field: "inputSelect",
                    type: "select",
                    allowedValues: ["Option 1", "Option 2", "Option 3"],
                    display: {
                        helpMessage: "select a option"
                    }
                },
                {
                    title: "Select Field Selected",
                    field: "inputSelected",
                    type: "select",
                    allowedValues: ["Option 1", "Option 2", "Option 3"],
                    display: {
                        helpMessage: "select a option",
                    }
                },
                {
                    title: "Select Field",
                    field: "inputSelectDisabled",
                    type: "select",
                    allowedValues: ["Option 1", "Option 2", "Option 3"],
                    display: {
                        helpMessage: "select a option",
                        disabled: true
                    }
                },
            ]
        },
        {
            title: "Checkbox & Toggle",
            elements: [
                {
                    title: "CheckBoxField",
                    field: "inputCheckBoxFalse",
                    type: "checkbox",
                },
                {
                    title: "CheckBoxField Filled",
                    field: "inputCheckBoxTrue",
                    type: "checkbox",
                },
                {
                    title: "toggle switch",
                    field: "inputToggleSwitch",
                    type: "toggle-switch",
                },
                {
                    title: "toggle switch Filled",
                    field: "inputToggleSwitchOn",
                    type: "toggle-switch",
                },
                {
                    title: "toggle buttons",
                    field: "inputToggleButtons",
                    type: "toggle-buttons",
                    allowedValues: ["YES", "NO", "UNKNOWN"],
                    display: {
                        placeholder: "Add the lab sample ID...",
                    },
                },
                {
                    title: "toggle buttons Selected",
                    field: "inputToggleButtonsSelected",
                    type: "toggle-buttons",
                    allowedValues: ["YES", "NO", "UNKNOWN"],
                    display: {
                        placeholder: "Add the lab sample ID...",
                    },
                },
            ],
        },
        {
            title: "Complex Field",
            elements: [
                {
                    title: "Complex Field",
                    // field: "inputComplex",
                    type: "complex",
                    display: {
                        template: "${inputComplex}-${testComplex}"
                    }
                },
                {
                    title: "Object List",
                    field: "inputObject.list",
                    type: "object-list",
                    display: {
                        style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                        collapsedUpdate: true,
                        view: data => html`
                                    <div>${data?.id} - ${data?.name}</div>
                                `,
                    },
                    elements: [
                        {
                            title: "id",
                            field: "inputObject.list[].id",
                            type: "input-text",
                            display: {
                                placeholder: "Add phenotype ID...",
                            },
                        },
                        {
                            title: "name",
                            field: "inputObject.list[].name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a name...",
                            },
                        },
                        {
                            title: "Description",
                            field: "inputObject.list[].description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                            },
                        },
                    ],
                },
                {
                    title: "Object",
                    field: "inputObject",
                    type: "object",
                    elements: [
                        {
                            title: "String Field",
                            field: "inputObject.text",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "Created on ...",
                            },
                        },
                        {
                            title: "String Field Multiline",
                            field: "inputObject.description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a large text...",
                            },
                        },
                        {
                            title: "String Field",
                            field: "inputObject.textDisabled",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true
                            },
                        },
                        {
                            title: "Number Field",
                            field: "inputObject.num",
                            type: "input-num",
                            display: {
                                helpMessage: "Add number"
                            }
                        },
                        {
                            title: "Select Field",
                            field: "inputObject.select",
                            type: "select",
                            allowedValues: ["Option 1", "Option 2", "Option 3"],
                            display: {
                                helpMessage: "select a option"
                            }
                        },
                        {
                            title: "Date Field",
                            field: "inputObject.date",
                            type: "input-date",
                        },
                    ]
                },
                // {
                //     title: "Json Input Field",
                //     field: "inputJson",
                //     type: "json", // Is it possible deprecated
                // },
                {
                    title: "JsonEditor Input Field",
                    field: "inputJsonEditor",
                    type: "json-editor",
                    display: {
                        rows: 10,
                        help: {
                            placeholder: "write json",
                            text: "Must be a valid json, please remove empty fields if you don't need them."
                        }
                    }
                },
                // {
                //     title: "Tree Field",
                //     field: "inputTree",
                //     type: "tree",
                // },
                {
                    title: "Download",
                    field: "inputDownload",
                    type: "download",
                },
                {
                    title: "Custom Element",
                    field: "inputCustom",
                    type: "custom",
                    display: {
                        render: () => {
                            return html`<div>Test Custom Type</div>`;
                        }
                    }
                },
            ],
        },
        {
            title: "List & Table",
            elements: [
                {
                    title: "Custom Element",
                    field: "inputList",
                    type: "list",
                    display: {
                        template: "${name} (${id})",
                        contentLayout: "vertical",
                        bullets: false,
                    }
                },
                {
                    title: "Table Example",
                    field: "inputTable",
                    type: "table",
                    display: {
                        headerVisible: false,
                        columns: [
                            {
                                field: "inputColumn1",
                            },
                            {
                                field: "inputColumn2",
                                defaultValue: "false",
                            },
                            {
                                field: "inputColumn3",
                                defaultValue: "-",
                            },
                        ],
                    },
                },
            ]
        },
        {
            title: "Charts & Plot",
            elements: [
                {
                    name: "chart",
                    field: "inputChart",
                    type: "chart",
                    showLabel: false,
                    display: {
                        highcharts: {
                            chart: {
                                type: "column",
                                ...defaultHighchartConfig.chart
                            },
                            title: {
                                text: "Char Columns"
                            },
                            tooltip: {
                                ...defaultHighchartConfig.tooltip
                            }
                        }
                    }
                },
                {
                    name: "plotExample from Object",
                    // field: "inputPlot",
                    data: {"INSERTION": 1, "SNV": 165398, "DELETION": 1, "INDEL": 7218},
                    type: "plot",
                    display: {
                        chart: "column",
                    }
                },
                {
                    name: "plotExample from Array",
                    field: "inputPlotArray",
                    type: "plot",
                    display: {
                        data: {
                            key: "id",
                            value: "total"
                        },
                        chart: "column",
                    }
                },
            ]
        },
    ],
};


// export const SAMPLE_DATA = {
//     id: "aaa",
//     somatic: true,
//     phenotypes: [
//         {
//             id: "a",
//             name: "b"
//         }
//     ]
// };
