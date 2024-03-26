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

export {OpenCGAClient} from "./core/clients/opencga/opencga-client.js";
export {CellBaseClient} from "./core/clients/cellbase/cellbase-client.js";
export {ReactomeClient} from "./core/clients/reactome/reactome-client.js";

export OpencgaVariantBrowser from "./webcomponents/variant/variant-browser.js";
export VariantBeacon from "./webcomponents/variant/variant-beacon.js";
export OpencgaProjects from "./webcomponents/user/opencga-projects.js";
export OpencgaSampleBrowser from "./webcomponents/sample/sample-browser.js";
export OpencgaFileBrowser from "./webcomponents/file/opencga-file-browser.js";
export OpencgaTranscriptView from "./webcomponents/opencga/opencga-transcript-view.js";
export OpencgaGeneView from "./webcomponents/opencga/opencga-gene-view.js";
export OpencgaSampleView from "./webcomponents/sample/sample-view.js";
export OpencgaProteinView from "./webcomponents/opencga/opencga-protein-view.js";
export OpencgaLogin from "./webcomponents/user/opencga-login.js";
export OpencgaIndividualBrowser from "./webcomponents/individual/individual-browser.js";
export OpencgaFamilyBrowser from "./webcomponents/family/opencga-family-browser.js";
export OpencgaCohortBrowser from "./webcomponents/cohort/cohort-browser.js";
export OpencgaClinicalAnalysisBrowser from "./webcomponents/clinical/opencga-clinical-analysis-browser.js";
export OpencgaGwasAnalysis from "./webcomponents/variant/analysis/opencga-gwas-analysis.js";
export VariantRdInterpreter from "./webcomponents/variant/interpretation/variant-interpreter-browser-rd.js";
export VariantCancerInterpreter from "./webcomponents/variant/interpretation/variant-interpreter-browser-cancer.js";

export Utils from "./core/utils.js";
export UtilsNew from "./core/utils-new.js";
export NotificationUtils from " ./webcomponents/NotificationUtils.js";

//export NotificationUtils from "./webcomponents/NotificationUtils.js"; we don't need it since it is not directly called from iva-app, it's a 2rd level dep.
