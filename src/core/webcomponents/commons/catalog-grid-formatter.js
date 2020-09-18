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

    constructor(opencgaSession, config) {
        this.opencgaSession = opencgaSession;
        this.config = config;

        this._prefix = UtilsNew.randomString(8);
    }

    phenotypesFormatter(value, row) {
        if (value && value.length > 0) {
            const tooltip = [...value].sort( (a,b) => a.status === "OBSERVED" ? -1 : 1).map(phenotype => {
                return `
                    <p>
                        ${phenotype.source && phenotype.source.toUpperCase() === "HPO"
                    ? `<span>${phenotype.name} (<a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id}</a>) - ${phenotype.status}</span>`
                    : `<span>${phenotype.id} - ${phenotype.status}</span>`}
                    </p>`;
            }).join("");
            return `<a tooltip-title="Phenotypes" tooltip-text='${tooltip}'> ${value.length} term${value.length > 1 ? "s" : ""} found</a>`;
        } else {
            return "-";
        }
    }

    disorderFormatter(value, row) {
        if (value && value.id) {
            let idHtml = value.id.startsWith("OMIM:")
                ? `<a href="https://omim.org/entry/${value.id.split(":")[1]}" target="_blank">${value.id}
                        <i class="fas fa-external-link-alt" aria-hidden="true" style="padding-left: 5px"></i>
                   </a>`
                : `${value.id}`;
            if (value.name) {
                return `${value.name} <span style="white-space: nowrap">(${idHtml})</span>`;
            } else {
                return `${idHtml}`;
            }
        } else {
            return "-";
        }
    }

    fileFormatter(fileIds, extensions) {
        if (fileIds && fileIds.length > 0) {
            let results = [];
            for (let fileId of fileIds) {
                if (extensions && extensions.length > 0) {
                    for (let extension of extensions) {
                        if (fileId.endsWith(extension)) {
                            let fields = fileId.split(":");
                            results.push(fields[fields.length - 1]);
                            break;
                        }
                    }
                } else {
                    let fields = fileId.split(":");
                    results.push(fields[fields.length - 1]);
                }
            }
            return results.join("<br>");
        } else {
            return "-";
        }
        // return values?.length
        //     ? values
        //         // .filter(fileId => fileId.endsWith("vcf") || fileId.endsWith("vcf.gz") || fileId.endsWith("bam"))
        //         .filter(fileId => fileId.endsWith("vcf") || fileId.endsWith("vcf.gz") || fileId.endsWith("bam"))
        //         .map(fileId => {
        //             let fields = fileId.split(":");
        //             return fields[fields.length - 1];
        //         })
        //         .join("<br>")
        //     : "-";
    }

    dateFormatter(value, row) {
        if (value) {
            return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
        }
        return "-";
    }

    caseFormatter(clinicalAnalysis, row, individualId, opencgaSession) {
        if (clinicalAnalysis && clinicalAnalysis.id) {
            return `
                <a href="#interpreter/${opencgaSession.project.id}/${opencgaSession.study.id}/${clinicalAnalysis.id}">
                    ${clinicalAnalysis.id} ${clinicalAnalysis.proband.id === individualId ? "(proband)" : ""}
                </a>
            `;
        } else {
            return "-";
        }
    }

    addTooltip(selector, title, content, config) {
        $(selector).qtip({
            content: {
                title: title,
                text: function (event, api) {
                    if (UtilsNew.isNotEmpty(content)) {
                        return content;
                    } else {
                        return $(this).attr("data-tooltip-text");
                    }
                }
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

}
