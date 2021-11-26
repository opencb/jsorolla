import UtilsNew from "./utilsNew.js";

export default class NotificationManager {

    constructor(config) {
        this._init(config);
    }

    // Initialize the notification manager
    _init(config) {
        this.config = {...this.getDefaultConfig(), ...config};

        // Initialize notifications parent
        this.parent = document.createElement("div");
        Object.assign(this.parent.style, {
            "left": "50%",
            "maxWidth": this.config.display?.width || "600px",
            "position": "fixed",
            "top": "8px",
            "transform": "translateX(-50%)",
            "width": "100%",
            "zIndex": "9999",
        });

        // Append notification parent to document
        document.body.appendChild(this.parent);
    }

    // Display a notification alert
    show(options) {
        const type = (options.type || "info").toLowerCase();
        const className = (type === "error") ? "danger" : type; // Fix error classname

        // Generate notification element
        const element = UtilsNew.renderHTML(`
            <div class="alert alert-${className}" style="display:flex;">
                ${options.display?.showIcon ? `
                    <div style="margin-right:16px">
                        <span class="${options.icon || this.config.icons[type]}"></span>
                    </div>
                ` : ""}
                <div style="flex-grow:1;">
                    <div>
                        ${options.title ? `<h4 style="font-weight:bold;margin-bottom:8px;">${options.title}</h4>` : ""}
                        ${options.message || ""}
                    </div>
                    ${options.buttons && options.buttons?.length > 0 ? `
                        <div align="right" style="margin-top:12px;">
                            ${options.buttons.map((button, index) => `
                                <button data-index="${index}" class="btn btn-${className}">            
                                    ${button.text || ""}
                                </button>
                            `).join("")}
                        </div>
                    ` : ""}
                </div>
                ${options.display?.showCloseButton ? `
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
            this.parent.contains(element) && this.parent.removeChild(element);
        };

        // Register buttons actions
        Array.from(element.querySelectorAll("button.btn")).forEach(buttonElement => {
            const index = parseInt(buttonElement.dataset.index);

            buttonElement.addEventListener("click", () => {
                // First call the onClick function (if provided)
                if (typeof options.buttons[index].onClick === "function") {
                    options.buttons[index].onClick(removeNotification);
                }

                // Check if we want to automatically remove the notification
                if (options.buttons[index].removeOnClick) {
                    return removeNotification();
                }
            });
        });

        // Register event to remove the notification when the close button is clicked
        if (options.display?.showCloseButton) {
            element.querySelector("button.close").addEventListener("click", () => {
                return removeNotification();
            });
        }

        // Register the timer to automatically remove the notification after the specified ms
        if (options.removeAfter > 0) {
            UtilsNew.sleep(options.removeAfter).then(() => removeNotification());
        }

        // Append notification
        this.parent.appendChild(element);
    }

    // Alias to create a success notification
    success(title, message) {
        return this.show({
            type: "success",
            display: {
                showIcon: true,
                showCloseButton: true,
            },
            removeAfter: this.config.removeAfter,
            title: title,
            message: message,
        });
    }

    // Alias to create an info notification
    info(title, message) {
        return this.show({
            type: "info",
            display: {
                showIcon: true,
                showCloseButton: true,
            },
            removeAfter: this.config.removeAfter,
            title: title,
            message: message,
        });
    }

    // Alias to create a warning notification
    warning(title, message) {
        return this.show({
            type: "warning",
            display: {
                showIcon: true,
                showCloseButton: true,
            },
            removeAfter: this.config.removeAfter,
            title: title,
            message: message,
        });
    }

    // Alias to create an error notification
    error(title, message) {
        return this.show({
            type: "error",
            display: {
                showIcon: true,
                showCloseButton: false,
            },
            removeAfter: 0,
            buttons: [
                {
                    text: "Close",
                    removeOnClick: true,
                },
            ],
            title: title,
            message: message,
        });
    }

    // Get default config for the notification manager
    getDefaultConfig() {
        return {
            icons: {
                error: "fas fa-times-circle",
                info: "fas fa-info-circle",
                success: "fas fa-check-circle",
                warning: "fas fa-exclamation-triangle",
            },
            display: {
                width: "600px",
            },
            removeAfter: 5000,
        };
    }

}
