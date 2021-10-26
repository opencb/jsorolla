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

export default class FormUtils {


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
            delete updateParams[field][prop];
        }
    }

    // This function implements a general method for object array updates in forms.
    // Usage example, updating: panels.id or flags.id
    static updateObjectArray(original, _original, updateParams, param, values) {
        const [field, prop] = param.split(".");

        if (!_original?.[field]) {
            _original = {
                [field]: []
            };
        }

        if (!updateParams?.[field]) {
            updateParams[field] = [];
        }

        const valuesSplit = values.split(",");
        for (const value of valuesSplit) {
            const index = _original[field].findIndex(item => item[prop] === value);
            if (index === -1 && value !== null) {
                original[field].push(
                    {
                        [prop]: value
                    }
                );
                for (const item of original[field]) {
                    updateParams[field].push(
                        {
                            [prop]: item[prop]
                        }
                    );
                }
            } else {
                updateParams[field].splice(index, 1);
            }
        }

        if (updateParams[field]?.length === 0) {
            delete updateParams[field];
        }
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
