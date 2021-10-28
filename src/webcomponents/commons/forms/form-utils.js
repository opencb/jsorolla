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

    static updateScalar(original, _original, updateParams, param, value) {
        if (_original?.[param] !== value && value !== null) {
            original[param] = value;
            updateParams[param] = value;
        } else {
            delete updateParams[param];
        }

        // We need to create a new 'updateParams' reference to force an update
        return [original, {...updateParams}];
    }

    static updateObject(original, _original, updateParams, param, value) {
        const [field, prop] = param.split(".");
        if (_original?.[field]?.[prop] !== value && value !== null) {

            original[field] = {
                ...original[field],
                [prop]: value
            };

            updateParams[field] = {
                ...updateParams[field],
                [prop]: value
            };
        } else {
            // original[field][prop] = _original[field][prop];
            delete updateParams[field][prop];
        }

        // We need to create a new 'updateParams' reference to force an update
        return [original, {...updateParams}];
    }

    // This function implements a general method for object array updates in forms.
    // Usage example, updating: panels.id or flags.id
    static updateObjectArray(original, _original, updateParams, param, values) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams,
        };

        const valuesSplit = values?.split(",") || [];
        original[field] = valuesSplit.map(value => ({[prop]: value}));
        _updateParams[field] = valuesSplit.map(value => ({[prop]: value}));

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

        return [original, _updateParams];
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
