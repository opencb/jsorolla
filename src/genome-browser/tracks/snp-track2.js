import FeatureTrack from "./feature-track";
import FeatureRenderer from "../renderers/feature-renderer";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";

export const SNP_BIOTYPE_COLORS = {
    "2KB_upstream_variant": "#a2b5cd",
    "5KB_upstream_variant": "#a2b5cd",
    "500B_downstream_variant": "#a2b5cd",
    "5KB_downstream_variant": "#a2b5cd",
    "3_prime_UTR_variant": "#7ac5cd",
    "5_prime_UTR_variant": "#7ac5cd",
    "coding_sequence_variant": "#458b00",
    "complex_change_in_transcript": "#00fa9a",
    "frameshift_variant": "#ff69b4",
    "incomplete_terminal_codon_variant": "#ff00ff",
    "inframe_codon_gain": "#ffd700",
    "inframe_codon_loss": "#ffd700",
    "initiator_codon_change": "#ffd700",
    "non_synonymous_codon": "#ffd700",
    "intergenic_variant": "#636363",
    "intron_variant": "#02599c",
    "mature_miRNA_variant": "#458b00",
    "nc_transcript_variant": "#32cd32",
    "splice_acceptor_variant": "#ff7f50",
    "splice_donor_variant": "#ff7f50",
    "splice_region_variant": "#ff7f50",
    "stop_gained": "#ff0000",
    "stop_lost": "#ff0000",
    "stop_retained_variant": "#76ee00",
    "synonymous_codon": "#76ee00",
    "other": "#000000"
};

export const snp = {
    label: function (f) {
        const change = f.reference + " > " + f.alternate;
        let name = "";
        if ("name" in f) {
            name += f.name;
        } else if ("id" in f) {
            name += f.id;
        }
        return name + " " + change;
    },
    tooltipTitle: function (f) {
        const change = f.reference + " > " + f.alternate;
        let name = "";
        if ("name" in f) {
            name += f.name;
        } else if ("id" in f) {
            name += f.id;
        }
        return "SNP" + " - <span class=\"ok\">" + name + " " + change + "</span>";
    },
    getTipCommons: function (f) {
        const strand = (f.strand !== null) ? f.strand : "NA";
        return `start-end:&nbsp;<span style="font-weight: bold">${f.start}-${f.end} (${strand})</span><br>` +
            `length:&nbsp;<span style="font-weight: bold; color:#005fdb">${(f.end - f.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span><br>`;
    },
    tooltipText: function (f) {
        let mafString = "N/A";
        if (typeof f.annotation.minorAlleleFreq !== "undefined") {
            mafString = f.annotation.minorAlleleFreq + " (" + f.annotation.minorAllele + ")";
        }
        return "alleles:&nbsp;<span class=\"ssel\">" + f.reference + "/" + f.alternate + "</span><br>"
            + this.getTipCommons(f)
            + "conseq. type :&nbsp;<span class=\"ssel\">" + f.annotation.displayConsequenceType + "</span><br>"
            + "1000G MAF:&nbsp;<span class=\"ssel\">" + mafString + "</span><br>";

    },
    color: function (f) {
        return SNP_BIOTYPE_COLORS[f.annotation.displayConsequenceType];
    },
    infoWidgetId: "id",
    strokeColor: "#555",
    height: 8,
    histogramColor: "orange"
};

/* **************************************************/
/* Create a Variant SNP track for genome-browser    */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/* **************************************************/

export default class SnpTrack2 {

    constructor(args) {
        this._config = {...this.getDefaultConfig(), ...args};
    }

    getDefaultConfig() {
        return {
            title: "Variation",
            featureType: "SNP",
            minHistogramRegionSize: 12000,
            maxLabelRegionSize: 3000,
            height: 120,
            exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
        };
    }

    createTrack() {
        return new FeatureTrack({
            title: this._config.title,
            featureType: this._config.featureType,
            minHistogramRegionSize: this._config.minHistogramRegionSize,
            maxLabelRegionSize: this._config.maxLabelRegionSize,
            height: this._config.height,
            exclude: this._config.exclude,
            renderer: new FeatureRenderer(FEATURE_TYPES.snp),
            dataAdapter: new CellBaseAdapter(this._config.cellbaseClient, "genomic", "region", "snp", {
                exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
            }, {
                chunkSize: 10000
            })
        });
    }

}
