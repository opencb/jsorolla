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

import LitUtils from "../commons/utils/lit-utils.js";

export default class ClinicalAnalysisManager {

    constructor(context, clinicalAnalysis, opencgaSession) {
        this.ctx = context;
        this.clinicalAnalysis = clinicalAnalysis;
        this.opencgaSession = opencgaSession;

        this.init();
    }

    init() {
        this.state = {
            addedVariants: [],
            removedVariants: [],
            updatedVariants: []
        };
    }

    // Clear all changed variants.
    reset() {
        this.init();
        this.clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
    }

    // getStatuses() {
    //     return ["READY_FOR_INTERPRETATION", "READY_FOR_REPORT", "CLOSED", "REJECTED"];
    // }

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


    addVariant(variant) {
        // First, check if the variant was selected to be removed
        let index = this.state.removedVariants.findIndex(v => v.id === variant.id);
        if (index >= 0) {
            this.state.removedVariants.splice(index, 1);
        } else {
            // Second, check variant is new and selected to be added
            index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === variant.id);
            if (index === -1) {
                this.state.addedVariants.push(variant);
            } else {
                // Third, this cannot happen, variant must exist somewhere
                console.error("There must be an error, variant " + variant.id + " seems to exist.");
            }
        }
        this.state = {...this.state};
    }

    removeVariant(variant) {
        // First, check if the variant was selected to be added
        let index = this.state.addedVariants.findIndex(v => v.id === variant.id);
        if (index >= 0) {
            this.state.addedVariants.splice(index, 1);
        } else {
            // Second, check if the variant was added to be inserted but not inserted yet
            index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === variant.id);
            if (index >= 0) {
                this.state.removedVariants.push(variant);
            } else {
                // Third, this cannot happen, variant must exist somewhere
                console.error("There must be an error, variant " + variant.id + " seems to not exist.");
            }
        }
        this.state = {...this.state};
    }

    setInterpretationAsPrimary(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, {}, {
            study: this.opencgaSession.study.fqn,
            setAs: "PRIMARY"
        })
            .then(() => {
                // Notify interpretation saved
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", null, {
                    // title: "Interpretation Saved",
                    message: `Changed primary interpretation to '${interpretationId}'.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
            });
    }

    updateInterpretation(comment, callback) {
        if (this.state.addedVariants.length === 0 && this.state.removedVariants.length === 0) {
            // console.log("Nothing to do");
            return;
        }

        // Prepare interpretation object for the update
        const interpretation = {
            primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings
        };
        // Check if a comment is provided
        if (comment && comment.message) {
            interpretation.comments = [comment];
        }

        // Add selected variants
        if (this.state.addedVariants.length > 0) {
            for (const addedVariant of this.state.addedVariants) {
                const index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === addedVariant.id);
                if (index === -1) {
                    interpretation.primaryFindings.push(addedVariant);
                } else {
                    console.error("There must be an error, variant " + addedVariant.id + " already exist.");
                }
            }
        }

        // Remove variants
        if (this.state.removedVariants.length > 0) {
            for (const removedVariant of this.state.removedVariants) {
                const index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === removedVariant.id);
                if (index >= 0) {
                    interpretation.primaryFindings.splice(index, 1);
                } else {
                    console.error("There must be an error, variant " + removedVariant.id + " seems to not exist.");
                }
            }
        }

        const interpretationId = this.clinicalAnalysis.interpretation.id;
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, interpretation, {
            study: this.opencgaSession.study.fqn,
            primaryFindingsAction: "SET",
            // secondaryFindingsAction: "SET",
        })
            .then(() => {
                // Notify
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", null, {
                    // title: "Interpretation saved",
                    message: "The interpretation has been updated.",
                });
                callback(this.clinicalAnalysis);

                // Reset internal state
                this.state = {...this.state, addedVariants: [], removedVariants: []};
            })
            .catch(response => {
                // console.error(response);
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
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
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", {
                    // title: "Interpretation Created",
                    message: "The new interpretation has been created.",
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred creating an interpretation: ", restResponse);
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
            });
    }

    clearInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().clearInterpretation(this.clinicalAnalysis.id, interpretationId, {
            study: this.opencgaSession.study.fqn,
        })
            .then(() => {
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", null, {
                    message: `Interpretation '${interpretationId}' cleared.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred clearing an interpretation: ", restResponse);
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
            });
    }

    deleteInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().deleteInterpretation(this.clinicalAnalysis.id, interpretationId, {
            study: this.opencgaSession.study.fqn
        })
            .then(() => {
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", null, {
                    message: `Interpretation '${interpretationId}' deleted.`,
                });
                callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred deleting an interpretation: ", restResponse);
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
            });
    }

    updateVariant(variant, interpretation, callback) {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretation.id, {primaryFindings: [variant]}, {
            study: this.opencgaSession.study.fqn,
            primaryFindingsAction: "REPLACE",
        })
            .then(() => {
                LitUtils.dispatchCustomEvent(this.ctx, "notifySuccess", null, {
                    // title: "Variant Updated",
                    message: `Variant '${variant.id}' has been updated.`,
                });
                // callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred deleting an interpretation: ", restResponse);
                LitUtils.dispatchCustomEvent(this.ctx, "notifyResponse", response);
            });
    }

}
