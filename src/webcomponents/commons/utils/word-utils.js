
import {Document, Packer, Paragraph} from "docx";

export default class WordUtils {

    static async processNode(nodeElement) {
        const children = [];
        for (const childNode of nodeElement.childNodes) {
            if (childNode.nodeType === Node.TEXT_NODE) {
                if (childNode.textContent.trim()) {
                    children.push(new Paragraph(childNode.textContent.trim()));
                }
            } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                switch (childNode.tagName) {
                    case "p":
                        children.push(new Paragraph(childNode.textContent.trim()));
                        break;
                    case "div":
                    default:
                        children.push(...await WordUtils.processNode(childNode));
                }
            }
        }
        return children;
    }

    static getDocumentOld(element, options = {}) {
        const content = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>${options.title || "Exported Word Document"}</title>
            </head>
            <body>
                ${element?.innerHTML || ""}
            </body>
            </html>
        `;
        return Promise.resolve(new Blob([content], {type: "application/vnd.ms-word"}));
    }

    static getDocument(element, options = {}) {
        return WordUtils.processNode(element).then(children => {
            const doc = new Document({
                title: options.title || "Document",
                description: options.description || "",
                sections: [{
                    properties: {},
                    children: children,
                }],
            });
            return Packer.toBlob(doc);
        });
    }

};
