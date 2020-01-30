class NotificationUtils {

    // Notify api: http://bootstrap-notify.remabledesigns.com/
    static showNotify(message = "", type = "INFO", options = {}, settings = {}, opencgaClient = null, notifyInstance = null) {
        const types = {
            "ERROR": "danger",
            "SUCCESS": "success",
            "WARNING": "warning",
            "INFO": "info"
        };
        const defaultIcons = {
            "ERROR": "fa fa-times-circle",
            "SUCCESS": "fa fa-check-circle",
            "WARNING": "fa fa-exclamation-triangle",
            "INFO": "fa fa-info-circle"
        };

        let settingsDefault = {
            placement: {
                from: "top",
                align: "center"
            },
            type: types[type] || types["INFO"],
            animate: {
                enter: 'zoomInDown',
                exit: 'zoomInDown'
            },
            delay: 2000
        };

        const icon = defaultIcons[type];
        let optionsDefault = {
            message: message,
            icon: icon
        };

        settingsDefault = Object.assign({}, settingsDefault, settings);
        optionsDefault = Object.assign({}, optionsDefault, options);

        if (UtilsNew.isNotUndefinedOrNull(notifyInstance)) {
            notifyInstance.update("message", message);
            return notifyInstance;
        }

        if (UtilsNew.isNotUndefinedOrNull(opencgaClient)) {
            this.opencgaClient = opencgaClient;
        }
        return $.notify(optionsDefault, settingsDefault);
    }

    static closeNotify(notifyInstance) {
        if (UtilsNew.isNotUndefinedOrNull(notifyInstance)) {
            notifyInstance.close();
        }
    }

    static refreshToken(event) {
        const _this = this;
        this.opencgaClient.refresh().then(response => {
            const sessionId = response.getResult(0).token;
            const decoded = jwt_decode(sessionId);
            const dateExpired = new Date(decoded.exp * 1000);
            const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss");
            const _message = "Your session is now valid until " + validTimeSessionId;
            $.notifyClose();
            _this.showNotify(_message);
        });

    }

}
