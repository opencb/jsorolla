import LitUtils from "./lit-utils.js";

export default class NotificationUtils {

    // Notification types
    static NOTIFY = "notify";
    static NOTIFY_INFO = "notifyInfo";
    static NOTIFY_SUCCESS = "notifySuccess";
    static NOTIFY_WARNING = "notifyWarning";
    static NOTIFY_ERROR = "notifyError";
    static NOTIFY_RESPONSE = "notifyResponse";

    // Dispatch a notification event
    static dispatch(self, type, value) {
        return LitUtils.dispatchCustomEvent(self, type, null, value, null, {
            bubbles: true,
            composed: true,
        });
    }

}
