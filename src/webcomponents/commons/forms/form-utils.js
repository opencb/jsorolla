/*
 * Copyright 2015-2021 OpenCB
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

import {has} from "lodash";

export default class FormUtils {

    static updateScalar(_original, original, updateParams, param, value) {
        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        if (_original?.[param] !== value && value !== null) {
            original[param] = value;
            _updateParams[param] = value;
        } else {
            delete _updateParams[param];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    static updateObject(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        if (_original?.[field]?.[prop] !== value && value !== null) {
            original[field] = {
                ...original[field],
                [prop]: value
            };

            _updateParams[field] = {
                [prop]: value
            };
        } else {
            delete _updateParams[field];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    // updateNestedObject, updateMultipleObject... alternative function name.
    static updateObjectWithProps(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        if (_original?.[field]?.[prop] !== value && value !== null) {
            original[field] = {
                ...original[field],
                [prop]: value
            };

            _updateParams[field] = {
                ..._updateParams[field],
                [prop]: value
            };
        } else {
            delete _updateParams[field][prop];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    // This function implements a general method for object array updates in forms.
    // Usage example, updating: panels.id or flags.id
    static updateObjectArray(_original, original, updateParams, param, values, data) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        const valuesSplit = values?.split(",") || [];

        // Set array of objects WITH only THE 'prop' field
        _updateParams[field] = valuesSplit.map(value => ({[prop]: value}));

        // If possible we store the complete objects in 'original'
        if (data) {
            original[field] = [];
            for (const value of valuesSplit) {
                const item = data.find(d => d[prop] === value);
                original[field].push(item);
            }
        } else {
            original[field] = valuesSplit.map(value => ({[prop]: value}));
        }

        // Let's find out if the content of the array is different from the '_original' array in the server
        let hasChanged = false;
        if (original[field]?.length === _original[field]?.length) {
            for (const v of original[field]) {
                const index = _original[field].findIndex(vv => vv[prop] === v[prop]);
                if (index === -1) {
                    hasChanged = true;
                    break;
                }
            }
        } else {
            hasChanged = true;
        }

        // Delete updateParams field if nothing has changed
        if (!hasChanged) {
            delete _updateParams[field];
        }

        return _updateParams;
    }

    static createObject(object, params, value, includeField=false) {
        const [field, prop] = params.split(".");
        if (includeField) {
            object[field] = {
                ...object[field],
                [prop]: value
            };
        } else {
            object = {
                ...object,
                [prop]: value
            };
            console.log("Object:", object);
        }
    }

    static showAlert(title, message, type) {
        Swal.fire(
            title,
            message,
            type,
        );
    }

}
