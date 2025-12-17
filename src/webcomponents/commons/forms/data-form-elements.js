import {html, nothing} from "lit";
import * as XLSX from "xlsx";

export default class DataFormElements {

    static tabsElement(customConfig = {}) {
        return {
            title: customConfig?.title,
            field: customConfig?.field,
            type: "custom",
            display: {
                ...customConfig?.display,
                render: (value, onFieldChange, updateParams, data, item, disabled) => html`
                    <div class="nav nav-pills p-2 border bg-gray-100 rounded-4 nav-fill">
                        ${(customConfig?.tabs || []).map(tab => html`
                            <a
                                class="nav-link rounded-3 d-flex justify-content-center align-items-center gap-2 ${value === tab.id ? "active" : "cursor-pointer"}"
                                @click="${() => onFieldChange(tab.id)}">
                                <span class="fw-bold lh-1 text-center text-break">${tab.text || tab.id}</span>
                            </a>
                        `)}
                    </div>
                `,
            },
        };
    }

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
                        <div class="form-control overflow-auto ${disabled ? "bg-gray-200" : "bg-gray-100"}" style="min-height:40px; max-height: ${maxHeight}px;">
                            <div class="font-monospace fs-7" style="white-space:pre-wrap;">${value}</div>
                        </div>
                    `;
                },
            },
        };
    }
};
