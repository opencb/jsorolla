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

    static getDisplayName(item) {
        if (item?.id && item?.name) {
            // First case: both item.id and item.name exists and are not empty
            return `${item.name} (${item.id})`;
        } else if (item?.id) {
            // Second case: only item.id exists
            return item.id;
        } else if (item?.name) {
            // Thids case: only item.name exists
            return item.name;
        } else {
            // Fallback: neither item.id and item.name exists or item is empty
            return "-";
        }
    }

}
