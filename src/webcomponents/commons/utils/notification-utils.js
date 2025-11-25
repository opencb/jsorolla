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

    // notification actions
    static NOTIFY_CLEAR = "notify:clear";

    // internal method to generate a unique id for each notification
    static _generateId() {
        return `notification:${Date.now()}:${Math.floor(Math.random() * 1000)}`;
    }

    // Dispatch a notification event
    static dispatch(self, type, value = {}) {
        // 1. generate an unique identifier for the notification
        const notificationId = NotificationUtils._generateId();

        // 2. dispatch the notification event
        self.dispatchEvent(new CustomEvent(type, {
            detail: {
                id: notificationId,
                ...value,
            },
            bubbles: true,
            composed: true,
        }));

        // 3. return the notification id
        return notificationId;
    }

    // clear notifications
    static clear(self, notificationId = null) {
        self.dispatchEvent(new CustomEvent(this.NOTIFY_CLEAR, {
            detail: {
                id: notificationId,
            },
            bubbles: true,
            composed: true,
        }));
    }

}
