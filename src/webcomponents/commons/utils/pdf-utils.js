// Notification utils class
export default class PdfUtils {

    static boldText = (content, config) => {
        return {
            text: content,
            bold: true,
            ...config
        };
    }

    static titleText = (content, config) => {
        return {
            text: content,
            style: "header",
            fontSize: 23,
            ...config
        };
    }

    static headerText = (content, config) => {
        return {
            text: content,
            style: "header",
            ...config
        };
    }

    static fieldText = (field, value, config) => {
        return {
            text: [
                this.boldText(field, config),
                {text: value}
            ]
        };
    }

    static htmlToPdf = contentHtml => {

        return htmlToPdfmake(contentHtml?contentHtml:"", {removeExtraBlanks: true, ignoreStyles: ["font-family"]});
    }

}
