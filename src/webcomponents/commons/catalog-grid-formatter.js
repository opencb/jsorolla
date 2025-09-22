/*
 * Copyright 2015-2016 OpenCB
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

import UtilsNew from "../../core/utils-new.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import GridCommons from "./grid-commons.js";

export default class CatalogGridFormatter {

    static JOB_STATUS = {
        PENDING: {
            className: "text-primary",
            icon: "far fa-clock",
        },
        QUEUED: {
            className: "text-primary",
            icon: "far fa-clock",
        },
        RUNNING: {
            className: "text-primary",
            icon: "fas fa-sync-alt anim-rotate",
        },
        DONE: {
            className: "text-success",
            icon: "fas fa-check-circle",
        },
        ERROR: {
            className: "text-danger",
            icon: "fas fa-exclamation-circle",
        },
        UNKNOWN: {
            className: "text-danger",
            icon: "fas fa-exclamation-circle",
        },
        ABORTED: {
            className: "text-warning",
            icon: "fas fa-ban",
        },
        DELETED: {
            className: "text-primary",
            icon: "fas fa-trash-alt",
        },
    }

    static userStatusFormatter(status, config) {
        const _config = config || [];
        const currentStatus = status.id || status.name || "UNDEFINED"; // Get current status
        const displayCurrentStatus = _config.find(status => status.id === currentStatus);
        return `
            <span class="badge" style="background-color: ${displayCurrentStatus.displayColor}">
                <strong>${displayCurrentStatus.displayLabel}</strong>
            </span>
        `;
    }
    static sexFormatter(value, row) {
        let sexHtml = `${UtilsNew.isEmpty(value) ? "Not specified" : value.id ?? value}`;
        if (row?.karyotypicSex && row.karyotypicSex !== "UNKNOWN") {
            sexHtml += ` (${row.karyotypicSex?.id || row.karyotypicSex})`;
        }
        return sexHtml;
    }

    static phenotypesFormatter(phenotypes) {
        const status = ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"];
        const phenotypesItems = (phenotypes || [])
            .sort((a, b) => status.indexOf(a.status) - status.indexOf(b.status))
            .map(phenotype => {
                const result = [];
                if (phenotype.name) {
                    result.push(UtilsNew.escapeHtml(phenotype.name));
                }
                // Add phenotype ID if exists
                if (phenotype.id && phenotype.id !== phenotype.name) {
                    const ontologyLink = BioinfoUtils.getOntologyLink(phenotype.id);
                    if (ontologyLink.startsWith("http")) {
                        result.push(`
                            (<a class="link d-inline-flex align-items-center gap-1" target="_blank" href="${ontologyLink}">
                                <span>${phenotype.id}</span>
                                <i class="fa fa-external-link-alt fs-8"></i>
                            </a>)
                        `);
                    } else {
                        result.push(`(${phenotype.id})`);
                    }
                }
                return `
                    <div style="white-space:nowrap;">${result.join(" ")}</div>
                `;
            });
        return GridCommons.generateExpandCollapseContent(phenotypesItems, 3);
    }

    static disorderFormatter(disorders) {
        const disordersItems = (disorders || []).map(disorder => {
            if (disorder?.id) {
                // Default value if the disorder ID does not include ':' (source:ID)
                let idHtml = disorder.id;
                // We try to get a HTTP link
                const ontologyLink = BioinfoUtils.getOntologyLink(disorder.id);
                if (ontologyLink.startsWith("http")) {
                    // We have identified the ontology source and created a link
                    idHtml = `
                        <a class="link d-inline-flex align-items-center gap-1" href="${ontologyLink}" target="_blank">
                            <span>${disorder.id}</span>
                            <i class="fa fa-external-link-alt fs-8"></i>
                        </a>
                    `;
                }
                if (disorder.name && disorder.name !== disorder.id) {
                    return `
                        <div class="" style="white-space: nowrap">
                            <span data-cy="disorder-name">${disorder.name}</span> (<span data-cy="disorder-id">${idHtml}</span>)
                        </div>
                    `;
                } else {
                    return `
                        <div class="" style="white-space: nowrap">
                            <span data-cy="disorder-id">${idHtml}</span>
                        </div>
                    `;
                }
            }
            return "";
        });
        return GridCommons.generateExpandCollapseContent(disordersItems, 3);
    }

    static panelFormatter(panels) {
        const panelsItems = (panels || []).map(panel => {
            if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                return `
                    <a class="link d-flex align-items-center gap-1" href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                        <span>${panel.name} (${panel.source.project} v${panel.source.version})</span>
                        <i class="fa fa-external-link-alt fs-8"></i>
                    </a>
                `;
            } else {
                return `
                    <div class="">${panel.id}</div>
                `;
            }
        });
        return GridCommons.generateExpandCollapseContent(panelsItems, 3);
    }

    //  Formats the files for the Catalog grids
    // @param {Array} files Either a list of fileIds or file objects
    // @param {Array} extensions A list of file extensions. Default '*'
    // @returns {string} html code
    static fileFormatter(files, extensions = "*") {
        const items = (files || [])
            .filter(file => extensions === "*" || extensions.some(ext => (file?.id || file?.name || file).endsWith(ext)))
            .map(file => {
                return `
                    <a class="link d-block fw-bold" data-action="view-file" data-file="${file?.id || file}">
                        ${file?.name || (file?.id || file).split(":").pop()}
                    </a>
                `;
            });
        return GridCommons.generateExpandCollapseContent(items, 3);
    }

    static dateFormatter(value, row) {
        if (value) {
            return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
        }
        return "-";
    }

    static modifiedAndCreateDateFormatter(value, row) {
        if (row) {
            return `
                <div class="" title="${row.version ? `Version ${row.version}` : ""}">
                    <span class="my-1">${UtilsNew.dateFormatter(row.modificationDate)}</span>
                    <span class="d-block text-secondary my-1">${UtilsNew.dateFormatter(row.creationDate)}</span>
                </div>
            `;
        }
        return "-";
    }

    static caseFormatter(clinicalAnalysisArray, row, individualId, opencgaSession) {
        const items = (clinicalAnalysisArray || []).map(clinicalAnalysis => {
            // const caseUrl = WebUtils.getInterpreterLink(opencgaSession, clinicalAnalysis.id);
            return `
                <div class="text-nowrap">
                    <a class="link fw-bold" data-action="view-clinical-analysis" data-clinical-analysis="${clinicalAnalysis.id}">
                        <span>${clinicalAnalysis.id}</span>
                    </a>
                    <span class="text-secondary ms-1">${clinicalAnalysis.proband.id === individualId ? "(proband)" : ""}</span>
                </div>
            `;
        });
        return GridCommons.generateExpandCollapseContent(items, 3);
    }

    static customAnnotationFormatter(annotationSets, selectedVariableSetId, selectedVariables) {
        let html = `<div>`;
        if (selectedVariableSetId) {
            // Select the first annotationSet for the selectedVariableSetId. In the future there will be only one.
            const annotationSet = annotationSets?.find(v => v.variableSetId === selectedVariableSetId);
            if (annotationSet) {
                // If 'variables' is not provided we display all of them
                const variables = (selectedVariables?.length > 0) ? selectedVariables : Object.keys(annotationSet.annotations).sort();
                for (const variable of variables) {
                    html += `
                        <div style="white-space: nowrap">
                            <span style="margin: 2px 0; font-weight: bold">${variable}:</span> ${annotationSet.annotations[variable]}
                        </div>
                    `;
                }
            } else {
                // This entity has not this variableSetId annotated
                html += `-`;
            }
        } else {
            if (annotationSets?.length > 0) {
                // We display all variableSetIds
                for (const annotationSet of annotationSets) {
                    html += `<div class="d-block text-secondary" style="margin: 5px 0 2px 0">${annotationSet.variableSetId}</div>`;
                    for (const variable of Object.keys(annotationSet.annotations).sort()) {
                        html += `
                            <div style="white-space: nowrap">
                                <span style="margin: 2px 0; font-weight: bold">${variable}:</span> ${annotationSet.annotations[variable]}
                            </div>
                        `;
                    }
                }
            } else {
                // This entity has not annotations
                html += `-`;
            }
        }
        html += `</div>`;
        return html;
    }

    static tagsFormatter(tags) {
        if (tags?.length > 0) {
            return `
                <div class="d-flex gap-1 flex-wrap" style="max-width:15rem;">
                    ${tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(" ")}
                </div>
            `;
        }
        return "-";
    }

    static jobStatusFormatter(status, job, appendDescription = false) {
        const statusConfig = CatalogGridFormatter.JOB_STATUS[status.id] || null;
        if (statusConfig) {
            const content = `
                <span class="fw-bold" style="text-wrap:nowrap;">
                    <i class="${statusConfig.icon}"></i> ${status.id}
                </span>
                ${status?.description && appendDescription ? `<span class="">: ${status?.description}</span>` : ""}
            `;
            // if not appendDescription, we return the status with the description as a tooltip
            if (!appendDescription && status?.description) {
                const errorEvent = job?.execution?.events.find(event => event.type === "ERROR");
                const tooltipText = errorEvent ? `${status.description}<br><br>${errorEvent.message}` : status.description;
                return `
                    <a class="${statusConfig.className} text-decoration-none" tooltip-title="${status.id}" tooltip-text="${tooltipText}">
                        ${content}
                    </a>
                `;
            } else {
                return `<div class="${statusConfig.className}">${content}</div>`;
            }
        }
        return "-";
    }

    static variantStatusFormatter(internalVariant) {
        let indexHtml = internalVariant?.index?.status?.id === "READY"
            ? `<i class="fas fa-check text-success" title="VCF Variant indexed"></i>`
            : `<span class="text-danger">${internalVariant.index.status.id}</span>`;
        let annotationHtml = internalVariant?.annotationIndex?.status?.id === "READY"
            ? `<i class="fas fa-check text-success" title="Variant Annotation indexed"></i>`
            : `<span class="text-danger">${internalVariant.annotationIndex.status.id}</span>`;

        return `
            <div class="d-flex flex-column gap-1">
                <div class="">Indexed: <span class="mx-3">${indexHtml}</span></div>
                <div class="">Annotated: <span class="mx-3">${annotationHtml}</span></div>
            </div>
                    `;
    }
}
