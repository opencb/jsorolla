import {html, nothing} from "lit";
import LitUtils from "../utils/lit-utils";

export default class ModalUtils {

    static show(id) {
        const modalElm = document.querySelector(`#${id}`);
        if (modalElm.dataset?.draggable === "true") {
            ModalUtils.draggableModal(modalElm);
        }
        $(`#${id}`).modal("show");
    }

    static close(id) {
        $(`#${id}`).modal("hide");
    }

    static create(self, id, config) {
        // Parse modal parameters, all of them must start with prefix 'modal'
        // const modalWidth = config.display?.modalWidth || "auto";
        const modalContainerClass = config.display?.modalContainerClass || "";
        const modalStyle = config.display?.modalStyle || "";
        const modalSize = config.display?.modalSize || "";
        const modalTitle = config.display?.modalTitle || "";
        const modalTitleClassName = config.display?.modalTitleClassName || "";
        const modalTitleStyle = config.display?.modalTitleStyle || "";
        const btnsVisible = config.display?.modalbtnsVisible;
        const btnCancelVisible = config.display?.btnCancelVisible ?? true;
        const btnSaveVisible = config.display?.btnSaveVisible ?? true;
        const modalDraggable = config.display?.modalDraggable ?? false;
        const modalCyName = config.display?.modalCyDataName || "";

        // handle modal events (cancel, and submit aka ok)
        const handleCancel = event => {
            config?.onCancel ? config.onCancel(event) : LitUtils.dispatchCustomEvent(self, "modalCancel", null, event);
        };
        const handleOk = event => {
            config?.onOk ? config.onOk(event) : LitUtils.dispatchCustomEvent(self, "modalOk", null, event);
        };

        return html`
            <div class="modal fade ${modalContainerClass}" id="${id}" tabindex="-1" data-draggable="${modalDraggable}" data-cy="${modalCyName}">
                <div class="modal-dialog ${modalSize}" style="${modalStyle}">
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
                                        ${config?.display?.cancelButtonText || "Cancel"}
                                    </button>
                                ` : nothing}
                                ${btnSaveVisible ? html`
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${handleOk}">
                                        ${config?.display?.okButtonText || "Save"}
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
            modalDialog.style.margin = "0";
            modalDialog.style.left = (window.innerWidth * 0.30) + "px";
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
