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

import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import LitUtils from "../utils/lit-utils";

export default class FormUtils {

    // ** IVA SETTINGS FORM UTILS **

    // **  DATA FORM UTLIS ** /
    static getUpdateParams(original, updatedFields, customisations) {
        const params = {};
        const updatedFieldKeyPrefixes = Object.keys(updatedFields)
            .map(key => key.replace(/[.[].*$/, ""));
        const uniqueUpdateFieldKeys = [...new Set(updatedFieldKeyPrefixes)];

        uniqueUpdateFieldKeys.forEach(key => {
            params[key] = original[key];
        });

        // 'customisations' array allows to perform some modifications in the updateParams object
        if (customisations?.length > 0) {
            customisations.forEach(field => {
                // 1. You can pass a lambda function
                if (typeof field === "function") {
                    field(params);
                } else {
                    // 2. When String then we delete the field
                    if (typeof UtilsNew.getObjectValue(params, field, undefined) !== "undefined") {
                        UtilsNew.deleteObjectValue(params, field);
                    }
                }
            });
        }
        return params;
    }

    static getUpdatedFields(_original, updatedFields, param, value, action) {
        const _updatedFields = {
            ...updatedFields
        };

        // 1. Check if are updating an object-list
        if (param.includes("[]")) {
            // Parse 'param' in 3 parts, in this example 'collection.from[].1.name':
            //  - arrayFieldName: collection.from
            //  - index: 1
            //  - field: name
            const re = /(?<arrayFieldName>[a-zA-Z.]+)\[\].(?<index>[0-9]+).(?<field>[a-zA-Z.]+)/;
            const match = param.match(re);

            // 1.1 If field exist we are just updating an existing field, example: 'phenotypes[].0.name' where 'name' is the field
            if (match?.groups?.field) {
                // 1.1.1 Check if we are updating an item just ADDED, example: 'phenotypes[].1'
                if (_updatedFields[match?.groups?.arrayFieldName + "[]." + match?.groups?.index]) {
                    _updatedFields[match?.groups?.arrayFieldName + "[]." + match?.groups?.index].after[match.groups.field] = value;
                } else {
                    // 1.1.2 We are updating an existing field, example: 'phenotypes[].0.name'
                    const originalArray = UtilsNew.getObjectValue(_original, match?.groups?.arrayFieldName, undefined);
                    _updatedFields[param] = {
                        before: originalArray[match.groups.index][match.groups.field],
                        after: value
                    };
                    if (_updatedFields[param].before === _updatedFields[param].after) {
                        delete _updatedFields[param];
                    }
                }
            } else {
                // 1.2 Check 'value' to decide if we are adding or removing a new item
                switch (action) {
                    case "ADD":
                        _updatedFields[param] = {
                            before: undefined,
                            after: {}
                        };
                        break;
                    case "REMOVE":
                        // 1.2.2 Item REMOVED
                        let [arrayFieldName, removedIndex] = param.split("[].");
                        removedIndex = Number.parseInt(removedIndex);

                        // 1. Check if we are deleting a new added item, if yes, we DO NOT save it as deleted
                        if (!_updatedFields[param]) {
                            // 1.1 Create 'delete' arrays if it does not exist
                            if (!_updatedFields[arrayFieldName + "[].deleted"]) {
                                _updatedFields[arrayFieldName + "[].deleted"] = [];
                            }
                            // 1.2 Save existing object as deleted
                            _updatedFields[arrayFieldName + "[].deleted"].push(value);
                        }

                        // 2. Remove from updatedFields any key starting with the param
                        const deletedKeys = Object.keys(_updatedFields).filter(key => key.startsWith(param));
                        if (deletedKeys.length > 0) {
                            for (const deletedKey of deletedKeys) {
                                delete _updatedFields[deletedKey];
                            }
                        }

                        // 3. Rename (decrease) the index key of all elements
                        const keys = Object.keys(_updatedFields).filter(key => key.startsWith(arrayFieldName + "[]."));
                        for (const key of keys) {
                            const right = key.split("[].")[1];
                            let keyIndex, newKey;
                            if (right.includes(".")) {
                                // We have edited an existing field
                                const [index, field] = right.split(".");
                                keyIndex = Number.parseInt(index);
                                newKey = arrayFieldName + "[]." + (keyIndex - 1) + "." + field;
                            } else {
                                // This is a new added item
                                keyIndex = Number.parseInt(right);
                                newKey = arrayFieldName + "[]." + (keyIndex - 1);
                            }

                            // We only rename keys bigger than the removedVersion
                            if (keyIndex > removedIndex) {
                                _updatedFields[newKey] = _updatedFields[key];
                                delete _updatedFields[key];
                            }
                        }
                        break;
                    case "RESET":
                        const resetKeys = Object.keys(_updatedFields).filter(key => key.startsWith(param));
                        if (resetKeys.length > 0) {
                            for (const deletedKey of resetKeys) {
                                delete _updatedFields[deletedKey];
                            }
                        }
                        break;
                    default:
                        console.error("Unknown action: " + action);
                        break;
                }
            }
        } else {
            // 2. This works well for both objects and primitives
            const originalValue = UtilsNew.getObjectValue(_original, param, undefined);
            _updatedFields[param] = {
                before: originalValue,
                after: value
            };

            if ((_updatedFields[param].before === undefined && !_updatedFields[param].after) || _updatedFields[param].before === _updatedFields[param].after) {
                delete _updatedFields[param];
            }
        }

        return _updatedFields;
    }

    static createObject(object, params, value) {
        let data = {...object};
        const [field, prop] = params.split(".");

        // Rodiel (07/03/22): For object type values it is necessary to check if it is empty.
        // otherwise it would create an empty object instead of removing the empty object.
        if (UtilsNew.isNotEmpty(value)) {
            if (prop) {
                data[field] = {
                    ...data[field],
                    [prop]: value
                };
            } else {
                data = {
                    ...data,
                    [field]: value
                };
            }
        } else {
            if (prop) {
                delete data[field][prop];
            } else {
                delete data[field];
            }
        }
        return data;
    }

    static updateObjectParams(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        const isValueDifferent = (_obj, val) => _obj !== val && val !== null;

        // sometimes original object come as value undefined or empty but is not the same.
        const isNotEmtpy = (_obj, val) => typeof _obj !== "undefined" || val !== "";

        if (prop) {
            if (isValueDifferent(_original?.[field]?.[prop], value) && isNotEmtpy(_original?.[field]?.[prop], value)) {
                original[field] = {
                    ...original[field],
                    [prop]: value
                };

                _updateParams[field] = {
                    ..._updateParams[field],
                    [prop]: value
                };
            } else {
                // Josemi (2022-07-29) uncommented this as is not restoring the initial value in the original object
                // Added this if check to prevent rare cases where original[field] is not defined
                if (typeof original?.[field]?.[prop] !== "undefined") {
                    original[field][prop] = _original?.[field]?.[prop];
                }

                delete _updateParams?.[field]?.[prop];

                if (UtilsNew.isEmpty(_updateParams[field])) {
                    delete _updateParams[field];
                }
            }
        } else {
            if (isValueDifferent(_original?.[field], value)) {
                original[field] = value;
                _updateParams[field] = value;
            } else {
                original[field] =_original[field];
                delete _updateParams[field];
            }
        }

        return _updateParams;
    }

}
