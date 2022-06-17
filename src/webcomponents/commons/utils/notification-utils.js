// Notification utils class
export default class NotificationUtils {

    // Notification types
    static NOTIFY = "notify";
    static NOTIFY_INFO = "notifyInfo";
    static NOTIFY_SUCCESS = "notifySuccess";
    static NOTIFY_WARNING = "notifyWarning";
    static NOTIFY_ERROR = "notifyError";
    static NOTIFY_RESPONSE = "notifyResponse";
    static NOTIFY_CONFIRMATION = "notifyConfirmation";

    // Dispatch a notification event
    static dispatch(self, type, value) {
        self.dispatchEvent(new CustomEvent(type, {
            detail: value,
            bubbles: true,
            composed: true,
        }));
    }

}
