/*
 * Copyright 2015-2016 OpenCB
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

import UtilsNew from "../../utilsNew.js";

export default class CatalogUIUtils {

    constructor() {

    }

    static parseVariableSetVariablesForDisplay(variables, tags, margin, config) {
        config = Object.assign({
            marginStep: 15,
            onlyAllowLeafSelection: true
        }, config);

        let displayVariables = [];

        for (let i in variables) {
            let variable = variables[i];

            if (variable.type !== "OBJECT") {

                // Add variable
                displayVariables.push({
                    id: variable.id,
                    name: UtilsNew.defaultString(variable.name, variable.id),
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    disabled: false,
                    margin: margin,
                    cursor: "pointer",

                    tags: tags.concat(variable.id).join(".")
                });
            } else {
                // Add variable
                displayVariables.push({
                    id: variable.id,
                    name: UtilsNew.defaultString(variable.name, variable.id),
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    disabled: config.onlyAllowLeafSelection,
                    margin: margin,
                    cursor: config.onlyAllowLeafSelection ? "default" : "pointer",

                    tags: tags.concat(variable.id).join(".")
                });

                displayVariables = displayVariables.concat(this.parseVariableSetVariablesForDisplay(variable.variableSet,
                    tags.concat(variable.id), margin + config.marginStep, config));
            }
        }

        return displayVariables;
    }

    addTooltip(selector, title, config) {
        $(selector).qtip({
            content: {
                title: title,
                text: function (event, api) {
                    return $(this).attr('data-tooltip-text');
                }
            },
            position: {
                target: "mouse",
                adjust: {
                    x: 2, y: 2,
                    mouse: false
                }
            },
            style: {
                classes: (config !== undefined && config.style !== undefined && config.style.classes !== undefined) ? config.style.classes : "qtip-light qtip-rounded qtip-shadow qtip-custom-class",
                width: "320px",
            },
            show: {
                delay: 250
            },
            hide: {
                fixed: true,
                delay: 300
            }
        });
    }

}
