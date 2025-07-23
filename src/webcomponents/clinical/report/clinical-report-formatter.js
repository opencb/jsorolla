import {html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";

export default class ClinicalReportFormatter {

    static formatReference(reference) {
        return html`
            <div class="mb-2">
                <div class="fw-bold">
                    ${reference.title || reference.name || "-"}
                </div>
                <div class="text-secondary">
                    ${reference.authors?.join(", ") || "-"}
                </div>
                <div class="text-muted d-flex align-items-center flex-row flex-wrap gap-1 fs-7">
                    ${reference.journal ? html`
                        <span>${reference.journal}.</span>
                    ` : nothing}
                    ${reference.date ? html`
                        <span>${UtilsNew.dateFormatter(reference.date)}.</span>
                    ` : nothing}
                    ${reference.url ? html`
                        <span class="text-nowrap d-flex align-items-center gap-1 ms-2">
                            <i class="fa fa-link fs-8"></i>
                            <span>${reference.url || "-"}</span>
                        </span>
                    ` : nothing}
                </div>
            </div>
        `;
    }

};
