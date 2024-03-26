/*
 * Copyright 2015-2024 OpenCB
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

    // static getStatuses() {
    //     return ["READY_FOR_INTERPRETATION", "READY_FOR_REPORT", "CLOSED", "REJECTED"];  // , "READY_FOR_REVIEW"
    // }

    static getInterpretationStatuses() {
        return ["IN_PROGRESS", "READY", "REJECTED"];
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

}

