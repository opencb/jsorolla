import {html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";

export default class ClinicalVariantUtils {

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

    static formatComment(comment) {
        return html`
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="fas fa-comment text-secondary"></i>
                <span class="fw-bold">${comment.author || "Unknown"}</span>
                <span class="text-secondary fs-7">${UtilsNew.dateFormatter(comment.date)}</span>
            </div>
            <div>${comment.message || "-"}</div>
            ${comment?.tags?.length > 0 ? html`
                <div class="mt-2 d-flex gap-2 flex-wrap">
                    ${comment.tags.map(tag => html`
                        <span class="badge bg-secondary">${tag}</span>
                    `)}
                </div>    
            ` : nothing}
        `;
    }

    static formatEvidence(evidence) {
        return html`
            <div class="card border border-1 border-gray-200 bg-white">
            </div>
        `;
    }

};
