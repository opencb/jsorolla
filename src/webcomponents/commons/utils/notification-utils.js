// Notification utils class
export default class NotificationUtils {

    // notification types
    static NOTIFY = "notify";
    static NOTIFY_INFO = "notifyInfo";
    static NOTIFY_SUCCESS = "notifySuccess";
    static NOTIFY_WARNING = "notifyWarning";
    static NOTIFY_ERROR = "notifyError";
    static NOTIFY_RESPONSE = "notifyResponse";

    // other notification types
    static NOTIFY_CONFIRMATION = "notifyConfirmation";
    static NOTIFY_LOADING = "notify:loading";

    // Dispatch a notification event
    static dispatch(self, type, value) {
        self.dispatchEvent(new CustomEvent(type, {
            detail: value,
            bubbles: true,
            composed: true,
        }));
    }

}
