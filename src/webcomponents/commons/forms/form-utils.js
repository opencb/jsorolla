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

import UtilsNew from "../../../core/utilsNew.js";

export default class FormUtils {

    //  Rodiel 2022-05-16 DEPRECATED use updateObjectParams
    static updateScalar(_original, original, updateParams, param, value) {
        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        if (_original?.[param] !== value && value !== null) {
            original[param] = value; // This the problem
            _updateParams[param] = value;
        } else {
            // We need to restore the original value in our copy
            original[param] = _original[param];
            delete _updateParams[param];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    static updateScalarParams(_original, original, updateParams, param, value) {
        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        // Rodiel 22-05-17: avoid override original data and updateParams. (ontology-term-annotation-update)
        const _data = {
            original: {...original},
            updateParams: {...updateParams}
        };

        if (_original?.[param] !== value && value !== null) {
            _data.original[param] = value; // This the problem
            _data.updateParams[param] = value;
        } else {
            // We need to restore the original value in our copy
            _data.original[param] = _original[param];
            delete _data.updateParams[param];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _data;
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
                ..._updateParams[field],
                [prop]: value
            };
        } else {
            delete _updateParams[field];
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    // Update object with Object as props
    static updateObjectWithObj(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");
        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };

        // The value it's object too.
        const childKey = Object.keys(value)[0];
        const childValue = Object.values(value)[0];

        if (prop) {
            if (_original?.[field]?.[prop]?.[childKey] !== childValue && childValue !== null) {
                original[field][prop] = {
                    ...original[field][prop],
                    ...value
                };

                // init new object
                _updateParams[field] = {
                    ...updateParams[field],
                    [prop]: {}
                };

                _updateParams[field][prop] = {
                    ..._updateParams[field][prop],
                    ...value
                };
            } else {
                delete _updateParams[field][prop];

                if (UtilsNew.isEmpty(_updateParams[field])) {
                    delete _updateParams[field];
                }

            }
        } else {

            if (_original?.[field]?.[childKey] !== childValue && childValue !== null) {
                original[field] = {
                    ...original[field],
                    ...value
                };

                _updateParams[field] = {
                    ..._updateParams[field],
                    ...value
                };
            } else {
                delete _updateParams[field];
            }

        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    // Rodiel 2022-05-16 DEPRECATED use updateObjectParams
    // update object with props has primitive type
    static updateObjectWithProps(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");

        // Prepare an internal object to store the updateParams.
        // NOTE: it is important to create a new object reference to force a new render()
        const _updateParams = {
            ...updateParams
        };


        if (_original?.[field]?.[prop] !== value && value !== null && (_original?.[field]?.[prop] !== undefined || value !== "")) {
            original[field] = {
                ...original[field],
                [prop]: value
            };

            _updateParams[field] = {
                ..._updateParams[field],
                [prop]: value
            };
        } else {
            // original[param][prop] = _original[param][prop];
            delete _updateParams[field][prop];

            // if the object is entire emtpy well delete it
            if (UtilsNew.isEmpty(_updateParams[field])) {
                delete _updateParams[field];
            }
        }

        // We need to create a new 'updateParams' reference to force an update
        return _updateParams;
    }

    // new function: with updateScalar & updateObjectWithProps
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

    static updateArraysObject(_original, original, updateParams, param, value) {
        const [field, prop] = param.split(".");
        const _updateParams = {
            ...updateParams,
        };

        const arraysEqual = (a, b) => a.length === b.length && a.every(
            (o, idx) => UtilsNew.objectCompare(o, b[idx])
        );

        if (prop) {
            if (!arraysEqual(_original[field][prop], value)) {
                original[field] = {
                    ...original[field],
                    [prop]: value
                };

                _updateParams[field] = {
                    ..._updateParams[field],
                    [prop]: value
                };
            } else {
                original[field][prop] = _original[field][prop];
                delete _updateParams[field][prop];
                if (UtilsNew.isEmpty(_updateParams[field])) {
                    delete _updateParams[field];
                }
            }
        } else {
            if (!arraysEqual(_original[field], value)) {
                original[field] = value;
                _updateParams[field] = value;
            } else {
                original[field] = _original[field];
                delete _updateParams[field];
            }
        }

        return _updateParams;
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

    /**
    * @deprecated since version 2.2
    */
    // ! Deprecated Don't Used This Code
    static notifyError() {
        // Nothing to do
    }

    // Deprecated
    static showAlert(title, message, type) {
        Swal.fire(
            title,
            message,
            type,
        );
    }

    static getBooleanValue(data, visible, defaultValue) {
        let _visible = typeof defaultValue !== "undefined" ? defaultValue : true;
        if (typeof visible !== "undefined" && visible !== null) {
            if (typeof visible === "boolean") {
                _visible = visible;
            } else {
                if (typeof visible === "function") {
                    _visible = visible(data);
                } else {
                    console.error(`Field 'visible' not boolean or function: ${typeof visible}`);
                }
            }
        }
        return _visible;
    }

}
