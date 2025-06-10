import {html, nothing} from "lit";
import LitUtils from "../utils/lit-utils";

export default class ModalUtils {

    static show(id) {
        const modalElm = document.querySelector(`#${id}`);
        // note: first we need to show the modal before we can set the draggable
        $(`#${id}`).modal("show");
        if (modalElm.dataset?.draggable === "true") {
            ModalUtils.draggableModal(modalElm);
        }
    }

    static close(id) {
        $(`#${id}`).modal("hide");
    }

    static create(self, id, config) {
        const modalContainerClass = config.display?.modalContainerClass || "";
        const modalStyle = config?.display?.style || config.display?.modalStyle || "";
        const modalSize = config?.display?.size || config?.display?.modalSize || "";
        const modalTitle = config?.display?.title || config.display?.modalTitle || "";
        const modalTitleClassName = config?.display?.titleClassName || config?.display?.modalTitleClassName || "";
        const modalTitleStyle = config?.display?.titleStyle || config.display?.modalTitleStyle || "";
        const btnsVisible = config?.display?.buttonsVisible ?? config.display?.modalBtnsVisible ?? config.display?.modalbtnsVisible;
        const btnCancelVisible = config?.display?.buttonCancelVisible ?? config.display?.btnCancelVisible ?? true;
        const btnSaveVisible = config?.display?.buttonSaveVisible ?? config.display?.btnSaveVisible ?? true;
        const modalDraggable = config?.display?.draggable ?? config.display?.modalDraggable ?? false;
        const modalCyName = config.display?.modalCyDataName || "";
        const modalScrollable = config?.display?.scrollable ?? config?.display?.modalScrollable ?? false;
        const backdrop = config?.display?.backdrop ?? ""; // set to "static" to prevent closing the modal on backdrop click

        // handle modal events (cancel, and submit aka ok)
        const handleCancel = event => {
            config?.onCancel ? config.onCancel(event) : LitUtils.dispatchCustomEvent(self, "modalCancel", null, event);
        };
        const handleOk = event => {
            if (typeof config?.onSave === "function") {
                config.onSave(event);
            } else if (typeof config?.onOk === "function") {
                // NOTE: onOk has been deprecated in favor of onSave
                config.onOk(event);
            } else {
                // if no onSave function is provided, dispatch a custom event
                LitUtils.dispatchCustomEvent(self, "modalOk", null, event);
            }
        };

        return html`
            <div class="modal ${modalContainerClass}" id="${id}" tabindex="-1" data-bs-backdrop="${backdrop}" data-draggable="${modalDraggable}" data-cy="${modalCyName}">
                <div class="modal-dialog ${modalSize} ${modalScrollable ? "modal-dialog-scrollable" : ""}" style="${modalStyle}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title text-truncate ${modalTitleClassName}" style="${modalTitleStyle}">
                                ${modalTitle}
                            </h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="${handleCancel}"></button>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                ${config?.render(self)}
                            </div>
                        </div>
                        ${btnsVisible? html`
                            <div class="modal-footer">
                                ${btnCancelVisible ? html`
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal" @click="${handleCancel}">
                                        ${config?.display?.buttonCancelText || config?.display?.btnCancelText || config?.display?.cancelButtonText || "Cancel"}
                                    </button>
                                ` : nothing}
                                ${btnSaveVisible ? html`
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${handleOk}">
                                        ${config?.display?.buttonSaveText || config?.display?.btnSaveText || config?.display?.okButtonText || "Save"}
                                    </button>
                                ` : nothing}
                            </div>
                        `: nothing}
                    </div>
                </div>
            </div>
        `;
    }

    static draggableModal(modalElm) {
        const offset = [0, 0, 0, 0];
        const modalDialog = modalElm.querySelector(".modal-dialog");
        const modalHeader = modalElm.querySelector(".modal-header");

        if (modalDialog) {
            const modalSize = modalDialog.getBoundingClientRect();
            modalDialog.style.margin = "0";
            modalDialog.style.left = ((window.innerWidth - (modalSize?.width || 0)) * 0.50) + "px";
            modalDialog.style.top = (window.innerHeight * 0.05) + "px";
        }

        const elementDrag = e => {
            e.preventDefault();

            // calculate the new cursor position:
            offset[0] = offset[2] - e.clientX;
            offset[1] = offset[3] - e.clientY;
            offset[2] = e.clientX;
            offset[3] = e.clientY;

            // set the element's new position:
            modalDialog.style.top = (modalDialog.offsetTop - offset[1]) + "px";
            modalDialog.style.left = (modalDialog.offsetLeft - offset[0]) + "px";
        };

        const closeDragElement = e => {
            e.preventDefault();
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        };

        const dragMouseDown = e => {
            e.preventDefault();

            // get the mouse cursor position at startup:
            offset[2] = e.clientX;
            offset[3] = e.clientY;
            document.onmouseup = closeDragElement;

            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        };

        modalHeader.onmousedown = dragMouseDown;
        modalHeader.style.cursor = "move";
    }

}
