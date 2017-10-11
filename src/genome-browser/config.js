
const CELLBASE_HOST = "bioinfo.hpc.cam.ac.uk/cellbase";
const CELLBASE_VERSION = "v4";

const OPENCGA_HOST = "bioinfo.hpc.cam.ac.uk/hgva";
const OPENCGA_USER = "";
const OPENCGA_PASSWORD = "";


const CODON_CONFIG = {
    "": {text: "", color: "transparent"},
    "R": {text: "Arg", color: "#BBBFE0"},
    "H": {text: "His", color: "#BBBFE0"},
    "K": {text: "Lys", color: "#BBBFE0"},

    "D": {text: "Asp", color: "#F8B7D3"},
    "E": {text: "Glu", color: "#F8B7D3"},

    "F": {text: "Phe", color: "#FFE75F"},
    "L": {text: "Leu", color: "#FFE75F"},
    "I": {text: "Ile", color: "#FFE75F"},
    "M": {text: "Met", color: "#FFE75F"},
    "V": {text: "Val", color: "#FFE75F"},
    "P": {text: "Pro", color: "#FFE75F"},
    "A": {text: "Ala", color: "#FFE75F"},
    "W": {text: "Trp", color: "#FFE75F"},
    "G": {text: "Gly", color: "#FFE75F"},


    "T": {text: "Thr", color: "#B3DEC0"},
    "S": {text: "Ser", color: "#B3DEC0"},
    "Y": {text: "Tyr", color: "#B3DEC0"},
    "Q": {text: "Gln", color: "#B3DEC0"},
    "N": {text: "Asn", color: "#B3DEC0"},
    "C": {text: "Cys", color: "#B3DEC0"},

    "X": {text: " X ", color: "#f0f0f0"},
    "*": {text: " * ", color: "#DDDDDD"}
};

const GENE_BIOTYPE_COLORS = {
    "3prime_overlapping_ncrna": "Orange",
    "ambiguous_orf": "SlateBlue",
    "antisense": "SteelBlue",
    "disrupted_domain": "YellowGreen",
    "IG_C_gene": "#FF7F50",
    "IG_D_gene": "#FF7F50",
    "IG_J_gene": "#FF7F50",
    "IG_V_gene": "#FF7F50",
    "lincRNA": "#8b668b",
    "miRNA": "#8b668b",
    "misc_RNA": "#8b668b",
    "Mt_rRNA": "#8b668b",
    "Mt_tRNA": "#8b668b",
    "ncrna_host": "Fuchsia",
    "nonsense_mediated_decay": "seagreen",
    "non_coding": "orangered",
    "non_stop_decay": "aqua",
    "polymorphic_pseudogene": "#666666",
    "processed_pseudogene": "#666666",
    "processed_transcript": "#0000ff",
    "protein_coding": "#a00000",
    "pseudogene": "#666666",
    "retained_intron": "goldenrod",
    "retrotransposed": "lightsalmon",
    "rRNA": "indianred",
    "sense_intronic": "#20B2AA",
    "sense_overlapping": "#20B2AA",
    "snoRNA": "#8b668b",
    "snRNA": "#8b668b",
    "transcribed_processed_pseudogene": "#666666",
    "transcribed_unprocessed_pseudogene": "#666666",
    "unitary_pseudogene": "#666666",
    "unprocessed_pseudogene": "#666666",
    // "": "orangered",
    "other": "#000000"
};

const SNP_BIOTYPE_COLORS = {
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

const SEQUENCE_COLORS = {A: "#009900", C: "#0000FF", G: "#857A00", T: "#aa0000", N: "#555555"};

const SAM_FLAGS = [
    ["read paired", 0x1],
    ["read mapped in proper pair", 0x2],
    ["read unmapped", 0x4],
    ["mate unmapped", 0x8],
    ["read reverse strand", 0x10],
    ["mate reverse strand", 0x20],
    ["first in pair", 0x40],
    ["second in pair", 0x80],
    ["not primary alignment", 0x100],
    ["read fails platform/vendor quality checks", 0x200],
    ["read is PCR or optical duplicate", 0x400]
];

const FEATURE_TYPES = {

    //methods
    formatTitle: function (str) {
        let s = str;
        if (str) {
            str.replace(/_/gi, " ");
            s = s.charAt(0).toUpperCase() + s.slice(1);
        }
        return s;
    },
    getTipCommons: function (f) {
        let strand = (f.strand !== null) ? f.strand : "NA";
        return `start-end:&nbsp;<span style="font-weight: bold">${f.start}-${f.end} (${strand})</span><br>` +
            // `strand:&nbsp;<span style="font-weight: bold">${strand}</span><br>` +
            `length:&nbsp;<span style="font-weight: bold; color:#005fdb">${(f.end - f.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span><br>`;
    },
    getTipTitleCommons: function (f) {
        let tokens = [];
        if (f.featureType) tokens.push(f.featureType);
        if (f.id) tokens.push(f.id);
        if (f.name) tokens.push(f.name);
        return tokens.join(" - ");
    },
    getLabelCommons: function (f) {
        let tokens = [];
        if (f.id) tokens.push(f.id);
        if (f.name) tokens.push(f.name);
        return tokens.join(" - ");
    },
    _getSimpleKeys: function (f) {
        let s = "";
        for (key in f) {
            if (key == "start" || key == "end" || key == "id" || key == "name" || key == "length") {
                continue;
            }
            if (_.isNumber(f[key]) || _.isString(f[key])) {
                s += key + ":&nbsp;<span style=\"font-weight: bold\">" + f[key] + "</span><br>"
            }
        }
        return s
    },

    //items
    sequence: {
        color: SEQUENCE_COLORS
    },
    undefined: {
        label: function (f) {
            let str = "";
            str += f.chromosome + ":" + f.start + "-" + f.end;
            return str;
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#aaa",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "lightgray",
    },
    gene: {
        label: function (f) {
            let name = (f.name != null) ? f.name : f.id;
            let str = "";
            str += (f.strand < 0 || f.strand == "-") ? "<" : "";
            str += " " + name + " ";
            str += (f.strand > 0 || f.strand == "+") ? ">" : "";
            if (f.biotype != null && f.biotype != "") {
                str += " [" + f.biotype + "]";
            }
            return str;
        },
        tooltipTitle: function (f) {
            let name = (f.name !== null) ? f.name : f.id;
            return FEATURE_TYPES.formatTitle("Gene") + " - <span class=\"ok\">" + name + "</span>";
        },
        tooltipText: function (f) {
            let color = GENE_BIOTYPE_COLORS[f.biotype];
            return "id:&nbsp;<span class=\"ssel\">" + f.id + "</span><br>" +
                "biotype:&nbsp;<span class=\"emph\" style=\"color:" + color + ";\">" + f.biotype + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f) +
                "source:&nbsp;<span class=\"ssel\">" + f.source + "</span><br><br>" +
                "description:&nbsp;<span class=\"emph\">" + f.description + "</span><br>";
        },
        color: function (f) {
            return GENE_BIOTYPE_COLORS[f.biotype];
        },
        infoWidgetId: "id",
        height: 4,
        histogramColor: "lightblue"
    },
    snp: {
        label: function (f) {
            let change = f.reference + " > " + f.alternate;
            let name = "";
            if("name" in f){
                name += f.name;
            }else if("id" in f){
                name += f.id;
            }
            return name + " " + change;
        },
        tooltipTitle: function (f) {
            let change = f.reference + " > " + f.alternate;
            let name = "";
            if("name" in f){
                name += f.name;
            }else if("id" in f){
                name += f.id;
            }
            return "SNP" + " - <span class=\"ok\">" +  name + " " + change + "</span>";
        },
        tooltipText: function (f) {
            let mafString = "N/A";
            if (typeof f.annotation.minorAlleleFreq !== "undefined") {
                mafString = f.annotation.minorAlleleFreq + " (" + f.annotation.minorAllele + ")";
            }
            return "alleles:&nbsp;<span class=\"ssel\">" + f.reference + "/" + f.alternate + "</span><br>"
                + FEATURE_TYPES.getTipCommons(f)
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
    },
    vcf: {
        label: function (f) {
            return f.id;
            try {
                let fields = f.sampleData.split("\t");
            } catch (e) {
                //Uncaught TypeError: Cannot call method 'split' of undefined
                console.log(e)
            }

            if (fields.length > 10 || fields.length == 9)
                return f.id + " " + f.ref + "/" + f.alt + "";
            else {
                var gt = fields[9].split(":")[0];
                if (gt.indexOf(".") != -1 || gt.indexOf("-") != -1)
                    return gt;
                var label = "";
                var alt = f.alt.split(",");
                if (gt.charAt(0) == "0")
                    label = f.ref;
                else {
                    var pos = gt.charAt(0) - 1;
                    label = alt[pos];
                }
                label += gt.charAt(1);
                if (gt.charAt(2) == "0")
                    label += f.ref;
                else {
                    var pos = gt.charAt(2) - 1
                    label += alt[pos]
                }

                return label;
            }
        },
        tooltipTitle: function (f) {
            return "VCF variant - <span class=\"ok\">" + f.id + "</span>";
        },
        tooltipText: function (f) {
            return "alleles (ref/alt):&nbsp;<span class=\"emph\">" + f.reference + "/" + f.alternate + "</span><br>" +
                "quality:&nbsp;<span class=\"emph\">" + f.quality + "</span><br>" +
                "filter:&nbsp;<span class=\"emph\">" + f.filter + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f);
        },
        color: function (f) {
            return "black";
        },
        infoWidgetId: "id",
        height: 8,
        histogramColor: "gray"
    },
    gff2: {
        label: function (f) {
            var str = "";
            str += f.label;
            return str;
        },
        tooltipTitle: function (f) {
            return f.featureType.toUpperCase() +
                " - <span class=\"ok\">" + f.label + "</span>";
        },
        tooltipText: function (f) {
            return "score:&nbsp;<span class=\"emph\">" + f.score + "</span><br>" +
                "frame:&nbsp;<span class=\"emph\">" + f.frame + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f);
        },
        getColor: function (f) {
            return "black";
        },
        height: 8,
        histogramColor: "gray"
    },
    gff3: {
        label: function (f) {
            var str = "";
            str += f.label;
            return str;
        },
        tooltipTitle: function (f) {
            return f.featureType.toUpperCase() +
                " - <span class=\"ok\">" + f.label + "</span>";
        },
        tooltipText: function (f) {
            return "score:&nbsp;<span class=\"emph\">" + f.score + "</span><br>" +
                "frame:&nbsp;<span class=\"emph\">" + f.frame + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f);
        },
        color: function (f) {
            return "black";
        },
        height: 8,
        histogramColor: "gray",
        infoWidgetId: "id",
        handlers: {
            "feature:mouseover": function (e) {
                console.log(e)
            },
            "feature:click": function (e) {
                console.log(e)
            }
        }
    },
    gtf: {
        label: function (f) {
            var str = "";
            str += f.label;
            return str;
        },
        tooltipTitle: function (f) {
            return f.featureType.toUpperCase() +
                " - <span class=\"ok\">" + f.label + "</span>";
        },
        tooltipText: function (f) {
            return "score:&nbsp;<span class=\"emph\">" + f.score + "</span><br>" +
                "frame:&nbsp;<span class=\"emph\">" + f.frame + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f);
        },
        color: function (f) {
            return "black";
        },
        height: 8,
        histogramColor: "gray",
        infoWidgetId: "id",
        handlers: {
            "feature:mouseover": function (e) {
                console.log(e)
            },
            "feature:click": function (e) {
                console.log(e)
            }
        }
    },
    bed: {
        label: function (f) {
            var str = "";
            str += f.label;
            return str;
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.formatTitle(f.featureType);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f);
        },
        color: function (f) {
            //XXX convert RGB to Hex
            var rgbColor = new Array();
            rgbColor = f.itemRgb.split(",");
            var hex = function (x) {
                var hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
                return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            };
            var hexColor = hex(rgbColor[0]) + hex(rgbColor[1]) + hex(rgbColor[2]);
            return "#" + hexColor;
        },
        height: 8,
        histogramColor: "orange",
        infoWidgetId: "id",
        handlers: {
            "feature:mouseover": function (e) {
                console.log(e)
            },
            "feature:click": function (e) {
                console.log(e)
            }
        }
    },
    bam: {
        explainFlags: function (flags) {
            var summary = "<div style=\"background:#FFEF93;font-weight:bold;\">flags : <span>" + flags + "</span></div>";
            for (var i = 0; i < SAM_FLAGS.length; i++) {
                if (SAM_FLAGS[i][1] & flags) {
                    summary += SAM_FLAGS[i][0] + "<br>";
                }
            }
            return summary;
        },
        label: function (f) {
            return "Read  " + f.chromosome + ":" + f.start + "-" + f.end;
        },
        tooltipTitle: function (f) {
            return "Read" + " - <span class=\"ok\">" + f.QNAME + "</span>";
        },
        tooltipText: function (f) {
            f.strand = this.strand(f);
            var cigar = "";
            for (var i = 0; i < f.differences.length; i++) {
                var d = f.differences[i];
                cigar += d.length + d.op
            }

            var one = "CIGAR:&nbsp;<b>" + cigar + "</b><br>" +
                "TLEN:&nbsp;<b>" + f.TLEN + "</b><br>" +
                "RNAME:&nbsp;<b>" + f.RNAME + "</b><br>" +
                "POS:&nbsp;<b>" + f.POS + "</b><br>" +
                "MAPQ:&nbsp;<b>" + f.MAPQ + "</b><br>" +
                "RNEXT:&nbsp;<b>" + f.RNEXT + "</b><br>" +
                "PNEXT:&nbsp;<b>" + f.PNEXT + "</b><br>" +
                FEATURE_TYPES.getTipCommons(f) + "<br>" +
                this.explainFlags(f.FLAG)+ "<br>";

            var three = "<div style=\"background:#FFEF93;font-weight:bold;\">Optional fields</div>";
            for (var key in f.OPTIONAL) {
                three += key + ":" + f.OPTIONAL[key] + "<br>";
            }
            var style = "background:#FFEF93;font-weight:bold;";
            return "<div>" + one + "</div>" +
                "<div>" + three + "</div>";
        },
        color: function (f, chr) {
            if (f.RNEXT == "=" || f.RNAME == f.RNEXT) {
                return (parseInt(f.FLAG) & (0x10)) == 0 ? "DarkGray" : "LightGray";
            }else{
                return "lightgreen";
            }
            /**/
        },
        strokeColor: function (f) {
            if (this.mateUnmappedFlag(f)) {
                return "tomato"
            }
            return (parseInt(f.FLAG) & (0x10)) == 0 ? "LightGray" : "DarkGray";
        },
        strand: function (f) {
            return (parseInt(f.FLAG) & (0x10)) == 0 ? "Forward" : "Reverse";
        },
        readPairedFlag: function (f) {
            return (parseInt(f.FLAG) & (0x1)) == 0 ? false : true;
        },
        firstOfPairFlag: function (f) {
            return (parseInt(f.FLAG) & (0x40)) == 0 ? false : true;
        },
        mateUnmappedFlag: function (f) {
            return (parseInt(f.FLAG) & (0x8)) == 0 ? false : true;
        },
        infoWidgetId: "id",
        height: 13,
        histogramColor: "grey"
    },
    variantMulti: {
        label: function (f) {
            return f.id;
            try {
                var fields = f.sampleData.split("\t");
            } catch (e) {
                //Uncaught TypeError: Cannot call method 'split' of undefined
                console.log(e)
            }

            if (fields.length > 10 || fields.length == 9)
                return f.id + " " + f.ref + "/" + f.alt + "";
            else {
                var gt = fields[9].split(":")[0];
                if (gt.indexOf(".") !== -1 || gt.indexOf("-") !== -1)
                    return gt;
                var label = "";
                var alt = f.alt.split(",");
                if (gt.charAt(0) === "0")
                    label = f.ref;
                else {
                    var pos = gt.charAt(0) - 1
                    label = alt[pos]
                }
                label += gt.charAt(1)
                if (gt.charAt(2) === "0") {
                    label += f.ref;
                } else {
                    var pos = gt.charAt(2) - 1
                    label += alt[pos]
                }

                return label;
            }
        },
        tooltipTitle: function (f) {
            return "VCF variant - <span class=\"ok\">" + f.id + "</span>";
        },
        tooltipText: function (f) {
            return "alleles (ref/alt):&nbsp;<span class=\"emph\">" + f.reference + "/" + f.alternate + "</span><br>" +
                "type:&nbsp;<span class=\"emph\">" + f.type + "</span><br>" +
                FEATURE_TYPES.getTipCommons(f);
        },
        color: "#8BC34A",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "gray"
    },
    TF_binding_site: {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#58f3f0",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#58f3f0"
    },
    mirna_target: {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#8af688",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#8af688"
    },
    Histone: {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#7a91c7",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#7a91c7"
    },
    Polymerase: {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#44c2d4",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#44c2d4"
    },
    "Open Chromatin": {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return FEATURE_TYPES.getTipTitleCommons(f);
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#ba56b8",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#ba56b8"
    },
    "Clinvar": {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return "Clinvar" + " - " + f.clinvarSet.title;
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#d7ff9a",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#d7ff9a"
    },
    "Cosmic": {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return "Cosmic";
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#009aff",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#009aff"
    },
    "GWAS": {
        label: function (f) {
            return FEATURE_TYPES.getLabelCommons(f);
        },
        tooltipTitle: function (f) {
            return "GWAS";
        },
        tooltipText: function (f) {
            return FEATURE_TYPES.getTipCommons(f) + FEATURE_TYPES._getSimpleKeys(f);
        },
        color: "#ff6500",
        infoWidgetId: "id",
        height: 10,
        histogramColor: "#ff6500"
    }
};
