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

export default class LitUtils {

    /* Problem:
    *
    * The function name must not be the same. (maximum stack call size exceeded)
    * Without static Javascript not recognize this as a function
    * Not matter if this class extend LitElement not recognize "dispatchEvent".
    * Solution:
    *
    * We need to pass "this" from component as "self" to work
    * If we pass "this" is not necessary to the class extends LitElement.
    *
    * Other solution it converts this class as class mixin.
    *
    * Pros:
    * it's not necessary to pass "this";
    * it recognizes all LitElements functions.
    *
    * Cons:
    * Should be extended from the class mixin and pass LitElement as parameter
    * Ex: export default class NameComponent extends ClassMixin(LitElement) {....}
    */
    static dispatchCustomEvent(self, id, value, other = null, error = null, options = {bubbles: true, composed: true}) {
        const event = {
            detail: {},
            ...options
        };

        if (value !== null && typeof value !== "undefined") {
            event.detail.value = value;
        }
        if (other) {
            event.detail = {
                ...event.detail,
                ...other,
            };
        }

        if (error) {
            event.status = {
                error: !!error,
                message: error
            };
        }
        self.dispatchEvent(new CustomEvent(id, event));
    }

}
