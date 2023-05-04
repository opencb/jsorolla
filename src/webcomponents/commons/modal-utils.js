import {html} from "lit";
import NotificationUtils from "../utils/notification-utils";
import UtilsNew from "../../../core/utils-new";


export default class ModalUtils {

    // static check(status, message) {
    //     return {
    //         status: status,
    //         message: message
    //     };
    // }

    static create(id, config) {
        return html`
            <div class="modal fade" id="${id}" tabindex="-1" role="dialog"
                     aria-labelledby="${this._prefix}DataModalLabel" aria-hidden="true">
                    <div class="modal-dialog" style="width: ${config.modalWidth}">
                        <div class="modal-content">
                            <div class="modal-header">
                                ${this._getTitleHeader(config.modalTitleHeader, config.modalTitle, "modal-title " + config.modalTitleClassName, modalTitleStyle)}
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    ${config.render()}
                                </div>
                            </div>
                            ${config.modalButtonsVisible ? html`
                                <div class="modal-footer">
                                    ${config.renderButtons("modal")}
                                </div>
                            ` : null}
                        </div>
                    </div>
                </div>
        `;
    }

    static show(id) {
        $(id).modal("show");
    }

}
