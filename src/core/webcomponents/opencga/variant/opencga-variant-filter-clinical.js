/**
 * Created by Antonio Altamura on 08/10/2019.
 */

import {LitElement, html} from '/web_modules/lit-element.js';

export default class OpencgaVariantFilterClinical extends LitElement {
    constructor() {
        super();
        this._init();
    }
    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "ovfc" + Utils.randomString(6);

        this.sampleFilters = [];
        this.fileFilters = [];
        this.modeOfInheritance = "none";
        this.showModeOfInheritance = true;

        this._query = {};

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        console.log("changing:: ",changedProperties)
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver()
        }
        if (changedProperties.has("query")) {
            this.queryObserver()
        }
        if (changedProperties.has("configObserver")) {
            this.queryObserver()
        }
    }
    connectedCallback() {
        super.connectedCallback();

        // Render the first time after preparing the DOM
        this.clinicalAnalysisObserver(this.clinicalAnalysis);

        $('select.selectpicker').selectpicker('render');
    }

    // opencgaSessionObserver() {
    //     if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
    //         this.clinicalAnalysis = {};
    //     }
    // }

    configObserver(config) {
        this._config = {...this.getDefaultConfig(), ...config};
    }

    clinicalAnalysisObserver(clinicalAnalysis) {
        if (UtilsNew.isUndefinedOrNull(clinicalAnalysis)) {
            console.log("clinicalAnalysis is undefined or null: ", clinicalAnalysis);
            return;
        }

        /*
         * First, get and render individual options
         * Second, get and render files options
         */

        // We read Individuals from Clinical Analysis
        let individuals = [];
        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.family) && UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.family.members)) {
            individuals = clinicalAnalysis.family.members;
            this.showModeOfInheritance = true;
        } else {
            if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband)) {
                individuals = [clinicalAnalysis.proband];
            }
            this.showModeOfInheritance = false;
        }

        // Set new individuals setting the previous values selected
        if (UtilsNew.isNotEmptyArray(individuals)) {

            // Prepare data to be easier to query
            let _sampleFiltersMap = {};
            if (UtilsNew.isNotEmptyArray(this.sampleFilters)) {
                for (let sampleFilter of this.sampleFilters) {
                    _sampleFiltersMap[sampleFilter.id] = sampleFilter;
                }
            }

            // We iterate the individuals copying the previous values
            let _sampleFilters = [];
            for (let individual of individuals) {
                if (UtilsNew.isNotEmptyArray(individual.samples)) {
                    let fatherId = "-";
                    // If possible we use sample ID
                    if (individual.father !== undefined && individual.father.id !== undefined) {
                        fatherId = individual.father.id;
                        for (let ind of individuals) {
                            if (individual.father.id === ind.id) {
                                fatherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                                break;
                            }
                        }
                    }

                    let motherId = "-";
                    // If possible we use sample ID
                    if (individual.mother !== undefined && individual.mother.id !== undefined) {
                        motherId = individual.mother.id;
                        for (let ind of individuals) {
                            if (individual.mother.id === ind.id) {
                                motherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                                break;
                            }
                        }
                    }

                    // There should be just one sample per individual in the Clinical Analysis
                    let sample = individual.samples[0];
                    let _sampleFilter = {
                        id: sample.id,
                        proband: false,
                        affected: false,
                        sex: individual.sex,
                        // father: (individual.father !== undefined && individual.father.id !== undefined) ? individual.father.id : "-",
                        // mother: (individual.mother !== undefined && individual.mother.id !== undefined) ? individual.mother.id : "-",
                        father: fatherId,
                        mother: motherId,
                        genotypes: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].genotypes : this._config.defaultGenotypes,
                        dp: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].dp : "",
                    };

                    if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband) && individual.id === clinicalAnalysis.proband.id) {
                        _sampleFilter.proband = true;
                    }

                    if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.disorder) && UtilsNew.isNotEmptyArray(individual.disorders)) {
                        for (let disorder of individual.disorders) {
                            if (disorder.id === clinicalAnalysis.disorder.id) {
                                _sampleFilter.affected = true;
                            }
                        }
                    }

                    _sampleFilters.push(_sampleFilter);
                }
            }
            this.sampleFilters = _sampleFilters;
        } else {
            // There is an event and no individuals have been found
            this.sampleFilters = [];
        }


        // if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.files)) {
        //     // Prepare data to be easier to query
        //     let _fileFiltersMap = {};
        //     if (UtilsNew.isNotUndefinedOrNull(this.fileFilters)) {
        //         for (let fileFilter of this.fileFilters) {
        //             _fileFiltersMap[fileFilter.id] = fileFilter;
        //         }
        //     }
        //
        //     // We iterate the files copying the previous values
        //     // let _fileFilters = [];
        //     let _fileFiltersMap2 = {};
        //     for (let sampleId in clinicalAnalysis.files) {
        //         let sampleFiles = clinicalAnalysis.files[sampleId];
        //         for (let file of sampleFiles) {
        //             if (UtilsNew.isNotUndefinedOrNull(file.format) && file.format.toUpperCase() === "VCF") {
        //
        //                 if (_fileFiltersMap2[file.id] === undefined) {
        //                     let _fileFilter = {
        //                         id: file.id,
        //                         samples: [sampleId],
        //                         name: file.name,
        //                         path: file.path,
        //                         // qual: (UtilsNew.isNotUndefinedOrNull(_fileFiltersMap[file.id])) ? _fileFiltersMap[file.id].qual : "",
        //                         // filter: (UtilsNew.isNotUndefinedOrNull(_fileFiltersMap[file.id])) ? _fileFiltersMap[file.id].filter : "",
        //                         selected: (UtilsNew.isNotUndefinedOrNull(_fileFiltersMap[file.id])) ? _fileFiltersMap[file.id].selected : ""
        //                     };
        //                     _fileFiltersMap2[file.id] = _fileFilter;
        //                 } else {
        //                     _fileFiltersMap2[file.id].samples.push(sampleId);
        //                 }
        //
        //                 // _fileFilters.push(_fileFilter);
        //             }
        //         }
        //     }
        //
        //     this.fileFilters = [];
        //     for (let fileId in _fileFiltersMap2) {
        //         this.fileFilters.push(_fileFiltersMap2[fileId]);
        //     }
        //     // this.fileFilters = _fileFilters;
        // } else {
        //     this.fileFilters = [];
        // }

        this.renderSampleTable();
        // this.renderFileTable();

        this.notify();
    }

    /**
     * This function can not add or remove samples or file, this just changes the filters applied, if not present then is left empty.
     * @param query
     */
    queryObserver(query) {
        if (UtilsNew.isEmptyArray(this.sampleFilters) && UtilsNew.isEmptyArray(this.fileFilters)) {
            return;
        }

        if (UtilsNew.isNotUndefinedOrNull(query)) {
            // Reset all genotypes
            for (let sampleFilter of this.sampleFilters) {
                sampleFilter.genotypes = [];
            }

            if (UtilsNew.isNotUndefinedOrNull(query.genotype)) {
                // Assign new passed genotypes to EXISTING samples
                let genotypes = query.genotype.split(";");
                for (let genotype of genotypes) {
                    let sampleAndGenotype = genotype.split(":");
                    for (let sampleFilter of this.sampleFilters) {
                        if (sampleFilter.id === sampleAndGenotype[0]) {
                            sampleFilter.genotypes = sampleAndGenotype[1].split(",");
                            break;
                        }
                    }
                }
                delete this._query.sample;
            } else {
                // let _sampleIds = [];
                // for (let sampleFilter of this.sampleFilters) {
                //     _sampleIds.push(sampleFilter.id);
                // }
                // debugger
                // this._query.sample = _sampleIds.join(",");
                // debugger
            }
            this.renderSampleTable();


            // Set FILE filters
            // let _files = UtilsNew.isNotEmpty(query.file) ? query.file.split(";") : [];
            // for (let fileFilter of this.fileFilters) {
            //     fileFilter.selected = _files.includes(fileFilter.name);
            // }
            //
            // if (UtilsNew.isNotEmpty(query.qual)) {
            //     PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox").checked = true;
            //     PolymerUtils.getElementById(this._prefix + "FileFilterQualInput").value = query.qual;
            //     PolymerUtils.removeAttribute(this._prefix + "FileFilterQualInput", "disabled");
            // } else {
            //     if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox"))) {
            //         PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox").checked = false;
            //         PolymerUtils.getElementById(this._prefix + "FileFilterQualInput").value = "";
            //         PolymerUtils.setAttribute(this._prefix + "FileFilterQualInput", "disabled", true);
            //     }
            // }
            //
            // if (UtilsNew.isNotEmpty(query.filter) && query.filter === "PASS") {
            //     PolymerUtils.getElementById(this._prefix + "FileFilterPass").checked = true;
            // } else {
            //     if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterPass"))) {
            //         PolymerUtils.getElementById(this._prefix + "FileFilterPass").checked = false;
            //     }
            // }
            // this.renderFileTable();
        }
    }

    notify() {
        // let compHet = false;
        let missing = false;
        if (PolymerUtils.getElementById(this._prefix + "MissingCheckbox") !== null) {
            missing = PolymerUtils.getElementById(this._prefix + "MissingCheckbox").checked;
        }

        // File Filters
        // let _qual = undefined;
        // if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox"))
        //     && PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox").checked) {
        //     _qual = PolymerUtils.getElementById(this._prefix + "FileFilterQualInput").value;
        // }
        // let _filter = undefined;
        // if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterPass"))
        //     && PolymerUtils.getElementById(this._prefix + "FileFilterPass").checked) {
        //     _filter = "PASS";
        // }

        // Notify the sample change
        this.dispatchEvent(new CustomEvent("samplefilterschange", {
            detail: {
                sampleFilters: this.sampleFilters,
                modeOfInheritance: this.modeOfInheritance,
                // compoundHeterozygous: compHet,
                missing: missing,
                // fileFilters: this.fileFilters,
                // qual: _qual,
                // filter: _filter
            },
            bubbles: true,
            composed: true
        }));
    }

    onModeOfInheritance(e) {
        this.modeOfInheritance = e.target.value;
        let _this = this;
        this.opencgaSession.opencgaClient.variants().familyGenotypes({
            study: this.opencgaSession.study.fqn,
            family: this.clinicalAnalysis.family.id,
            disorder: this.clinicalAnalysis.disorder.id,
            modeOfInheritance: this.modeOfInheritance,
            completePenetrance: true
        }).then(function(response) {
            let genotypeResults = response.response[0].result[0];
            if (UtilsNew.isNotUndefinedOrNull(genotypeResults)) {
                let individualToSampleMap = {};
                for (let member of _this.clinicalAnalysis.family.members) {
                    if (UtilsNew.isNotEmptyArray(member.samples)) {
                        individualToSampleMap[member.samples[0].id] = member.id;
                    }
                }

                let countGenoypes = 0;
                for (let sampleFilter of _this.sampleFilters) {
                    // sampleFilter.genotypes = genotypeResults[sampleFilter.id];
                    sampleFilter.genotypes = genotypeResults[individualToSampleMap[sampleFilter.id]];
                    countGenoypes += sampleFilter.genotypes.length;
                }
                _this.renderSampleTable()

                if (countGenoypes > 0) {
                    PolymerUtils.hide(_this._prefix + "Warning")
                } else {
                    PolymerUtils.show(_this._prefix + "Warning")
                }

                _this.notify();
            }
        }).catch(function(response) {
            console.error(response);
        });
    }

    renderSampleTable() {
        let tr = "";
        for (let sampleFilter of this.sampleFilters) {
            let defaultValues = {
                gt00: (sampleFilter.genotypes.includes("0/0")) ? "checked" : "",
                gt01: (sampleFilter.genotypes.includes("0/1")) ? "checked" : "",
                gt11: (sampleFilter.genotypes.includes("1/1")) ? "checked" : "",
                dp: (sampleFilter.dp !== undefined && sampleFilter.dp > 0) ? sampleFilter.dp : "",
            };

            let sampleIcon = this._config.sexIConMap[sampleFilter.sex];
            let sampleIdStyle = (sampleFilter.affected) ? "color: darkred" : "font-weight: normal";
            sampleIdStyle += (sampleFilter.proband) ? ";font-weight: bold" : "";
            let sampleIdHtml = `<div>
                                            <span data-toggle="tooltip" data-placement="bottom" title="" style="${sampleIdStyle}">
                                                ${sampleFilter.id} <i class='fa ${sampleIcon} fa-lg' style='padding-left: 5px'></i>
                                            </span>
                                        </div>`;

            let probandHtml = "";
            if (sampleFilter.proband) {
                probandHtml = `<span data-toggle="tooltip" data-placement="bottom" title="Proband">
                                        <i class='fa fa-check' style='color: green'></i>
                                       </span>`;
            } else {
                probandHtml = `<span><i class='fa fa-times' style='color: red'></i></span>`;
            }

            let affectedHtml = "";
            if (sampleFilter.affected) {
                affectedHtml = `<span data-toggle="tooltip" data-placement="bottom" title="Affected">
                                        <i class='fa fa-check' style='color: green'></i>
                                       </span>`;
            } else {
                affectedHtml = `<span><i class='fa fa-times' style='color: red'></i></span>`;
            }

            tr += `
                            <tr data-sample="${sampleFilter.id}">
                                <td style="vertical-align: middle">
                                    ${sampleIdHtml}
                                </td>
                                <td style="padding-left: 20px">
                                    ${probandHtml}
                                </td>
                                <td style="padding-left: 20px">
                                    ${affectedHtml}
                                </td>
                                <td style="padding-left: 20px">
                                    <span>${sampleFilter.father}</span>
                                </td>
                                <td style="padding-left: 20px">
                                    <span>${sampleFilter.mother}</span>
                                </td>
                                <td style="padding-left: 20px">
                                    <input id="${this._prefix}${sampleFilter.id}00" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/0" ${defaultValues.gt00}>
                                </td>
                                <td style="padding-left: 20px">
                                    <input id="${this._prefix}${sampleFilter.id}01" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/1" ${defaultValues.gt01}>
                                </td>
                                <td style="padding-left: 20px">
                                    <input id="${this._prefix}${sampleFilter.id}11" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="1/1" ${defaultValues.gt11}>
                                </td>
                                <td style="padding-left: 10px">
                                    <input id="${this._prefix}${sampleFilter.id}DP" type="text" value="${defaultValues.dp}" class="form-control input-sm sample-dp-textbox" aria-label="..." placeholder="e.g. 15" style="width: 60px">
                                </td>

                            </tr>
                    `;
        }

// debugger
        let elementById = PolymerUtils.getElementById(this._prefix + "BasicTBody");
        if (UtilsNew.isNotUndefinedOrNull(elementById)) {
            // Set HTML into the table body
            elementById.innerHTML = tr;
            // Add or remove the message
            if (tr === "") {
                PolymerUtils.getElementById(this._prefix + "BasicTableMessage").innerHTML = "<span style=\"font-weight: bold\">No Samples selected</span>";
            } else {
                PolymerUtils.getElementById(this._prefix + "BasicTableMessage").innerHTML = "";
            }

            // Add event listener to DP textbox
            let checkboxes = PolymerUtils.getElementsByClassName("sample-checkbox");
            for (let dpTextbox of checkboxes) {
                dpTextbox.addEventListener('click', this.onSampleTableChange.bind(this));
            }

            // Add event listener to DP textbox
            let dpTextboxes = PolymerUtils.getElementsByClassName("sample-dp-textbox");
            for (let dpTextbox of dpTextboxes) {
                dpTextbox.addEventListener('keyup', this.onSampleTableChange.bind(this));
            }
        }
    }

    onSampleTableChange(e) {
        let table = PolymerUtils.getElementById(this._prefix + "BasicTable");
        let counter = 0;
        for (let row of table.rows) {
            if (row.dataset.sample !== undefined) {
                // Set GT values reading columns 5, 6 and 7
                this.sampleFilters[counter].genotypes = [];
                for (let i = 5; i <= 7; i++) {
                    if (row.children[i].children[0].checked) {
                        this.sampleFilters[counter].genotypes.push(row.children[i].children[0].dataset.gt)
                    }

                }

                // Set DP value
                this.sampleFilters[counter].dp = row.children[8].children[0].value;

                counter++;
            }
        }

        // Set MoI select to 'none' when clicked in GT
        if (UtilsNew.isNotUndefinedOrNull(e.currentTarget.dataset.gt)) {
            this.modeOfInheritance = "none";
            $("#" + this._prefix + "ModeOfInheritance").selectpicker('val', "none");
            PolymerUtils.hide(this._prefix + "Warning")
        }

        this.notify();
    }



    // renderFileTable() {
    //     if (UtilsNew.isUndefinedOrNull(this.clinicalAnalysis) || UtilsNew.isUndefinedOrNull(this.clinicalAnalysis.files)) {
    //         return;
    //     }
    //
    //     let tr = "";
    //     for (let fileFilter of this.fileFilters) {
    //         // Prepare the options in the FILTER dropdown and set the selected option
    //         // let options = "<option value='none'>None</option>";
    //         // for (let filterOption of filterValues) {
    //         //     if (filterOption === defaultValues.filter) {
    //         //         options += `<option value='${filterOption}' selected>${filterOption}</option>`;
    //         //     } else {
    //         //         options += `<option value='${filterOption}'>${filterOption}</option>`;
    //         //     }
    //         // }
    //
    //         // let lastSlashIdx = fileFilter.path.lastIndexOf("/");
    //         // let path = fileFilter.path.substring(0, lastSlashIdx + 8) + "...";
    //         let sampleHtml = "<div>";
    //         for (let sample of fileFilter.samples) {
    //             if (sample === this.clinicalAnalysis.proband.samples[0].id) {
    //                 sampleHtml += `<div><span style="color: darkred">${sample}</span></div>`;
    //             } else {
    //                 sampleHtml += `<div>${sample}</div>`;
    //             }
    //         }
    //         sampleHtml += "</div>";
    //         let selected = (fileFilter.selected) ? "checked" : "";
    //
    //         // <td style="vertical-align: middle"><span>${path}</span></td>
    //         tr += `
    //                 <tr data-file="${fileFilter.name}">
    //                     <td style="vertical-align: middle"><span>${sampleHtml}</span></td>
    //                     <td style="vertical-align: middle"><span>${fileFilter.name}</span></td>
    //                     <td style="vertical-align: middle; padding-left: 20px"><input type="checkbox" class="file-filter-checkbox" ${selected}></td>
    //                 </tr>
    //         `;
    //     }
    //
    //     let elementById = PolymerUtils.getElementById(this._prefix + "FileTBody");
    //     if (UtilsNew.isNotUndefinedOrNull(elementById)) {
    //         // Set HTML into the table body
    //         elementById.innerHTML = tr;
    //         // Add or remove the message
    //         if (tr === "") {
    //             PolymerUtils.getElementById(this._prefix + "FileTableMessage").innerHTML = "<span style=\"font-weight: bold\">No Files selected</span>";
    //         } else {
    //             PolymerUtils.getElementById(this._prefix + "FileTableMessage").innerHTML = "";
    //         }
    //
    //         // // Add event listener to Qual textbox
    //         // let dpTextboxes = PolymerUtils.getElementsByClassName("file-qual-textbox");
    //         // for (let dpTextbox of dpTextboxes) {
    //         //     dpTextbox.addEventListener('keyup', this.onFileTableChange.bind(this));
    //         // }
    //         //
    //         // Add event listener to FILTER textbox
    //         // let filterSelects = PolymerUtils.getElementsByClassName("file-filter-select");
    //         // for (let filterSelect of filterSelects) {
    //         //     filterSelect.addEventListener('change', this.onFileTableChange.bind(this));
    //         // }
    //
    //         // Add event listener to FILTER textbox
    //         let filterSelects = PolymerUtils.getElementsByClassName("file-filter-checkbox");
    //         for (let filterSelect of filterSelects) {
    //             filterSelect.addEventListener('click', this.onFileTableChange.bind(this));
    //         }
    //     }
    // }
    //
    // onFileTableChange(e) {
    //     let table = PolymerUtils.getElementById(this._prefix + "FileTable");
    //     let counter = 0;
    //     for (let row of table.rows) {
    //         if (row.dataset.file !== undefined) {
    //             this.fileFilters[counter].selected = row.children[2].children[0].checked;
    //             counter++;
    //         }
    //     }
    //     if (counter === 0) {
    //         PolymerUtils.setAttribute(this._prefix + "FileFilterQualCheckbox", "disabled", true);
    //         PolymerUtils.setAttribute(this._prefix + "FileFilterPass", "disabled", true);
    //     } else {
    //         PolymerUtils.removeAttribute(this._prefix + "FileFilterQualCheckbox", "disabled");
    //         PolymerUtils.removeAttribute(this._prefix + "FileFilterPass", "disabled");
    //     }
    //
    //     this.notify();
    // }
    //
    // onFileQualClick(e) {
    //     if (e.currentTarget.checked) {
    //         PolymerUtils.removeAttribute(this._prefix + "FileFilterQualInput", "disabled");
    //     } else {
    //         PolymerUtils.setAttribute(this._prefix + "FileFilterQualInput", "disabled", true);
    //     }
    //
    //     this.notify();
    // }
    //
    // onFileQualChange(e) {
    //     this.fileQual = e.currentTarget.value;
    //
    //     this.notify();
    // }

    getDefaultConfig() {
        return {
            // defaultGenotypes: ["0/1", "1/1"],
            defaultGenotypes: [],
            sexIConMap: {
                MALE: "fa-mars",
                FEMALE: "fa-venus",
                UNKNOWN: "fa-genderless"
            }
        }
    }


    render() {
        return html`
       <style include="jso-styles">
            /*.filter-option {*/
            /*font-size: 12px !important;*/
            /*}*/
            /*.dropdown-menu {*/
            /*font-size: 1em !important;*/
            /*}*/
        </style>

        <div class="row">

            <div class="col-md-12" style="padding: 0px 20px">
                <h4>Select Sample Filters</h4>
                <div style="padding: 5px 20px">
                    You can select the sample genotypes manually or select a <span style="font-weight: bold;margin: 0px">Mode of Inheritance</span>
                    in the dropdown below the table, this option is only available for Family analysis. Please, notice that if you want to execute a
                    <span style="font-weight: bold;margin: 0px">Compound Heterozygous</span> or <span style="font-weight: bold;margin: 0px">de Novo</span>
                    analysis you can go to the corresponding tools in the analysis toolbar.
                </div>
                <div style="padding: 0px 20px">
                    <table id="{{prefix}}BasicTable" class="table table-hover table-no-bordered">
                        <thead>
                        <tr>
                            <th rowspan="2">Sample</th>
                            <th rowspan="2">Proband</th>
                            <th rowspan="2">Affected</th>
                            <th rowspan="2">Father</th>
                            <th rowspan="2">Mother</th>
                            <th rowspan="1" colspan="3" style="text-align: center">Genotypes</th>
                            <th rowspan="2">Min. Depth</th>
                        </tr>
                        <tr>
                            <th scope="col" rowspan="2">HOM_REF</th>
                            <th scope="col" rowspan="2">HET</th>
                            <th scope="col" rowspan="2">HOM_ALT</th>
                        </tr>
                        </thead>
                        <tbody id="{{prefix}}BasicTBody"></tbody>
                    </table>
                </div>
                <div id="{{prefix}}BasicTableMessage" style="text-align: center"><span style="font-weight: bold">No Samples selected</span></div>
            </div>

            <template is="dom-if" if="{{showModeOfInheritance}}">
                <div class="col-md-12" style="padding: 10px 20px">
                    <div class="col-md-2" style="padding: 10px 25px 5px 25px">
                        <label>Mode of Inheritance</label>
                    </div>
                    <div class="col-md-3">
                        <select class="selectpicker" id="{{prefix}}ModeOfInheritance" data-size="8" style="font-size: 12px"
                                on-change="onModeOfInheritance">
                            <option value="none">None</option>
                            <option value="MONOALLELIC">Autosomal Dominant</option>
                            <option value="BIALLELIC">Autosomal Recessive</option>
                            <!--<option value="COMPOUND_HETEROZYGOUS">Compound Heterozygous (AR) </option>-->
                            <option value="XLINKED_MONOALLELIC">X-linked Dominant</option>
                            <option value="XLINKED_BIALLELIC">X-linked Recessive</option>
                            <option value="YLINKED">Y-linked</option>
                        </select>
                    </div>
                    <div class="col-md-7">
                        <div class="alert alert-warning" role="alert" id="{{prefix}}Warning" style="display: none;padding: 10px">
                            <span style="font-weight: bold;font-size: 1.20em">Warning:</span>&nbsp;The selected Mode of Inheritance is not compatible with the family pedigree .
                        </div>
                    </div>
                </div>
            </template>

            <div class="col-md-12" style="padding: 10px 20px">
                <div style="padding: 0px 25px">
                    <label>Other options</label>
                </div>
                <div style="padding: 5px 30px">
<!--                    <input type="checkbox" on-click="advancedModeButtonClick"><span style="padding-left: 5px">Include multi-allelic genotypes (e.g. 0/2, 1/2, ...)</span>-->
<!--                    <br>-->
                    <!--<input id="{{prefix}}CompHetCheckbox" type="checkbox" on-click="notify"><span style="padding-left: 5px">Compound Heterozygous</span>-->
                    <!--<br>-->
                    <input id="{{prefix}}MissingCheckbox" type="checkbox" on-click="notify"><span style="padding-left: 5px">Include parent missing (non-ref) allele calls</span>
                </div>
            </div>

<!--            <div class="col-md-12" style="padding: 10px 20px 5px 20px">-->
<!--                <h4>Select File Filters</h4>-->
<!--                <div style="padding: 5px 20px">-->
<!--                    <table id="{{prefix}}FileTable" class="table">-->
<!--                        <thead>-->
<!--                        <tr>-->
<!--                            <th scope="col" rowspan="1">Sample ID</th>-->
<!--                            <th scope="col" rowspan="1">File Name</th>-->
<!--&lt;!&ndash;                            <th scope="col" rowspan="1">File Path</th>&ndash;&gt;-->
<!--                            <th scope="col" rowspan="1">Select</th>-->
<!--                        </tr>-->
<!--                        </thead>-->
<!--                        <tbody id="{{prefix}}FileTBody"></tbody>-->
<!--                    </table>-->

<!--                    <div id="{{prefix}}FileTableMessage" style="text-align: center"><span style="font-weight: bold">No Files selected</span></div>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div class="col-md-12" style="padding: 0px 20px 5px 20px">-->
<!--                <div style="padding: 0px 25px">-->
<!--                    <label>Options</label>-->
<!--                </div>-->
<!--                <div style="padding: 5px 15px">-->
<!--                    <form class="form-horizontal">-->
<!--                        <div class="form-group col-md-12" style="margin-bottom: 5px">-->
<!--                            <div class="col-md-2">-->
<!--                                <input id="{{prefix}}FileFilterQualCheckbox" type="checkbox" on-click="onFileQualClick" disabled><span style="padding-left: 5px">Introduce min. QUAL</span>-->
<!--                                &lt;!&ndash;<span style="padding-left: 5px"><i class="fa fa-circle fa-xs" aria-hidden="true"> Introduce min. QUAL</i></span>&ndash;&gt;-->
<!--                            </div>-->
<!--                            <div class="col-md-10" style="width: 120px;padding-left: 5px">-->
<!--                                <input id="{{prefix}}FileFilterQualInput" type="text" class="form-control input-sm" style="padding: 5px 2px" on-keyup="onFileQualChange" disabled>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </form>-->
<!--                    <div class="col-md-12">-->
<!--                        <input id="{{prefix}}FileFilterPass" type="checkbox" on-click="notify" disabled><span style="padding-left: 5px">Only include PASS variants</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
        </div>
        `;
    }
}

customElements.define('opencga-variant-filter-clinical',OpencgaVariantFilterClinical);
