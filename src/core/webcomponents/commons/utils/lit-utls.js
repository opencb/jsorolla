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

import {LitElement} from "/web_modules/lit-element.js";

export default class LitUtils extends LitElement {

    dispatchEvent(id, value, error = null, other = null, options = {bubbles: true, composed: true}) {
        const event = {
            detail: {
                value: value,
                ...other
            },
            ...options
        };

        if (error) {
            event.status = {
                error: !!error,
                message: error
            };
        }

        this.dispatchEvent(new CustomEvent(id, event));
    }

}
