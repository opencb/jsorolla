
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
import Region from "../../core/bioinfo/region.js";
import Utils from "../../core/utils.js";
import GenomeBrowser from "../genome-browser.js";
import FeatureRenderer from "../renderers/feature-renderer.js";
import FeatureTrack from "../tracks/feature-track.js";
import GeneTrack from "../tracks/gene-track.js";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter.js";
import SequenceRenderer from "../renderers/sequence-renderer.js";
import "../config.js";


/** *************************************************************************/
/** *** Setting Defaults Params                                           ***/
/** *************************************************************************/

// We first parse URL to check (and overwrite) if a CellBase Host and Version have been provided
// if we do not provide the CellbaseHost then you will get those configured in the file "config.js"

let CELLBASE_HOST = "http://bioinfo.hpc.cam.ac.uk/cellbase";
let CELLBASE_VERSION = "v4";
let AVAILABLE_SPECIES;

const cellBaseClientConfig = {
    hosts: CELLBASE_HOST,
    version: CELLBASE_VERSION,
    cache: {active: false}
};


const queryParams = URI.parseQuery(window.location.search);
if (typeof queryParams.CELLBASE_HOST !== "undefined") {
    CELLBASE_HOST = queryParams.CELLBASE_HOST;
}
CELLBASE_HOST = "bioinfo.hpc.cam.ac.uk/cellbase";

if (typeof queryParams.CELLBASE_VERSION !== "undefined") {
    CELLBASE_VERSION = queryParams.CELLBASE_VERSION;
}

console.log("CellBase Host: " + CELLBASE_HOST, " - CellBase Version: " + CELLBASE_VERSION);
// let cellBaseClientConfig = new CellBaseClientConfig(hosts = CELLBASE_HOST, version = CELLBASE_VERSION);
// cellBaseClientConfig.cache.active = false;

const cellbaseClient = new CellBaseClient(cellBaseClientConfig);

// GenomeBrowser, Region and Species:
// let genomeBrowser;
const region = new Region({chromosome: "13", start: 32996311, end: 32996450}); // initial region


function getSpecies(callback) {
    cellbaseClient.getMeta("species").then(function (r) {
        const taxonomies = r.response[0].result[0];
        for (const taxonomy in taxonomies) {
            const newSpecies = [];
            for (let i = 0; i < taxonomies[taxonomy].length; i++) {
                const species = taxonomies[taxonomy][i];
                for (let j = 0; j < species.assemblies.length; j++) {
                    const s = Utils.clone(species);
                    s.assembly = species.assemblies[j];
                    delete s.assemblies;
                    newSpecies.push(s);
                }
            }
            taxonomies[taxonomy] = newSpecies;
        }
        callback(taxonomies);
    });
}

function run() {
    const species = AVAILABLE_SPECIES.vertebrates[0];
    const genomeBrowser = new GenomeBrowser({
        client: cellbaseClient,
        cellBaseHost: CELLBASE_HOST,
        cellBaseVersion: CELLBASE_VERSION,
        target: "application",
        width: document.querySelector("#application").getBoundingClientRect().width,
        region: region,
        species: species,
        autoRender: true,
        resizable: true,
        karyotypePanelConfig: {
            collapsed: false,
            collapsible: true
        },
        chromosomePanelConfig: {
            collapsed: false,
            collapsible: true
        },
        //            navigationBarConfig: {
        //                componentsConfig: {
        //                }
        //            },
        handlers: {
            "region:change": function (e) {
                console.log(e);
            }
        }
    });

    const tracks = [];

    /** *************************************************************************/
    /** *** Demo Gene overview Track using FeatureTrack and Cellbase adapter  ***/
    /** *************************************************************************/

    const renderer = new FeatureRenderer(FEATURE_TYPES.gene);
    renderer.on({
        "feature:click": function (event) {
            // feature click event example
            console.log(event);
        }
    });

    const featureTrack = new FeatureTrack({
        title: "Gene overview",
        minHistogramRegionSize: 20000000,
        maxLabelRegionSize: 10000000,
        height: 80,
        renderer: renderer,
        dataAdapter: new CellBaseAdapter(cellbaseClient, "genomic", "region", "gene", {
            exclude: "transcripts,chunkIds"
        }, {
            chunkSize: 100000
        })
    });
    genomeBrowser.addOverviewTrack(featureTrack);

    /** *************************************************************************/
    /** *** Demo Sequence Track using FeatureTrack and Cellbase adapter       ***/
    /** *************************************************************************/

    const sequence = new FeatureTrack({
        title: "Sequence",
        height: 20,
        visibleRegionSize: 200,
        renderer: new SequenceRenderer(),
        dataAdapter: new CellBaseAdapter(cellbaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100})
    });
    tracks.push(sequence);

    /** ************************************************************************/
    /** *** Demo Gene Track using GeneTrack and Cellbase adapter             ***/
    /** ************************************************************************/

    const gene = new GeneTrack({
        title: "Gene",
        minHistogramRegionSize: 20000000,
        maxLabelRegionSize: 10000000,
        minTranscriptRegionSize: 200000,
        height: 120,
        cellbase: {
            "host": CELLBASE_HOST,
            "version": CELLBASE_VERSION,
            "species": "hsapiens"
        }
        //            renderer: new GeneRenderer({
        //                handlers: {
        //                    'feature:click': function(e) {
        //                        console.log(e)
        //                    }
        //                }
        //            })
        //            dataAdapter: new CellBaseAdapter(cellbaseClient, "genomic", "region", "gene", {
        //                exclude: 'transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence'
        //            }, {
        //                chunkSize: 100000
        //            })
    });
    tracks.push(gene);

    // The user can change the render and adapter as in the commented example

    /** *************************************************************************/
    /** ***   Demo SNP Track using FeatureTrack and Cellbase adapter          ***/
    /** *************************************************************************/

    const snp = new FeatureTrack({
        title: "Variation",
        featureType: "SNP",
        minHistogramRegionSize: 12000,
        maxLabelRegionSize: 3000,
        height: 120,
        exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples",

        renderer: new FeatureRenderer(FEATURE_TYPES.snp),

        dataAdapter: new CellBaseAdapter(cellbaseClient, "genomic", "region", "snp", {
            exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
        }, {
            chunkSize: 10000
        })
    });
    tracks.push(snp);


    genomeBrowser.addTrack(tracks);
    genomeBrowser.draw();
}

getSpecies(function (s) {
    AVAILABLE_SPECIES = s;
    run();
});
