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

import UtilsNew from "../../core/utilsNew.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";

export default class CatalogGridFormatter {

    static phenotypesFormatter(value, row) {
        if (!value || !value?.length) {
            return "-";
        }
        const status = ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"];
        const tooltip = [...value].sort((a, b) => status.indexOf(a.status) - status.indexOf(b.status)).map(phenotype => {
            const result = [];
            if (phenotype.name) {
                result.push(UtilsNew.escapeHtml(phenotype.name));
                // Check if we have also the phenotype ID --> add the '-' separator
                if (phenotype.id && phenotype.id !== phenotype.name) {
                    result.push("-");
                }
            }
            // Add phenotype ID if exists
            if (phenotype.id && phenotype.id !== phenotype.name) {
                if (phenotype.source && phenotype.source.toUpperCase() === "HPO") {
                    result.push(`
                        <a target="_blank" href="${BioinfoUtils.getHpoLink(phenotype.id)}">${phenotype.id}</a>`);
                } else {
                    result.push(phenotype.id);
                }
            }
            // Add phenotype status if exists
            if (phenotype.status) {
                result.push(`(${phenotype.status})`);
            }
            return `<p>${result.join(" ")}</p>`;
        }).join("");
        if (value && value.length > 0) {
            return `<a tooltip-title="Phenotypes" tooltip-text='${tooltip}'> ${value.length} term${value.length > 1 ? "s" : ""} found</a>`;
        } else {
            // TODO Think about this
            return `<div>${tooltip}</div>`;
        }
    }

    static disorderFormatter(value, row) {
        if (value && value.id) {
            let idHtml;
            const split = value.id.split(":");
            switch (split[0]) {
                case "HP":
                    idHtml = `
                        <a href="${BioinfoUtils.getHpoLink(value.id)}" target="_blank">${value.id}
                            <i class="fas fa-external-link-alt" aria-hidden="true" style="padding-left: 5px"></i>
                        </a>`;
                    break;
                case "OMIM":
                    idHtml = `
                        <a href="https://omim.org/entry/${split[1]}" target="_blank">${value.id}
                            <i class="fas fa-external-link-alt" aria-hidden="true" style="padding-left: 5px"></i>
                        </a>`;
                    break;
                default:
                    idHtml = value.id;
                    break;
            }
            if (value.name) {
                return `<span data-cy="disorder-name">${value.name}</span> (<span style="white-space: nowrap" data-cy="disorder-id">${idHtml}</span>)`;
            } else {
                return `${idHtml}`;
            }
        } else {
            return "-";
        }
    }

    static panelFormatter(panels) {
        let panelHtml = "-";
        if (panels?.length > 0) {
            panelHtml = "";
            for (const panel of panels) {
                if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                    panelHtml += `
                        <div style="margin: 5px 0px">
                            <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                ${panel.name} (${panel.source.project} v${panel.source.version})
                            </a>
                        </div>`;
                } else {
                    panelHtml = panel.id;
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
        let results = [];
        if (files && files.length > 0) {
            if (extensions && extensions.length > 0) {
                files.forEach(file => {
                    const f = key ? file[key] : file;
                    for (const extension of extensions) {
                        if (f.endsWith(extension)) {
                            results.push(f);
                        }
                    }
                });
            } else {
                results = key ? files.map(file => file?.name) : files;
            }
            return results.length > 20 ? results.length + " files" : `<ul class="pad-left-15">${results.map(file => `<li class="break-word">${file}</li>`).join("")}</ul>`;
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
                    <div>
                        <a title="Go to Case Interpreter" class="btn btn-default btn-small ripple dropdown-toggle one-line" href="#interpreter/${opencgaSession.project.id}/${opencgaSession.study.id}/${clinicalAnalysis.id}">
                            <i aria-hidden="true" class="fas fa-user-md"></i> ${clinicalAnalysis.id} ${clinicalAnalysis.proband.id === individualId ? "(proband)" : ""}
                       </a>
                    </div>
                `;
            }
            return result;
        } else {
            return "-";
        }
    }

}
