// import * as pdfMake from "pdfmake/build/pdfmake";
// import "pdfmake/build/vfs_fonts";
// eslint-disable-next-line no-import-assign
// pdfMake.vfs = window.pdfMake.vfs;
// import pdfMake from "pdfmake/build/pdfmake";
// Documentation: https://pdfmake.github.io/docs/0.1/

export default class PdfBuilder {

    /**
     * Add docDefinition to create a pdf document
     * @param {Object} docDefinition template for pdf document
     */
    constructor(docDefinition) {
        this.#init(docDefinition);
    }

    #init(docDefinition) {
        this.docDefinition = {...this.getDefaultConfig(), ...docDefinition};
        this.tableLayouts = {...this.getTableLayouts()};
    }

    /**
     * Open pdf in a new window
     * @returns {void}
     */
    open() {
        pdfMake.createPdf(this.docDefinition, this.tableLayouts).open();
    }

    /**
     * Download pdf in a new window
     * @returns {void}
     */
    download() {
        pdfMake.createPdf(this.docDefinition).download();
    }

    /**
     * Print pdf
     * @returns {void}
     */
    print() {
        pdfMake.createPdf(this.docDefinition).print();
    }

    addStyles(stylesDefinition) {
        this.docDefinition.styles = {
            ...this.docDefinition.styles,
            stylesDefinition
        };
    }

    addCustomTableLayout(customTableLayoutDefinition) {
        this.tableLayouts = {
            ...this.getTableLayouts(),
            ...customTableLayoutDefinition
        };
    }

    getTableLayouts() {
        return {
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
    }

    getDefaultConfig() {
        return {
            pageSize: "A4",
            styles: {
                header: {
                    fontSize: 12,
                    bold: true
                },
                subheader: {
                    fontSize: 11,
                    bold: true
                },
                label: {
                    bold: true
                },
                small: {
                    fontSize: 9
                }
            },
            defaultStyle: {
                fontSize: 10
            }
        };
    }


}
