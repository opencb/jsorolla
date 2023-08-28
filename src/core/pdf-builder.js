import UtilsNew from "./utils-new";


export default class PdfBuilder {

    defaultStyles = {
        h1: {
            fontSize: 24,
            bold: true,
        },
        h2: {
            fontSize: 20,
            bold: true,
        },
        h3: {
            fontSize: 18,
            bold: true,
        },
        h4: {
            fontSize: 16,
            bold: true,
        },
        subheader: {
            fontSize: 14,
            bold: true,
        },
        body: {
            fontSize: 12,
        },
        label: {
            fontSize: 12,
            bold: true
        },
        caption: {
            fontSize: 8
        },
        note: {
            fontSize: 10
        }
    };

    defaultTableLayout = {
        headerVerticalBlueLine: {
            // top & bottom
            hLineWidth: function () {
                return 0;
            },
            // left & right
            vLineWidth: function (i, node) {
                // i == 0 mean no draw line on start
                // i == node.table.body.length no draw the last line
                if (i === node.table.body.length) {
                    return 0;
                }
                // it will draw a line if i == 0
                return i === 0 ? 2 : 0;
            },
            vLineColor: function (i) {
                return i === 0 ? "#0c2f4c" : "";
            },
            fillColor: function () {
                return "#f3f3f3";
            }
        },
    };

    constructor(data, docDefinition) {
        this.#init(data, docDefinition);
    }

    // docDefinition Config
    #init(data, dataFormConfig) {
        this.data = data ?? {};
        this.docDefinitionConfig = dataFormConfig;
        this.docDefinition = {
            pageSize: "A4",
            styles: {...this.defaultStyles, ...dataFormConfig?.styles},
            defaultStyle: {
                fontSize: 10
            },
            watermark: {...dataFormConfig.displayDoc.watermark},
            content: [this.#creatTextElement(dataFormConfig?.displayDoc?.headerTitle), dataFormConfig.sections ? this.#transformData() : []]
        };
    }

    exportToPdf() {
        pdfMake.createPdf(this.docDefinition, this.defaultTableLayout).open();
    }

    downloadPdf() {
        pdfMake.createPdf(this.docDefinition).download();
    }

    print() {
        pdfMake.createPdf(this.docDefinition).print();
    }

    pdfBlob() {
        return new Promise((resolve, reject) => {
            pdfMake.createPdf(this.doc, this.table)
                .getBlob(result =>{
                    resolve(result);
                },
                err =>{
                    reject(err);
                });
        });
    }

    #getBooleanValue(value, defaultValue) {
        const _defaultValue = typeof defaultValue !== "undefined" ? defaultValue : true;

        if (typeof value !== "undefined" && value !== null) {

            if (typeof value === "boolean") {
                return value;
            }

            if (typeof value === "function") {
                return value(this.data);
            } else {
                console.error(`Expected boolean or function value, but got ${typeof value}`);
            }
        }
        return _defaultValue;

    }

    #getVisibleSections() {
        return this.docDefinitionConfig.sections
            .filter(section => section?.elements[0]?.type !== "notification" || section?.elements?.length > 1)
            .filter(section => this.#getBooleanValue(section?.display?.visible, true) && this.#getBooleanValue(section?.display?.showPDF, true));
    }

    /**
     * @param {string} field -
     * @param {string} defaultValue --
     * @returns {Any} return style
    */
    #getValue(field, defaultValue) {
        const _value = UtilsNew.getObjectValue(this.data, field, defaultValue);
        if (typeof _value === "boolean") {
            return _value.toString();
        }
        return _value;
    }

    #transformData() {
        return this.#getVisibleSections()
            .map(section => this.#writePdfSection(section));
    }

    #writePdfElement(element) {
        const content = [];
        if (!element.type) {
            content.push(this.#createLabelElement(element));
        } else {
            switch (element?.type) {
                case "text":
                    content.push(this.#creatTextElement(element));
                    break;
                case "label":
                    content.push(this.#createLabelElement(element));
                    break;
                case "table":
                    content.push(this.#createTableElement(element));
                    break;
                case "column":
                    content.push(this.#createColumnElement(element));
                    break;
                case "list":
                    content.push(this.#createListElement(element));
                    break;
                case "custom":
                    content.push(this.#createHtmlElement(element));
                    break;
                default:
                    throw new Error("Element type not supported:" + element?.type);
            }
        }
        return content;
    }

    #writePdfSection(section) {
        const defaultTitleStyle = {
            classes: "h1"
        };
        return {
            stack: [
                this.#creatTextElement({
                    text: section.title,
                    display: {
                        ...defaultTitleStyle,
                    }
                }),
                section.elements
                    .filter(element => this.#getBooleanValue(element?.display?.showPDF, true))
                    .map(element => this.#writePdfElement(element, section))
            ],
            ...section?.display
        };
    }

    #creatTextElement(element) {
        const value = element?.text || element?.title || "";
        const classes = element.display?.classes || {};
        const propsStyle = element.display?.propsStyle || {};
        return {
            text: value,
            style: classes,
            ...propsStyle
        };
    }

    #createLabelElement(element) {
        const defaultLabelStyle = {
            propsStyle: {
                bold: true
            }
        };

        return {
            text: [
                this.#creatTextElement({
                    text: `${element?.title}: `,
                    display: {
                        ...defaultLabelStyle
                    }}),
                this.#creatTextElement({text: this.#getValue(element.field, element?.defaultValue || "")})
            ]
        };
    }

    // #createStackElement(elements) {
    //     return {
    //         stack: [
    //             elements.map(element => this.#writePdfElement(element))
    //         ],
    //     };
    // }

    #createTableElement(element) {
        const cols = [element.display.columns];
        // Initialize headers
        const headIndex = []; // Store column indices that need to be skipped
        const headers = cols.map(columns => {
            const head = [];
            columns.forEach((column, index) => {
                if (headIndex.length > 0 && column?.rowspan === 1 && column?.colspan === 1) {
                    // Fill in empty cells for skipped columns
                    head.push(...Array(headIndex[0]).fill(""));
                    headIndex.shift();
                }

                // Create a cell with the specified properties
                const cell = {
                    text: column.title,
                    display: {
                        propsStyle: {
                            bold: true,
                            colSpan: column.colspan,
                            rowSpan: column.rowspan,
                        },
                    }
                };

                head.push(this.#creatTextElement(cell));

                if (column?.colspan > 1) {
                    // Store the index of the column to skip
                    headIndex.push(index);
                    head.push({});
                }
            });

            return head;
        });

        // Initialize rows
        const array = this.#getValue(element.field, element?.defaultValue);
        const rows = array.map(item => {
            const row = [];
            let colIndex = 0;
            const columnSubHeader = cols[1];

            cols[0].forEach(column => {
                const colFormatter = column?.formatter;
                const fieldValue = item[column.field];

                if (column.colspan > 1) {
                    // For columns with colspan > 1, loop through the sub-columns
                    colIndex += column.colspan;
                    for (let i = colIndex - column.colspan; i < colIndex; i++) {
                        const subHeaderFormatter = columnSubHeader[i]?.formatter;
                        // Apply sub-header formatter if it exists, otherwise use fieldValue
                        row.push(subHeaderFormatter ? subHeaderFormatter(fieldValue, item) : fieldValue);
                    }
                } else {
                    // For single column, apply column formatter if it exists, otherwise use fieldValue
                    row.push(colFormatter ? colFormatter(fieldValue, item) : fieldValue);
                }
            });

            // Add the completed row to the rows array
            return row;
        });

        // Merge headers and rows
        const contents = [...headers, ...rows];
        return {
            table: {
                widths: cols[0].map(col => col.width), // TODO modify to support nested for nested column soon...
                headerRows: cols.length,
                body: contents,
            },
        };
    }

    #createColumnElement(element) {
        const cols = element.display.columns;
        return {
            columns: [...cols]
        };
    }

    #createListElement(element) {
        const array = this.#getValue(element.field, element?.defaultValue || []);
        // ol or ul
        const contentLayout = element.display?.contentLayout === "bullets" ? "ul" : "ol";
        const defaultLabelStyle = {
            propsStyle: {
                bold: true
            }
        };

        if (element.display?.render) {
            const title = element?.title;
            const content = `<ul>${array?.map(item => `<li>${element.display.render(item)}</li>`).join("")}</ul>`;
            const defaultHtmlStyle = {
                ignoreStyles: ["font-family"]
            };
            const container = `<div><b>${title ? title + ": " : ""}</b>${content}</div>`;
            return htmlToPdfmake(container, {...defaultHtmlStyle});
        }

        return {
            stack: [
                this.#creatTextElement({
                    text: `${element?.title}`,
                    display: {
                        ...defaultLabelStyle
                    }}),
                {[contentLayout]: [...array]}
            ]
        };
    }

    #createHtmlElement(element) {
        const data = element?.field ? this.#getValue(element?.field, {}) : this.data;
        const title = element?.title;
        const content = element.display?.render ? element.display?.render(data) : {};
        const defaultHtmlStyle = {
            removeExtraBlanks: true,
            ignoreStyles: ["font-family"]
        };

        const container = `<div><b>${title ? title + ": " : ""}</b>${content}</div>`;
        return htmlToPdfmake(container, {...defaultHtmlStyle});
    }

}

// https://pdfmake.github.io/docs/0.1/document-definition-object/styling/#style-properties
/**
 * @typedef {Object} Style
 * @property {string} font - name of the font
 * @property {number} fontSize - size of the font in pt
 * @property {string[]} fontFeatures - array of advanced typographic features supported in TTF fonts (supported features depend on font file)
 * @property {number} lineHeight - the line height (default: 1)
 * @property {boolean} bold - whether to use bold text (default: false)
 * @property {boolean} italics - whether to use italic text (default: false)
 * @property {string} alignment - (‘left’ or ‘center’ or ‘right’ or ‘justify’) the alignment of the text
 * @property {number} characterSpacing - size of the letter spacing in pt
 * @property {string} color - the color of the text (color name e.g., ‘blue’ or hexadecimal color e.g., ‘#ff5500’)
 * @property {string} background - the background color of the text
 * @property {string} markerColor - the color of the bullets in a buletted list
 * @property {string} decoration - the text decoration to apply (‘underline’ or ‘lineThrough’ or ‘overline’)
 * @property {string} decorationStyle - the style of the text decoration (‘dashed’ or ‘dotted’ or ‘double’ or ‘wavy’)
 * @property {string} decorationColor - the color of the text decoration, see color
 **/
/**
 * @param {Style} style - Define the style config you want to use for the element
 * @returns {Style} return style
*/
export function stylePdf(style) {
    return {...style};
}
