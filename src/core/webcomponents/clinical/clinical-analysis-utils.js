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

export default class ClinicalAnalysisUtils {

    static getStatuses() {
        return ["READY_FOR_INTERPRETATION", "READY_FOR_REPORT", "CLOSED", "REJECTED"];
    }

    static getProbandQc(clinicalAnalysis) {
        return clinicalAnalysis?.proband?.qualityControl;
    }

    static getProbandSampleQc(clinicalAnalysis, sampleIdx = 0) {
        let qc = null;
        if (clinicalAnalysis?.proband?.samples.length > 0 && clinicalAnalysis.proband.samples[sampleIdx]?.qualityControl) {
            qc = clinicalAnalysis.proband.samples[sampleIdx].qualityControl;
        }
        return qc;
    }

    static chromosomeFilterSorter(chromosomeCount) {
        let filtered = Object.assign({}, ...Object.entries(chromosomeCount).map(([ch, val]) => {
            if (!isNaN(ch) || ["X", "Y", "MT"].includes(ch)) return {[ch]: val};
        }));
        let ordered = {};
        Object.keys(filtered).sort((a, b) => {
            const chA = a;
            const chB = b;
            const A = Boolean(parseInt(chA));
            const B = Boolean(parseInt(chB));
            if (A && !B) return -1;
            if (!A && B) return 1;
            if (!A && !B) return chA.length < chB.length ? -1 : chA < chB ? -1 : 1;
            return chA - chB;
        }).forEach(k => ordered[k] = filtered[k]);
        return ordered;
    }

    static updateInterpretation(clinicalAnalysis, interpretation, opencgaSession, callback) {
        if (!clinicalAnalysis) {
            console.error("It is not possible have this error");
            return;
        }

        let _interpretation = {
            primaryFindings: [],
            ...clinicalAnalysis.interpretation,
            // clinicalAnalysisId: clinicalAnalysis.id,
            methods: [{name: "IVA"}]
        };

        _interpretation.primaryFindings = JSON.parse(JSON.stringify(clinicalAnalysis.interpretation.primaryFindings));
        for (let variant of _interpretation.primaryFindings) {
            // delete variant.checkbox;
            if (!variant.attributes.creationDate) {
                variant.attributes.creationDate = new Date().getTime();
            }
        }
        clinicalAnalysis.interpretation = _interpretation;
        debugger
        opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysis.id, clinicalAnalysis.interpretation.id, clinicalAnalysis.interpretation,
            {
                study: opencgaSession.study.fqn,
                primaryFindingsAction: "SET",
                secondaryFindingsAction: "SET",
            })
            .then(restResponse => {
                Swal.fire(
                    "Interpretation Saved",
                    "Primary findings have been saved.",
                    "success"
                );
                callback(clinicalAnalysis);
                // this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
                //     detail: {
                //         clinicalAnalysis: clinicalAnalysis
                //     },
                //     bubbles: true,
                //     composed: true
                // }));
            })
            .catch(restResponse => {
                console.error(restResponse);
                //optional chaining is to make sure the response is a restResponse instance
                const msg = restResponse?.getResultEvents?.("ERROR")?.map(event => event.message).join("<br>") ?? "Server Error";
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    html: msg
                });
            });
    }
}
