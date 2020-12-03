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

import UtilsNew from "../../utilsNew.js";


export default class CatalogGridFormatter {

    static phenotypesFormatter(value, row) {
        if (value && value.length > 0) {
            const tooltip = [...value].sort((a, b) => a.status === "OBSERVED" ? -1 : 1).map(phenotype => {
                return `
                    <p>
                        ${phenotype.source && phenotype.source.toUpperCase() === "HPO" ?
                    `<span>${phenotype.name} (<a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id}</a>) - ${phenotype.status}</span>` :
                    `<span>${phenotype.id} - ${phenotype.status}</span>`}
                    </p>`;
            }).join("");
            return `<a tooltip-title="Phenotypes" tooltip-text='${tooltip}'> ${value.length} term${value.length > 1 ? "s" : ""} found</a>`;
        } else {
            return "-";
        }
    }

    static disorderFormatter(value, row) {
        if (value && value.id) {
            const idHtml = value.id.startsWith("OMIM:") ?
                `<a href="https://omim.org/entry/${value.id.split(":")[1]}" target="_blank">${value.id}
                        <i class="fas fa-external-link-alt" aria-hidden="true" style="padding-left: 5px"></i>
                   </a>` :
                `${value.id}`;
            if (value.name) {
                return `${value.name} <span style="white-space: nowrap">(${idHtml})</span>`;
            } else {
                return `${idHtml}`;
            }
        } else {
            return "-";
        }
    }

    /**
     *  Formats the files for the Catalog grids
     * @param {Array} files Either a list of fileIds or file objects
     * @param {Array} extensions A list of file extensions. If it is defined, only the file with extensions are returned.
     * @param {String} key The property to map onto in case `files` is an array of objects.
     * @returns {string} html code
     */
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
            return results.length > 20 ? results.length + " files" : `<ul class="pad-left-15">${results.map(file => `<li>${file}</li>`).join("")}</ul>`;
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
        if (clinicalAnalysisArray && clinicalAnalysisArray.length > 0) {
            let result = "";
            for (const clinicalAnalysis of clinicalAnalysisArray) {
                result += `
                    <div>
                        <a href="#interpreter/${opencgaSession.project.id}/${opencgaSession.study.id}/${clinicalAnalysis.id}">
                            ${clinicalAnalysis.id} ${clinicalAnalysis.proband.id === individualId ? "(proband)" : ""}
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
