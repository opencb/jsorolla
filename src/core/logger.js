

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
