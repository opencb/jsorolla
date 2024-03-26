/*
 * Copyright 2015-2024 OpenCB
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

// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// pdfMake.vfs = pdfFonts.pdfMake.vfs;


export default class PdfBuilder {

    constructor(data, dataFormConfig, pdfConfig) {
        this.#init(data, dataFormConfig, pdfConfig);
    }

    // docDefinition Config
    #init(data, dataFormConfig, pdfConfig) {
        this.data = data ?? {};
        this.dataFormConfig = dataFormConfig;
        this.pdfConfig = {...this.getDefaultPdfConfig(), ...pdfConfig};

        this.docDefinition = {
            // pageSize: "A4",
            // styles: {...this.pdfConfig?.styles, ...pdfConfig?.styles},
            // defaultStyle: {
            //     ...this.pdfConfig?.defaultStyle
            // },
            // watermark: {...dataFormConfig?.displayDoc.watermark},
            ...this.pdfConfig,
            content: []
        };
        this.render();
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




    #getVisibleSections() {
        return this.docDefinitionConfig.sections
            .filter(section => section?.elements[0]?.type !== "notification" || section?.elements?.length > 1)
            .filter(section => this.#getBooleanValue(section?.display?.visible, true) && this.#getBooleanValue(section?.display?.showPDF, true));
    }

    /*
     * @param {string} field -
     * @param {string} defaultValue --
     * @returns {Any} return style
     */
    // #getValue(field, defaultValue) {
    //     const _value = UtilsNew.getObjectValue(this.data, field, defaultValue);
    //     if (typeof _value === "boolean") {
    //         return _value.toString();
    //     }
    //     return _value;
    // }

    #getValue(field, object = this.data, defaultValue, display) {
        let value;
        if (field) {
            // Optional chaining is needed when "res" is undefined
            value = field.split(".").reduce((res, prop) => res?.[prop], object);

            // If 'value' exists we must apply the functions, DO NOT change the order
            if (value) {
                if (display?.format) {
                    // Check if response is actually an HTML
                    // value = UtilsNew.renderHTML(display.format(value));
                    value = display.format(value, object);
                }
                // if (display?.link) {
                //     const href = display.link.replace(field.toUpperCase(), value);
                //     value = html`<a href="${href}" target="_blank">${value}</a>`;
                // }
                // if (display?.className || display?.classes || display?.style) {
                //     const style = this._parseStyleField(display.style, value, object);
                //     value = html`<span class="${display.className || display.classes}" style="${style}">${value}</span>`;
                // }
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
            } else {
                if (typeof value === "function") {
                    _value = value(this.data);
                } else {
                    console.error(`Expected boolean or function value, but got '${typeof value}'`);
                }
            }
        }
        return _value;
    }

    #getDefaultValue(element, section) {
        // Preference order: element, section and then global config
        return element?.display?.defaultValue ?? section?.display?.defaultValue ?? this.dataFormConfig?.display?.defaultValue ?? "";
    }
    #getDefaultLayout(element, section) {
        return element?.display?.defaultLayout ?? section?.display?.defaultLayout ?? this.dataFormConfig?.display?.defaultLayout ?? "horizontal";
    }

    #getElementWidth(element, section) {
        return element?.display?.width ?? section?.display?.width ?? this.dataFormConfig?.display?.width ?? null;
    }

    #getElementTitleWidth(element, section) {
        return element?.display?.titleWidth ?? section?.display?.titleWidth ?? this.dataFormConfig?.display?.titleWidth ?? null;
    }

    applyTemplate(template, data, defaultValue, element) {
        // Parse template string and find matches groups
        const matches = template
            .match(/\$\{[a-zA-Z_.\[\]]+}/g)
            .map(elem => elem.substring(2, elem.length - 1));

        const content = {
            columnGap: 5,
            columns: []
        };
        for (const match of matches) {
            // Check if 'style' has been defined for this match variable, example:
            //     {
            //         title: "Format",
            //         type: "complex",
            //         display: {
            //             template: "${format} (${bioformat})",
            //             format: {
            //                 "format": value => value.toUpperCase()
            //             },
            //             style: {
            //                  format: {
            //                      "font-weight": "bold",
            //                      "color": "red"
            //                  },
            //                  bioformat: {
            //                      "color": "green"
            //                  }
            //              },
            //              link: {
            //                  format: (value, data) => https://...
            //              }
            //          },
            //     },
            const value = {text: this.#getValue(match, data, defaultValue)};
            if (element?.display?.format?.[match]) {
                value.text = element?.display?.format?.[match](value, data);
            }
            if (element?.display?.link?.[match]) {
                value.link = element?.display?.link?.[match](value, data);
            }
            if (element?.display?.style?.[match] && typeof element.display.style[match] === "object") {
                if (element.display.style[match].color) {
                    value.color = element.display.style[match].color;
                }
                if (element.display.style[match]["font-weight"]) {
                    value.bold = element.display.style[match]["font-weight"] === "bold";
                }
            }
            content.columns.push(
                {
                    ...value,
                    width: "auto"
                }
            );
        }

        return content;
    }

    render() {

        if (this.dataFormConfig?.display?.layout && Array.isArray(this.dataFormConfig.display.layout)) {
            // Render with a specific layout
            // return html`
            //         <div class="${className}" style="${style}">
            //             ${this.dataFormConfig?.display.layout
            //     .map(section => {
            //         const sectionClassName = section.className ?? section.classes ?? "";
            //         const sectionStyle = section.style ?? "";
            //
            //         if (section.id) {
            //             return html`
            //                             <div class="${layoutClassName} ${sectionClassName}" style="${sectionStyle}">
            //                                 ${this._createSection(this.dataFormConfig.sections.find(s => s.id === section.id))}
            //                             </div>
            //                         `;
            //         } else {
            //             // this section contains nested subsections: 'sections'
            //             return html`
            //                             <div class="${sectionClassName}" style="${sectionStyle}">
            //                                 ${(section.sections || [])
            //                 .map(subsection => {
            //                     const subsectionClassName = subsection.className ?? subsection.classes ?? "";
            //                     const subsectionStyle = this._parseStyleField(subsection.style);
            //                     if (subsection.id) {
            //                         return html`
            //                                                 <div class="${layoutClassName} ${subsectionClassName}" style="${subsectionStyle}">
            //                                                     ${this._createSection(this.dataFormConfig.sections.find(s => s.id === subsection.id))}
            //                                                 </div>
            //                                             `;
            //                     } else {
            //                         return nothing;
            //                     }
            //                 })
            //             }
            //                             </div>
            //                         `;
            //         }
            //     })}
            //         </div>
            //     `;
        } else {
            // Render without layout
            // return html`
            //         <div class="${layoutClassName} ${className}" style="${style}">
            //             ${this.dataFormConfig.sections.map(section => this._createSection(section))}
            //         </div>
            //     `;
            const content = this.dataFormConfig.sections.map(section => this._createSection(section));
            // debugger
            this.docDefinition.content.push(...content);
        }

    }

    _createSection(section) {
        // Check if the section is visible
        if (section.display && !this.#getBooleanValue(section.display.visible)) {
            return;
        }

        // Section values
        // const sectionClassName = section?.display?.className ?? section?.display?.classes ?? "";
        // const sectionStyle = section?.display?.style ?? "";
        // const sectionWidth = "col-md-" + this._getSectionWidth(section);
        //
        // // Section title values
        // const titleHeader = section?.display?.titleHeader ?? "h3";
        // const titleClassName = section?.display?.titleClassName ?? section?.display?.titleClasses ?? "";
        // const titleStyle = section?.display?.titleStyle ?? "";
        //
        // // Section description values
        // const description = section.description ?? section.text ?? null;
        // const descriptionClassName = section.display?.descriptionClassName ?? "help-block";
        // const descriptionStyle = section.display?.descriptionStyle ?? section.display?.textStyle ?? "";
        //
        // const buttonsVisible = this._getBooleanValue(section.display?.buttonsVisible ?? false);

        let content;
        // Check if a custom layout has been provided
        if (section.display?.layout && Array.isArray(section.display.layout)) {
            // Render with a specific layout
            // content = html`
            //     <div class="${sectionClassName}" style="${sectionStyle}">
            //         ${section.display.layout
            //             .map(element => {
            //                 const elementClassName = element.className ?? element.classes ?? "";
            //                 const elementStyle = element.style ?? "";
            //
            //                 if (element.id) {
            //                     return html`
            //                         <div class="${elementClassName}" style="${elementStyle}">
            //                             ${this._createElement(section.elements.find(s => s.id === element.id))}
            //                         </div>
            //                     `;
            //                 } else {
            //                     // this section contains nested subsections: 'sections'
            //                     return html`
            //                         <div class="${elementClassName}" style="${elementStyle}">
            //                             ${(element.elements || [])
            //                                 .map(subelement => {
            //                                     const subsectionClassName = subelement.className ?? subelement.classes ?? "";
            //                                     const subsectionStyle = this._parseStyleField(subelement.style);
            //                                     if (subelement.id) {
            //                                         return html`
            //                                             <div class="${subsectionClassName}" style="${subsectionStyle}">
            //                                                 ${this._createElement(section.elements.find(s => s.id === subelement.id))}
            //                                             </div>
            //                                         `;
            //                                     } else {
            //                                         return nothing;
            //                                     }
            //                                 })
            //                             }
            //                         </div>
            //                     `;
            //                 }
            //             })}
            //     </div>
            // `;
        } else {
            // Otherwise render vertically
            // content = html`
            //     <div class="${sectionClassName}" style="${sectionStyle}">
            //         ${section.elements.map(element => this._createElement(element, section))}
            //     </div>
            // `;
            content = section.elements.map(element => this._createElement(element, section));
        }

        // return html`
        //     <div class="row" style="margin-bottom: 12px;">
        //         <div class="${sectionWidth}">
        //             ${section.title ? html`
        //                 <div style="margin-bottom:8px;">
        //                     ${this._getTitleHeader(titleHeader, section.title, titleClassName, titleStyle)}
        //                 </div>
        //             ` : null}
        //             ${description ? html`
        //                 <div style="margin-bottom:8px">
        //                     <div class="${descriptionClassName}" style="${descriptionStyle}">
        //                         <span>${description}</span>
        //                     </div>
        //                 </div>
        //             ` : null}
        //             ${content}
        //         </div>
        //     </div>
        //     ${buttonsVisible ? this.renderButtons(null, section?.id) : null}
        // `;
        return content;
    }

    _createElement(element, section) {
        // Check if the element is visible
        if (element.display && !this.#getBooleanValue(element.display.visible, true)) {
            return;
        }

        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        // if (element.type === "separator") {
        //     return html`<hr style="${element.display?.style || ""}" />`;
        // }

        // To store element content
        let content = "";

        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            // content = html`${this.getValue(element.field, this.data, this._getDefaultValue(element, section), element.display)}`;
            content = {text: this.#getValue(element.field, this.data, this.#getDefaultValue(element, section), element.display)};
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                // View elements
                // case "text":
                // case "title":
                // case "notification":
                //     content = this._createTextElement(element);
                //     break;
                case "complex":
                    content = this._createComplexElement(element, this.data, section);
                    break;
                case "list":
                    content = this._createListElement(element, this.data, section);
                    break;
                case "table":
                //     content = this._createTableElement(element, this.data, section);
                //     break;
                // case "image":
                //     content = this._createImageElement(element);
                //     break;
                // case "chart":
                // case "plot":
                //     content = this._createPlotElement(element);
                //     break;
                // case "json":
                //     content = this._createJsonElement(element, section);
                //     break;
                // case "tree":
                //     content = this._createTreeElement(element);
                //     break;
                // case "download":
                //     content = this._createDownloadElement(element);
                //     break;
                // case "custom":
                //     content = html`${this._createCustomElement(element)}`;
                //     break;

                // Form controls and editors
                // case "input-text":
                //     content = this._createInputElement(element, "text", section);
                //     break;
                // case "input-num":
                //     content = this._createInputElement(element, "number", section);
                //     break;
                // case "input-password":
                //     content = this._createInputElement(element, "password", section);
                //     break;
                // case "input-number":
                //     content = this._createInputNumberElement(element, section);
                //     break;
                // case "input-date":
                //     content = this._createInputDateElement(element, section);
                //     break;
                // case "checkbox":
                //     content = this._createCheckboxElement(element);
                //     break;
                // case "select":
                //     content = this._createInputSelectElement(element);
                //     break;
                // case "toggle-switch":
                //     content = this._createToggleSwitchElement(element);
                //     break;
                // case "toggle-buttons":
                //     content = this._createToggleButtonsElement(element);
                //     break;
                // case "json-editor":
                //     content = this._createJsonEditorElement(element);
                //     break;
                // case "object":
                //     content = this._createObjectElement(element);
                //     break;
                // case "object-list":
                //     content = this._createObjectListElement(element);
                //     break;
                default:
                    content = {text: element.type};
                // throw new Error("Element type not supported:" + element.type);
            }
        }

        // Initialize element values
        const layout = this.#getDefaultLayout(element, section);
        const width = this.#getElementWidth(element, section) || 12;
        //
        // // Initialize container values
        // const elementContainerClassName = element.display?.containerClassName ?? "";
        // const elementContainerStyle = element.display?.containerStyle ?? "";
        //
        // // Initialize title values
        let title = element.title ?? element.name; // element.name is deprecated --> use element.title
        // const titleClassName = element.display?.titleClassName ?? element.display?.labelClasses ?? "";
        // const titleStyle = element.display?.titleStyle ?? element.display?.labelStyle ?? "";
        const titleVisible = element.display?.titleVisible ?? true;
        const titleWidth = title && titleVisible ? this.#getElementTitleWidth(element, section) : 0;
        // const titleAlign = element.display?.titleAlign ?? element.display?.labelAlign ?? "left";
        // const titleRequiredMark = element.required ? html`<b class="text-danger" style="margin-left:8px;">*</b>` : "";
        //
        // // Help message
        // const helpMessage = this._getHelpMessage(element);
        // const helpMode = this._getHelpMode(element);

        // Templates are allowed in the names
        if (title?.includes("${")) {
            title = this.applyTemplate(title);
        }

        let result;
        // Check for horizontal layout
        if (layout === "horizontal") {
            // return html`
            //     <div class="row form-group ${elementContainerClassName}" style="${elementContainerStyle}">
            //         ${title && titleVisible ? html`
            //             <div class="col-md-${titleWidth}">
            //                 <label class="control-label ${titleClassName}" style="padding-top: 0; text-align:${titleAlign};${titleStyle}">
            //                     ${title} ${titleRequiredMark}
            //                 </label>
            //             </div>
            //         ` : null}
            //         <div class="col-md-${(width - titleWidth)}">
            //             <div>${content}</div>
            //             ${helpMessage && helpMode === "block" ? html`
            //                 <div class="col-md-1" style="padding:0; margin-top:8px" title="${helpMessage}">
            //                     <span><i class="${this._getHelpIcon(element, section)}"></i></span>
            //                 </div>
            //             ` : null}
            //         </div>
            //     </div>
            // `;

            result = {
                columnGap: this.pdfConfig?.columnGap,
                columns: [
                    {
                        text: {text: title, style: "title"},
                        // content,
                        width: (titleWidth * 100 / 12) + "%"
                    },
                    {
                        ...content,
                        width: (width * 100 / 12) + "%"
                    },
                ]
            };
        } else {
            // layout ===Vertical
            // return html`
            //     <div class="row form-group ${elementContainerClassName}" style="${elementContainerStyle}">
            //         <div class="col-md-${width}">
            //             ${title && titleVisible ? html`
            //                 <label class="control-label ${titleClassName}" style="padding-top: 0; ${titleStyle}">
            //                     ${title} ${titleRequiredMark}
            //                 </label>
            //             ` : null}
            //             <div>${content}</div>
            //         </div>
            //     </div>
            // `;

        }
        return result;
    }

    _createComplexElement(element, data = this.data, section) {
        // if (!element.display?.template) {
        //     return this._createElementTemplate(element, null, null, {
        //         message: "No template provided",
        //         className: "text-danger"
        //     });
        // }

        // const content = html`
        //     <span class="${element.display?.className}" style="${element.display?.style}">
        //         ${UtilsNew.renderHTML(this.applyTemplate(element.display.template, data, this._getDefaultValue(element, section), element))}
        //     </span>
        // `;

        // return this._createElementTemplate(element, null, content);
        return this.applyTemplate(element.display.template, data, this.#getDefaultValue(element, section), element);
    }

    _createListElement(element, data = this.data, section) {
        // Get values
        let values;
        if (element.field) {
            values = this.#getValue(element.field, data);
        } else {
            values = element.display.getData(data);
        }
        const contentLayout = element.display?.contentLayout || "vertical";

        if (typeof element.display?.transform === "function") {
            values = element.display.transform(values);
        }

        // 1. Check array and layout exist
        if (!Array.isArray(values)) {
            // return this._createElementTemplate(element, null, null, {
            //     message: this._getDefaultValue(element, section) ?? `Field '${element.field}' is not an array`,
            //     className: "text-danger"
            // });
        }
        if (contentLayout !== "horizontal" && contentLayout !== "vertical" && contentLayout !== "bullets" && contentLayout !== "numbers") {
            // return this._createElementTemplate(element, null, null, {
            //     message: "Content layout must be 'horizontal', 'vertical' or 'bullets'",
            //     className: "text-danger"
            // });
        }

        // 2. Apply 'filter' and 'transform' functions if defined
        if (typeof element.display?.filter === "function") {
            values = element.display.filter(values);
        }

        // 3. Check length of the array. This MUST be done after filtering
        if (values.length === 0) {
            // If empty we just print the defaultValue, this is not an error
            // return this._createElementTemplate(element, null, null, {
            //     message: this._getDefaultValue(element, section) ?? "Empty array",
            // });
        }
debugger
        // 4. Format list elements. Initialise values with array, this is valid for scalars, or when 'template' and 'format' do not exist
        // Apply the template to all Array elements and store them in 'values'
        if (element.display?.format || element.display?.render) {
            // NOTE: 'element.display.render' is now deprecated, use 'format' instead
            if (element.display?.format) {
                values = values.map(item => element.display.format(item, data));
            } else {
                values = values.map(item => element.display.render(item, data));
            }
        } else {
            if (element.display?.template) {
                values = values
                    .map(item => this.applyTemplate(element.display.template, item, this.#getDefaultValue(element, section), element));
            }
        }

        // 5. Precompute styles
        // const styles = {};
        // if (element.display?.style) {
        //     if (typeof element.display.style === "string") {
        //         // All elements will have the same style
        //         values.forEach(item => styles[item] = element.display.style);
        //     } else {
        //         // It is an object, we must find the right style for each element
        //         for (const item of values) {
        //             // This call already checks if style is a function
        //             styles[item] = this._parseStyleField(element.display?.style, item, data);
        //         }
        //     }
        // }

        // 6. Precompute separators
        // const separators = {};
        // if (element.display?.separator) {
        //     // Last element cannot add a separator, so we iterate until length -1
        //     for (let i = 0; i < values.length - 1; i++) {
        //         let separator = null;
        //         if (typeof element.display.separator === "string") {
        //             separator = element.display.separator;
        //         } else {
        //             separator = element.display.separator(values[i], i, values, data);
        //         }
        //         // if (separator) {
        //         //     separators[values[i]] = separator.includes("---") ? "<hr>" : separator;
        //         // }
        //         separators[i] = separator.includes("---") ? "<hr>" : separator;
        //     }
        // }

        // 7. Render element values
        let content = {text: this.#getDefaultValue(element, section)};
        switch (contentLayout) {
            // case "horizontal":
            //     content = `
            //         ${values
            //         .map((elem, index) => `
            //             <span style="${styles[elem]}">${elem}</span>
            //             <span>${index < values.length - 1 ? separators[index] ?? ", " : ""}</span>
            //         `)
            //         .join(``)
            //     }`;
            //     break;
            case "vertical":
                // content = `
                //     ${values
                //     .map((elem, index) => `
                //         <div><span style="${styles[elem]}">${elem}</span></div>
                //         ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                //     `)
                //     .join("")
                // }`;
                // CAUTION: stack accepts an array of strings, not an array of objects.
                //  See: https://pdfmake.github.io/docs/0.1/document-definition-object/stack/
                // content = {
                //     stack: values.map((elem, index) => {
                //         return {text: elem};
                //     })
                // };
                content = {
                    stack: values,
                };
                break;
            case "bullets":
                // content = `
                //     <ul class="pad-left-15">
                //         ${values
                //     .map((elem, index) => `
                //             <li><span style="${styles[elem]}">${elem}</span></li>
                //              ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                //         `)
                //     .join("")
                // }
                //     </ul>
                // `;
                // Fixme: object malformed if template or style applied
                content = {
                    ul: values.map((elem, index) => {
                        return {text: elem};
                    })
                };
                break;
            case "numbers":
                // content = `
                //     <ol class="pad-left-15">
                //         ${values
                //     .map((elem, index) => `
                //             <li><span style="${styles[elem]}">${elem}</span></li>
                //              ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                //         `)
                //     .join("")
                // }
                //     </ol>
                // `;
                content = {
                    ol: values.map((elem, index) => {
                        return {text: elem};
                    })
                };
                break;
        }

        // return this._createElementTemplate(element, null, content);
        return content;
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

    getDefaultPdfConfig() {
        return {
            columnGap: 25,
            defaultStyle: {
                fontSize: 10,
            },
            styles: {
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
                title: {
                    // fontSize: 12,
                    bold: true,
                    lineHeight: 1.5
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
            },
            defaultTableLayout: {
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
                }
            }
        };
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
