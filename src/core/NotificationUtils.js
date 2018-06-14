class NotificationUtils {

    // Notify api: http://bootstrap-notify.remabledesigns.com/
    static showNotify(message = "", type = "INFO", options = {}, settings = {}, opencgaClient = null, notifyInstance = null) {
        let types = {
            'ERROR': 'danger',
            'SUCCESS': 'success',
            'WARNING': 'warning',
            'INFO': 'info'
        };
        let defaultIcons = {
            'ERROR': 'fa fa-times-circle',
            'SUCCESS': 'fa fa-check-circle',
            'WARNING': 'fa fa-exclamation-triangle',
            'INFO': 'fa fa-info-circle'
        };

        let settingsDefault = {
            placement: {
                from: "top",
                align: "center"
            },
            type: types[type] || types['INFO']
        };

        let icon = defaultIcons[type];
        let optionsDefault = {
            message: message,
            icon: icon
        };

        settingsDefault = Object.assign({}, settingsDefault, settings);
        optionsDefault = Object.assign({}, optionsDefault, options);

        if (UtilsNew.isNotUndefinedOrNull(notifyInstance)) {
            notifyInstance.update('message', message);
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
        let _this = this;
        this.opencgaClient.users().refresh().then((response) => {
            let sessionId =  response.response[0].result[0].id;
            let decoded = jwt_decode(sessionId);
            let dateExpired = new Date(decoded.exp * 1000);
            let validTimeSessionId =  moment(dateExpired, "YYYYMMDDHHmmss").format('D MMM YY HH:mm:ss');
            let _message = "Your session is now valid until " + validTimeSessionId;
            $.notifyClose();
            _this.showNotify(_message);
        });

    }

}
