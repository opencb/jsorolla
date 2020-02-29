import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./utilsNew.js";

//TODO evaluate turning this to a WC and the render would show the notifcation
export default class NotificationUtils {

    constructor() {
        //this.notifications = [];
    }


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
            icon: icon,
            //url: document.location.href + "?reload",
            //target: "_self"
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
        //this.notifications.push(message)
        return $.notify(optionsDefault, settingsDefault);
    }

    static closeNotify(notifyInstance) {
        if (UtilsNew.isNotUndefinedOrNull(notifyInstance)) {
            notifyInstance.close();
        }
    }


    //TODO check why this method is here...
    static refreshToken(event) {
        console.log("refreshtoken")
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

    /*render() {
        return html`<div>
            Notification!
            <div data-notify="container" class="col-xs-11 col-sm-4 alert alert-info" role="alert" data-notify-position="top-center" style="display: inline-block; margin: 0px auto; position: fixed; transition: all 0.5s ease-in-out 0s; z-index: 1031; top: 20px; left: 0px; right: 0px;"><button type="button" aria-hidden="true" class="close" data-notify="dismiss" style="position: absolute; right: 10px; top: 5px; z-index: 1033;">×</button><span data-notify="icon" class="fa fa-info-circle"></span> <span data-notify="title"></span> <span data-notify="message">Your session is close to expire. <strong>27 minutes remaining</strong>. <a>Click here to refresh</a></span><a href="#" target="_blank" data-notify="url"></a></div>

            ${this.notifications.length ? this.notifications.map( notification => html`-- ${notification} -- `) : null}
        </div>`;
    }*/

}

customElements.define("notification-utils", NotificationUtils);
