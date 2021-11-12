import UtilsNew from "./utilsNew.js";

export class Notification {

    static parent = null;
    static iconsMap = {
        danger: "glyphicon glyphicon-remove-sign",
        info: "glyphicon glyphicon-info-sign",
        success: "glyphicon glyphicon-ok-sign",
        warning: "glyphicon glyphicon-warning-sign",
    };

    // Get notifications parent element
    static getParent() {
        if (!Notification.parent) {
            Notification.parent = document.createElement("div");
            Object.assign(Notification.parent.style, {
                "left": "50%",
                "maxWidth": "600px",
                "position": "fixed",
                "top": "8px",
                "transform": "translateX(-50%)",
                "width": "100%",
                "zIndex": "9999",
            });
            // Append notification to document
            document.body.appendChild(Notification.parent);
        }

        // Return parent element
        return Notification.parent;
    }

    // Display a notification alert
    static show(config) {
        const type = (config.type || "info").toLowerCase();
        const parent = Notification.getParent();

        // Generate notification element
        const element = UtilsNew.renderHTML(`
            <div class="alert alert-${type}" style="display:flex;">
                ${config.showIcon ? `
                    <div style="margin-right:16px">
                        <span class="${Notification.iconsMap[type]}"></span>
                    </div>
                ` : ""}
                <div style="flex-grow:1;">
                    <div>${config.message || ""}</div>
                    ${config.buttons && config.buttons?.length > 0 ? `
                        <div style="margin-top:16px;">
                            ${config.buttons.map((button, index) => `
                                <button data-index="${index}" class="btn btn-${type}">            
                                    ${button.text || ""}
                                </button>
                            `).join("")}
                        </div>
                    ` : ""}
                </div>
                ${config?.showCloseButton ? `
                    <div style="margin-left:16px;">
                        <button type="button" class="close" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                ` : ""}
            </div>
        `).querySelector("div.alert");

        // Method to remove the notification
        const removeNotification = () => {
            parent.contains(element) && parent.removeChild(element);
        };

        // Register buttons actions
        Array.from(element.querySelectorAll("button.btn")).forEach(buttonElement => {
            const index = parseInt(buttonElement.dataset.index);

            buttonElement.addEventListener("click", () => {
                return config.buttons[index].onClick({
                    hide: removeNotification,
                });
            });
        });

        // Append notification
        parent.appendChild(element);

        if (config.removeAfter > 0) {
            // Register event to remove the notification when the close button is clicked
            element.querySelector("button.close").addEventListener("click", () => {
                return removeNotification();
            });

            // Register the timer to automatically remove the notification after the specified ms
            UtilsNew.sleep(config.removeAfter).then(() => removeNotification());
        }
    }

    // Alias to create a success notification
    static success(message, customDelay) {
        return Notification.show({
            type: "success",
            showIcon: true,
            showCloseButton: true,
            removeAfter: customDelay || 5000,
            message,
        });
    }

    // Alias to create an info notification
    static info(message, customDelay) {
        return Notification.show({
            type: "info",
            showIcon: true,
            showCloseButton: true,
            removeAfter: customDelay || 5000,
            message,
        });
    }

    // Alias to create a warning notification
    static warning(message, customDelay) {
        return Notification.show({
            type: "warning",
            showIcon: true,
            showCloseButton: true,
            removeAfter: customDelay || 9000,
            message,
        });
    }

    // Alias to create an error notification
    static error(message) {
        return Notification.show({
            type: "danger",
            showIcon: true,
            removeAfter: 0,
            buttons: [
                {
                    text: "Close",
                    onClick: actions => actions.hide(),
                },
            ],
            message,
        });
    }

}
