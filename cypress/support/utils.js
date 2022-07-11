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

export const setCheckBox = (selectors, val) => {
    cy.get(selectors).invoke("prop", "checked", val);
};

export const checkLabel = (selectors, tag, val) => {
    cy.get(selectors).contains(tag, val);
};

export const setInput = (selectors, val) => {
    cy.get(selectors).type(val);
};
