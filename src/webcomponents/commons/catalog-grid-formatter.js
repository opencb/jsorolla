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

export default class CatalogGridFormatter {

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
        let sexHtml = `${UtilsNew.isEmpty(row?.sex) ? "Not specified" : row.sex.id || row.sex}`;
        if (row?.karyotypicSex && row.karyotypicSex !== "UNKNOWN") {
            sexHtml += ` (${row.karyotypicSex?.id || row.karyotypicSex})`;
        }
        return sexHtml;
    }

    static phenotypesFormatter(phenotypes) {
        if (!phenotypes || phenotypes.length === 0) {
            return "-";
        }
        const status = ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"];
        const phenotypesHtml = phenotypes
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
                            <a target="_blank" href="${ontologyLink}"> (${phenotype.id})</a>
                        `);
                    } else {
                        result.push(`(${phenotype.id})`);
                    }
                }
                // Add phenotype status if exists
                // if (phenotype.status) {
                //     result.push(`(${phenotype.status})`);
                // }
                return `<div style="margin: 2px 0; white-space: nowrap">${result.join(" ")}</div>`;
            });

        if (phenotypesHtml?.length > 0) {
            let html = "<div>";
            for (let i = 0; i < phenotypesHtml.length; i++) {
                // Display first 3 phenotypes
                if (i < 3) {
                    html += phenotypesHtml[i];
                } else {
                    html += `<a tooltip-title="Phenotypes" tooltip-text='${phenotypesHtml.join("")}'>... view all phenotypes (${phenotypesHtml.length})</a>`;
                    break;
                }
            }
            html += "</div>";
            return html;
        } else {
            // TODO Think about this
            return `-`;
        }
    }

    static disorderFormatter(disorders) {
        let html = "-";
        if (disorders?.length > 0) {
            html = "<div>";
            for (const disorder of disorders) {
                if (disorder?.id) {
                    // Default value if the disorder ID does not include ':' (source:ID)
                    let idHtml = disorder.id;
                    // We try to get a HTTP link
                    const ontologyLink = BioinfoUtils.getOntologyLink(disorder.id);
                    if (ontologyLink.startsWith("http")) {
                        // We have identified the ontology source and created a link
                        idHtml = `<a class="text-decoration-none" href="${ontologyLink}" target="_blank">${disorder.id}</a>`;
                    }
                    if (disorder.name && disorder.name !== disorder.id) {
                        html += `
                            <div style="margin: 2px 0; white-space: nowrap">
                                <span data-cy="disorder-name">${disorder.name}</span> (<span data-cy="disorder-id">${idHtml}</span>)
                            </div>`;
                    } else {
                        html += `
                            <div style="margin: 2px 0; white-space: nowrap">
                                <span data-cy="disorder-id">${idHtml}</span>
                            </div>
                        `;
                    }
                }
            }
            html += "</div>";
        }
        return html;
    }

    static panelFormatter(panels) {
        let panelHtml = "-";
        if (panels?.length > 0) {
            panelHtml = "";
            for (const panel of panels) {
                if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                    panelHtml += `
                        <div class="my-1 mx-0">
                            <a class="text-decoration-none" href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                ${panel.name} (${panel.source.project} v${panel.source.version})
                            </a>
                        </div>
                    `;
                } else {
                    panelHtml += `
                        <div class="my-1 mx-0">${panel.id}</div>
                    `;
                }
            }
        }
        return panelHtml;
    }

    //  Formats the files for the Catalog grids
    // @param {Array} files Either a list of fileIds or file objects
    // @param {Array} extensions A list of file extensions. If it is defined, only the file with extensions are returned.
    // @param {String} key The property to map onto in case `files` is an array of objects.
    // @returns {string} html code
    static fileFormatter(files, extensions, key) {
        let bamAndVcfFiles = [];
        if (files?.length > 0) {
            if (extensions?.length > 0) {
                files.forEach(file => {
                    const f = key ? file[key] : file;
                    for (const extension of extensions) {
                        if (f.endsWith(extension)) {
                            bamAndVcfFiles.push(f);
                            break;
                        }
                    }
                });
            } else {
                bamAndVcfFiles = key ? files.map(file => file[key]) : files;
            }

            if (bamAndVcfFiles?.length > 0) {
                let html = `<div class="text-nowrap">`;
                for (let i = 0; i < bamAndVcfFiles.length; i++) {
                    // Display first 3 files
                    if (i < 3) {
                        html += `
                            <div class="text-dark " style="font-size: 13px; margin: 2px 0">${bamAndVcfFiles[i]}</div>
                        `;
                    } else {
                        html += `<a class="text-link" style="cursor:pointer" tooltip-title="Files" tooltip-text='${bamAndVcfFiles.join("<br>")}'>... view all files (${bamAndVcfFiles.length})</a>`;
                        break;
                    }
                }
                html += "</div>";
                return html;
            }
        } else {
            return "-";
        }
    }

    static dateFormatter(value, row) {
        if (value) {
            return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
        }
        return "-";
    }

    static caseFormatter(clinicalAnalysisArray, row, individualId, opencgaSession) {
        if (clinicalAnalysisArray?.length > 0) {
            let result = "";
            for (const clinicalAnalysis of clinicalAnalysisArray) {
                result += `
                    <div class="my-1 mx-0">
                        <a title="Go to Case Interpreter" class="text-nowrap text-decoration-none" href="#interpreter/${opencgaSession.project.id}/${opencgaSession.study.id}/${clinicalAnalysis.id}">
                            <i aria-hidden="true" class="fas fa-user-md"></i> ${clinicalAnalysis.id} ${clinicalAnalysis.proband.id === individualId ? "(proband)" : ""}
                        </a>
                    </div>
                `;
            }
            return `<div class="d-grid gap-2 d-md-flex flex-column">${result}</div>`;
        } else {
            return "-";
        }
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

}
