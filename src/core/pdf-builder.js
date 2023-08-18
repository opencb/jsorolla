

export const createPdf = docDefinition => ({
    doc: {
        pageSize: "A4",
        styles: {
            header: {
                fontSize: 12,
                bold: true,
            },
            subheader: {
                fontSize: 11,
                bold: true,
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
        },
        ...docDefinition,
    },
    tableLayout: {
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
    },
    open() {
        pdfMake.createPdf(this.doc, this.table).open();
    },
    download() {
        pdfMake.createPdf(this.doc).download();
    },
    print() {
        pdfMake.createPdf(this.doc).print();
    },
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
    },
});


