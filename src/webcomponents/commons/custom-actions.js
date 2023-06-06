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

import UtilsNew from "../../core/utils-new.js";


export default class CustomActions {

    static get(actionConfig) {
        if (actionConfig.actionId) {
            return CUSTOM_ACTIONS[actionConfig.actionId];
        } else {
            return CUSTOM_ACTIONS[actionConfig.id];
        }
    }
    static exists(actionConfig) {
        return !!this.get(actionConfig)?.execute;
    }

    static execute(action, ...params) {
        return this.get(action).execute(...params);
    }

}
