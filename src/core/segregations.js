import Utils from "./utils.js";
import UtilsNew from "./utilsNew.js";


export default class Segregations {

    static decisionTreeInheritance() {
        return {
            autoDominant: {
                last: false,
                true:{
                    last: false,
                    true: "0/1",
                    false: {
                        last: false,
                        true: "0/1",
                        false: "1/1,0/1"
                    }
                },
                false: "0/0"
            },
            autoRecessive: {
                last: false,
                true: "1/1",
                false: {
                    last: false,
                    true: "0/1",
                    false: {
                        last: false,
                        true: "0/1",
                        false:"0/0,0/1"
                    }
                }
            },
            xLinked: {
                last: false,
                male: {
                    last: false,
                    true: "1/1",
                    false: "0/0"
                },
                female: {
                    last: false,
                    true: "1/1",
                    false: {
                        last: false,
                        true: "0/1",
                        false: {
                            last: false,
                            true: "0/1",
                            false: "0/0,0/1"
                        }
                    }
                }
            },
            yLinked: {
                last: false,
                male: {
                    last: false,
                    true: "1/1",
                    false: "0/0"
                },
                female: "-"

            }
        };
    }

    static inheritanceMode(modeInheritance, clinicalAnalysis, genotypeSamples, samples){
        // Set by default to false properties to get values from decision Tree
        let isHealthyOffsrping  = false
        let isHealthyParent  = false;
        let isDiseased = false;
        let isMale = false;
        if (UtilsNew.isNotUndefinedOrNull(modeInheritance) && modeInheritance !== "none") {
            // If we have a family from clinical Analysis
            if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis) && UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.family) && UtilsNew.isNotEmptyArray(clinicalAnalysis.family.members)) {
                // foreach member in family
                clinicalAnalysis.family.members.forEach((member) => {
                    // a member is diseased if has some phenotypes
                    isDiseased = UtilsNew.isNotUndefinedOrNull(member.phenotypes) && UtilsNew.isNotEmptyArray(member.phenotypes);
                    isMale = member.sex === "MALE" ? "male" :  "female";
                    let res = null;
                    // Depends of modeInheritance we select how get value from decisionTree
                    switch (modeInheritance) {
                        case "autoDominant":
                            res = this.autoDominantMode(member, modeInheritance, isDiseased, false, false, clinicalAnalysis);
                            break;
                        case "autoRecessive":
                            res = this.autoRecessiveMode(member, modeInheritance, isDiseased, false, false, clinicalAnalysis);
                            break;
                        case "xLinked":
                            res = this.xLinkedMode(member, modeInheritance, isDiseased, null, null, isMale, clinicalAnalysis);
                            break;
                        case "yLinked":
                            // We do not need do more checks when we have yLinked at least for default config. We just need isDiseased.
                            res = this._getValueModeDecisionTree(modeInheritance, isDiseased, null, null, isMale);
                            break;
                        default:
                            res = "-";
                            break;
                    }
                    // We set for every sample and genotype values from decision tree its resultin genotypeSamples
                    if (res) {
                        let genotypesValue = res.split(",");
                        genotypesValue.forEach((value) => {
                            member.samples.forEach((sample) => {
                                genotypeSamples[sample.name][value] = true;
                            });
                        });
                    }
                });
            } else {
                // If we have single from clinical Analysis
                if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis) && UtilsNew.isNotEmptyArray(clinicalAnalysis.subjects)) {
                    // We loop for every subjects selected when it is single analysis.
                    clinicalAnalysis.subjects.forEach((individual) => {
                        isMale = individual.sex === "MALE" ? "male" : "female";
                        individual.samples.forEach((sample) => {
                            isHealthyOffsrping  = false;
                            isHealthyParent  = false;
                            isDiseased = false;
                            if (UtilsNew.isNotUndefinedOrNull(sample)) {
                                isDiseased = UtilsNew.isNotUndefinedOrNull(individual.phenotypes) && UtilsNew.isNotEmpty(individual.phenotypes) && individual.phenotypes.length > 0;
                                // When it is single, we call _getValueModeDecisionTree because do not have offSpring or parents, so we do not need consider other logic to get results.
                                let res = this._getValueModeDecisionTree(modeInheritance, isDiseased, isHealthyOffsrping, isHealthyParent, isMale );

                                // We set for every sample and genotype values from decision tree its result in genotypeSamples
                                if (res) {
                                    let genotypesValue = res.split(",");
                                    genotypesValue.forEach((value) => {
                                        genotypeSamples[sample.name][value] = true;
                                    });
                                }
                            }
                        });

                    });
                } else {
                    // If we do not have a clinical Analysis we work directly with samples which user has selected.
                    samples.forEach((sample) => {
                        let _individual = sample.attributes.individual;
                        isMale = _individual.sex === "MALE" ? "male" : "female";
                        isHealthyOffsrping = false;
                        isHealthyParent = false;
                        isDiseased = false;
                        if (UtilsNew.isNotUndefinedOrNull(sample)) {
                            isDiseased = UtilsNew.isNotUndefinedOrNull(_individual.phenotypes) && UtilsNew.isNotEmpty(_individual.phenotypes) && _individual.phenotypes.length > 0;
                            // When it is just a sample, we call _getValueModeDecisionTree because do not have offSpring or parents, so we do not need consider other logic to get results.
                            let res = this._getValueModeDecisionTree(modeInheritance, isDiseased, isHealthyOffsrping, isHealthyParent, isMale);
                            if (res) {
                                let genotypesValue = res.split(",");
                                genotypesValue.forEach((value) => {
                                    genotypeSamples[sample.name][value] = true;
                                });
                            }
                        }
                    });
                }
            }
        }

        return Object.assign({},genotypeSamples);
    }

    static autoDominantMode(member, modeInheritance, isDiseased, isHealthyOffsrping=false, isHealthyParent=false, clinicalAnalysis) {
        // If some child of current member do not have a diseased
        let diseasedOffspring = clinicalAnalysis.family.members.filter((memberChild)=>{
            return (memberChild.father.id === member.id || memberChild.mother.id === member.id) &&
                (UtilsNew.isUndefinedOrNull(memberChild.phenotypes) || (UtilsNew.isNotUndefinedOrNull(memberChild.phenotypes) && UtilsNew.isEmptyArray(memberChild.phenotypes)));
        });

        if (UtilsNew.isNotUndefinedOrNull(diseasedOffspring) && UtilsNew.isNotEmptyArray(diseasedOffspring)){
            isHealthyOffsrping =  true;
        }

        // If any parents of current member do not have a diseased
        if (UtilsNew.isNotUndefinedOrNull(member.father) || UtilsNew.isNotUndefinedOrNull(member.mother)){
            let diseasedParent = clinicalAnalysis.family.members.filter((memberParent)=>{
                return (memberParent.id === member.father.id || memberParent.id === member.mother.id)
                    && ( UtilsNew.isUndefinedOrNull(memberParent.phenotypes) || (UtilsNew.isNotUndefinedOrNull(memberParent.phenotypes) && UtilsNew.isEmptyArray(memberParent.phenotypes)));
            });

            if (UtilsNew.isNotUndefinedOrNull(diseasedParent) && UtilsNew.isNotEmptyArray(diseasedParent)){
                isHealthyParent =  true;
            }
        }

        return this._getValueModeDecisionTree(modeInheritance, isDiseased, isHealthyOffsrping, isHealthyParent);
    }

    static autoRecessiveMode(member, modeInheritance, isDiseased, isDiseasedOffspring=false, isDiseasedParent=false, clinicalAnalysis) {
        // We do this because FEMALE xLinkedMode is equal to autoRecessiveMode
        return this.xLinkedMode(member, modeInheritance, isDiseased, isDiseasedOffspring, isDiseasedParent, "female", clinicalAnalysis);
    }

    static xLinkedMode(member, modeInheritance, isDiseased, isDiseasedOffspring=false, isDiseasedParent=false, isMale="male", clinicalAnalysis) {
        if(isMale !== "male") {
            // If some child of current member has a diseased
            let diseasedOffspring = clinicalAnalysis.family.members.filter((memberChild)=>{
                return (memberChild.father.id === member.id || memberChild.mother.id === member.id) &&
                    (UtilsNew.isNotUndefinedOrNull(memberChild.phenotypes) && UtilsNew.isNotEmptyArray(memberChild.phenotypes));
            });

            if (UtilsNew.isNotUndefinedOrNull(diseasedOffspring) && UtilsNew.isNotEmptyArray(diseasedOffspring)){
                isDiseasedOffspring =  true;
            }

            // If any parents of current member has a diseased
            if (UtilsNew.isNotUndefinedOrNull(member.father) || UtilsNew.isNotUndefinedOrNull(member.mother)){
                let diseasedParent = clinicalAnalysis.family.members.filter((memberParent)=>{
                    return (memberParent.id === member.father.id || memberParent.id === member.mother.id)
                        && (UtilsNew.isNotUndefinedOrNull(memberParent.phenotypes) && UtilsNew.isNotEmptyArray(memberParent.phenotypes));
                });

                if (UtilsNew.isNotUndefinedOrNull(diseasedParent) && UtilsNew.isNotEmptyArray(diseasedParent)){
                    isDiseasedParent =  true;
                }
            }
        }
        // We do not need do more checks when we have male xLinked. We just need isDiseased
        return this._getValueModeDecisionTree(modeInheritance, isDiseased, isDiseasedOffspring, isDiseasedParent, isMale);

    }

    static _getValueModeDecisionTree(modeInheritance, isDiseased, isHealthyOffsrping, isHealthyParent, isMale){
        let treeCurrent = this.decisionTreeInheritance();
        if (UtilsNew.isNotUndefinedOrNull(modeInheritance)){
            treeCurrent = treeCurrent[modeInheritance];
            // If modeInheritance is equal to yLinked or xLinked we have to do one more step choosing between male and female.
            if (modeInheritance === "yLinked" || modeInheritance === "xLinked"){
                if (UtilsNew.isNotUndefinedOrNull(isDiseased) && UtilsNew.isNotUndefinedOrNull(treeCurrent.last) && !treeCurrent.last){
                    treeCurrent = treeCurrent[isMale];
                } else {
                    // If isDiseased not exists we return false
                    return false;
                }
            }

            // If isDiseased exists
            if (UtilsNew.isNotUndefinedOrNull(isDiseased) && UtilsNew.isNotUndefinedOrNull(treeCurrent.last) && !treeCurrent.last){
                treeCurrent = treeCurrent[isDiseased];
                // If isHealthyOffsrping exists
                if (UtilsNew.isNotUndefinedOrNull(isHealthyOffsrping) && UtilsNew.isNotUndefinedOrNull(treeCurrent.last) && !treeCurrent.last){
                    treeCurrent = treeCurrent[isHealthyOffsrping];
                    // If isHealthyParent exists
                    if (UtilsNew.isNotUndefinedOrNull(isHealthyParent) && UtilsNew.isNotUndefinedOrNull(treeCurrent.last) && !treeCurrent.last){
                        treeCurrent = treeCurrent[isHealthyParent];
                    }
                }
            }
            return treeCurrent;
        }
        // If modeInheritance do not exist return false
        return false;
    }
}
