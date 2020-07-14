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

    static getProbandQc(clinicalAnalysis) {
        return  clinicalAnalysis?.proband?.qualityControl;
    }

    static getProbandSampleQc(clinicalAnalysis, sampleIdx = 0) {
        let qc = null;
        if (clinicalAnalysis?.proband?.samples.length > 0 && clinicalAnalysis.proband.samples[sampleIdx]?.qualityControl) {
            qc = clinicalAnalysis.proband.samples[sampleIdx].qualityControl;
        }
        return qc;
    }

    static chromosomeFilterSorter(chromosomeCount) {
        let filtered = Object.assign({}, ...Object.entries(chromosomeCount).map( ([ch, val]) => {
            if(Boolean(parseInt(ch)) || ["X", "Y", "MT"].includes(ch)) return {[ch]: val}
        }))
        let ordered = {};
        Object.keys(filtered).sort( (a,b) => {
            const chA = a;
            const chB = b;
            const A = Boolean(parseInt(chA))
            const B = Boolean(parseInt(chB))
            if(A && !B) return -1;
            if(!A && B) return 1;
            if(!A && !B) return chA.length < chB.length ? -1 : chA < chB ? -1 : 1
            return chA - chB;
        }).forEach(k => ordered[k] = filtered[k]);
        return ordered;
    }

    /* TODO individual-mendelian-errors-view and sample-variant-stats-view have different data strucutres for chromosome. Adapt the method for both
    static chromosomeFilterSorter(chromAggregation) {
        const filtered = chromAggregation.filter( ch => Boolean(parseInt(ch.chromosome)) || ["X", "Y", "MT"].includes(ch.chromosome));
        filtered.sort( (a,b) => {
            const chA = a.chromosome;
            const chB = b.chromosome;
            const A = Boolean(parseInt(chA))
            const B = Boolean(parseInt(chB))
            if(A && !B) return -1;
            if(!A && B) return 1;
            if(!A && !B) return chA.length < chB.length ? -1 : chA < chB ? -1 : 1
            return chA - chB;
        })
        return filtered;
    }*/
}
