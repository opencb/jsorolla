import {html, nothing} from "lit";
import * as XLSX from "xlsx";

export default class DataFormElements {

    static fileContentElement(customConfig = {}) {
        return {
            ...customConfig,
            type: "custom",
            display: {
                ...customConfig?.display,
                render: (value, onFieldChange, updateParams, data, item, disabled, element) => {
                    const rows = element.display?.rows ?? 10;
                    const maxHeight = rows * 20; // Approx 20px per line

                    const onFileClear = (event) => {
                        event.currentTarget.previousElementSibling.value = null; // Clear the file input
                        onFieldChange("");
                    };

                    const onFileChange = async (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            let content = "";
                            try {
                                if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                                    const data = await file.arrayBuffer();
                                    const workbook = XLSX.read(data, { type: "array" });
                                    if (workbook.SheetNames.length > 0) {
                                        const sheetName = workbook.SheetNames[0];
                                        const sheet = workbook.Sheets[sheetName];
                                        content = XLSX.utils.sheet_to_csv(sheet);
                                    }
                                } else {
                                    content = await file.text();
                                }
                            } catch (error) {
                                console.error("Error reading file:", error);
                                content = "Error reading file: " + error.message;
                            }
                            onFieldChange(content);
                        }
                    };
 
                    return html`
                        <div class="mb-2 d-flex align-items-center gap-2">
                            <input type="file"
                                class="form-control"
                                ?disabled="${disabled}"
                                @change="${event => onFileChange(event)}">
                            <button class="btn btn-light ${disabled || !value ? "disabled" : ""}" @click="${event => onFileClear(event)}">
                                <i class="fa fa-trash-alt"></i>
                            </button>
                        </div>
                        <div class="form-control" style="min-height:40px; max-height: ${maxHeight}px; overflow-y: auto; background-color: ${disabled ? "#e9ecef" : "#fff"};">
                            <div style="white-space:pre-wrap;font-family:monospace;">${value}</div>
                        </div>
                    `;
                },
            },
        };
    }
};
