// Notification utils class
export default class PdfUtils {

    static boldText = (content, config) => {
        return {
            text: content,
            bold: true,
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
                value
            ]
        };
    }

}
