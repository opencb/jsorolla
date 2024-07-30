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

import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

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
        // Remove this variant from the list of updated variants (if has been added)
        this.state.updatedVariants = this.state.updatedVariants.filter(v => v.id !== variant.id);
        this.state = {...this.state};
    }

    // TODO: rename this method
    updateSingleVariant(variant) {
        const index = this.state.updatedVariants.findIndex(v => v.id === variant.id);
        if (index >= 0) {
            this.state.updatedVariants[index] = variant; // Update variant value
        } else {
            this.state.updatedVariants.push(variant);
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

    updateInterpretationVariants(comment, callback) {
        if (this.state.addedVariants.length === 0 && this.state.removedVariants.length === 0 && this.state.updatedVariants.length === 0) {
            // console.log("Nothing to do");
            return;
        }

        // Prepare interpretation object for the update
        const interpretation = {
            primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings,
            comments: [],
        };
        // Check if a comment is provided
        if (comment?.message) {
            interpretation.comments.push(comment);
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

        // Update variants
        if (this.state.updatedVariants.length > 0) {
            this.state.updatedVariants.forEach(variant => {
                const index = interpretation.primaryFindings.findIndex(v => v.id === variant.id);
                if (index >= 0) {
                    interpretation.primaryFindings[index] = variant; // Update variant
                } else {
                    console.error("There must be an error, variant " + variant.id + " seems to not exist.");
                }
            });
        }

        const interpretationId = this.clinicalAnalysis.interpretation.id;
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, interpretation, {
            study: this.opencgaSession.study.fqn,
            primaryFindingsAction: "SET",
            // secondaryFindingsAction: "SET",
        }).then(() => {
            // Notify
            NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                // title: "Interpretation saved",
                message: "The interpretation has been updated.",
            });
            callback(this.clinicalAnalysis);

            // Reset internal state
            this.state = {
                ...this.state,
                addedVariants: [],
                removedVariants: [],
                updatedVariants: [],
            };
        }).catch(response => {
            // console.error(response);
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

    updateVariant(variant, interpretation, callback) {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretation.id, {primaryFindings: [variant]}, {
            study: this.opencgaSession.study.fqn,
            primaryFindingsAction: "REPLACE",
        })
            .then(() => {
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_SUCCESS, {
                    // title: "Variant Updated",
                    message: `Variant '${variant.id}' has been updated.`,
                });
                // callback(this.clinicalAnalysis);
            })
            .catch(response => {
                // console.error("An error occurred deleting an interpretation: ", restResponse);
                NotificationUtils.dispatch(this.ctx, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

}
