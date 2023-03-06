import * as pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
// eslint-disable-next-line no-import-assign
// pdfMake.vfs = window.pdfMake.vfs;

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
    }

    /**
     * Open pdf in a new window
     * @returns {void}
     */
    open() {
        // debugger;

        pdfMake.createPdf(this.docDefinition, null, null, window.pdfMake.vfs).open();
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
