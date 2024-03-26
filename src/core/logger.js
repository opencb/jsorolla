

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

export default class Logger {

    static #logLevel = 3;

    static #logLevels = {
        "ERROR": 5,
        "WARN": 4,
        "INFO": 3,
        "DEBUG": 2,
        "TRACE": 1,
    }


    static error(msg) {
        console.error(msg);
    }

    static warn(msg) {
        if (Logger.getLevel() <= 4) {
            console.warn(msg);
        }
    }

    static info(msg) {
        if (this.getLevel() <= 3) {
            console.log(msg);
        }
    }

    static debug(msg) {
        if (this.getLevel() <= 2) {
            console.log(msg);
        }
    }

    static trace(msg) {
        if (this.getLevel() <= 1) {
            console.trace(msg);
        }
    }

    static getLevel() {
        return this.#logLevel;
    }

    static setLevel(level = "info") {
        this.#logLevel = this.#logLevels[level?.toUpperCase()] || 3;
        return this.#logLevel;
    }

}
