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
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class ClinicalAnalysisManager {

    constructor(context, clinicalAnalysis, opencgaSession) {
        this.ctx = context;
        this.clinicalAnalysis = clinicalAnalysis;
        this.opencgaSession = opencgaSession;
    }

    // Clear all changed variants.
    reset() {
        this.clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
    }

    getProbandQc() {
        return this.clinicalAnalysis?.proband?.qualityControl;
    }

    getProbandSampleQc(sampleIdx = 0) {
        let qc = null;
        if (this.clinicalAnalysis?.proband?.samples.length > 0 && this.clinicalAnalysis.proband.samples[sampleIdx]?.qualityControl) {
            qc = this.clinicalAnalysis.proband.samples[sampleIdx].qualityControl;
        }
        return qc;
    }

    setInterpretationAsPrimary(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, {}, {
            study: this.opencgaSession.study.fqn,
            setAs: "PRIMARY"
        })
            .then(() => {
                // Notify interpretation saved
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    // title: "Interpretation Saved",
                    message: `Changed primary interpretation to '${interpretationId}'.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    createInterpretation(interpretation, callback) {
        const newInterpretation = interpretation || {
            clinicalAnalysisId: this.clinicalAnalysis.id,
            analyst: {
                id: this.opencgaSession.user.id,
            }
        };

        this.opencgaSession.opencgaClient.clinical().createInterpretation(this.clinicalAnalysis.id, newInterpretation, {
            study: this.opencgaSession.study.fqn,
        })
            .then(() => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    // title: "Interpretation Created",
                    message: "The new interpretation has been created.",
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred creating an interpretation: ", restResponse);
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    clearInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().clearInterpretation(this.clinicalAnalysis.id, interpretationId, {
            study: this.opencgaSession.study.fqn,
        })
            .then(() => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Interpretation '${interpretationId}' cleared.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred clearing an interpretation: ", restResponse);
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    deleteInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().deleteInterpretation(this.clinicalAnalysis.id, interpretationId, {
            study: this.opencgaSession.study.fqn
        })
            .then(() => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Interpretation '${interpretationId}' deleted.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred deleting an interpretation: ", restResponse);
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    #updateInterpretation(interpretationId, params, message, callback) {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, params, {
            study: this.opencgaSession.study.fqn
        })
            .then(() => {
                // Notify interpretation saved
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    message: message,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    lockInterpretation(interpretationId, callback) {
        this.#updateInterpretation(interpretationId, {locked: true}, `Interpretation '${interpretationId}' Locked.`, callback);
    }

    unLockInterpretation(interpretationId, callback) {
        this.#updateInterpretation(interpretationId, {locked: false}, `Interpretation '${interpretationId}' Unlocked.`, callback);
    }

    downloadInterpretation(interpretationId) {
        return this.opencgaSession.opencgaClient.clinical()
            .infoInterpretation(interpretationId, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                UtilsNew.downloadJSON(response?.responses?.[0]?.results?.[0], `interpretation-${interpretationId}.json`);
            })
            .catch(response => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    updateVariants(variants, primaryFinding = true, action = "UPDATE") {
        const field = primaryFinding ? "primaryFindings" : "secondaryFindings";
        // prepare interpretation object for the update
        const interpretation = {
            primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings || [],
            secondaryFindings: this.clinicalAnalysis.interpretation.secondaryFindings || [],
        };
        // check the action to perform
        // NOTE: variant can be an array of variants (for example in rearrangements)
        const variantsArray = Array.isArray(variants) ? variants : [variants];
        for (let i = 0; i < variantsArray.length; i++) {
            const variant = variantsArray[i];
            switch (action) {
                case "ADD":
                    // check if the variant is already in the primary findings
                    if (interpretation[field].find(v => v.id === variant.id)) {
                        console.error(`There must be an error, variant '${variant.id}' already exists in ${field}.`);
                        return Promise.reject(new Error(`Variant '${variant.id}' already exists in ${field}.`));
                    }
                    // add the variant to the primary/secondary findings
                    interpretation[field].push(variant);
                    break;
                case "UPDATE":
                    // find the index of the variant in the primary findings
                    const index = interpretation[field].findIndex(v => v.id === variant.id);
                    if (index === -1) {
                        // check if the variant exists in the other field
                        const otherField = primaryFinding ? "secondaryFindings" : "primaryFindings";
                        const otherIndex = interpretation[otherField].findIndex(v => v.id === variant.id);
                        if (otherIndex === -1) {
                            console.error(`There must be an error, variant '${variant.id}' does not exist in ${field}.`);
                            return Promise.reject(new Error(`Variant '${variant.id}' does not exist in ${field}.`));
                        }
                        // remove from the other field
                        interpretation[otherField] = interpretation[otherField].filter(v => v.id !== variant.id);
                        interpretation[field].push(variant);
                    } else {
                        // update the variant in the primary findings
                        interpretation[field][index] = variant;
                    }
                    break;
                case "REMOVE":
                    // remove from both primary and secondary findings
                    interpretation.primaryFindings = interpretation.primaryFindings.filter(v => v.id !== variant.id);
                    interpretation.secondaryFindings = interpretation.secondaryFindings.filter(v => v.id !== variant.id);
                    break;
            }
        }
        // update the interpretation
        const interpretationId = this.clinicalAnalysis.interpretation.id;
        return this.opencgaSession.opencgaClient.clinical()
            .updateInterpretation(this.clinicalAnalysis.id, interpretationId, interpretation, {
                study: this.opencgaSession.study.fqn,
                primaryFindingsAction: "SET",
                secondaryFindingsAction: "SET",
            })
            .then(() => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The interpretation has been updated.",
                });
            })
            .catch(response => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

}
