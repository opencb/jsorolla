class UtilsNew {
    static isUndefined(obj) {
        return typeof obj === 'undefined';
    }

    static isNotUndefined(obj) {
        return typeof obj !== 'undefined';
    }

    static isNull(obj) {
        return obj === null;
    }

    static isNotNull(obj) {
        return obj !== null;
    }

    static isUndefinedOrNull(obj) {
        return typeof obj === 'undefined' || obj === null;
    }

    static isNotUndefinedOrNull(obj) {
        return typeof obj !== 'undefined' && obj !== null;
    }

    static isEmpty(str) {
        return typeof str === 'undefined' || str === null || str === '';
    }

    static isNotEmpty(str) {
        return typeof str !== 'undefined' && str !== null && str !== '';
    }

    static isEmptyArray(arr) {
        return typeof arr !== 'undefined' && arr !== null && arr.length === 0;
    }

    static isNotEmptyArray(arr) {
        return typeof arr !== 'undefined' && arr !== null && arr.length > 0;
    }

    static containsArray(arr, item) {
        if (UtilsNew.isNotEmptyArray(arr) && UtilsNew.isNotUndefinedOrNull(item)) {
            return arr.indexOf(item) > -1;
        }

        return false;
    }

    static removeDuplicates (array, prop) {
        var newArray = [];
        var lookupObject  = {};

        for(let i in array) {
            lookupObject[array[i][prop]] = array[i];
        }

        for(let i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    static checkPermissions(project) {
        return Object.keys(project).length === 0;
    }


    static showNotify(options = {}, settings = {}) {
        $.notify(options, settings);
    }
    static showNotifyError(message, options = {}, settings = {}) {
        let optionsDefault = {
            icon: 'glyphicon glyphicon-warning-sign',
            message: message

        };

        let settingsDefault = {
            placement: {
                from: "top",
                align: "center"
            },
            type: 'danger'
        };

        settings = Object.assign({}, settingsDefault, settings);
        options = Object.assign({}, optionsDefault, options);
        this.showNotify(options,settings);
    }

    static showNotifySuccess(message, options = {}, settings = {}) {
        let optionsDefault = {
            icon: 'glyphicon glyphicon-warning-sign',
            message: message
        };

        let settingsDefault = {
            placement: {
                from: "top",
                align: "center"
            },
            type: 'success'
        };

        settings = Object.assign({}, settingsDefault, settings);
        options = Object.assign({}, optionsDefault, options);
        this.showNotify(options,settings);
    }

}
