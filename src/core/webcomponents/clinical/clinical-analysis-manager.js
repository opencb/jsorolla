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

export default class ClinicalAnalysisManager {

    constructor(clinicalAnalysis, opencgaSession) {
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

    /**
     * clear all changed variants.
     */
    reset() {
        this.init();

        this.clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
    }

    getStatuses() {
        return ["READY_FOR_INTERPRETATION", "READY_FOR_REPORT", "CLOSED", "REJECTED"];
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
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, interpretationId, {},
            {
                study: this.opencgaSession.study.fqn,
                saveAs: "PRIMARY"
            })
            .then(restResponse => {
                callback(this.clinicalAnalysis);

                // Notify
                Swal.fire(
                    "Interpretation Saved",
                    "Primary findings have been saved.",
                    "success"
                );
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

    updateInterpretation(comment, callback) {
        if (this.state.addedVariants.length === 0 && this.state.removedVariants.length === 0) {
            console.log("Nothing to do");
            return;
        }

        // Prepare interpretation object for the update
        let interpretation = {
            primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings
        };
        // Check if a comment is provided
        if (comment && comment.message) {
            interpretation.comments = [comment];
        }

        // Add selected variants
        if (this.state.addedVariants.length > 0) {
            for (let addedVariant of this.state.addedVariants) {
                let index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === addedVariant.id);
                if (index === -1) {
                    interpretation.primaryFindings.push(addedVariant);
                } else {
                    console.error("There must be an error, variant " + addedVariant.id + " already exist.");
                }
            }
        }

        // Remove variants
        if (this.state.removedVariants.length > 0) {
            for (let removedVariant of this.state.removedVariants) {
                let index = this.clinicalAnalysis.interpretation.primaryFindings.findIndex(v => v.id === removedVariant.id);
                if (index >= 0) {
                    interpretation.primaryFindings.splice(index, 1);
                } else {
                    console.error("There must be an error, variant " + removedVariant.id + " seems to not exist.");
                }
            }
        }

        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id, interpretation,
            {
                study: this.opencgaSession.study.fqn,
                primaryFindingsAction: "SET",
                // secondaryFindingsAction: "SET",
            })
            .then(restResponse => {
                callback(this.clinicalAnalysis);

                // Notify
                Swal.fire(
                    "Interpretation Saved",
                    "Primary findings have been saved.",
                    "success"
                );

                // Reset
                this.state = {...this.state, addedVariants: [], removedVariants: []};
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

    createInterpretation(interpretation, callback) {
        if (!interpretation) {
            let lastVersion = this.clinicalAnalysis.interpretation.id;
            if (this.clinicalAnalysis.secondaryInterpretations?.length > 0) {
                lastVersion = this.clinicalAnalysis.secondaryInterpretations[this.clinicalAnalysis.secondaryInterpretations.length - 1].id;
            }
            let interpretationVersion = Number.parseInt(lastVersion.split(".")[1]) + 1;
            interpretation = {
                id: this.clinicalAnalysis.id + "." + interpretationVersion,
                clinicalAnalysisId: this.clinicalAnalysis.id,
                analyst: {
                    id: this.opencgaSession.user.id,
                }
            };
        }

        this.opencgaSession.opencgaClient.clinical().createInterpretation(this.clinicalAnalysis.id, interpretation, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                callback(this.clinicalAnalysis);

                Swal.fire(
                    "Interpretation Created",
                    "New interpretation created.",
                    "success"
                );
            })
            .catch(restResponse => {
                console.error("An error occurred creating an interpretation: ", restResponse);
                const msg = restResponse?.getResultEvents?.("ERROR")?.map(event => event.message).join("<br>") ?? "Server Error";
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    html: msg
                });
            });
    }

    clearInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().clearInterpretation(this.clinicalAnalysis.id, interpretationId, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                callback(this.clinicalAnalysis);

                Swal.fire(
                    "Interpretation Clear",
                    "Interpretation cleared.",
                    "success"
                );
            })
            .catch(restResponse => {
                console.error("An error occurred clearing an interpretation: ", restResponse);
                const msg = restResponse?.getResultEvents?.("ERROR")?.map(event => event.message).join("<br>") ?? "Server Error";
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    html: msg
                });
            });
    }

    deleteInterpretation(interpretationId, callback) {
        this.opencgaSession.opencgaClient.clinical().deleteInterpretation(this.clinicalAnalysis.id, interpretationId, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                callback(this.clinicalAnalysis);

                Swal.fire(
                    "Interpretation Deleted",
                    "Interpretation deleted.",
                    "success"
                );
            })
            .catch(restResponse => {
                console.error("An error occurred deleting an interpretation: ", restResponse);
                const msg = restResponse?.getResultEvents?.("ERROR")?.map(event => event.message).join("<br>") ?? "Server Error";
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    html: msg
                });
            });
    }
}
