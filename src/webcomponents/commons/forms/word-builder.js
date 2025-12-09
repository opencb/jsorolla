/**
 * Copyright 2015-2022 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun} from "docx";
import UtilsNew from "../../../core/utils-new.js";

export default class WordBuilder {

    static ARRAY_FIELD_REGULAR_EXPRESSION = /(?<arrayFieldName>[a-zA-Z.]+)\[\].(?<index>[0-9]+).(?<field>[a-zA-Z.]+)/;

    constructor(data, dataFormConfig, wordConfig) {
        this.#init(data, dataFormConfig, wordConfig);
    }

    #init(data, dataFormConfig, wordConfig) {
        this.data = data ?? {};
        this.dataFormConfig = dataFormConfig;
        this.wordConfig = {...this.getDefaultWordConfig(), ...wordConfig};

        this.children = [];
        this.built = false;
    }

    async #build() {
        if (this.built) {
            return;
        }
        this.children = await this.renderAsync();
        this.built = true;
    }

    async exportToWord() {
        await this.#build();
        const doc = new Document({
            sections: [{
                properties: {},
                children: this.children
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = this.wordConfig.filename || "document.docx";
        link.click();
        window.URL.revokeObjectURL(url);
    }

    async getWordBlob() {
        await this.#build();
        const doc = new Document({
            sections: [{
                properties: {},
                children: this.children
            }]
        });
        return await Packer.toBlob(doc);
    }

    #getValue(field, object = this.data, defaultValue, display) {
        let value;
        if (field) {
            // If field contains [] means the element type is object-list,
            // we need to get the value from the array, information is encoded as:
            //   phenotypes[].1.id: field id from second item of phenotypes
            if (field.includes("[]")) {
                const [parentItemArray, right] = field.split("[].");
                if (right?.includes(".")) {
                    const [itemIndex, ...itemFieldIds] = right.split(".");
                    // Support nested object
                    if (itemFieldIds.length === 1) {
                        value = UtilsNew.getObjectValue(object, parentItemArray, "")[itemIndex]?.[itemFieldIds[0]];
                    } else {
                        value = UtilsNew.getObjectValue(object, parentItemArray, "")[itemIndex]?.[itemFieldIds[0]]?.[itemFieldIds[1]];
                    }
                } else {
                    console.error("Invalid field format for object-list");
                }
            } else {
                // Optional chaining is needed when "res" is undefined
                value = field.split(".").reduce((res, prop) => res?.[prop], object);
            }

            // If 'value' exists we must apply the functions, DO NOT change the order
            if (value || typeof value === "boolean") {
                if (display?.format && typeof display.format === "function") {
                    value = display.format(value, object);
                }
            } else {
                value = defaultValue;
            }
        } else {
            value = defaultValue;
        }

        return value;
    }

    #getBooleanValue(value, defaultValue) {
        let _value = typeof defaultValue !== "undefined" ? defaultValue : true;
        if (typeof value !== "undefined" && value !== null) {
            if (typeof value === "boolean") {
                _value = value;
            } else if (typeof value === "function") {
                _value = value(this.data);
            } else {
                console.error(`Expected boolean or function value, but got '${typeof value}'`);
            }
        }
        return _value;
    }

    #getDefaultValue(element, section) {
        // Preference order: element, section and then global config
        return element?.display?.defaultValue ?? section?.display?.defaultValue ?? this.dataFormConfig?.display?.defaultValue ?? "";
    }

    #htmlToPlainText(html) {
        if (typeof html !== "string") {
            return String(html ?? "");
        }
        // Use DOMParser to strip HTML tags while keeping text content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.body.textContent || "";
    }

    async #htmlToRunsAsync(html) {
        if (typeof html !== "string") {
            return [new TextRun({text: String(html ?? "")})];
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const result = [];

        const traverse = async node => {
            for (const child of Array.from(node.childNodes)) {
                if (child.nodeType === 3) { // text
                    const text = child.textContent;
                    if (text && text.trim() !== "") {
                        result.push(new TextRun({text}));
                    }
                } else if (child.nodeType === 1) { // element
                    const tagName = child.tagName.toLowerCase();
                    if (tagName === "img") {
                        const src = child.getAttribute("src");
                        const alt = child.getAttribute("alt") || "";
                        if (src?.startsWith("data:")) {
                            try {
                                const imageRun = this.#dataUrlToImageRun(src, child);
                                if (imageRun) {
                                    result.push(imageRun);
                                }
                            } catch (e) {
                                result.push(new TextRun({text: alt || "[image]"}));
                            }
                        } else if (src) {
                            // Fetch remote image and embed
                            try {
                                const imageRun = await this.#remoteUrlToImageRun(src, child);
                                if (imageRun) {
                                    result.push(imageRun);
                                }
                            } catch (e) {
                                result.push(new TextRun({text: alt || `[image: ${src}]`}));
                            }
                        }
                    } else if (tagName === "table") {
                        // Parse HTML table and convert to Word table
                        const table = await this.#parseHtmlTable(child);
                        if (table) {
                            result.push(table);
                        }
                    } else {
                        await traverse(child);
                    }
                }
            }
        };

        await traverse(doc.body);
        if (result.length === 0) {
            result.push(new TextRun({text: ""}));
        }
        return result;
    }

    async #parseHtmlTable(tableEl) {
        const rows = [];
        let headerRows = 0;

        // Check for thead
        const thead = tableEl.querySelector("thead");
        if (thead) {
            const headerRowEls = thead.querySelectorAll("tr");
            for (const rowEl of headerRowEls) {
                const cells = Array.from(rowEl.querySelectorAll("th, td")).map(cellEl => {
                    const cellContent = this.#htmlToPlainText(cellEl.innerHTML);
                    return new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: cellContent,
                                    bold: true
                                })
                            ]
                        })],
                        shading: {
                            fill: "F3F3F3"
                        }
                    });
                });
                if (cells.length > 0) {
                    rows.push(new TableRow({children: cells}));
                    headerRows++;
                }
            }
        }

        // Check for tbody or direct tr elements (excluding those already in thead)
        const tbody = tableEl.querySelector("tbody");
        let bodyRows;
        if (tbody) {
            bodyRows = tbody.querySelectorAll("tr");
        } else {
            // Get all tr elements that are not in thead
            const allRows = tableEl.querySelectorAll("tr");
            const theadRows = thead ? thead.querySelectorAll("tr") : [];
            bodyRows = Array.from(allRows).filter(row => !Array.from(theadRows).includes(row));
        }
        
        for (const rowEl of bodyRows) {
            const cells = Array.from(rowEl.querySelectorAll("td, th")).map(cellEl => {
                const cellContent = this.#htmlToPlainText(cellEl.innerHTML);
                return new TableCell({
                    children: [new Paragraph({
                        text: cellContent
                    })]
                });
            });
            if (cells.length > 0) {
                rows.push(new TableRow({children: cells}));
            }
        }

        // If no thead/tbody and no rows found, just get all tr elements
        if (rows.length === 0 && !thead && !tbody) {
            const allRows = tableEl.querySelectorAll("tr");
            for (const rowEl of allRows) {
                const cells = Array.from(rowEl.querySelectorAll("td, th")).map((cellEl, idx) => {
                    const cellContent = this.#htmlToPlainText(cellEl.innerHTML);
                    const isHeader = cellEl.tagName.toLowerCase() === "th" || idx === 0;
                    return new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: cellContent,
                                    bold: isHeader
                                })
                            ]
                        })],
                        shading: isHeader ? {
                            fill: "F3F3F3"
                        } : undefined
                    });
                });
                if (cells.length > 0) {
                    rows.push(new TableRow({children: cells}));
                    if (rows.length === 1) {
                        headerRows = 1; // First row is header if no thead
                    }
                }
            }
        }

        if (rows.length === 0) {
            return null;
        }

        // Calculate column widths (equal distribution)
        const numColumns = rows[0]?.children?.length || 1;
        const pageWidthTwips = 9360; // 6.5 inches in twips
        const columnWidthTwips = Math.floor(pageWidthTwips / numColumns);
        const columnWidths = Array(numColumns).fill(columnWidthTwips);

        return new Paragraph({
            children: [
                new Table({
                    rows: rows,
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE
                    },
                    columnWidths: columnWidths
                })
            ]
        });
    }

    #dataUrlToImageRun(dataUrl, imgEl) {
        // Expected format: data:<mime>;base64,<data>
        const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
        if (!match) {
            return null;
        }
        const mimeType = match[1];
        const base64 = match[2];
        const binary = atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }

        // Optional dimensions from attributes
        const widthAttr = imgEl?.getAttribute?.("width");
        const heightAttr = imgEl?.getAttribute?.("height");
        const width = widthAttr ? parseInt(widthAttr, 10) : undefined;
        const height = heightAttr ? parseInt(heightAttr, 10) : undefined;

        return new ImageRun({
            data: buffer,
            transformation: {
                width: width || 200,
                height: height || 200,
            },
        });
    }

    async #remoteUrlToImageRun(url, imgEl) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch image");
        }
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const widthAttr = imgEl?.getAttribute?.("width");
        const heightAttr = imgEl?.getAttribute?.("height");
        const width = widthAttr ? parseInt(widthAttr, 10) : undefined;
        const height = heightAttr ? parseInt(heightAttr, 10) : undefined;

        return new ImageRun({
            data: buffer,
            transformation: {
                width: width || 200,
                height: height || 200,
            },
        });
    }

    applyTemplate(template, data, defaultValue, element) {
        // Parse template string and find matches groups - follow data-form pattern
        const matches = template
            .match(/\$\{[a-zA-Z_.\[\]]+}/g)
            ?.map(elem => elem.substring(2, elem.length - 1)) || [];

        let processedTemplate = template;

        for (const match of matches) {
            let value = this.#getValue(match, data, defaultValue);
            
            // Check if format is an object with a function for this match variable (like data-form)
            if (element?.display?.format?.[match] && typeof element.display.format[match] === "function") {
                value = element.display.format[match](value, data);
            }

            // Replace the template variable with the value (same as data-form)
            processedTemplate = processedTemplate.replace("${" + match + "}", String(value || ""));
        }

        // For Word, we'll create a simple text run with the processed template
        // If we need per-variable styling later, we can enhance this
        return [new TextRun({text: processedTemplate})];
    }

    async renderAsync() {
        const result = [];
        if (this.dataFormConfig?.sections) {
            const sections = this.dataFormConfig.sections
                .filter(section => this.#getBooleanValue(section?.display?.visible, true))
                .filter(section => this.#getBooleanValue(section?.display?.showWord, true));

            for (const section of sections) {
                const sectionContent = await this._createSectionAsync(section);
                if (sectionContent) {
                    result.push(...sectionContent);
                }
            }
        }
        return result;
    }

    async _createSectionAsync(section) {
        // Check if the section is visible
        if (section.display && !this.#getBooleanValue(section.display.visible, true)) {
            return [];
        }

        const children = [];

        // Add section title if it exists
        if (section.title) {
            const titleLevel = section.display?.titleLevel || 1;
            const headingLevel = titleLevel === 1 ? HeadingLevel.HEADING_1 :
                                 titleLevel === 2 ? HeadingLevel.HEADING_2 :
                                 titleLevel === 3 ? HeadingLevel.HEADING_3 :
                                 titleLevel === 4 ? HeadingLevel.HEADING_4 :
                                 titleLevel === 5 ? HeadingLevel.HEADING_5 :
                                 HeadingLevel.HEADING_6;
            
            children.push(new Paragraph({
                text: section.title,
                heading: headingLevel,
                spacing: {before: 0, after: 200}
            }));
        }

        // Add section description if it exists
        if (section.description || section.text) {
            children.push(new Paragraph({
                text: section.description || section.text,
                spacing: {after: 200}
            }));
        }

        // Process elements
        if (section.elements) {
            for (const element of section.elements) {
                const elementContent = await this._createElementAsync(element, section);
                if (elementContent) {
                    if (Array.isArray(elementContent)) {
                        children.push(...elementContent);
                    } else {
                        children.push(elementContent);
                    }
                }
            }
        }

        // Add spacing at the end of the section (blank line after section)
        if (children.length > 0) {
            children.push(new Paragraph({
                text: "",
                spacing: {after: 200}
            }));
        }

        return children;
    }

    async _createElementAsync(element, section) {
        // Check if the element is visible
        if (element.display && !this.#getBooleanValue(element.display.visible, true)) {
            return null;
        }

        // Check if type is 'separator', this is a special case
        if (element.type === "separator") {
            return new Paragraph({
                text: "",
                spacing: {after: 200},
                border: {
                    bottom: {
                        color: "auto",
                        space: 1,
                        style: "single",
                        size: 6
                    }
                }
            });
        }

        // Get element title
        let title = element.title ?? element.name;
        if (title?.includes("${")) {
            // Apply template to title
            const titleRuns = this.applyTemplate(title, this.data, "", element);
            title = titleRuns.map(run => run.text).join("");
        }

        const titleVisible = element.display?.titleVisible ?? true;

        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            const value = this.#getValue(element.field, this.data, this.#getDefaultValue(element, section), element.display);
            return this._createElementWithTitle(title, titleVisible, String(value || ""));
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                case "text":
                case "title":
                case "notification":
                    return this._createTextElement(element, title, titleVisible);
                case "complex":
                    return this._createComplexElement(element, this.data, section, title, titleVisible);
                case "list":
                    return this._createListElement(element, this.data, section, title, titleVisible);
                case "table":
                    return await this._createTableElement(element, this.data, section, title, titleVisible);
                case "custom":
                    return this._createCustomElementAsync(element, section, title, titleVisible);
                case "object":
                    return this._createObjectElement(element, section, title, titleVisible);
                case "object-list":
                    return this._createObjectListElement(element, section, title, titleVisible);
                case "input-text":
                case "input-num":
                case "input-number":
                case "input-date":
                case "select":
                case "checkbox":
                    // For form inputs, just show the value
                    const value = this.#getValue(element.field, this.data, this.#getDefaultValue(element, section), element.display);
                    return this._createElementWithTitle(title, titleVisible, String(value || ""));
                default:
                    // For unknown types, try to get the value
                    const defaultValue = this.#getValue(element.field, this.data, this.#getDefaultValue(element, section), element.display);
                    return this._createElementWithTitle(title, titleVisible, String(defaultValue || ""));
            }
        }
    }

    _createElementWithTitle(title, titleVisible, content) {
        const children = [];
        
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}: `,
                        bold: true
                    }),
                    new TextRun({
                        text: content
                    })
                ]
            }));
        } else if (content) {
            children.push(new Paragraph({
                text: content
            }));
        }

        return children.length > 0 ? children : null;
    }

    _createTextElement(element, title, titleVisible) {
        let value = element.text || element.title || element.name || "";
        
        if (element.field) {
            value = this.#getValue(element.field, this.data, value, element.display);
        }

        return this._createElementWithTitle(title, titleVisible, String(value || ""));
    }

    async _createCustomElementAsync(element, section, title, titleVisible) {
        if (typeof element.display?.render !== "function") {
            return this._createElementWithTitle(title, titleVisible, "Custom element requires display.render()");
        }

        // If 'field' is defined then we pass it to the 'render' function, otherwise 'data' object is passed
        const data = element.field ? this.#getValue(element.field, this.data, null, element.display) : this.data;

        // When an object-list, get the item being rendered using the regex (same as data-form)
        let item;
        if (element.field?.includes("[]")) {
            const match = element.field.match(WordBuilder.ARRAY_FIELD_REGULAR_EXPRESSION);
            if (match) {
                item = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
            }
        }

        // Call render; in HTML it may return lit/html, here we parse HTML to runs (supporting img and tables)
        const content = element.display.render(data, null, this.updateParams, this.data, item);
        const parsedContent = await this.#htmlToRunsAsync(content);

        const result = [];
        
        if (title && titleVisible) {
            // Check if first element is a Paragraph (table) or runs
            if (parsedContent.length > 0 && parsedContent[0] instanceof Paragraph) {
                // First element is a table/block element, add title separately
                result.push(new Paragraph({
                    children: [
                        new TextRun({text: `${title}: `, bold: true})
                    ]
                }));
                result.push(...parsedContent);
            } else {
                // All content is runs, combine with title
                result.push(new Paragraph({
                    children: [
                        new TextRun({text: `${title}: `, bold: true}),
                        ...parsedContent.filter(item => item instanceof TextRun || item instanceof ImageRun)
                    ]
                }));
                // Add any Paragraph elements (tables) after
                result.push(...parsedContent.filter(item => item instanceof Paragraph));
            }
        } else {
            // No title, separate runs from paragraphs
            const runs = parsedContent.filter(item => item instanceof TextRun || item instanceof ImageRun);
            const paragraphs = parsedContent.filter(item => item instanceof Paragraph);
            
            if (runs.length > 0) {
                result.push(new Paragraph({
                    children: runs
                }));
            }
            result.push(...paragraphs);
        }

        return result.length > 0 ? result : [new Paragraph({text: ""})];
    }

    _createComplexElement(element, data = this.data, section, title, titleVisible) {
        if (!element.display?.template) {
            return this._createElementWithTitle(title, titleVisible, "No template provided");
        }

        // Check if field is provided to get data from
        if (element.field) {
            data = this.#getValue(element.field, data);
        }

        const textRuns = this.applyTemplate(element.display.template, data, this.#getDefaultValue(element, section), element);
        
        const children = [];
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}: `,
                        bold: true
                    }),
                    ...textRuns
                ]
            }));
        } else {
            children.push(new Paragraph({
                children: textRuns
            }));
        }

        return children;
    }

    _createListElement(element, data = this.data, section, title, titleVisible) {
        // Get values
        let values;
        if (element.field) {
            values = this.#getValue(element.field, data);
        } else if (element.display?.getData) {
            values = element.display.getData(data);
        } else {
            values = [];
        }

        const contentLayout = element.display?.contentLayout || "vertical";

        // 1. Check array and layout exist
        if (!Array.isArray(values)) {
            return this._createElementWithTitle(title, titleVisible, this.#getDefaultValue(element, section) || "Not an array");
        }

        // 2. Apply 'filter' and 'transform' functions if defined
        if (typeof element.display?.filter === "function") {
            values = element.display.filter(values);
        }
        if (typeof element.display?.transform === "function") {
            values = element.display.transform(values);
        }

        // 3. Check length of the array
        if (values.length === 0) {
            return this._createElementWithTitle(title, titleVisible, this.#getDefaultValue(element, section) || "Empty array");
        }

        // 4. Format list elements. Initialise values with array, this is valid for scalars, or when 'template' and 'format' do not exist
        // Apply the template to all Array elements and store them in 'values'
        if (typeof element.display?.format === "function" || typeof element.display?.render === "function") {
            // NOTE: 'element.display.render' is now deprecated, use 'format' instead
            if (typeof element.display?.format === "function") {
                values = values.map(item => element.display.format(item, data));
            } else {
                values = values.map(item => element.display.render(item, data));
            }
        } else if (element.display?.template) {
            // Note: template can contain HTML, so we convert it to text
            values = values.map(item => {
                const textRuns = this.applyTemplate(element.display.template, item, "", element);
                return textRuns.map(run => run.text).join("");
            });
        } else {
            // Convert to strings
            values = values.map(item => String(item));
        }

        const children = [];
        
        // Add title if visible
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}:`,
                        bold: true
                    })
                ]
            }));
        }

        // Create list based on layout
        if (contentLayout === "bullets") {
            const listItems = values.map(value => 
                new Paragraph({
                    text: value,
                    bullet: {
                        level: 0
                    }
                })
            );
            children.push(...listItems);
        } else if (contentLayout === "numbers") {
            // For numbered lists, add numbers manually
            values.forEach((value, index) => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: `${index + 1}. `,
                            bold: true
                        }),
                        new TextRun({
                            text: String(value)
                        })
                    ]
                }));
            });
        } else {
            // For horizontal or vertical, just create paragraphs
            values.forEach(value => {
                children.push(new Paragraph({
                    text: String(value)
                }));
            });
        }

        return children;
    }

    async _createTableElement(element, data = this.data, section, title, titleVisible) {
        // Get array values
        let array;
        if (typeof element.display?.getData === "function") {
            array = element.display.getData(data);
        } else if (element.field) {
            array = this.#getValue(element.field, data, []);
        } else {
            array = [];
        }

        // 1. Check field exists, and it is an array
        if (!Array.isArray(array)) {
            return this._createElementWithTitle(title, titleVisible, "Field is not an array");
        }
        if (!element.display?.columns) {
            return this._createElementWithTitle(title, titleVisible, "Table requires a 'columns' array");
        }

        // 2. Apply 'filter' and 'transform' functions if defined
        if (typeof element.display?.filter === "function") {
            array = element.display.filter(array);
        }
        if (typeof element.display?.transform === "function") {
            array = element.display.transform(array);
        }

        // 3. Check length of the array
        if (array.length === 0) {
            return this._createElementWithTitle(title, titleVisible, this.#getDefaultValue(element, section) || "Empty table");
        }

        // 4. Build columns (handle nested columns)
        const columns = [];
        for (const column of element.display.columns) {
            if (column.display?.columns) {
                // Add nested columns
                columns.push(...column.display.columns);
            } else {
                // Add single column
                columns.push(column);
            }
        }

        const children = [];

        // Add title if visible
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}:`,
                        bold: true
                    })
                ]
            }));
            children.push(new Paragraph({
                text: "",
                spacing: {after: 200}
            }));
        }

        // Build table rows
        const headerVisible = this.#getBooleanValue(element.display?.headerVisible, true);
        const rows = [];

        // Add header row
        if (headerVisible) {
            const headerCells = columns.map(column =>
                new TableCell({
                    children: [new Paragraph({
                        children: [
                            new TextRun({
                                text: column.title || column.name || "",
                                bold: true
                            })
                        ]
                    })],
                    shading: {
                        fill: "F3F3F3"
                    }
                })
            );
            rows.push(new TableRow({
                children: headerCells
            }));
        }

        // Add data rows (await custom render with remote images)
        for (const row of array) {
            const cells = [];
            for (const column of columns) {
                let cellValue = this.#getValue(column.field, row, "", column.display);

                if (column.type === "complex" && column.display?.template) {
                    const textRuns = this.applyTemplate(column.display.template, row, "", column);
                    cells.push(new TableCell({
                        children: [new Paragraph({children: textRuns})]
                    }));
                } else if (column.type === "custom" && typeof column.display?.render === "function") {
                    const rendered = column.display.render(cellValue, null, this.updateParams, this.data, row);
                    const parsedContent = await this.#htmlToRunsAsync(rendered);
                    
                    // Separate runs from paragraphs (tables)
                    const runs = parsedContent.filter(item => item instanceof TextRun || item instanceof ImageRun);
                    const paragraphs = parsedContent.filter(item => item instanceof Paragraph);
                    
                    const cellChildren = [];
                    if (runs.length > 0) {
                        cellChildren.push(new Paragraph({children: runs}));
                    }
                    // Note: Tables inside table cells might not render well in Word, but we'll include them
                    cellChildren.push(...paragraphs);
                    
                    cells.push(new TableCell({
                        children: cellChildren.length > 0 ? cellChildren : [new Paragraph({text: ""})]
                    }));
                } else {
                    cells.push(new TableCell({
                        children: [new Paragraph({
                            text: String(cellValue || "")
                        })]
                    }));
                }
            }
            rows.push(new TableRow({children: cells}));
        }

        // Create table with auto column widths
        // Standard page width is about 6.5 inches = 9360 twips
        // For equal column widths, divide by number of columns
        const pageWidthTwips = 9360; // 6.5 inches in twips
        const columnWidthTwips = Math.floor(pageWidthTwips / columns.length);
        const columnWidths = columns.map(() => columnWidthTwips);
        
        children.push(new Table({
            rows: rows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            columnWidths: columnWidths
        }));

        return children;
    }

    _createObjectElement(element, section, title, titleVisible) {
        if (!element.elements) {
            return this._createElementWithTitle(title, titleVisible, "");
        }

        const children = [];
        
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}:`,
                        bold: true
                    })
                ]
            }));
        }

        // Process nested elements
        element.elements.forEach(childElement => {
            const childContent = this._createElement(childElement, section);
            if (childContent) {
                if (Array.isArray(childContent)) {
                    children.push(...childContent);
                } else {
                    children.push(childContent);
                }
            }
        });

        return children.length > 0 ? children : null;
    }

    _createObjectListElement(element, section, title, titleVisible) {
        // Get the array from the field - use getValue to follow the same pattern as data-form
        const items = this.#getValue(element.field, this.data, []);
        
        if (!Array.isArray(items)) {
            return this._createElementWithTitle(title, titleVisible, "Not an array");
        }

        if (items.length === 0) {
            return this._createElementWithTitle(title, titleVisible, this.#getDefaultValue(element, section) || "No items found.");
        }

        const children = [];
        
        if (title && titleVisible) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${title}:`,
                        bold: true
                    })
                ]
            }));
            children.push(new Paragraph({
                text: "",
                spacing: {after: 200}
            }));
        }

        // Process each item in the array - follow data-form pattern
        items.forEach((item, index) => {
            // Add item separator if not first item
            if (index > 0) {
                children.push(new Paragraph({
                    text: "",
                    spacing: {after: 200}
                }));
            }

            if (element.elements) {
                // Create a copy of the element with modified field paths (like data-form does)
                element.elements.forEach(childElement => {
                    // Handle field paths like "phenotypes[].id" - modify to "phenotypes[].0.id" for index 0
                    let field = childElement.field;
                    if (field && field.includes("[]")) {
                        // Modify field path to include index (same as data-form)
                        const [left, right] = field.split("[].");
                        field = left + "[]." + index + "." + right;
                    }

                    // Now use getValue with the modified field path - it will handle the [] pattern
                    const value = this.#getValue(field, this.data, this.#getDefaultValue(childElement, section), childElement.display);
                    const childTitle = childElement.title || childElement.name || "";
                    
                    if (childTitle) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${childTitle}: `,
                                    bold: true
                                }),
                                new TextRun({
                                    text: String(value || "")
                                })
                            ]
                        }));
                    } else if (value) {
                        children.push(new Paragraph({
                            text: String(value)
                        }));
                    }
                });
            }
        });

        return children.length > 0 ? children : null;
    }

    getDefaultWordConfig() {
        return {
            filename: "document.docx"
        };
    }
}

