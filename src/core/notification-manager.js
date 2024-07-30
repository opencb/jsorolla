/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import UtilsNew from "./utils-new.js";

export default class NotificationManager {

    constructor(config) {
        this.#init(config);
    }

    // Initialize the notification manager
    #init(config) {
        this.config = {...this.getDefaultConfig(), ...config};

        // Initialize notifications parent
        this.parent = document.createElement("div");
        this.parent.classList.add("notification-manager");
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

        this.confirmationDiv = document.createElement("div");
        document.body.appendChild(this.confirmationDiv);
    }

    // Display a notification alert
    showNotification(options) {
        const type = (options.type || "info").toLowerCase();
        const alertClass = options.display?.alertClassName || this.config.display.alertClassName[type];
        const buttonClass = options.display?.buttonClassName || this.config.display.buttonClassName[type];

        // Generate notification element
        const element = UtilsNew.renderHTML(`
            <div class="alert ${alertClass} animated fadeInDown" style="display:flex;animation-duration:0.5s!important;">
                ${options.display?.showIcon ? `
                    <div style="margin-right:16px">
                        <span class="${options.icon || this.config.icons[type]}"></span>
                    </div>
                ` : ""}
                <div style="flex-grow:1;">
                    <div>
                        ${options.title ? `<h4 style="font-weight:bold;margin-bottom:8px;">${options.title}</h4>` : ""}
                        ${options.message ? `
                            <div style="word-break:break-all;max-height:${this.config.display.messageMaxHeight};overflow-y:auto;">
                                ${options.message}
                            </div>
                        ` : ""}
                    </div>
                    ${options.buttons && options.buttons?.length > 0 ? `
                        <div align="right" style="margin-top:12px;">
                            ${options.buttons.map((button, index) => `
                                <button data-index="${index}" class="${buttonClass}">
                                    ${button.text || ""}
                                </button>
                            `).join("")}
                        </div>
                    ` : ""}
                </div>
                ${options.display?.showCloseButton ? `
                    <div style="margin-left:16px;">
                        <button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="alert" aria-label="Close"></button>
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
            element.querySelector("button.btn-close").addEventListener("click", () => {
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
        return this.showNotification({
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
        return this.showNotification({
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
        return this.showNotification({
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
        return this.showNotification({
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

    // Register response error listener
    // This will handle all response errors from OpenCGA and display a notification if needed
    response(response) {
        // Display error response events
        (response?.getResultEvents?.("ERROR") || []).forEach(error => this.error(error.name, error.message));
        (response?.getEvents?.("ERROR") || []).forEach(error => this.error(error.name, error.message));

        // Display warning response events
        (response?.getResultEvents?.("WARNING") || []).forEach(warn => this.warning(warn.name, warn.message));
        (response?.getEvents?.("WARNING") || []).forEach(warn => this.warning(warn.name, warn.message));

        // Sometimes response is an instance of an error
        if (response instanceof Error) {
            this.error(response.name, response.message);
        }
    }

    // Show a confirmation dialog
    showConfirmation(options) {
        const element = UtilsNew.renderHTML(`
            <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="myModalLabel">${options.title}</h4>
                            <button type="button" class="close btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${options.message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light cancel" data-bs-dismiss="modal">
                                ${options.display?.cancelButtonText || "Cancel"}
                            </button>
                            <button type="button" class="btn btn-primary ok" data-bs-dismiss="modal">
                                ${options.display?.okButtonText || "OK"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).querySelector("div.modal");

        // Method to remove the confirmation element
        const removeConfirmation = () => {
            this.confirmationDiv.contains(element) && this.confirmationDiv.removeChild(element);
        };

        // Register cancel listeners
        [element.querySelector("button.cancel"), element.querySelector("button.close")].forEach(el => {
            el.addEventListener("click", () => {
                removeConfirmation();

                if (typeof options.cancel === "function") {
                    options.cancel();
                }
            });
        });

        // Register submit listener
        element.querySelector("button.ok").addEventListener("click", () => {
            removeConfirmation();

            if (typeof options.ok === "function") {
                options.ok();
            }
        });

        // Append confirmation and display modal
        this.confirmationDiv.appendChild(element);
        // $(element).modal("show");
        const elementModal = new bootstrap.Modal(element);
        elementModal.show();
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
                messageMaxHeight: "200px",
                alertClassName: {
                    error: "alert-danger",
                    info: "alert-info",
                    success: "alert-success",
                    warning: "alert-warning",
                },
                buttonClassName: {
                    error: "btn btn-danger",
                    info: "btn btn-info",
                    success: "btn btn-success",
                    warning: "btn btn-warning",
                },
            },
            removeAfter: 5000,
        };
    }

}
