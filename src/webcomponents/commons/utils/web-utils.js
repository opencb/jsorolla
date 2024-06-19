/*
 * Copyright 2015-present OpenCB
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

export default class WebUtils {

    static formatDisplayName(id, name, defaultValue = "-") {
        if (id && name) {
            // First case: both id and name exists and are not empty
            return `${name} (${id})`;
        } else if (id) {
            // Second case: only id exists
            return id;
        } else if (name) {
            // Third case: only name exists
            return name;
        } else {
            // Fallback: neither id and name exists
            return defaultValue;
        }
    }

    // Note: this is an alias to 'formatDisplayName', where the argument is an object that contains 'id' and/or 'name'
    static getDisplayName(item, defaultValue) {
        return WebUtils.formatDisplayName(item?.id, item?.name, defaultValue);
    }

    static getIVALink(opencgaSession, tool, query = {}) {
        const baseUrl = (new URL(window.location.pathname, window.location.origin));
        let queryStr = "";
        // Check if query object has been provided
        if (query) {
            const keys = Object.keys(query);
            // Special case: only id field is in the query
            if (keys.length === 1 && keys[0] === "id") {
                queryStr = query.id;
            } else {
                queryStr = (new URLSearchParams(query)).toString();
            }
        }
        return `${baseUrl}#${tool}/${opencgaSession.project.id}/${opencgaSession.study.id}/${queryStr}`;
    }

}
