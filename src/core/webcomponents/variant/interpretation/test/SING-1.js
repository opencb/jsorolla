export default {
    "id": "SING-1",
    "uuid": "066f827d-0173-0009-0001-7696fe49a784",
    "description": "sss",
    "type": "SINGLE",
    "disorder": {"id": "OMIM:611597", "name": "Cataract, Autosomal Dominant, Multiple Types 1", "source": "OMIM"},
    "comments": [
        {
            "id": "001",
            "message": "test message",
            "type": "NOTE",
            "creationDate": "20200617133615",
        },
        {
            "id": "002",
            "message": "test message 2",
            "creationDate": "20200617133615",
        },
    ],
    "files": [{
        "id": "data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
        "annotationSets": [],
        "name": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
        "uuid": "c27e9552-0172-0003-0001-7ac1bf71be92",
        "type": "FILE",
        "format": "VCF",
        "bioformat": "VARIANT",
        "uri": "file:///opt/opencga/variants/pilot-rd/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
        "path": "data/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
        "release": 1,
        "creationDate": "20200617133615",
        "modificationDate": "20200617150756",
        "external": true,
        "size": 40275805,
        "software": {},
        "experiment": {},
        "samples": [{
            "id": "D000001",
            "uuid": "c27e967f-0172-0004-0001-f06154e217db",
            "release": 1,
            "version": 1,
            "creationDate": "20200617133615",
            "modificationDate": "20200619091632",
            "description": "",
            "somatic": false,
            "phenotypes": [],
            "individualId": "D000001",
            "fileIds": ["data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz"],
            "status": {"name": "", "description": "", "date": ""},
            "internal": {"status": {"name": "READY", "date": "20200617133615", "description": ""}},
            "attributes": {}
        }],
        "jobId": "",
        "tags": [],
        "relatedFiles": [],
        "stats": {
            "variantFileStats": {
                "variantCount": 3732219,
                "sampleCount": 1,
                "filterCount": {".": 3732219},
                "filesCount": 1,
                "tiTvRatio": 1.524401,
                "qualityAvg": 1947.7278,
                "qualityStdDev": 2878.4617,
                "typeCount": {"INSERTION": 29, "SNV": 48779, "DELETION": 15, "INDEL": 15513, "NO_VARIATION": 3667883},
                "biotypeCount": {},
                "consequenceTypeCount": {},
                "chromosomeCount": {
                    "1": 388857,
                    "2": 245283,
                    "3": 195314,
                    "4": 126165,
                    "5": 163914,
                    "6": 177451,
                    "7": 176968,
                    "8": 116580,
                    "9": 152770,
                    "10": 148690,
                    "11": 221289,
                    "12": 205702,
                    "13": 57703,
                    "14": 109026,
                    "15": 115056,
                    "16": 172421,
                    "17": 233043,
                    "18": 51466,
                    "19": 346884,
                    "20": 98186,
                    "21": 35784,
                    "22": 82562,
                    "X": 107093,
                    "Y": 4012
                },
                "chromosomeDensity": {
                    "1": 0.0015601044,
                    "2": 0.0010085675,
                    "3": 0.0009863226,
                    "4": 0.00066001667,
                    "5": 0.0009060264,
                    "6": 0.0010370273,
                    "7": 0.0011120365,
                    "8": 0.0007965072,
                    "9": 0.0010818377,
                    "10": 0.0010970618,
                    "11": 0.0016390987,
                    "12": 0.0015367881,
                    "13": 0.0005010251,
                    "14": 0.0010156169,
                    "15": 0.0011221538,
                    "16": 0.0019082671,
                    "17": 0.0028701571,
                    "18": 0.0006591677,
                    "19": 0.0058665643,
                    "20": 0.0015578768,
                    "21": 0.000743488,
                    "22": 0.0016092524,
                    "X": 0.00068971864,
                    "Y": 0.00006757215
                }
            }
        },
        "status": {"name": "", "description": "", "date": ""},
        "internal": {
            "status": {"name": "READY", "date": "20200617133615", "description": ""},
            "index": {
                "userId": "",
                "creationDate": "",
                "status": {"name": "READY", "date": "20200617150756", "description": "Job finished. File index ready"},
                "jobId": -1,
                "release": 1,
                "attributes": {}
            },
            "sampleMap": {}
        },
        "attributes": {
            "variantFileMetadata": {
                "attributes": {}, "id": "0", "header": {
                    "version": "VCFv4.2",
                    "complexLines": [{"key": "ALT", "id": "NON_REF", "description": "Represents any possible alternative allele at this location", "genericFields": {}}, {
                        "key": "FORMAT",
                        "id": "AD",
                        "description": "Allelic depths for the ref and alt alleles in the order listed",
                        "number": "R",
                        "type": "Integer",
                        "genericFields": {}
                    }, {"key": "FORMAT", "id": "DP", "description": "Read depth", "number": "1", "type": "Integer", "genericFields": {}}, {
                        "key": "FORMAT",
                        "id": "GQ",
                        "description": "Genotype quality",
                        "number": "1",
                        "type": "Integer",
                        "genericFields": {}
                    }, {"key": "FORMAT", "id": "GT", "description": "Genotype", "number": "1", "type": "String", "genericFields": {}}, {
                        "key": "FORMAT",
                        "id": "MIN_DP",
                        "description": "Minimum DP observed within the GVCF block",
                        "number": "1",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "PGT",
                        "description": "Physical phasing haplotype information, describing how the alternate alleles are phased in relation to one another",
                        "number": "1",
                        "type": "String",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "PID",
                        "description": "Physical phasing ID information, where each unique ID within a given sample (but not across samples) connects records within a phasing group",
                        "number": "1",
                        "type": "String",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "PL",
                        "description": "The phred-scaled genotype likelihoods rounded to the closest integer",
                        "number": "G",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "SB",
                        "description": "Per-sample component statistics which comprise the Fisher's Exact Test to detect strand bias",
                        "number": "4",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "BaseQRankSum",
                        "description": "Z-score from Wilcoxon rank sum test of Alt Vs. Ref base qualities",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "ClippingRankSum",
                        "description": "Z-score From Wilcoxon rank sum test of Alt vs. Ref number of hard clipped bases",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "DB", "description": "dbSNP membership", "number": "0", "type": "Flag", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "DP",
                        "description": "Combined depth across samples",
                        "number": "1",
                        "type": "Integer",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "END", "description": "Stop position of the interval", "number": "1", "type": "Integer", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "ExcessHet",
                        "description": "Phred-scaled p-value for exact test of excess heterozygosity",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "InbreedingCoeff",
                        "description": "Inbreeding coefficient as estimated from the genotype likelihoods per-sample when compared against the Hardy-Weinberg expectation",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "MLEAC",
                        "description": "Maximum likelihood expectation (MLE) for the allele counts, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "MLEAF",
                        "description": "Maximum likelihood expectation (MLE) for the allele frequency, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "MQRankSum",
                        "description": "Z-score From Wilcoxon rank sum test of Alt vs. Ref read mapping qualities",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "RAW_MQ", "description": "Raw data for RMS mapping quality", "number": "1", "type": "Float", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "ReadPosRankSum",
                        "description": "Z-score from Wilcoxon rank sum test of Alt vs. Ref read position bias",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "contig", "id": "1", "genericFields": {"length": "249250621", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "2",
                        "genericFields": {"length": "243199373", "assembly": "unknown"}
                    }, {"key": "contig", "id": "3", "genericFields": {"length": "198022430", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "4",
                        "genericFields": {"length": "191154276", "assembly": "unknown"}
                    }, {"key": "contig", "id": "5", "genericFields": {"length": "180915260", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "6",
                        "genericFields": {"length": "171115067", "assembly": "unknown"}
                    }, {"key": "contig", "id": "7", "genericFields": {"length": "159138663", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "8",
                        "genericFields": {"length": "146364022", "assembly": "unknown"}
                    }, {"key": "contig", "id": "9", "genericFields": {"length": "141213431", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "10",
                        "genericFields": {"length": "135534747", "assembly": "unknown"}
                    }, {"key": "contig", "id": "11", "genericFields": {"length": "135006516", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "12",
                        "genericFields": {"length": "133851895", "assembly": "unknown"}
                    }, {"key": "contig", "id": "13", "genericFields": {"length": "115169878", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "14",
                        "genericFields": {"length": "107349540", "assembly": "unknown"}
                    }, {"key": "contig", "id": "15", "genericFields": {"length": "102531392", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "16",
                        "genericFields": {"length": "90354753", "assembly": "unknown"}
                    }, {"key": "contig", "id": "17", "genericFields": {"length": "81195210", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "18",
                        "genericFields": {"length": "78077248", "assembly": "unknown"}
                    }, {"key": "contig", "id": "19", "genericFields": {"length": "59128983", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "20",
                        "genericFields": {"length": "63025520", "assembly": "unknown"}
                    }, {"key": "contig", "id": "21", "genericFields": {"length": "48129895", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "22",
                        "genericFields": {"length": "51304566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "X", "genericFields": {"length": "155270560", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "Y",
                        "genericFields": {"length": "59373566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "MT", "genericFields": {"length": "16569", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000207.1",
                        "genericFields": {"length": "4262", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000226.1", "genericFields": {"length": "15008", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000229.1",
                        "genericFields": {"length": "19913", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000231.1", "genericFields": {"length": "27386", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000210.1",
                        "genericFields": {"length": "27682", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000239.1", "genericFields": {"length": "33824", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000235.1",
                        "genericFields": {"length": "34474", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000201.1", "genericFields": {"length": "36148", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000247.1",
                        "genericFields": {"length": "36422", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000245.1", "genericFields": {"length": "36651", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000197.1",
                        "genericFields": {"length": "37175", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000203.1", "genericFields": {"length": "37498", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000246.1",
                        "genericFields": {"length": "38154", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000249.1", "genericFields": {"length": "38502", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000196.1",
                        "genericFields": {"length": "38914", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000248.1", "genericFields": {"length": "39786", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000244.1",
                        "genericFields": {"length": "39929", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000238.1", "genericFields": {"length": "39939", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000202.1",
                        "genericFields": {"length": "40103", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000234.1", "genericFields": {"length": "40531", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000232.1",
                        "genericFields": {"length": "40652", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000206.1", "genericFields": {"length": "41001", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000240.1",
                        "genericFields": {"length": "41933", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000236.1", "genericFields": {"length": "41934", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000241.1",
                        "genericFields": {"length": "42152", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000243.1", "genericFields": {"length": "43341", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000242.1",
                        "genericFields": {"length": "43523", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000230.1", "genericFields": {"length": "43691", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000237.1",
                        "genericFields": {"length": "45867", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000233.1", "genericFields": {"length": "45941", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000204.1",
                        "genericFields": {"length": "81310", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000198.1", "genericFields": {"length": "90085", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000208.1",
                        "genericFields": {"length": "92689", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000191.1", "genericFields": {"length": "106433", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000227.1",
                        "genericFields": {"length": "128374", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000228.1", "genericFields": {"length": "129120", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000214.1",
                        "genericFields": {"length": "137718", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000221.1", "genericFields": {"length": "155397", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000209.1",
                        "genericFields": {"length": "159169", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000218.1", "genericFields": {"length": "161147", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000220.1",
                        "genericFields": {"length": "161802", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000213.1", "genericFields": {"length": "164239", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000211.1",
                        "genericFields": {"length": "166566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000199.1", "genericFields": {"length": "169874", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000217.1",
                        "genericFields": {"length": "172149", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000216.1", "genericFields": {"length": "172294", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000215.1",
                        "genericFields": {"length": "172545", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000205.1", "genericFields": {"length": "174588", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000219.1",
                        "genericFields": {"length": "179198", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000224.1", "genericFields": {"length": "179693", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000223.1",
                        "genericFields": {"length": "180455", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000195.1", "genericFields": {"length": "182896", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000212.1",
                        "genericFields": {"length": "186858", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000222.1", "genericFields": {"length": "186861", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000200.1",
                        "genericFields": {"length": "187035", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000193.1", "genericFields": {"length": "189789", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000194.1",
                        "genericFields": {"length": "191469", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000225.1", "genericFields": {"length": "211173", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000192.1",
                        "genericFields": {"length": "547496", "assembly": "unknown"}
                    }, {"key": "contig", "id": "NC_007605", "genericFields": {"length": "171823", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "hs37d5",
                        "genericFields": {"length": "35477943", "assembly": "unknown"}
                    }],
                    "simpleLines": [{
                        "key": "SentieonCommandLine.Haplotyper",
                        "value": "<ID=Haplotyper,Version=\"sentieon-genomics-201911\",Date=\"2020-05-28T19:08:04Z\",CommandLine=\"/usr/local/sentieon-genomics-201911/libexec/driver -t 36 -r genome/hs37d5.fa -i markdup.bam -q recal_data_Sentieon.table --interval targets_bed/refseq_nirvana_2.0.10_100bp_no_PAR_Y.bed --algo Haplotyper -d resources/dbsnp_138.b37.vcf.gz --emit_mode GVCF haplotyper.g.vcf.gz\">"
                    }, {"key": "reference", "value": "file://genome/hs37d5.fa"}, {"key": "GVCFBlock0-1", "value": "minGQ=0(inclusive),maxGQ=1(exclusive)"}, {
                        "key": "GVCFBlock1-2",
                        "value": "minGQ=1(inclusive),maxGQ=2(exclusive)"
                    }, {"key": "GVCFBlock2-3", "value": "minGQ=2(inclusive),maxGQ=3(exclusive)"}, {"key": "GVCFBlock3-4", "value": "minGQ=3(inclusive),maxGQ=4(exclusive)"}, {
                        "key": "GVCFBlock4-5",
                        "value": "minGQ=4(inclusive),maxGQ=5(exclusive)"
                    }, {"key": "GVCFBlock5-6", "value": "minGQ=5(inclusive),maxGQ=6(exclusive)"}, {"key": "GVCFBlock6-7", "value": "minGQ=6(inclusive),maxGQ=7(exclusive)"}, {
                        "key": "GVCFBlock7-8",
                        "value": "minGQ=7(inclusive),maxGQ=8(exclusive)"
                    }, {"key": "GVCFBlock8-9", "value": "minGQ=8(inclusive),maxGQ=9(exclusive)"}, {"key": "GVCFBlock9-10", "value": "minGQ=9(inclusive),maxGQ=10(exclusive)"}, {
                        "key": "GVCFBlock10-11",
                        "value": "minGQ=10(inclusive),maxGQ=11(exclusive)"
                    }, {"key": "GVCFBlock11-12", "value": "minGQ=11(inclusive),maxGQ=12(exclusive)"}, {
                        "key": "GVCFBlock12-13",
                        "value": "minGQ=12(inclusive),maxGQ=13(exclusive)"
                    }, {"key": "GVCFBlock13-14", "value": "minGQ=13(inclusive),maxGQ=14(exclusive)"}, {
                        "key": "GVCFBlock14-15",
                        "value": "minGQ=14(inclusive),maxGQ=15(exclusive)"
                    }, {"key": "GVCFBlock15-16", "value": "minGQ=15(inclusive),maxGQ=16(exclusive)"}, {
                        "key": "GVCFBlock16-17",
                        "value": "minGQ=16(inclusive),maxGQ=17(exclusive)"
                    }, {"key": "GVCFBlock17-18", "value": "minGQ=17(inclusive),maxGQ=18(exclusive)"}, {
                        "key": "GVCFBlock18-19",
                        "value": "minGQ=18(inclusive),maxGQ=19(exclusive)"
                    }, {"key": "GVCFBlock19-20", "value": "minGQ=19(inclusive),maxGQ=20(exclusive)"}, {
                        "key": "GVCFBlock20-21",
                        "value": "minGQ=20(inclusive),maxGQ=21(exclusive)"
                    }, {"key": "GVCFBlock21-22", "value": "minGQ=21(inclusive),maxGQ=22(exclusive)"}, {
                        "key": "GVCFBlock22-23",
                        "value": "minGQ=22(inclusive),maxGQ=23(exclusive)"
                    }, {"key": "GVCFBlock23-24", "value": "minGQ=23(inclusive),maxGQ=24(exclusive)"}, {
                        "key": "GVCFBlock24-25",
                        "value": "minGQ=24(inclusive),maxGQ=25(exclusive)"
                    }, {"key": "GVCFBlock25-26", "value": "minGQ=25(inclusive),maxGQ=26(exclusive)"}, {
                        "key": "GVCFBlock26-27",
                        "value": "minGQ=26(inclusive),maxGQ=27(exclusive)"
                    }, {"key": "GVCFBlock27-28", "value": "minGQ=27(inclusive),maxGQ=28(exclusive)"}, {
                        "key": "GVCFBlock28-29",
                        "value": "minGQ=28(inclusive),maxGQ=29(exclusive)"
                    }, {"key": "GVCFBlock29-30", "value": "minGQ=29(inclusive),maxGQ=30(exclusive)"}, {
                        "key": "GVCFBlock30-31",
                        "value": "minGQ=30(inclusive),maxGQ=31(exclusive)"
                    }, {"key": "GVCFBlock31-32", "value": "minGQ=31(inclusive),maxGQ=32(exclusive)"}, {
                        "key": "GVCFBlock32-33",
                        "value": "minGQ=32(inclusive),maxGQ=33(exclusive)"
                    }, {"key": "GVCFBlock33-34", "value": "minGQ=33(inclusive),maxGQ=34(exclusive)"}, {
                        "key": "GVCFBlock34-35",
                        "value": "minGQ=34(inclusive),maxGQ=35(exclusive)"
                    }, {"key": "GVCFBlock35-36", "value": "minGQ=35(inclusive),maxGQ=36(exclusive)"}, {
                        "key": "GVCFBlock36-37",
                        "value": "minGQ=36(inclusive),maxGQ=37(exclusive)"
                    }, {"key": "GVCFBlock37-38", "value": "minGQ=37(inclusive),maxGQ=38(exclusive)"}, {
                        "key": "GVCFBlock38-39",
                        "value": "minGQ=38(inclusive),maxGQ=39(exclusive)"
                    }, {"key": "GVCFBlock39-40", "value": "minGQ=39(inclusive),maxGQ=40(exclusive)"}, {
                        "key": "GVCFBlock40-41",
                        "value": "minGQ=40(inclusive),maxGQ=41(exclusive)"
                    }, {"key": "GVCFBlock41-42", "value": "minGQ=41(inclusive),maxGQ=42(exclusive)"}, {
                        "key": "GVCFBlock42-43",
                        "value": "minGQ=42(inclusive),maxGQ=43(exclusive)"
                    }, {"key": "GVCFBlock43-44", "value": "minGQ=43(inclusive),maxGQ=44(exclusive)"}, {
                        "key": "GVCFBlock44-45",
                        "value": "minGQ=44(inclusive),maxGQ=45(exclusive)"
                    }, {"key": "GVCFBlock45-46", "value": "minGQ=45(inclusive),maxGQ=46(exclusive)"}, {
                        "key": "GVCFBlock46-47",
                        "value": "minGQ=46(inclusive),maxGQ=47(exclusive)"
                    }, {"key": "GVCFBlock47-48", "value": "minGQ=47(inclusive),maxGQ=48(exclusive)"}, {
                        "key": "GVCFBlock48-49",
                        "value": "minGQ=48(inclusive),maxGQ=49(exclusive)"
                    }, {"key": "GVCFBlock49-50", "value": "minGQ=49(inclusive),maxGQ=50(exclusive)"}, {
                        "key": "GVCFBlock50-51",
                        "value": "minGQ=50(inclusive),maxGQ=51(exclusive)"
                    }, {"key": "GVCFBlock51-52", "value": "minGQ=51(inclusive),maxGQ=52(exclusive)"}, {
                        "key": "GVCFBlock52-53",
                        "value": "minGQ=52(inclusive),maxGQ=53(exclusive)"
                    }, {"key": "GVCFBlock53-54", "value": "minGQ=53(inclusive),maxGQ=54(exclusive)"}, {
                        "key": "GVCFBlock54-55",
                        "value": "minGQ=54(inclusive),maxGQ=55(exclusive)"
                    }, {"key": "GVCFBlock55-56", "value": "minGQ=55(inclusive),maxGQ=56(exclusive)"}, {
                        "key": "GVCFBlock56-57",
                        "value": "minGQ=56(inclusive),maxGQ=57(exclusive)"
                    }, {"key": "GVCFBlock57-58", "value": "minGQ=57(inclusive),maxGQ=58(exclusive)"}, {
                        "key": "GVCFBlock58-59",
                        "value": "minGQ=58(inclusive),maxGQ=59(exclusive)"
                    }, {"key": "GVCFBlock59-60", "value": "minGQ=59(inclusive),maxGQ=60(exclusive)"}, {
                        "key": "GVCFBlock60-70",
                        "value": "minGQ=60(inclusive),maxGQ=70(exclusive)"
                    }, {"key": "GVCFBlock70-80", "value": "minGQ=70(inclusive),maxGQ=80(exclusive)"}, {
                        "key": "GVCFBlock80-90",
                        "value": "minGQ=80(inclusive),maxGQ=90(exclusive)"
                    }, {"key": "GVCFBlock90-99", "value": "minGQ=90(inclusive),maxGQ=99(exclusive)"}, {"key": "GVCFBlock99-2147483647", "value": "minGQ=99(inclusive),maxGQ=2147483647(exclusive)"}]
                }, "path": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz", "sampleIds": ["D000001"]
            }, "storagePipelineResult": {
                "input": "file:///opt/opencga/variants/pilot-rd/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                "preTransformResult": "file:///opt/opencga/variants/pilot-rd/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                "transformResult": "file:/tmp/scratch_variant-indexcVhblmG56F/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz.variants.avro.gz",
                "postTransformResult": "file:/tmp/scratch_variant-indexcVhblmG56F/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz.variants.avro.gz",
                "preLoadResult": "file:/tmp/scratch_variant-indexcVhblmG56F/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz.variants.avro.gz",
                "loadResult": "file:/tmp/scratch_variant-indexcVhblmG56F/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz.variants.avro.gz",
                "postLoadResult": "file:/tmp/scratch_variant-indexcVhblmG56F/D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz.variants.avro.gz",
                "transformExecuted": true,
                "transformTimeMillis": 47213,
                "transformStats": {},
                "loadExecuted": true,
                "loadTimeMillis": 243195,
                "loadStats": {"duplicatedVariants": 0, "duplicatedLocus": 0, "discardedVariants": 0}
            }
        }
    }, {
        "id": "data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz",
        "annotationSets": [],
        "name": "D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz",
        "uuid": "c27ea35c-0172-0003-0001-1746c094a96f",
        "type": "FILE",
        "format": "VCF",
        "bioformat": "VARIANT",
        "uri": "file:///opt/opencga/variants/pilot-rd/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz",
        "path": "data/vcfs/D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz",
        "release": 1,
        "creationDate": "20200617133618",
        "modificationDate": "20200617133618",
        "external": true,
        "size": 1870084,
        "software": {},
        "experiment": {},
        "samples": [{
            "id": "D000001",
            "uuid": "c27e967f-0172-0004-0001-f06154e217db",
            "release": 1,
            "version": 1,
            "creationDate": "20200617133615",
            "modificationDate": "20200619091632",
            "description": "",
            "somatic": false,
            "phenotypes": [],
            "individualId": "D000001",
            "fileIds": ["data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz"],
            "status": {"name": "", "description": "", "date": ""},
            "internal": {"status": {"name": "READY", "date": "20200617133615", "description": ""}},
            "attributes": {}
        }],
        "jobId": "",
        "tags": [],
        "relatedFiles": [],
        "stats": {},
        "status": {"name": "", "description": "", "date": ""},
        "internal": {
            "status": {"name": "READY", "date": "20200617133618", "description": ""},
            "index": {"userId": "", "creationDate": "", "status": {"name": "NONE", "date": "20200617133618", "description": ""}, "jobId": -1, "release": 0, "attributes": {}},
            "sampleMap": {}
        },
        "attributes": {
            "variantFileMetadata": {
                "attributes": {}, "id": "0", "header": {
                    "version": "VCFv4.2",
                    "complexLines": [{
                        "key": "FORMAT",
                        "id": "AD",
                        "description": "Allelic depths for the ref and alt alleles in the order listed",
                        "number": "R",
                        "type": "Integer",
                        "genericFields": {}
                    }, {"key": "FORMAT", "id": "DP", "description": "Read depth", "number": "1", "type": "Integer", "genericFields": {}}, {
                        "key": "FORMAT",
                        "id": "GQ",
                        "description": "Genotype quality",
                        "number": "1",
                        "type": "Integer",
                        "genericFields": {}
                    }, {"key": "FORMAT", "id": "GT", "description": "Genotype", "number": "1", "type": "String", "genericFields": {}}, {
                        "key": "FORMAT",
                        "id": "PGT",
                        "description": "Physical phasing haplotype information, describing how the alternate alleles are phased in relation to one another",
                        "number": "1",
                        "type": "String",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "PID",
                        "description": "Physical phasing ID information, where each unique ID within a given sample (but not across samples) connects records within a phasing group",
                        "number": "1",
                        "type": "String",
                        "genericFields": {}
                    }, {
                        "key": "FORMAT",
                        "id": "PL",
                        "description": "The phred-scaled genotype likelihoods rounded to the closest integer",
                        "number": "G",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "AC",
                        "description": "Allele count in genotypes, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "AF",
                        "description": "Allele frequency, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "AN", "description": "Total number of alleles in called genotypes", "number": "1", "type": "Integer", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "BaseQRankSum",
                        "description": "Z-score from Wilcoxon rank sum test of Alt Vs. Ref base qualities",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "ClippingRankSum",
                        "description": "Z-score From Wilcoxon rank sum test of Alt vs. Ref number of hard clipped bases",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "DB", "description": "dbSNP membership", "number": "0", "type": "Flag", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "DP",
                        "description": "Combined depth across samples",
                        "number": "1",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "ExcessHet",
                        "description": "Phred-scaled p-value for exact test of excess heterozygosity",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "FS",
                        "description": "Phred-scaled p-value using Fisher's exact test to detect strand bias",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "InbreedingCoeff",
                        "description": "Inbreeding coefficient as estimated from the genotype likelihoods per-sample when compared against the Hardy-Weinberg expectation",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "MLEAC",
                        "description": "Maximum likelihood expectation (MLE) for the allele counts, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Integer",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "MLEAF",
                        "description": "Maximum likelihood expectation (MLE) for the allele frequency, for each ALT allele, in the same order as listed",
                        "number": "A",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "MQ", "description": "RMS mapping quality", "number": "1", "type": "Float", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "MQRankSum",
                        "description": "Z-score From Wilcoxon rank sum test of Alt vs. Ref read mapping qualities",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "INFO", "id": "QD", "description": "Variant Confidence/Quality by Depth", "number": "1", "type": "Float", "genericFields": {}}, {
                        "key": "INFO",
                        "id": "ReadPosRankSum",
                        "description": "Z-score from Wilcoxon rank sum test of Alt vs. Ref read position bias",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {
                        "key": "INFO",
                        "id": "SOR",
                        "description": "Symmetric Odds Ratio of 2x2 contingency table to detect strand bias",
                        "number": "1",
                        "type": "Float",
                        "genericFields": {}
                    }, {"key": "contig", "id": "1", "genericFields": {"length": "249250621", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "2",
                        "genericFields": {"length": "243199373", "assembly": "unknown"}
                    }, {"key": "contig", "id": "3", "genericFields": {"length": "198022430", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "4",
                        "genericFields": {"length": "191154276", "assembly": "unknown"}
                    }, {"key": "contig", "id": "5", "genericFields": {"length": "180915260", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "6",
                        "genericFields": {"length": "171115067", "assembly": "unknown"}
                    }, {"key": "contig", "id": "7", "genericFields": {"length": "159138663", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "8",
                        "genericFields": {"length": "146364022", "assembly": "unknown"}
                    }, {"key": "contig", "id": "9", "genericFields": {"length": "141213431", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "10",
                        "genericFields": {"length": "135534747", "assembly": "unknown"}
                    }, {"key": "contig", "id": "11", "genericFields": {"length": "135006516", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "12",
                        "genericFields": {"length": "133851895", "assembly": "unknown"}
                    }, {"key": "contig", "id": "13", "genericFields": {"length": "115169878", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "14",
                        "genericFields": {"length": "107349540", "assembly": "unknown"}
                    }, {"key": "contig", "id": "15", "genericFields": {"length": "102531392", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "16",
                        "genericFields": {"length": "90354753", "assembly": "unknown"}
                    }, {"key": "contig", "id": "17", "genericFields": {"length": "81195210", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "18",
                        "genericFields": {"length": "78077248", "assembly": "unknown"}
                    }, {"key": "contig", "id": "19", "genericFields": {"length": "59128983", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "20",
                        "genericFields": {"length": "63025520", "assembly": "unknown"}
                    }, {"key": "contig", "id": "21", "genericFields": {"length": "48129895", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "22",
                        "genericFields": {"length": "51304566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "X", "genericFields": {"length": "155270560", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "Y",
                        "genericFields": {"length": "59373566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "MT", "genericFields": {"length": "16569", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000207.1",
                        "genericFields": {"length": "4262", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000226.1", "genericFields": {"length": "15008", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000229.1",
                        "genericFields": {"length": "19913", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000231.1", "genericFields": {"length": "27386", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000210.1",
                        "genericFields": {"length": "27682", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000239.1", "genericFields": {"length": "33824", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000235.1",
                        "genericFields": {"length": "34474", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000201.1", "genericFields": {"length": "36148", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000247.1",
                        "genericFields": {"length": "36422", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000245.1", "genericFields": {"length": "36651", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000197.1",
                        "genericFields": {"length": "37175", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000203.1", "genericFields": {"length": "37498", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000246.1",
                        "genericFields": {"length": "38154", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000249.1", "genericFields": {"length": "38502", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000196.1",
                        "genericFields": {"length": "38914", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000248.1", "genericFields": {"length": "39786", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000244.1",
                        "genericFields": {"length": "39929", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000238.1", "genericFields": {"length": "39939", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000202.1",
                        "genericFields": {"length": "40103", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000234.1", "genericFields": {"length": "40531", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000232.1",
                        "genericFields": {"length": "40652", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000206.1", "genericFields": {"length": "41001", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000240.1",
                        "genericFields": {"length": "41933", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000236.1", "genericFields": {"length": "41934", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000241.1",
                        "genericFields": {"length": "42152", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000243.1", "genericFields": {"length": "43341", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000242.1",
                        "genericFields": {"length": "43523", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000230.1", "genericFields": {"length": "43691", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000237.1",
                        "genericFields": {"length": "45867", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000233.1", "genericFields": {"length": "45941", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000204.1",
                        "genericFields": {"length": "81310", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000198.1", "genericFields": {"length": "90085", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000208.1",
                        "genericFields": {"length": "92689", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000191.1", "genericFields": {"length": "106433", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000227.1",
                        "genericFields": {"length": "128374", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000228.1", "genericFields": {"length": "129120", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000214.1",
                        "genericFields": {"length": "137718", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000221.1", "genericFields": {"length": "155397", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000209.1",
                        "genericFields": {"length": "159169", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000218.1", "genericFields": {"length": "161147", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000220.1",
                        "genericFields": {"length": "161802", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000213.1", "genericFields": {"length": "164239", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000211.1",
                        "genericFields": {"length": "166566", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000199.1", "genericFields": {"length": "169874", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000217.1",
                        "genericFields": {"length": "172149", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000216.1", "genericFields": {"length": "172294", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000215.1",
                        "genericFields": {"length": "172545", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000205.1", "genericFields": {"length": "174588", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000219.1",
                        "genericFields": {"length": "179198", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000224.1", "genericFields": {"length": "179693", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000223.1",
                        "genericFields": {"length": "180455", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000195.1", "genericFields": {"length": "182896", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000212.1",
                        "genericFields": {"length": "186858", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000222.1", "genericFields": {"length": "186861", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000200.1",
                        "genericFields": {"length": "187035", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000193.1", "genericFields": {"length": "189789", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000194.1",
                        "genericFields": {"length": "191469", "assembly": "unknown"}
                    }, {"key": "contig", "id": "GL000225.1", "genericFields": {"length": "211173", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "GL000192.1",
                        "genericFields": {"length": "547496", "assembly": "unknown"}
                    }, {"key": "contig", "id": "NC_007605", "genericFields": {"length": "171823", "assembly": "unknown"}}, {
                        "key": "contig",
                        "id": "hs37d5",
                        "genericFields": {"length": "35477943", "assembly": "unknown"}
                    }],
                    "simpleLines": [{
                        "key": "SentieonCommandLine.GVCFtyper",
                        "value": "<ID=GVCFtyper,Version=\"sentieon-genomics-201911\",Date=\"2020-05-28T19:10:07Z\",CommandLine=\"/usr/local/sentieon-genomics-201911/libexec/driver -t 36 -r genome/hs37d5.fa --interval targets_bed/refseq_nirvana_2.0.10_100bp_no_PAR_Y.bed --algo GVCFtyper -d resources/dbsnp_138.b37.vcf.gz -v haplotyper.g.vcf.gz haplotyper.vcf.gz\">"
                    }, {
                        "key": "SentieonCommandLine.Haplotyper",
                        "value": "<ID=Haplotyper,Version=\"sentieon-genomics-201911\",Date=\"2020-05-28T19:08:04Z\",CommandLine=\"/usr/local/sentieon-genomics-201911/libexec/driver -t 36 -r genome/hs37d5.fa -i markdup.bam -q recal_data_Sentieon.table --interval targets_bed/refseq_nirvana_2.0.10_100bp_no_PAR_Y.bed --algo Haplotyper -d resources/dbsnp_138.b37.vcf.gz --emit_mode GVCF haplotyper.g.vcf.gz\">"
                    }, {"key": "reference", "value": "file://genome/hs37d5.fa"}]
                }, "path": "D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz", "sampleIds": ["D000001"]
            }
        }
    }],
    "proband": {
        "id": "D000001",
        "name": "D000001",
        "uuid": "cbdd85bd-0172-0006-0001-e64589db1506",
        "father": {"id": "D000079", "release": 0, "version": 1, "parentalConsanguinity": false},
        "mother": {"id": "D000091", "release": 0, "version": 1, "parentalConsanguinity": false},
        "location": {},
        "qualityControl": {
            "sampleId": "D000001", "inferredSexReports": [], "mendelianErrorReport": {
                "numErrors": 1536, "sampleAggregation": [{
                    "sample": "D000001",
                    "numErrors": 1536,
                    "ratio": 0.029175451592683345,
                    "chromAggregation": [{"chromosome": "1", "numErrors": 114, "errorCodeAggregation": {"1": 114}}, {
                        "chromosome": "2",
                        "numErrors": 83,
                        "errorCodeAggregation": {"1": 83}
                    }, {"chromosome": "3", "numErrors": 65, "errorCodeAggregation": {"1": 65}}, {"chromosome": "4", "numErrors": 54, "errorCodeAggregation": {"1": 54}}, {
                        "chromosome": "5",
                        "numErrors": 44,
                        "errorCodeAggregation": {"1": 44}
                    }, {"chromosome": "6", "numErrors": 207, "errorCodeAggregation": {"1": 207}}, {"chromosome": "7", "numErrors": 60, "errorCodeAggregation": {"1": 60}}, {
                        "chromosome": "8",
                        "numErrors": 39,
                        "errorCodeAggregation": {"1": 39}
                    }, {"chromosome": "9", "numErrors": 55, "errorCodeAggregation": {"1": 55}}, {"chromosome": "10", "numErrors": 104, "errorCodeAggregation": {"1": 104}}, {
                        "chromosome": "11",
                        "numErrors": 120,
                        "errorCodeAggregation": {"1": 120}
                    }, {"chromosome": "12", "numErrors": 103, "errorCodeAggregation": {"1": 103}}, {"chromosome": "13", "numErrors": 27, "errorCodeAggregation": {"1": 27}}, {
                        "chromosome": "14",
                        "numErrors": 51,
                        "errorCodeAggregation": {"1": 51}
                    }, {"chromosome": "15", "numErrors": 55, "errorCodeAggregation": {"1": 55}}, {"chromosome": "16", "numErrors": 66, "errorCodeAggregation": {"1": 66}}, {
                        "chromosome": "17",
                        "numErrors": 81,
                        "errorCodeAggregation": {"1": 81}
                    }, {"chromosome": "18", "numErrors": 16, "errorCodeAggregation": {"1": 16}}, {"chromosome": "19", "numErrors": 120, "errorCodeAggregation": {"1": 120}}, {
                        "chromosome": "20",
                        "numErrors": 22,
                        "errorCodeAggregation": {"1": 22}
                    }, {"chromosome": "21", "numErrors": 22, "errorCodeAggregation": {"1": 22}}, {"chromosome": "22", "numErrors": 28, "errorCodeAggregation": {"1": 28}}]
                }]
            }, "fileIds": [], "comments": []
        },
        "sex": "MALE",
        "karyotypicSex": "XY",
        "ethnicity": "",
        "population": {},
        "release": 1,
        "version": 1,
        "creationDate": "20200619091632",
        "modificationDate": "20200802010423",
        "lifeStatus": "ALIVE",
        "phenotypes": [{"id": "HP:0000519", "name": "Developmental cataract", "source": "HPO", "status": "OBSERVED"}, {"id": "HP:00005456", "name": "Myopia", "source": "HPO", "status": "OBSERVED"}],
        "disorders": [{"id": "OMIM:611597", "name": "Cataract, Autosomal Dominant, Multiple Types 1", "source": "OMIM"}],
        "samples": [{
            "id": "D000001",
            "uuid": "c27e967f-0172-0004-0001-f06154e217db",
            "qualityControl": {
                "fileIds": [], "comments": [], "metrics": [{
                    "bamFileId": "", "variantStats": [{
                        "id": "ALL", "stats": {
                            "id": "D000001",
                            "variantCount": 52647,
                            "chromosomeCount": {
                                "1": 5367,
                                "2": 3708,
                                "3": 2775,
                                "4": 2120,
                                "5": 2252,
                                "6": 3741,
                                "7": 2431,
                                "8": 1776,
                                "9": 2188,
                                "10": 2178,
                                "11": 3069,
                                "12": 2717,
                                "13": 1059,
                                "14": 1487,
                                "15": 1751,
                                "16": 2262,
                                "17": 2849,
                                "18": 961,
                                "19": 3713,
                                "20": 1185,
                                "21": 702,
                                "22": 1192,
                                "X": 1156,
                                "Y": 8
                            },
                            "typeCount": {"SNV": 45250, "INSERTION": 19, "DELETION": 11, "INDEL": 7367},
                            "genotypeCount": {"1/11": 2, "1/10": 4, "0/1": 29596, "1/1": 21942, "1/2": 530, "1/3": 342, "1/4": 135, "1/14": 1, "1/5": 47, "1/6": 22, "1/7": 10, "1/8": 11, "1/9": 5},
                            "indelLengthCount": {"lt5": 6243, "lt10": 635, "lt15": 211, "lt20": 106, "gte20": 202},
                            "filterCount": {".": 52647},
                            "tiTvRatio": 1.6830715,
                            "qualityAvg": 2254.6235,
                            "qualityStdDev": 3009.5361,
                            "heterozygosityRate": 0.5832241,
                            "mendelianErrorCount": {"1": 1536},
                            "consequenceTypeCount": {
                                "intergenic_variant": 18,
                                "start_retained_variant": 1,
                                "frameshift_variant": 241,
                                "3_prime_UTR_variant": 4879,
                                "2KB_downstream_variant": 14069,
                                "splice_acceptor_variant": 93,
                                "intron_variant": 37319,
                                "splice_region_variant": 2233,
                                "upstream_gene_variant": 11897,
                                "5_prime_UTR_variant": 2391,
                                "non_coding_transcript_exon_variant": 11380,
                                "stop_gained": 290,
                                "non_coding_transcript_variant": 18493,
                                "2KB_upstream_variant": 12209,
                                "start_lost": 31,
                                "NMD_transcript_variant": 14902,
                                "splice_donor_variant": 75,
                                "synonymous_variant": 8294,
                                "missense_variant": 9358,
                                "mature_miRNA_variant": 2,
                                "feature_truncation": 11,
                                "stop_lost": 29,
                                "regulatory_region_variant": 48626,
                                "downstream_gene_variant": 14282,
                                "stop_retained_variant": 14,
                                "TF_binding_site_variant": 8339,
                                "coding_sequence_variant": 18,
                                "inframe_deletion": 193,
                                "inframe_insertion": 149,
                                "incomplete_terminal_codon_variant": 5
                            },
                            "biotypeCount": {
                                "protein_coding": 52067,
                                "rRNA": 95,
                                "retained_intron": 22302,
                                "nonsense_mediated_decay": 18154,
                                "3prime_overlapping_ncrna": 44,
                                "snRNA": 366,
                                "snoRNA": 413,
                                "transcribed_processed_pseudogene": 73,
                                "unitary_pseudogene": 41,
                                "transcribed_unprocessed_pseudogene": 291,
                                "pseudogene": 200,
                                "sense_intronic": 252,
                                "non_stop_decay": 114,
                                "processed_pseudogene": 1014,
                                "unprocessed_pseudogene": 507,
                                "miRNA": 1024,
                                "lincRNA": 989,
                                "misc_RNA": 425,
                                "sense_overlapping": 138,
                                "processed_transcript": 21415,
                                "antisense": 5975,
                                "polymorphic_pseudogene": 192
                            }
                        }
                    }], "geneCoverageStats": [], "signatures": [], "fileIds": [], "comments": []
                }]
            },
            "release": 1,
            "version": 3,
            "creationDate": "20200617133615",
            "modificationDate": "20200705235014",
            "description": "",
            "somatic": false,
            "phenotypes": [],
            "individualId": "D000001",
            "fileIds": ["data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz", "data:vcfs:D000001_markdup_recalibrated_Haplotyper_anonymized.vcf.gz"],
            "status": {"name": "", "description": "", "date": ""},
            "internal": {"status": {"name": "READY", "date": "20200617133615", "description": ""}},
            "attributes": {}
        }],
        "parentalConsanguinity": false,
        "status": {"name": "", "description": "", "date": ""},
        "internal": {"status": {"name": "READY", "date": "20200619091632", "description": ""}},
        "attributes": {}
    },
    "interpretation": {
        "id": "SING-1_1",
        "uuid": "066f7e88-0173-000b-0001-62ab2590b200",
        "description": "",
        "clinicalAnalysisId": "SING-1",
        "analyst": {},
        "methods": [{"name": "IVA"}],
        "primaryFindings": [
            {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596036856525},
            "type": "SNV",
            "end": 871285,
            "start": 871285,
            "id": "1:871285:C:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 12.05,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "T",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "1,2,0", "3", "31", ".", ".", ".", "40,0,31,43,37,80", "0,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871285:C:T,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "10800.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "12.05",
                        "BaseQRankSum": "-0.967",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "3",
                        "ReadPosRankSum": "0.431"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871285, "end": 871285, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871285,
                "reference": "C",
                "alternate": "T",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+9C>T", "ENST00000342066(ENSG00000187634):c.430+9C>T", "ENST00000341065(ENSG00000187634):c.201+9C>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.9999918,
                    "altAlleleFreq": 0.000008235197,
                    "refHomGenotypeFreq": 0.99998355,
                    "hetGenotypeFreq": 0.000016470394,
                    "altHomGenotypeFreq": 0
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.99998504,
                    "altAlleleFreq": 0.0000149747675,
                    "refHomGenotypeFreq": 0.9999701,
                    "hetGenotypeFreq": 0.000029949535,
                    "altHomGenotypeFreq": 0
                }],
                "conservation": [{"score": -1.8300000429153442, "source": "gerp"}, {"score": 0.009999999776482582, "source": "phastCons"}, {"score": -0.257999986410141, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.19999980926513672, "source": "cadd_raw"}, {"score": 4.71999979019165, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596036856525},
            "type": "SNV",
            "end": 871334,
            "start": 871334,
            "id": "1:871334:G:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.7036199,
                    "missingAlleleCount": 0,
                    "fileCount": 70,
                    "mgf": 0.040723983,
                    "genotypeFreq": {"0/0": 0.68325794, "0/1": 0.040723983, "1/1": 0.2760181},
                    "refAlleleCount": 311,
                    "altAlleleCount": 131,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 151, "0/1": 9, "1/1": 61},
                    "filterCount": {"PASS": 0, ".": 70},
                    "qualityAvg": 54.26143,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.2963801,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 70,
                    "sampleCount": 221,
                    "maf": 0.2963801
                }, {
                    "refAlleleFreq": 0.6666667,
                    "missingAlleleCount": 0,
                    "fileCount": 5,
                    "mgf": 0.16666667,
                    "genotypeFreq": {"0/0": 0.5833333, "0/1": 0.16666667, "1/1": 0.25},
                    "refAlleleCount": 16,
                    "altAlleleCount": 8,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 7, "0/1": 2, "1/1": 3},
                    "filterCount": {"PASS": 0, ".": 5},
                    "qualityAvg": 38.982,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.33333334,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 5,
                    "sampleCount": 12,
                    "maf": 0.33333334
                }, {
                    "refAlleleFreq": 0.7173913,
                    "missingAlleleCount": 0,
                    "fileCount": 20,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.71014494, "0/1": 0.014492754, "1/1": 0.2753623},
                    "refAlleleCount": 99,
                    "altAlleleCount": 39,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 49, "0/1": 1, "1/1": 19},
                    "filterCount": {"PASS": 0, ".": 20},
                    "qualityAvg": 58.6455,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.2826087,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 20,
                    "sampleCount": 69,
                    "maf": 0.2826087
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,2,0", "2", "6", ".", ".", ".", "49,6,0,49,6,49", "0,0,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871334:G:T,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "22.58", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "2", "RAW_MQ": "7200.00", "VCF_ID": "rs4072383", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871334, "end": 871334, "reference": "G", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4072383"],
            "chromosome": "1",
            "reference": "G",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871334,
                "reference": "G",
                "alternate": "T",
                "id": "rs4072383",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+58G>T", "ENST00000342066(ENSG00000187634):c.430+58G>T", "ENST00000341065(ENSG00000187634):c.201+58G>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43061146,
                    "altAlleleFreq": 0.5628002,
                    "refHomGenotypeFreq": 0.21770738,
                    "hetGenotypeFreq": 0.42580813,
                    "altHomGenotypeFreq": 0.3564845
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.35507247,
                    "altAlleleFreq": 0.64492756,
                    "refHomGenotypeFreq": 0.14078675,
                    "hetGenotypeFreq": 0.42857143,
                    "altHomGenotypeFreq": 0.43064183
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4851301,
                    "altAlleleFreq": 0.51486987,
                    "refHomGenotypeFreq": 0.23172243,
                    "hetGenotypeFreq": 0.5068154,
                    "altHomGenotypeFreq": 0.2614622
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41985646,
                    "altAlleleFreq": 0.5801435,
                    "refHomGenotypeFreq": 0.17464115,
                    "hetGenotypeFreq": 0.49043062,
                    "altHomGenotypeFreq": 0.33492824
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.34768212,
                    "altAlleleFreq": 0.6523179,
                    "refHomGenotypeFreq": 0.09271523,
                    "hetGenotypeFreq": 0.50993377,
                    "altHomGenotypeFreq": 0.397351
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3538682,
                    "altAlleleFreq": 0.6461318,
                    "refHomGenotypeFreq": 0.1260745,
                    "hetGenotypeFreq": 0.4555874,
                    "altHomGenotypeFreq": 0.41833812
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29166108,
                    "altAlleleFreq": 0.7083389,
                    "refHomGenotypeFreq": 0.085132055,
                    "hetGenotypeFreq": 0.41305804,
                    "altHomGenotypeFreq": 0.5018099
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7022795,
                    "altAlleleFreq": 0.27434954,
                    "refHomGenotypeFreq": 0.4966613,
                    "hetGenotypeFreq": 0.41123646,
                    "altHomGenotypeFreq": 0.09210224
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43728733,
                    "altAlleleFreq": 0.5559662,
                    "refHomGenotypeFreq": 0.22597677,
                    "hetGenotypeFreq": 0.42262113,
                    "altHomGenotypeFreq": 0.3514021
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4223449,
                    "altAlleleFreq": 0.57126254,
                    "refHomGenotypeFreq": 0.20746768,
                    "hetGenotypeFreq": 0.42975447,
                    "altHomGenotypeFreq": 0.36277786
                }, {"study": "GONL", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.2995992, "altAlleleFreq": 0.7004008}, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.40625,
                    "altAlleleFreq": 0.59375,
                    "refHomGenotypeFreq": 0.1875,
                    "hetGenotypeFreq": 0.4375,
                    "altHomGenotypeFreq": 0.375
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.49540734,
                    "altAlleleFreq": 0.4978035,
                    "refHomGenotypeFreq": 0.29353034,
                    "hetGenotypeFreq": 0.403754,
                    "altHomGenotypeFreq": 0.30271566
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37116563,
                    "altAlleleFreq": 0.62781185,
                    "refHomGenotypeFreq": 0.14314929,
                    "hetGenotypeFreq": 0.4560327,
                    "altHomGenotypeFreq": 0.400818
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.39361703,
                    "altAlleleFreq": 0.60106385,
                    "refHomGenotypeFreq": 0.15957446,
                    "hetGenotypeFreq": 0.4680851,
                    "altHomGenotypeFreq": 0.3723404
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3872549,
                    "altAlleleFreq": 0.6127451,
                    "refHomGenotypeFreq": 0.15686275,
                    "hetGenotypeFreq": 0.46078432,
                    "altHomGenotypeFreq": 0.38235295
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7776097,
                    "altAlleleFreq": 0.19818456,
                    "refHomGenotypeFreq": 0.61270803,
                    "hetGenotypeFreq": 0.3298033,
                    "altHomGenotypeFreq": 0.05748865
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4952381,
                    "altAlleleFreq": 0.50476193,
                    "refHomGenotypeFreq": 0.24761905,
                    "hetGenotypeFreq": 0.49523813,
                    "altHomGenotypeFreq": 0.25714287
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.58653843,
                    "altAlleleFreq": 0.41346154,
                    "refHomGenotypeFreq": 0.3846154,
                    "hetGenotypeFreq": 0.40384614,
                    "altHomGenotypeFreq": 0.21153846
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8564815,
                    "altAlleleFreq": 0.11574074,
                    "refHomGenotypeFreq": 0.7222222,
                    "hetGenotypeFreq": 0.2685185,
                    "altHomGenotypeFreq": 0.009259259
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36979166,
                    "altAlleleFreq": 0.625,
                    "refHomGenotypeFreq": 0.17708333,
                    "hetGenotypeFreq": 0.38541666,
                    "altHomGenotypeFreq": 0.4375
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.78318584,
                    "altAlleleFreq": 0.19469027,
                    "refHomGenotypeFreq": 0.6460177,
                    "hetGenotypeFreq": 0.27433628,
                    "altHomGenotypeFreq": 0.07964602
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37745097,
                    "altAlleleFreq": 0.622549,
                    "refHomGenotypeFreq": 0.12745099,
                    "hetGenotypeFreq": 0.5,
                    "altHomGenotypeFreq": 0.37254903
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.30769232,
                    "altAlleleFreq": 0.6923077,
                    "refHomGenotypeFreq": 0.0989011,
                    "hetGenotypeFreq": 0.41758242,
                    "altHomGenotypeFreq": 0.48351648
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4247312,
                    "altAlleleFreq": 0.5752688,
                    "refHomGenotypeFreq": 0.21505377,
                    "hetGenotypeFreq": 0.41935486,
                    "altHomGenotypeFreq": 0.3655914
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47474748,
                    "altAlleleFreq": 0.5252525,
                    "refHomGenotypeFreq": 0.24242425,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.2929293
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.26168224,
                    "altAlleleFreq": 0.7383177,
                    "refHomGenotypeFreq": 0.093457945,
                    "hetGenotypeFreq": 0.3364486,
                    "altHomGenotypeFreq": 0.57009345
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37790698,
                    "altAlleleFreq": 0.622093,
                    "refHomGenotypeFreq": 0.13953489,
                    "hetGenotypeFreq": 0.47674417,
                    "altHomGenotypeFreq": 0.38372093
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.703125,
                    "altAlleleFreq": 0.26041666,
                    "refHomGenotypeFreq": 0.48958334,
                    "hetGenotypeFreq": 0.4270833,
                    "altHomGenotypeFreq": 0.083333336
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.82828283,
                    "altAlleleFreq": 0.14141414,
                    "refHomGenotypeFreq": 0.68686867,
                    "hetGenotypeFreq": 0.2828283,
                    "altHomGenotypeFreq": 0.030303031
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.74747473,
                    "altAlleleFreq": 0.24242425,
                    "refHomGenotypeFreq": 0.5555556,
                    "hetGenotypeFreq": 0.3838384,
                    "altHomGenotypeFreq": 0.060606062
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29025844,
                    "altAlleleFreq": 0.70974153,
                    "refHomGenotypeFreq": 0.091451295,
                    "hetGenotypeFreq": 0.3976143,
                    "altHomGenotypeFreq": 0.5109344
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.6803279,
                    "altAlleleFreq": 0.29508197,
                    "refHomGenotypeFreq": 0.45901638,
                    "hetGenotypeFreq": 0.44262293,
                    "altHomGenotypeFreq": 0.09836066
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41210374,
                    "altAlleleFreq": 0.58645535,
                    "refHomGenotypeFreq": 0.19020173,
                    "hetGenotypeFreq": 0.44380403,
                    "altHomGenotypeFreq": 0.36599424
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8,
                    "altAlleleFreq": 0.18235295,
                    "refHomGenotypeFreq": 0.65882355,
                    "hetGenotypeFreq": 0.28235295,
                    "altHomGenotypeFreq": 0.05882353
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3446602,
                    "altAlleleFreq": 0.6553398,
                    "refHomGenotypeFreq": 0.116504855,
                    "hetGenotypeFreq": 0.4563107,
                    "altHomGenotypeFreq": 0.42718446
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36363637,
                    "altAlleleFreq": 0.6363636,
                    "refHomGenotypeFreq": 0.13131313,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.4040404
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29439253,
                    "altAlleleFreq": 0.7056075,
                    "refHomGenotypeFreq": 0.07476635,
                    "hetGenotypeFreq": 0.43925232,
                    "altHomGenotypeFreq": 0.48598132
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3846154,
                    "altAlleleFreq": 0.61538464,
                    "refHomGenotypeFreq": 0.1923077,
                    "hetGenotypeFreq": 0.3846154,
                    "altHomGenotypeFreq": 0.42307693
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.22727273,
                    "altAlleleFreq": 0.77272725,
                    "refHomGenotypeFreq": 0.060606062,
                    "hetGenotypeFreq": 0.3333333,
                    "altHomGenotypeFreq": 0.6060606
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47058824,
                    "altAlleleFreq": 0.5294118,
                    "refHomGenotypeFreq": 0.22352941,
                    "hetGenotypeFreq": 0.49411768,
                    "altHomGenotypeFreq": 0.28235295
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.50793654,
                    "altAlleleFreq": 0.4920635,
                    "refHomGenotypeFreq": 0.2936508,
                    "hetGenotypeFreq": 0.4285714,
                    "altHomGenotypeFreq": 0.2777778
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.5485437,
                    "altAlleleFreq": 0.4514563,
                    "refHomGenotypeFreq": 0.36893204,
                    "hetGenotypeFreq": 0.3592233,
                    "altHomGenotypeFreq": 0.27184466
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.96067417,
                    "altAlleleFreq": 0.039325844,
                    "refHomGenotypeFreq": 0.9550562,
                    "hetGenotypeFreq": 0.011235955,
                    "altHomGenotypeFreq": 0.033707865
                }, {"study": "UK10K", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.27955568, "altAlleleFreq": 0.7204443}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2719642,
                    "altAlleleFreq": 0.7280358
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.28567722, "altAlleleFreq": 0.7143228}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2731931,
                    "altAlleleFreq": 0.7268069
                }],
                "conservation": [{"score": 0.5519999861717224, "source": "gerp"}, {"score": 0.01899999938905239, "source": "phastCons"}, {"score": 0.5609999895095825, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.05000019073486328, "source": "cadd_raw"}, {"score": 3.0999999046325684, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596038879458},
            "type": "SNV",
            "end": 871285,
            "start": 871285,
            "id": "1:871285:C:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 12.05,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "T",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "1,2,0", "3", "31", ".", ".", ".", "40,0,31,43,37,80", "0,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871285:C:T,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "10800.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "12.05",
                        "BaseQRankSum": "-0.967",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "3",
                        "ReadPosRankSum": "0.431"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871285, "end": 871285, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871285,
                "reference": "C",
                "alternate": "T",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+9C>T", "ENST00000342066(ENSG00000187634):c.430+9C>T", "ENST00000341065(ENSG00000187634):c.201+9C>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.9999918,
                    "altAlleleFreq": 0.000008235197,
                    "refHomGenotypeFreq": 0.99998355,
                    "hetGenotypeFreq": 0.000016470394,
                    "altHomGenotypeFreq": 0
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.99998504,
                    "altAlleleFreq": 0.0000149747675,
                    "refHomGenotypeFreq": 0.9999701,
                    "hetGenotypeFreq": 0.000029949535,
                    "altHomGenotypeFreq": 0
                }],
                "conservation": [{"score": -1.8300000429153442, "source": "gerp"}, {"score": 0.009999999776482582, "source": "phastCons"}, {"score": -0.257999986410141, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.19999980926513672, "source": "cadd_raw"}, {"score": 4.71999979019165, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596038879458},
            "type": "SNV",
            "end": 871334,
            "start": 871334,
            "id": "1:871334:G:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.7036199,
                    "missingAlleleCount": 0,
                    "fileCount": 70,
                    "mgf": 0.040723983,
                    "genotypeFreq": {"0/0": 0.68325794, "0/1": 0.040723983, "1/1": 0.2760181},
                    "refAlleleCount": 311,
                    "altAlleleCount": 131,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 151, "0/1": 9, "1/1": 61},
                    "filterCount": {"PASS": 0, ".": 70},
                    "qualityAvg": 54.26143,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.2963801,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 70,
                    "sampleCount": 221,
                    "maf": 0.2963801
                }, {
                    "refAlleleFreq": 0.6666667,
                    "missingAlleleCount": 0,
                    "fileCount": 5,
                    "mgf": 0.16666667,
                    "genotypeFreq": {"0/0": 0.5833333, "0/1": 0.16666667, "1/1": 0.25},
                    "refAlleleCount": 16,
                    "altAlleleCount": 8,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 7, "0/1": 2, "1/1": 3},
                    "filterCount": {"PASS": 0, ".": 5},
                    "qualityAvg": 38.982,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.33333334,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 5,
                    "sampleCount": 12,
                    "maf": 0.33333334
                }, {
                    "refAlleleFreq": 0.7173913,
                    "missingAlleleCount": 0,
                    "fileCount": 20,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.71014494, "0/1": 0.014492754, "1/1": 0.2753623},
                    "refAlleleCount": 99,
                    "altAlleleCount": 39,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 49, "0/1": 1, "1/1": 19},
                    "filterCount": {"PASS": 0, ".": 20},
                    "qualityAvg": 58.6455,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.2826087,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 20,
                    "sampleCount": 69,
                    "maf": 0.2826087
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,2,0", "2", "6", ".", ".", ".", "49,6,0,49,6,49", "0,0,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871334:G:T,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "22.58", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "2", "RAW_MQ": "7200.00", "VCF_ID": "rs4072383", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871334, "end": 871334, "reference": "G", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4072383"],
            "chromosome": "1",
            "reference": "G",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871334,
                "reference": "G",
                "alternate": "T",
                "id": "rs4072383",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+58G>T", "ENST00000342066(ENSG00000187634):c.430+58G>T", "ENST00000341065(ENSG00000187634):c.201+58G>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43061146,
                    "altAlleleFreq": 0.5628002,
                    "refHomGenotypeFreq": 0.21770738,
                    "hetGenotypeFreq": 0.42580813,
                    "altHomGenotypeFreq": 0.3564845
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.35507247,
                    "altAlleleFreq": 0.64492756,
                    "refHomGenotypeFreq": 0.14078675,
                    "hetGenotypeFreq": 0.42857143,
                    "altHomGenotypeFreq": 0.43064183
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4851301,
                    "altAlleleFreq": 0.51486987,
                    "refHomGenotypeFreq": 0.23172243,
                    "hetGenotypeFreq": 0.5068154,
                    "altHomGenotypeFreq": 0.2614622
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41985646,
                    "altAlleleFreq": 0.5801435,
                    "refHomGenotypeFreq": 0.17464115,
                    "hetGenotypeFreq": 0.49043062,
                    "altHomGenotypeFreq": 0.33492824
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.34768212,
                    "altAlleleFreq": 0.6523179,
                    "refHomGenotypeFreq": 0.09271523,
                    "hetGenotypeFreq": 0.50993377,
                    "altHomGenotypeFreq": 0.397351
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3538682,
                    "altAlleleFreq": 0.6461318,
                    "refHomGenotypeFreq": 0.1260745,
                    "hetGenotypeFreq": 0.4555874,
                    "altHomGenotypeFreq": 0.41833812
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29166108,
                    "altAlleleFreq": 0.7083389,
                    "refHomGenotypeFreq": 0.085132055,
                    "hetGenotypeFreq": 0.41305804,
                    "altHomGenotypeFreq": 0.5018099
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7022795,
                    "altAlleleFreq": 0.27434954,
                    "refHomGenotypeFreq": 0.4966613,
                    "hetGenotypeFreq": 0.41123646,
                    "altHomGenotypeFreq": 0.09210224
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43728733,
                    "altAlleleFreq": 0.5559662,
                    "refHomGenotypeFreq": 0.22597677,
                    "hetGenotypeFreq": 0.42262113,
                    "altHomGenotypeFreq": 0.3514021
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4223449,
                    "altAlleleFreq": 0.57126254,
                    "refHomGenotypeFreq": 0.20746768,
                    "hetGenotypeFreq": 0.42975447,
                    "altHomGenotypeFreq": 0.36277786
                }, {"study": "GONL", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.2995992, "altAlleleFreq": 0.7004008}, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.40625,
                    "altAlleleFreq": 0.59375,
                    "refHomGenotypeFreq": 0.1875,
                    "hetGenotypeFreq": 0.4375,
                    "altHomGenotypeFreq": 0.375
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.49540734,
                    "altAlleleFreq": 0.4978035,
                    "refHomGenotypeFreq": 0.29353034,
                    "hetGenotypeFreq": 0.403754,
                    "altHomGenotypeFreq": 0.30271566
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37116563,
                    "altAlleleFreq": 0.62781185,
                    "refHomGenotypeFreq": 0.14314929,
                    "hetGenotypeFreq": 0.4560327,
                    "altHomGenotypeFreq": 0.400818
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.39361703,
                    "altAlleleFreq": 0.60106385,
                    "refHomGenotypeFreq": 0.15957446,
                    "hetGenotypeFreq": 0.4680851,
                    "altHomGenotypeFreq": 0.3723404
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3872549,
                    "altAlleleFreq": 0.6127451,
                    "refHomGenotypeFreq": 0.15686275,
                    "hetGenotypeFreq": 0.46078432,
                    "altHomGenotypeFreq": 0.38235295
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7776097,
                    "altAlleleFreq": 0.19818456,
                    "refHomGenotypeFreq": 0.61270803,
                    "hetGenotypeFreq": 0.3298033,
                    "altHomGenotypeFreq": 0.05748865
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4952381,
                    "altAlleleFreq": 0.50476193,
                    "refHomGenotypeFreq": 0.24761905,
                    "hetGenotypeFreq": 0.49523813,
                    "altHomGenotypeFreq": 0.25714287
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.58653843,
                    "altAlleleFreq": 0.41346154,
                    "refHomGenotypeFreq": 0.3846154,
                    "hetGenotypeFreq": 0.40384614,
                    "altHomGenotypeFreq": 0.21153846
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8564815,
                    "altAlleleFreq": 0.11574074,
                    "refHomGenotypeFreq": 0.7222222,
                    "hetGenotypeFreq": 0.2685185,
                    "altHomGenotypeFreq": 0.009259259
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36979166,
                    "altAlleleFreq": 0.625,
                    "refHomGenotypeFreq": 0.17708333,
                    "hetGenotypeFreq": 0.38541666,
                    "altHomGenotypeFreq": 0.4375
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.78318584,
                    "altAlleleFreq": 0.19469027,
                    "refHomGenotypeFreq": 0.6460177,
                    "hetGenotypeFreq": 0.27433628,
                    "altHomGenotypeFreq": 0.07964602
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37745097,
                    "altAlleleFreq": 0.622549,
                    "refHomGenotypeFreq": 0.12745099,
                    "hetGenotypeFreq": 0.5,
                    "altHomGenotypeFreq": 0.37254903
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.30769232,
                    "altAlleleFreq": 0.6923077,
                    "refHomGenotypeFreq": 0.0989011,
                    "hetGenotypeFreq": 0.41758242,
                    "altHomGenotypeFreq": 0.48351648
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4247312,
                    "altAlleleFreq": 0.5752688,
                    "refHomGenotypeFreq": 0.21505377,
                    "hetGenotypeFreq": 0.41935486,
                    "altHomGenotypeFreq": 0.3655914
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47474748,
                    "altAlleleFreq": 0.5252525,
                    "refHomGenotypeFreq": 0.24242425,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.2929293
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.26168224,
                    "altAlleleFreq": 0.7383177,
                    "refHomGenotypeFreq": 0.093457945,
                    "hetGenotypeFreq": 0.3364486,
                    "altHomGenotypeFreq": 0.57009345
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37790698,
                    "altAlleleFreq": 0.622093,
                    "refHomGenotypeFreq": 0.13953489,
                    "hetGenotypeFreq": 0.47674417,
                    "altHomGenotypeFreq": 0.38372093
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.703125,
                    "altAlleleFreq": 0.26041666,
                    "refHomGenotypeFreq": 0.48958334,
                    "hetGenotypeFreq": 0.4270833,
                    "altHomGenotypeFreq": 0.083333336
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.82828283,
                    "altAlleleFreq": 0.14141414,
                    "refHomGenotypeFreq": 0.68686867,
                    "hetGenotypeFreq": 0.2828283,
                    "altHomGenotypeFreq": 0.030303031
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.74747473,
                    "altAlleleFreq": 0.24242425,
                    "refHomGenotypeFreq": 0.5555556,
                    "hetGenotypeFreq": 0.3838384,
                    "altHomGenotypeFreq": 0.060606062
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29025844,
                    "altAlleleFreq": 0.70974153,
                    "refHomGenotypeFreq": 0.091451295,
                    "hetGenotypeFreq": 0.3976143,
                    "altHomGenotypeFreq": 0.5109344
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.6803279,
                    "altAlleleFreq": 0.29508197,
                    "refHomGenotypeFreq": 0.45901638,
                    "hetGenotypeFreq": 0.44262293,
                    "altHomGenotypeFreq": 0.09836066
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41210374,
                    "altAlleleFreq": 0.58645535,
                    "refHomGenotypeFreq": 0.19020173,
                    "hetGenotypeFreq": 0.44380403,
                    "altHomGenotypeFreq": 0.36599424
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8,
                    "altAlleleFreq": 0.18235295,
                    "refHomGenotypeFreq": 0.65882355,
                    "hetGenotypeFreq": 0.28235295,
                    "altHomGenotypeFreq": 0.05882353
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3446602,
                    "altAlleleFreq": 0.6553398,
                    "refHomGenotypeFreq": 0.116504855,
                    "hetGenotypeFreq": 0.4563107,
                    "altHomGenotypeFreq": 0.42718446
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36363637,
                    "altAlleleFreq": 0.6363636,
                    "refHomGenotypeFreq": 0.13131313,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.4040404
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29439253,
                    "altAlleleFreq": 0.7056075,
                    "refHomGenotypeFreq": 0.07476635,
                    "hetGenotypeFreq": 0.43925232,
                    "altHomGenotypeFreq": 0.48598132
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3846154,
                    "altAlleleFreq": 0.61538464,
                    "refHomGenotypeFreq": 0.1923077,
                    "hetGenotypeFreq": 0.3846154,
                    "altHomGenotypeFreq": 0.42307693
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.22727273,
                    "altAlleleFreq": 0.77272725,
                    "refHomGenotypeFreq": 0.060606062,
                    "hetGenotypeFreq": 0.3333333,
                    "altHomGenotypeFreq": 0.6060606
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47058824,
                    "altAlleleFreq": 0.5294118,
                    "refHomGenotypeFreq": 0.22352941,
                    "hetGenotypeFreq": 0.49411768,
                    "altHomGenotypeFreq": 0.28235295
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.50793654,
                    "altAlleleFreq": 0.4920635,
                    "refHomGenotypeFreq": 0.2936508,
                    "hetGenotypeFreq": 0.4285714,
                    "altHomGenotypeFreq": 0.2777778
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.5485437,
                    "altAlleleFreq": 0.4514563,
                    "refHomGenotypeFreq": 0.36893204,
                    "hetGenotypeFreq": 0.3592233,
                    "altHomGenotypeFreq": 0.27184466
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.96067417,
                    "altAlleleFreq": 0.039325844,
                    "refHomGenotypeFreq": 0.9550562,
                    "hetGenotypeFreq": 0.011235955,
                    "altHomGenotypeFreq": 0.033707865
                }, {"study": "UK10K", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.27955568, "altAlleleFreq": 0.7204443}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2719642,
                    "altAlleleFreq": 0.7280358
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.28567722, "altAlleleFreq": 0.7143228}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2731931,
                    "altAlleleFreq": 0.7268069
                }],
                "conservation": [{"score": 0.5519999861717224, "source": "gerp"}, {"score": 0.01899999938905239, "source": "phastCons"}, {"score": 0.5609999895095825, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.05000019073486328, "source": "cadd_raw"}, {"score": 3.0999999046325684, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000474461", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000466827", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000464948", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000483767", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000327044", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000477976", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000496938", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001782", "name": "TF_binding_site_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596038879458},
            "type": "SNV",
            "end": 876491,
            "start": 876491,
            "id": "1:876491:C:A",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 9.31,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "A",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "2,2,0", "4", "37", ".", "0|1", "876491_C_A", "37,0,37,43,43,87", "1,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:876491:C:A,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "14400.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "9.31",
                        "BaseQRankSum": "-0.000",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "4",
                        "ReadPosRankSum": "1.383"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 876491, "end": 876491, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "A",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 876491,
                "reference": "C",
                "alternate": "A",
                "hgvs": ["ENST00000342066(ENSG00000187634):c.707-33C>A", "ENST00000341065(ENSG00000187634):c.430-33C>A", "ENST00000455979(ENSG00000187634):c.187-33C>A", "ENST00000478729(ENSG00000187634):n.118-33C>A", "ENST00000474461(ENSG00000187634):n.36C>A"],
                "displayConsequenceType": "non_coding_transcript_exon_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000474461",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "exonOverlap": [{"number": "1/4", "percentage": 0.43290043}],
                    "cdnaPosition": 36,
                    "sequenceOntologyTerms": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000466827",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000464948",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000483767",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000327044",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000477976",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000496938",
                    "strand": "-",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}, {
                    "sequenceOntologyTerms": [{
                        "accession": "SO:0001782",
                        "name": "TF_binding_site_variant"
                    }]
                }],
                "conservation": [{"score": -0.6050000190734863, "source": "gerp"}, {"score": 0.10899999737739563, "source": "phastCons"}, {"score": 0.1860000044107437, "source": "phylop"}],
                "geneTraitAssociation": [{
                    "id": "umls:C0035304",
                    "name": "Retinal Degeneration",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0699790",
                    "name": "Colon Carcinoma",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1140680",
                    "name": "Malignant neoplasm of ovary",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0029928",
                    "name": "Ovarian Diseases",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0028754",
                    "name": "Obesity",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1520166",
                    "name": "Xenograft Model",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007125",
                    "name": "Carcinoma, Ehrlich Tumor",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007102",
                    "name": "Malignant tumor of colon",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {"id": "umls:C0029925", "name": "OVARIAN CARCINOMA", "score": 0.00028350457, "numberOfPubmeds": 1, "associationTypes": ["Biomarker"], "sources": ["BeFree"], "source": "disgenet"}],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.7399997711181641, "source": "cadd_raw"}, {"score": 9.09000015258789, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039402782},
            "type": "SNV",
            "end": 871285,
            "start": 871285,
            "id": "1:871285:C:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 12.05,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "T",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "1,2,0", "3", "31", ".", ".", ".", "40,0,31,43,37,80", "0,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871285:C:T,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "10800.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "12.05",
                        "BaseQRankSum": "-0.967",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "3",
                        "ReadPosRankSum": "0.431"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871285, "end": 871285, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871285,
                "reference": "C",
                "alternate": "T",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+9C>T", "ENST00000342066(ENSG00000187634):c.430+9C>T", "ENST00000341065(ENSG00000187634):c.201+9C>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.9999918,
                    "altAlleleFreq": 0.000008235197,
                    "refHomGenotypeFreq": 0.99998355,
                    "hetGenotypeFreq": 0.000016470394,
                    "altHomGenotypeFreq": 0
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.99998504,
                    "altAlleleFreq": 0.0000149747675,
                    "refHomGenotypeFreq": 0.9999701,
                    "hetGenotypeFreq": 0.000029949535,
                    "altHomGenotypeFreq": 0
                }],
                "conservation": [{"score": -1.8300000429153442, "source": "gerp"}, {"score": 0.009999999776482582, "source": "phastCons"}, {"score": -0.257999986410141, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.19999980926513672, "source": "cadd_raw"}, {"score": 4.71999979019165, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039402782},
            "type": "SNV",
            "end": 871334,
            "start": 871334,
            "id": "1:871334:G:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.7036199,
                    "missingAlleleCount": 0,
                    "fileCount": 70,
                    "mgf": 0.040723983,
                    "genotypeFreq": {"0/0": 0.68325794, "0/1": 0.040723983, "1/1": 0.2760181},
                    "refAlleleCount": 311,
                    "altAlleleCount": 131,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 151, "0/1": 9, "1/1": 61},
                    "filterCount": {"PASS": 0, ".": 70},
                    "qualityAvg": 54.26143,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.2963801,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 70,
                    "sampleCount": 221,
                    "maf": 0.2963801
                }, {
                    "refAlleleFreq": 0.6666667,
                    "missingAlleleCount": 0,
                    "fileCount": 5,
                    "mgf": 0.16666667,
                    "genotypeFreq": {"0/0": 0.5833333, "0/1": 0.16666667, "1/1": 0.25},
                    "refAlleleCount": 16,
                    "altAlleleCount": 8,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 7, "0/1": 2, "1/1": 3},
                    "filterCount": {"PASS": 0, ".": 5},
                    "qualityAvg": 38.982,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.33333334,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 5,
                    "sampleCount": 12,
                    "maf": 0.33333334
                }, {
                    "refAlleleFreq": 0.7173913,
                    "missingAlleleCount": 0,
                    "fileCount": 20,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.71014494, "0/1": 0.014492754, "1/1": 0.2753623},
                    "refAlleleCount": 99,
                    "altAlleleCount": 39,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 49, "0/1": 1, "1/1": 19},
                    "filterCount": {"PASS": 0, ".": 20},
                    "qualityAvg": 58.6455,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.2826087,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 20,
                    "sampleCount": 69,
                    "maf": 0.2826087
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,2,0", "2", "6", ".", ".", ".", "49,6,0,49,6,49", "0,0,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871334:G:T,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "22.58", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "2", "RAW_MQ": "7200.00", "VCF_ID": "rs4072383", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871334, "end": 871334, "reference": "G", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4072383"],
            "chromosome": "1",
            "reference": "G",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871334,
                "reference": "G",
                "alternate": "T",
                "id": "rs4072383",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+58G>T", "ENST00000342066(ENSG00000187634):c.430+58G>T", "ENST00000341065(ENSG00000187634):c.201+58G>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43061146,
                    "altAlleleFreq": 0.5628002,
                    "refHomGenotypeFreq": 0.21770738,
                    "hetGenotypeFreq": 0.42580813,
                    "altHomGenotypeFreq": 0.3564845
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.35507247,
                    "altAlleleFreq": 0.64492756,
                    "refHomGenotypeFreq": 0.14078675,
                    "hetGenotypeFreq": 0.42857143,
                    "altHomGenotypeFreq": 0.43064183
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4851301,
                    "altAlleleFreq": 0.51486987,
                    "refHomGenotypeFreq": 0.23172243,
                    "hetGenotypeFreq": 0.5068154,
                    "altHomGenotypeFreq": 0.2614622
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41985646,
                    "altAlleleFreq": 0.5801435,
                    "refHomGenotypeFreq": 0.17464115,
                    "hetGenotypeFreq": 0.49043062,
                    "altHomGenotypeFreq": 0.33492824
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.34768212,
                    "altAlleleFreq": 0.6523179,
                    "refHomGenotypeFreq": 0.09271523,
                    "hetGenotypeFreq": 0.50993377,
                    "altHomGenotypeFreq": 0.397351
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3538682,
                    "altAlleleFreq": 0.6461318,
                    "refHomGenotypeFreq": 0.1260745,
                    "hetGenotypeFreq": 0.4555874,
                    "altHomGenotypeFreq": 0.41833812
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29166108,
                    "altAlleleFreq": 0.7083389,
                    "refHomGenotypeFreq": 0.085132055,
                    "hetGenotypeFreq": 0.41305804,
                    "altHomGenotypeFreq": 0.5018099
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7022795,
                    "altAlleleFreq": 0.27434954,
                    "refHomGenotypeFreq": 0.4966613,
                    "hetGenotypeFreq": 0.41123646,
                    "altHomGenotypeFreq": 0.09210224
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43728733,
                    "altAlleleFreq": 0.5559662,
                    "refHomGenotypeFreq": 0.22597677,
                    "hetGenotypeFreq": 0.42262113,
                    "altHomGenotypeFreq": 0.3514021
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4223449,
                    "altAlleleFreq": 0.57126254,
                    "refHomGenotypeFreq": 0.20746768,
                    "hetGenotypeFreq": 0.42975447,
                    "altHomGenotypeFreq": 0.36277786
                }, {"study": "GONL", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.2995992, "altAlleleFreq": 0.7004008}, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.40625,
                    "altAlleleFreq": 0.59375,
                    "refHomGenotypeFreq": 0.1875,
                    "hetGenotypeFreq": 0.4375,
                    "altHomGenotypeFreq": 0.375
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.49540734,
                    "altAlleleFreq": 0.4978035,
                    "refHomGenotypeFreq": 0.29353034,
                    "hetGenotypeFreq": 0.403754,
                    "altHomGenotypeFreq": 0.30271566
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37116563,
                    "altAlleleFreq": 0.62781185,
                    "refHomGenotypeFreq": 0.14314929,
                    "hetGenotypeFreq": 0.4560327,
                    "altHomGenotypeFreq": 0.400818
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.39361703,
                    "altAlleleFreq": 0.60106385,
                    "refHomGenotypeFreq": 0.15957446,
                    "hetGenotypeFreq": 0.4680851,
                    "altHomGenotypeFreq": 0.3723404
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3872549,
                    "altAlleleFreq": 0.6127451,
                    "refHomGenotypeFreq": 0.15686275,
                    "hetGenotypeFreq": 0.46078432,
                    "altHomGenotypeFreq": 0.38235295
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7776097,
                    "altAlleleFreq": 0.19818456,
                    "refHomGenotypeFreq": 0.61270803,
                    "hetGenotypeFreq": 0.3298033,
                    "altHomGenotypeFreq": 0.05748865
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4952381,
                    "altAlleleFreq": 0.50476193,
                    "refHomGenotypeFreq": 0.24761905,
                    "hetGenotypeFreq": 0.49523813,
                    "altHomGenotypeFreq": 0.25714287
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.58653843,
                    "altAlleleFreq": 0.41346154,
                    "refHomGenotypeFreq": 0.3846154,
                    "hetGenotypeFreq": 0.40384614,
                    "altHomGenotypeFreq": 0.21153846
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8564815,
                    "altAlleleFreq": 0.11574074,
                    "refHomGenotypeFreq": 0.7222222,
                    "hetGenotypeFreq": 0.2685185,
                    "altHomGenotypeFreq": 0.009259259
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36979166,
                    "altAlleleFreq": 0.625,
                    "refHomGenotypeFreq": 0.17708333,
                    "hetGenotypeFreq": 0.38541666,
                    "altHomGenotypeFreq": 0.4375
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.78318584,
                    "altAlleleFreq": 0.19469027,
                    "refHomGenotypeFreq": 0.6460177,
                    "hetGenotypeFreq": 0.27433628,
                    "altHomGenotypeFreq": 0.07964602
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37745097,
                    "altAlleleFreq": 0.622549,
                    "refHomGenotypeFreq": 0.12745099,
                    "hetGenotypeFreq": 0.5,
                    "altHomGenotypeFreq": 0.37254903
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.30769232,
                    "altAlleleFreq": 0.6923077,
                    "refHomGenotypeFreq": 0.0989011,
                    "hetGenotypeFreq": 0.41758242,
                    "altHomGenotypeFreq": 0.48351648
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4247312,
                    "altAlleleFreq": 0.5752688,
                    "refHomGenotypeFreq": 0.21505377,
                    "hetGenotypeFreq": 0.41935486,
                    "altHomGenotypeFreq": 0.3655914
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47474748,
                    "altAlleleFreq": 0.5252525,
                    "refHomGenotypeFreq": 0.24242425,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.2929293
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.26168224,
                    "altAlleleFreq": 0.7383177,
                    "refHomGenotypeFreq": 0.093457945,
                    "hetGenotypeFreq": 0.3364486,
                    "altHomGenotypeFreq": 0.57009345
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37790698,
                    "altAlleleFreq": 0.622093,
                    "refHomGenotypeFreq": 0.13953489,
                    "hetGenotypeFreq": 0.47674417,
                    "altHomGenotypeFreq": 0.38372093
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.703125,
                    "altAlleleFreq": 0.26041666,
                    "refHomGenotypeFreq": 0.48958334,
                    "hetGenotypeFreq": 0.4270833,
                    "altHomGenotypeFreq": 0.083333336
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.82828283,
                    "altAlleleFreq": 0.14141414,
                    "refHomGenotypeFreq": 0.68686867,
                    "hetGenotypeFreq": 0.2828283,
                    "altHomGenotypeFreq": 0.030303031
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.74747473,
                    "altAlleleFreq": 0.24242425,
                    "refHomGenotypeFreq": 0.5555556,
                    "hetGenotypeFreq": 0.3838384,
                    "altHomGenotypeFreq": 0.060606062
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29025844,
                    "altAlleleFreq": 0.70974153,
                    "refHomGenotypeFreq": 0.091451295,
                    "hetGenotypeFreq": 0.3976143,
                    "altHomGenotypeFreq": 0.5109344
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.6803279,
                    "altAlleleFreq": 0.29508197,
                    "refHomGenotypeFreq": 0.45901638,
                    "hetGenotypeFreq": 0.44262293,
                    "altHomGenotypeFreq": 0.09836066
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41210374,
                    "altAlleleFreq": 0.58645535,
                    "refHomGenotypeFreq": 0.19020173,
                    "hetGenotypeFreq": 0.44380403,
                    "altHomGenotypeFreq": 0.36599424
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8,
                    "altAlleleFreq": 0.18235295,
                    "refHomGenotypeFreq": 0.65882355,
                    "hetGenotypeFreq": 0.28235295,
                    "altHomGenotypeFreq": 0.05882353
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3446602,
                    "altAlleleFreq": 0.6553398,
                    "refHomGenotypeFreq": 0.116504855,
                    "hetGenotypeFreq": 0.4563107,
                    "altHomGenotypeFreq": 0.42718446
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36363637,
                    "altAlleleFreq": 0.6363636,
                    "refHomGenotypeFreq": 0.13131313,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.4040404
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29439253,
                    "altAlleleFreq": 0.7056075,
                    "refHomGenotypeFreq": 0.07476635,
                    "hetGenotypeFreq": 0.43925232,
                    "altHomGenotypeFreq": 0.48598132
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3846154,
                    "altAlleleFreq": 0.61538464,
                    "refHomGenotypeFreq": 0.1923077,
                    "hetGenotypeFreq": 0.3846154,
                    "altHomGenotypeFreq": 0.42307693
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.22727273,
                    "altAlleleFreq": 0.77272725,
                    "refHomGenotypeFreq": 0.060606062,
                    "hetGenotypeFreq": 0.3333333,
                    "altHomGenotypeFreq": 0.6060606
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47058824,
                    "altAlleleFreq": 0.5294118,
                    "refHomGenotypeFreq": 0.22352941,
                    "hetGenotypeFreq": 0.49411768,
                    "altHomGenotypeFreq": 0.28235295
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.50793654,
                    "altAlleleFreq": 0.4920635,
                    "refHomGenotypeFreq": 0.2936508,
                    "hetGenotypeFreq": 0.4285714,
                    "altHomGenotypeFreq": 0.2777778
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.5485437,
                    "altAlleleFreq": 0.4514563,
                    "refHomGenotypeFreq": 0.36893204,
                    "hetGenotypeFreq": 0.3592233,
                    "altHomGenotypeFreq": 0.27184466
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.96067417,
                    "altAlleleFreq": 0.039325844,
                    "refHomGenotypeFreq": 0.9550562,
                    "hetGenotypeFreq": 0.011235955,
                    "altHomGenotypeFreq": 0.033707865
                }, {"study": "UK10K", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.27955568, "altAlleleFreq": 0.7204443}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2719642,
                    "altAlleleFreq": 0.7280358
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.28567722, "altAlleleFreq": 0.7143228}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2731931,
                    "altAlleleFreq": 0.7268069
                }],
                "conservation": [{"score": 0.5519999861717224, "source": "gerp"}, {"score": 0.01899999938905239, "source": "phastCons"}, {"score": 0.5609999895095825, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.05000019073486328, "source": "cadd_raw"}, {"score": 3.0999999046325684, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000474461", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000466827", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000464948", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000483767", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000327044", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000477976", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000496938", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001782", "name": "TF_binding_site_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039402782},
            "type": "SNV",
            "end": 876491,
            "start": 876491,
            "id": "1:876491:C:A",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 9.31,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "A",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "2,2,0", "4", "37", ".", "0|1", "876491_C_A", "37,0,37,43,43,87", "1,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:876491:C:A,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "14400.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "9.31",
                        "BaseQRankSum": "-0.000",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "4",
                        "ReadPosRankSum": "1.383"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 876491, "end": 876491, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "A",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 876491,
                "reference": "C",
                "alternate": "A",
                "hgvs": ["ENST00000342066(ENSG00000187634):c.707-33C>A", "ENST00000341065(ENSG00000187634):c.430-33C>A", "ENST00000455979(ENSG00000187634):c.187-33C>A", "ENST00000478729(ENSG00000187634):n.118-33C>A", "ENST00000474461(ENSG00000187634):n.36C>A"],
                "displayConsequenceType": "non_coding_transcript_exon_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000474461",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "exonOverlap": [{"number": "1/4", "percentage": 0.43290043}],
                    "cdnaPosition": 36,
                    "sequenceOntologyTerms": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000466827",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000464948",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000483767",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000327044",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000477976",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000496938",
                    "strand": "-",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}, {
                    "sequenceOntologyTerms": [{
                        "accession": "SO:0001782",
                        "name": "TF_binding_site_variant"
                    }]
                }],
                "conservation": [{"score": -0.6050000190734863, "source": "gerp"}, {"score": 0.10899999737739563, "source": "phastCons"}, {"score": 0.1860000044107437, "source": "phylop"}],
                "geneTraitAssociation": [{
                    "id": "umls:C0035304",
                    "name": "Retinal Degeneration",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0699790",
                    "name": "Colon Carcinoma",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1140680",
                    "name": "Malignant neoplasm of ovary",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0029928",
                    "name": "Ovarian Diseases",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0028754",
                    "name": "Obesity",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1520166",
                    "name": "Xenograft Model",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007125",
                    "name": "Carcinoma, Ehrlich Tumor",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007102",
                    "name": "Malignant tumor of colon",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {"id": "umls:C0029925", "name": "OVARIAN CARCINOMA", "score": 0.00028350457, "numberOfPubmeds": 1, "associationTypes": ["Biomarker"], "sources": ["BeFree"], "source": "disgenet"}],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.7399997711181641, "source": "cadd_raw"}, {"score": 9.09000015258789, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000474461", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000466827", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000464948", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000483767", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000327044", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000477976", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000496938", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001782", "name": "TF_binding_site_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039402782},
            "type": "SNV",
            "end": 876499,
            "start": 876499,
            "id": "1:876499:A:G",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.6266968,
                    "missingAlleleCount": 0,
                    "fileCount": 84,
                    "mgf": 0.013574661,
                    "genotypeFreq": {"0/0": 0.6199095, "0/1": 0.013574661, "1/1": 0.36651585},
                    "refAlleleCount": 277,
                    "altAlleleCount": 165,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 137, "0/1": 3, "1/1": 81},
                    "filterCount": {"PASS": 0, ".": 84},
                    "qualityAvg": 58.359524,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.37330317,
                    "mafAllele": "G",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 84,
                    "sampleCount": 221,
                    "maf": 0.37330317
                }, {
                    "refAlleleFreq": 0.5,
                    "missingAlleleCount": 0,
                    "fileCount": 6,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.5, "0/1": 0, "1/1": 0.5},
                    "refAlleleCount": 12,
                    "altAlleleCount": 12,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 6, "0/1": 0, "1/1": 6},
                    "filterCount": {"PASS": 0, ".": 6},
                    "qualityAvg": 42.855,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.5,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 6,
                    "sampleCount": 12,
                    "maf": 0.5
                }, {
                    "refAlleleFreq": 0.5869565,
                    "missingAlleleCount": 0,
                    "fileCount": 29,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.5797101, "0/1": 0.014492754, "1/1": 0.4057971},
                    "refAlleleCount": 81,
                    "altAlleleCount": 57,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 40, "0/1": 1, "1/1": 28},
                    "filterCount": {"PASS": 0, ".": 29},
                    "qualityAvg": 56.771034,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.41304347,
                    "mafAllele": "G",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 29,
                    "sampleCount": 69,
                    "maf": 0.41304347
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,4,0", "4", "12", ".", "0|1", "876491_C_A", "139,12,0,139,12,139", "0,0,2,2"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:876499:A:G,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "111.03", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "4", "RAW_MQ": "14400.00", "VCF_ID": "rs4372192", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 876499, "end": 876499, "reference": "A", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4372192"],
            "chromosome": "1",
            "reference": "A",
            "alternate": "G",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 876499,
                "reference": "A",
                "alternate": "G",
                "id": "rs4372192",
                "hgvs": ["ENST00000342066(ENSG00000187634):c.707-25A>G", "ENST00000341065(ENSG00000187634):c.430-25A>G", "ENST00000455979(ENSG00000187634):c.187-25A>G", "ENST00000478729(ENSG00000187634):n.118-25A>G", "ENST00000474461(ENSG00000187634):n.44A>G"],
                "displayConsequenceType": "non_coding_transcript_exon_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000474461",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "exonOverlap": [{"number": "1/4", "percentage": 0.43290043}],
                    "cdnaPosition": 44,
                    "sequenceOntologyTerms": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000466827",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000464948",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000483767",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000327044",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000477976",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000496938",
                    "strand": "-",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}, {
                    "sequenceOntologyTerms": [{
                        "accession": "SO:0001782",
                        "name": "TF_binding_site_variant"
                    }]
                }],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.066567704,
                    "altAlleleFreq": 0.9334323,
                    "refHomGenotypeFreq": 0.0049407883,
                    "hetGenotypeFreq": 0.12325383,
                    "altHomGenotypeFreq": 0.87180537
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06641895,
                    "altAlleleFreq": 0.93358105,
                    "refHomGenotypeFreq": 0.0037157454,
                    "hetGenotypeFreq": 0.12540641,
                    "altHomGenotypeFreq": 0.87087786
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08983957,
                    "altAlleleFreq": 0.9101604,
                    "refHomGenotypeFreq": 0.00855615,
                    "hetGenotypeFreq": 0.16256684,
                    "altHomGenotypeFreq": 0.82887703
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.04885809,
                    "altAlleleFreq": 0.9511419,
                    "refHomGenotypeFreq": 0.0028282544,
                    "hetGenotypeFreq": 0.09205968,
                    "altHomGenotypeFreq": 0.9051121
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "ASJ",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.067721665,
                    "altAlleleFreq": 0.93227834,
                    "refHomGenotypeFreq": 0.00465441,
                    "hetGenotypeFreq": 0.12613451,
                    "altHomGenotypeFreq": 0.8692111
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.039462786,
                    "altAlleleFreq": 0.9605372,
                    "refHomGenotypeFreq": 0.0015382795,
                    "hetGenotypeFreq": 0.07584901,
                    "altHomGenotypeFreq": 0.9226127
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06175331,
                    "altAlleleFreq": 0.93824667,
                    "refHomGenotypeFreq": 0.003255839,
                    "hetGenotypeFreq": 0.11699494,
                    "altHomGenotypeFreq": 0.87974924
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12775286,
                    "altAlleleFreq": 0.87224716,
                    "refHomGenotypeFreq": 0.01774062,
                    "hetGenotypeFreq": 0.22002447,
                    "altHomGenotypeFreq": 0.7622349
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06744671,
                    "altAlleleFreq": 0.9325533,
                    "refHomGenotypeFreq": 0.0047925566,
                    "hetGenotypeFreq": 0.1253083,
                    "altHomGenotypeFreq": 0.86989915
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "FEMALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.065482676,
                    "altAlleleFreq": 0.9345173,
                    "refHomGenotypeFreq": 0.0051237624,
                    "hetGenotypeFreq": 0.12071782,
                    "altHomGenotypeFreq": 0.87415844
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.071645945,
                    "altAlleleFreq": 0.928354,
                    "refHomGenotypeFreq": 0.006021756,
                    "hetGenotypeFreq": 0.13124838,
                    "altHomGenotypeFreq": 0.86272985
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.051229507,
                    "altAlleleFreq": 0.94877046,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.10245901,
                    "altHomGenotypeFreq": 0.897541
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.086741015,
                    "altAlleleFreq": 0.91325897,
                    "refHomGenotypeFreq": 0.0049566296,
                    "hetGenotypeFreq": 0.16356878,
                    "altHomGenotypeFreq": 0.8314746
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.0548926,
                    "altAlleleFreq": 0.9451074,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.1097852,
                    "altHomGenotypeFreq": 0.8902148
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07615894,
                    "altAlleleFreq": 0.92384106,
                    "refHomGenotypeFreq": 0.013245033,
                    "hetGenotypeFreq": 0.12582782,
                    "altHomGenotypeFreq": 0.86092716
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.038704127,
                    "altAlleleFreq": 0.96129584,
                    "refHomGenotypeFreq": 0.0017201835,
                    "hetGenotypeFreq": 0.07396789,
                    "altHomGenotypeFreq": 0.92431194
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.05438995,
                    "altAlleleFreq": 0.94561005,
                    "refHomGenotypeFreq": 0.0037418148,
                    "hetGenotypeFreq": 0.10129627,
                    "altHomGenotypeFreq": 0.8949619
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11546415,
                    "altAlleleFreq": 0.88453585,
                    "refHomGenotypeFreq": 0.012867647,
                    "hetGenotypeFreq": 0.20519301,
                    "altHomGenotypeFreq": 0.7819393
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07262504,
                    "altAlleleFreq": 0.92737496,
                    "refHomGenotypeFreq": 0.0059739957,
                    "hetGenotypeFreq": 0.1333021,
                    "altHomGenotypeFreq": 0.8607239
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07043579,
                    "altAlleleFreq": 0.92956424,
                    "refHomGenotypeFreq": 0.0060807876,
                    "hetGenotypeFreq": 0.12871,
                    "altHomGenotypeFreq": 0.8652092
                }, {
                    "study": "ESP6500",
                    "population": "AA",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11668959,
                    "altAlleleFreq": 0.88331044,
                    "refHomGenotypeFreq": 0.018798716,
                    "hetGenotypeFreq": 0.19578175,
                    "altHomGenotypeFreq": 0.7854195
                }, {
                    "study": "ESP6500",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08071019,
                    "altAlleleFreq": 0.9192898,
                    "refHomGenotypeFreq": 0.0122499615,
                    "hetGenotypeFreq": 0.13692045,
                    "altHomGenotypeFreq": 0.8508296
                }, {
                    "study": "ESP6500",
                    "population": "EA",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.062324274,
                    "altAlleleFreq": 0.9376757,
                    "refHomGenotypeFreq": 0.008903468,
                    "hetGenotypeFreq": 0.10684161,
                    "altHomGenotypeFreq": 0.88425493
                }, {"study": "GONL", "population": "ALL", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.061122246, "altAlleleFreq": 0.93887776}, {
                    "study": "EXAC",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.072435744,
                    "altAlleleFreq": 0.92756426,
                    "refHomGenotypeFreq": 0.003148636,
                    "hetGenotypeFreq": 0.13857421,
                    "altHomGenotypeFreq": 0.85827714
                }, {
                    "study": "EXAC",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.054245282,
                    "altAlleleFreq": 0.9457547,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.108490564,
                    "altHomGenotypeFreq": 0.8915094
                }, {
                    "study": "EXAC",
                    "population": "SAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08316067,
                    "altAlleleFreq": 0.9168393,
                    "refHomGenotypeFreq": 0.006404219,
                    "hetGenotypeFreq": 0.15351291,
                    "altHomGenotypeFreq": 0.8400829
                }, {
                    "study": "EXAC",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.088508554,
                    "altAlleleFreq": 0.91149145,
                    "refHomGenotypeFreq": 0.0019559902,
                    "hetGenotypeFreq": 0.17310514,
                    "altHomGenotypeFreq": 0.8249389
                }, {
                    "study": "EXAC",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.05041712,
                    "altAlleleFreq": 0.9495829,
                    "refHomGenotypeFreq": 0.0007254262,
                    "hetGenotypeFreq": 0.09938339,
                    "altHomGenotypeFreq": 0.8998912
                }, {
                    "study": "EXAC",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.04094579,
                    "altAlleleFreq": 0.95905423,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.08189158,
                    "altHomGenotypeFreq": 0.9181084
                }, {
                    "study": "EXAC",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06496313,
                    "altAlleleFreq": 0.93503684,
                    "refHomGenotypeFreq": 0.0023518943,
                    "hetGenotypeFreq": 0.12522247,
                    "altHomGenotypeFreq": 0.8724256
                }, {
                    "study": "EXAC",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12451023,
                    "altAlleleFreq": 0.8754898,
                    "refHomGenotypeFreq": 0.006530257,
                    "hetGenotypeFreq": 0.23595995,
                    "altHomGenotypeFreq": 0.75750977
                }, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.0625,
                    "altAlleleFreq": 0.9375,
                    "refHomGenotypeFreq": 0.015625,
                    "hetGenotypeFreq": 0.09375,
                    "altHomGenotypeFreq": 0.890625
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08686102,
                    "altAlleleFreq": 0.913139,
                    "refHomGenotypeFreq": 0.0063897762,
                    "hetGenotypeFreq": 0.1609425,
                    "altHomGenotypeFreq": 0.8326677
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.084867075,
                    "altAlleleFreq": 0.91513294,
                    "refHomGenotypeFreq": 0.006134969,
                    "hetGenotypeFreq": 0.1574642,
                    "altHomGenotypeFreq": 0.8364008
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06382979,
                    "altAlleleFreq": 0.9361702,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12765957,
                    "altHomGenotypeFreq": 0.87234044
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.063725494,
                    "altAlleleFreq": 0.9362745,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12745099,
                    "altHomGenotypeFreq": 0.872549
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12632374,
                    "altAlleleFreq": 0.87367624,
                    "refHomGenotypeFreq": 0.012102874,
                    "hetGenotypeFreq": 0.22844175,
                    "altHomGenotypeFreq": 0.7594554
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.10952381,
                    "altAlleleFreq": 0.89047617,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.21904762,
                    "altHomGenotypeFreq": 0.7809524
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.057692308,
                    "altAlleleFreq": 0.9423077,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.11538462,
                    "altHomGenotypeFreq": 0.88461536
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.16666667,
                    "altAlleleFreq": 0.8333333,
                    "refHomGenotypeFreq": 0.018518519,
                    "hetGenotypeFreq": 0.2962963,
                    "altHomGenotypeFreq": 0.6851852
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.09375,
                    "altAlleleFreq": 0.90625,
                    "refHomGenotypeFreq": 0.010416667,
                    "hetGenotypeFreq": 0.16666667,
                    "altHomGenotypeFreq": 0.8229167
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.119469024,
                    "altAlleleFreq": 0.88053095,
                    "refHomGenotypeFreq": 0.0088495575,
                    "hetGenotypeFreq": 0.22123894,
                    "altHomGenotypeFreq": 0.7699115
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.063725494,
                    "altAlleleFreq": 0.9362745,
                    "refHomGenotypeFreq": 0.009803922,
                    "hetGenotypeFreq": 0.10784314,
                    "altHomGenotypeFreq": 0.88235295
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.021978023,
                    "altAlleleFreq": 0.978022,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.043956045,
                    "altHomGenotypeFreq": 0.95604396
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.09139785,
                    "altAlleleFreq": 0.9086022,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.1827957,
                    "altHomGenotypeFreq": 0.8172043
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08585858,
                    "altAlleleFreq": 0.9141414,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.17171717,
                    "altHomGenotypeFreq": 0.82828283
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.060747664,
                    "altAlleleFreq": 0.9392523,
                    "refHomGenotypeFreq": 0.009345794,
                    "hetGenotypeFreq": 0.10280374,
                    "altHomGenotypeFreq": 0.88785046
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.069767445,
                    "altAlleleFreq": 0.9302326,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.13953489,
                    "altHomGenotypeFreq": 0.8604651
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.104166664,
                    "altAlleleFreq": 0.8958333,
                    "refHomGenotypeFreq": 0.010416667,
                    "hetGenotypeFreq": 0.1875,
                    "altHomGenotypeFreq": 0.8020833
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.116161615,
                    "altAlleleFreq": 0.88383836,
                    "refHomGenotypeFreq": 0.01010101,
                    "hetGenotypeFreq": 0.21212122,
                    "altHomGenotypeFreq": 0.7777778
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.10606061,
                    "altAlleleFreq": 0.8939394,
                    "refHomGenotypeFreq": 0.01010101,
                    "hetGenotypeFreq": 0.1919192,
                    "altHomGenotypeFreq": 0.7979798
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.049701788,
                    "altAlleleFreq": 0.9502982,
                    "refHomGenotypeFreq": 0.0019880715,
                    "hetGenotypeFreq": 0.09542744,
                    "altHomGenotypeFreq": 0.9025845
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12295082,
                    "altAlleleFreq": 0.8770492,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.24590163,
                    "altHomGenotypeFreq": 0.75409836
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07925072,
                    "altAlleleFreq": 0.9207493,
                    "refHomGenotypeFreq": 0.011527377,
                    "hetGenotypeFreq": 0.13544668,
                    "altHomGenotypeFreq": 0.8530259
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.14705883,
                    "altAlleleFreq": 0.85294116,
                    "refHomGenotypeFreq": 0.023529412,
                    "hetGenotypeFreq": 0.24705884,
                    "altHomGenotypeFreq": 0.7294118
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.13106796,
                    "altAlleleFreq": 0.86893207,
                    "refHomGenotypeFreq": 0.009708738,
                    "hetGenotypeFreq": 0.24271846,
                    "altHomGenotypeFreq": 0.74757284
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.035353534,
                    "altAlleleFreq": 0.96464646,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.07070707,
                    "altHomGenotypeFreq": 0.9292929
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.060747664,
                    "altAlleleFreq": 0.9392523,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12149532,
                    "altHomGenotypeFreq": 0.8785047
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07692308,
                    "altAlleleFreq": 0.9230769,
                    "refHomGenotypeFreq": 0.009615385,
                    "hetGenotypeFreq": 0.13461539,
                    "altHomGenotypeFreq": 0.8557692
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.065656565,
                    "altAlleleFreq": 0.93434346,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.13131313,
                    "altHomGenotypeFreq": 0.86868685
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11176471,
                    "altAlleleFreq": 0.8882353,
                    "refHomGenotypeFreq": 0.023529412,
                    "hetGenotypeFreq": 0.1764706,
                    "altHomGenotypeFreq": 0.8
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07936508,
                    "altAlleleFreq": 0.9206349,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.15873016,
                    "altHomGenotypeFreq": 0.84126985
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.053398058,
                    "altAlleleFreq": 0.9466019,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.106796116,
                    "altHomGenotypeFreq": 0.89320385
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.9868914,
                    "altAlleleFreq": 0.013108614,
                    "refHomGenotypeFreq": 0.98501873,
                    "hetGenotypeFreq": 0.0037453184,
                    "altHomGenotypeFreq": 0.011235955
                }, {"study": "UK10K", "population": "ALL", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.049722295, "altAlleleFreq": 0.9502777}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.048684947,
                    "altAlleleFreq": 0.95131505
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.051115725, "altAlleleFreq": 0.94888425}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.048274003,
                    "altAlleleFreq": 0.951726
                }],
                "conservation": [{"score": 0.8149999976158142, "source": "gerp"}, {"score": 0.12600000202655792, "source": "phastCons"}, {"score": -1.0390000343322754, "source": "phylop"}],
                "geneTraitAssociation": [{
                    "id": "umls:C0035304",
                    "name": "Retinal Degeneration",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0699790",
                    "name": "Colon Carcinoma",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1140680",
                    "name": "Malignant neoplasm of ovary",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0029928",
                    "name": "Ovarian Diseases",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0028754",
                    "name": "Obesity",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1520166",
                    "name": "Xenograft Model",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007125",
                    "name": "Carcinoma, Ehrlich Tumor",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007102",
                    "name": "Malignant tumor of colon",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {"id": "umls:C0029925", "name": "OVARIAN CARCINOMA", "score": 0.00028350457, "numberOfPubmeds": 1, "associationTypes": ["Biomarker"], "sources": ["BeFree"], "source": "disgenet"}],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.5500001907348633, "source": "cadd_raw"}, {"score": 7.860000133514404, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039541066},
            "type": "SNV",
            "end": 871285,
            "start": 871285,
            "id": "1:871285:C:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 12.05,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "T",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "1,2,0", "3", "31", ".", ".", ".", "40,0,31,43,37,80", "0,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871285:C:T,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "10800.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "12.05",
                        "BaseQRankSum": "-0.967",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "3",
                        "ReadPosRankSum": "0.431"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871285, "end": 871285, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871285,
                "reference": "C",
                "alternate": "T",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+9C>T", "ENST00000342066(ENSG00000187634):c.430+9C>T", "ENST00000341065(ENSG00000187634):c.201+9C>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.9999918,
                    "altAlleleFreq": 0.000008235197,
                    "refHomGenotypeFreq": 0.99998355,
                    "hetGenotypeFreq": 0.000016470394,
                    "altHomGenotypeFreq": 0
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "C",
                    "altAllele": "T",
                    "refAlleleFreq": 0.99998504,
                    "altAlleleFreq": 0.0000149747675,
                    "refHomGenotypeFreq": 0.9999701,
                    "hetGenotypeFreq": 0.000029949535,
                    "altHomGenotypeFreq": 0
                }],
                "conservation": [{"score": -1.8300000429153442, "source": "gerp"}, {"score": 0.009999999776482582, "source": "phastCons"}, {"score": -0.257999986410141, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.19999980926513672, "source": "cadd_raw"}, {"score": 4.71999979019165, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000437963", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000268179", "type": "GENE", "transcriptId": "ENST00000598827", "geneName": "AL645608.1"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039541066},
            "type": "SNV",
            "end": 871334,
            "start": 871334,
            "id": "1:871334:G:T",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.7036199,
                    "missingAlleleCount": 0,
                    "fileCount": 70,
                    "mgf": 0.040723983,
                    "genotypeFreq": {"0/0": 0.68325794, "0/1": 0.040723983, "1/1": 0.2760181},
                    "refAlleleCount": 311,
                    "altAlleleCount": 131,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 151, "0/1": 9, "1/1": 61},
                    "filterCount": {"PASS": 0, ".": 70},
                    "qualityAvg": 54.26143,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.2963801,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 70,
                    "sampleCount": 221,
                    "maf": 0.2963801
                }, {
                    "refAlleleFreq": 0.6666667,
                    "missingAlleleCount": 0,
                    "fileCount": 5,
                    "mgf": 0.16666667,
                    "genotypeFreq": {"0/0": 0.5833333, "0/1": 0.16666667, "1/1": 0.25},
                    "refAlleleCount": 16,
                    "altAlleleCount": 8,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 7, "0/1": 2, "1/1": 3},
                    "filterCount": {"PASS": 0, ".": 5},
                    "qualityAvg": 38.982,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.33333334,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 5,
                    "sampleCount": 12,
                    "maf": 0.33333334
                }, {
                    "refAlleleFreq": 0.7173913,
                    "missingAlleleCount": 0,
                    "fileCount": 20,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.71014494, "0/1": 0.014492754, "1/1": 0.2753623},
                    "refAlleleCount": 99,
                    "altAlleleCount": 39,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 49, "0/1": 1, "1/1": 19},
                    "filterCount": {"PASS": 0, ".": 20},
                    "qualityAvg": 58.6455,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.2826087,
                    "mafAllele": "T",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 20,
                    "sampleCount": 69,
                    "maf": 0.2826087
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,2,0", "2", "6", ".", ".", ".", "49,6,0,49,6,49", "0,0,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:871334:G:T,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "22.58", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "2", "RAW_MQ": "7200.00", "VCF_ID": "rs4072383", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 871334, "end": 871334, "reference": "G", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4072383"],
            "chromosome": "1",
            "reference": "G",
            "alternate": "T",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 871334,
                "reference": "G",
                "alternate": "T",
                "id": "rs4072383",
                "hgvs": ["ENST00000420190(ENSG00000187634):c.430+58G>T", "ENST00000342066(ENSG00000187634):c.430+58G>T", "ENST00000341065(ENSG00000187634):c.201+58G>T"],
                "displayConsequenceType": "intron_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000437963",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {
                    "geneName": "AL645608.1",
                    "ensemblGeneId": "ENSG00000268179",
                    "ensemblTranscriptId": "ENST00000598827",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001631", "name": "upstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}],
                "populationFrequencies": [{
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43061146,
                    "altAlleleFreq": 0.5628002,
                    "refHomGenotypeFreq": 0.21770738,
                    "hetGenotypeFreq": 0.42580813,
                    "altHomGenotypeFreq": 0.3564845
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.35507247,
                    "altAlleleFreq": 0.64492756,
                    "refHomGenotypeFreq": 0.14078675,
                    "hetGenotypeFreq": 0.42857143,
                    "altHomGenotypeFreq": 0.43064183
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4851301,
                    "altAlleleFreq": 0.51486987,
                    "refHomGenotypeFreq": 0.23172243,
                    "hetGenotypeFreq": 0.5068154,
                    "altHomGenotypeFreq": 0.2614622
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41985646,
                    "altAlleleFreq": 0.5801435,
                    "refHomGenotypeFreq": 0.17464115,
                    "hetGenotypeFreq": 0.49043062,
                    "altHomGenotypeFreq": 0.33492824
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.34768212,
                    "altAlleleFreq": 0.6523179,
                    "refHomGenotypeFreq": 0.09271523,
                    "hetGenotypeFreq": 0.50993377,
                    "altHomGenotypeFreq": 0.397351
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3538682,
                    "altAlleleFreq": 0.6461318,
                    "refHomGenotypeFreq": 0.1260745,
                    "hetGenotypeFreq": 0.4555874,
                    "altHomGenotypeFreq": 0.41833812
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29166108,
                    "altAlleleFreq": 0.7083389,
                    "refHomGenotypeFreq": 0.085132055,
                    "hetGenotypeFreq": 0.41305804,
                    "altHomGenotypeFreq": 0.5018099
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7022795,
                    "altAlleleFreq": 0.27434954,
                    "refHomGenotypeFreq": 0.4966613,
                    "hetGenotypeFreq": 0.41123646,
                    "altHomGenotypeFreq": 0.09210224
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.43728733,
                    "altAlleleFreq": 0.5559662,
                    "refHomGenotypeFreq": 0.22597677,
                    "hetGenotypeFreq": 0.42262113,
                    "altHomGenotypeFreq": 0.3514021
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4223449,
                    "altAlleleFreq": 0.57126254,
                    "refHomGenotypeFreq": 0.20746768,
                    "hetGenotypeFreq": 0.42975447,
                    "altHomGenotypeFreq": 0.36277786
                }, {"study": "GONL", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.2995992, "altAlleleFreq": 0.7004008}, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.40625,
                    "altAlleleFreq": 0.59375,
                    "refHomGenotypeFreq": 0.1875,
                    "hetGenotypeFreq": 0.4375,
                    "altHomGenotypeFreq": 0.375
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.49540734,
                    "altAlleleFreq": 0.4978035,
                    "refHomGenotypeFreq": 0.29353034,
                    "hetGenotypeFreq": 0.403754,
                    "altHomGenotypeFreq": 0.30271566
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37116563,
                    "altAlleleFreq": 0.62781185,
                    "refHomGenotypeFreq": 0.14314929,
                    "hetGenotypeFreq": 0.4560327,
                    "altHomGenotypeFreq": 0.400818
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.39361703,
                    "altAlleleFreq": 0.60106385,
                    "refHomGenotypeFreq": 0.15957446,
                    "hetGenotypeFreq": 0.4680851,
                    "altHomGenotypeFreq": 0.3723404
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3872549,
                    "altAlleleFreq": 0.6127451,
                    "refHomGenotypeFreq": 0.15686275,
                    "hetGenotypeFreq": 0.46078432,
                    "altHomGenotypeFreq": 0.38235295
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.7776097,
                    "altAlleleFreq": 0.19818456,
                    "refHomGenotypeFreq": 0.61270803,
                    "hetGenotypeFreq": 0.3298033,
                    "altHomGenotypeFreq": 0.05748865
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4952381,
                    "altAlleleFreq": 0.50476193,
                    "refHomGenotypeFreq": 0.24761905,
                    "hetGenotypeFreq": 0.49523813,
                    "altHomGenotypeFreq": 0.25714287
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.58653843,
                    "altAlleleFreq": 0.41346154,
                    "refHomGenotypeFreq": 0.3846154,
                    "hetGenotypeFreq": 0.40384614,
                    "altHomGenotypeFreq": 0.21153846
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8564815,
                    "altAlleleFreq": 0.11574074,
                    "refHomGenotypeFreq": 0.7222222,
                    "hetGenotypeFreq": 0.2685185,
                    "altHomGenotypeFreq": 0.009259259
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36979166,
                    "altAlleleFreq": 0.625,
                    "refHomGenotypeFreq": 0.17708333,
                    "hetGenotypeFreq": 0.38541666,
                    "altHomGenotypeFreq": 0.4375
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.78318584,
                    "altAlleleFreq": 0.19469027,
                    "refHomGenotypeFreq": 0.6460177,
                    "hetGenotypeFreq": 0.27433628,
                    "altHomGenotypeFreq": 0.07964602
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37745097,
                    "altAlleleFreq": 0.622549,
                    "refHomGenotypeFreq": 0.12745099,
                    "hetGenotypeFreq": 0.5,
                    "altHomGenotypeFreq": 0.37254903
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.30769232,
                    "altAlleleFreq": 0.6923077,
                    "refHomGenotypeFreq": 0.0989011,
                    "hetGenotypeFreq": 0.41758242,
                    "altHomGenotypeFreq": 0.48351648
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.4247312,
                    "altAlleleFreq": 0.5752688,
                    "refHomGenotypeFreq": 0.21505377,
                    "hetGenotypeFreq": 0.41935486,
                    "altHomGenotypeFreq": 0.3655914
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47474748,
                    "altAlleleFreq": 0.5252525,
                    "refHomGenotypeFreq": 0.24242425,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.2929293
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.26168224,
                    "altAlleleFreq": 0.7383177,
                    "refHomGenotypeFreq": 0.093457945,
                    "hetGenotypeFreq": 0.3364486,
                    "altHomGenotypeFreq": 0.57009345
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.37790698,
                    "altAlleleFreq": 0.622093,
                    "refHomGenotypeFreq": 0.13953489,
                    "hetGenotypeFreq": 0.47674417,
                    "altHomGenotypeFreq": 0.38372093
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.703125,
                    "altAlleleFreq": 0.26041666,
                    "refHomGenotypeFreq": 0.48958334,
                    "hetGenotypeFreq": 0.4270833,
                    "altHomGenotypeFreq": 0.083333336
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.82828283,
                    "altAlleleFreq": 0.14141414,
                    "refHomGenotypeFreq": 0.68686867,
                    "hetGenotypeFreq": 0.2828283,
                    "altHomGenotypeFreq": 0.030303031
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.74747473,
                    "altAlleleFreq": 0.24242425,
                    "refHomGenotypeFreq": 0.5555556,
                    "hetGenotypeFreq": 0.3838384,
                    "altHomGenotypeFreq": 0.060606062
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29025844,
                    "altAlleleFreq": 0.70974153,
                    "refHomGenotypeFreq": 0.091451295,
                    "hetGenotypeFreq": 0.3976143,
                    "altHomGenotypeFreq": 0.5109344
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.6803279,
                    "altAlleleFreq": 0.29508197,
                    "refHomGenotypeFreq": 0.45901638,
                    "hetGenotypeFreq": 0.44262293,
                    "altHomGenotypeFreq": 0.09836066
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.41210374,
                    "altAlleleFreq": 0.58645535,
                    "refHomGenotypeFreq": 0.19020173,
                    "hetGenotypeFreq": 0.44380403,
                    "altHomGenotypeFreq": 0.36599424
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.8,
                    "altAlleleFreq": 0.18235295,
                    "refHomGenotypeFreq": 0.65882355,
                    "hetGenotypeFreq": 0.28235295,
                    "altHomGenotypeFreq": 0.05882353
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3446602,
                    "altAlleleFreq": 0.6553398,
                    "refHomGenotypeFreq": 0.116504855,
                    "hetGenotypeFreq": 0.4563107,
                    "altHomGenotypeFreq": 0.42718446
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.36363637,
                    "altAlleleFreq": 0.6363636,
                    "refHomGenotypeFreq": 0.13131313,
                    "hetGenotypeFreq": 0.46464646,
                    "altHomGenotypeFreq": 0.4040404
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.29439253,
                    "altAlleleFreq": 0.7056075,
                    "refHomGenotypeFreq": 0.07476635,
                    "hetGenotypeFreq": 0.43925232,
                    "altHomGenotypeFreq": 0.48598132
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.3846154,
                    "altAlleleFreq": 0.61538464,
                    "refHomGenotypeFreq": 0.1923077,
                    "hetGenotypeFreq": 0.3846154,
                    "altHomGenotypeFreq": 0.42307693
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.22727273,
                    "altAlleleFreq": 0.77272725,
                    "refHomGenotypeFreq": 0.060606062,
                    "hetGenotypeFreq": 0.3333333,
                    "altHomGenotypeFreq": 0.6060606
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.47058824,
                    "altAlleleFreq": 0.5294118,
                    "refHomGenotypeFreq": 0.22352941,
                    "hetGenotypeFreq": 0.49411768,
                    "altHomGenotypeFreq": 0.28235295
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.50793654,
                    "altAlleleFreq": 0.4920635,
                    "refHomGenotypeFreq": 0.2936508,
                    "hetGenotypeFreq": 0.4285714,
                    "altHomGenotypeFreq": 0.2777778
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.5485437,
                    "altAlleleFreq": 0.4514563,
                    "refHomGenotypeFreq": 0.36893204,
                    "hetGenotypeFreq": 0.3592233,
                    "altHomGenotypeFreq": 0.27184466
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.96067417,
                    "altAlleleFreq": 0.039325844,
                    "refHomGenotypeFreq": 0.9550562,
                    "hetGenotypeFreq": 0.011235955,
                    "altHomGenotypeFreq": 0.033707865
                }, {"study": "UK10K", "population": "ALL", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.27955568, "altAlleleFreq": 0.7204443}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2719642,
                    "altAlleleFreq": 0.7280358
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "G", "altAllele": "T", "refAlleleFreq": 0.28567722, "altAlleleFreq": 0.7143228}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "G",
                    "altAllele": "T",
                    "refAlleleFreq": 0.2731931,
                    "altAlleleFreq": 0.7268069
                }],
                "conservation": [{"score": 0.5519999861717224, "source": "gerp"}, {"score": 0.01899999938905239, "source": "phastCons"}, {"score": 0.5609999895095825, "source": "phylop"}],
                "geneTraitAssociation": [],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.05000019073486328, "source": "cadd_raw"}, {"score": 3.0999999046325684, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000474461", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000466827", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000464948", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000483767", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000327044", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000477976", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000496938", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001782", "name": "TF_binding_site_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["PM2"], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039541066},
            "type": "SNV",
            "end": 876491,
            "start": 876491,
            "id": "1:876491:C:A",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.9977375,
                    "missingAlleleCount": 0,
                    "fileCount": 1,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.9954751, "0/1": 0.004524887, "1/1": 0},
                    "refAlleleCount": 441,
                    "altAlleleCount": 1,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 220, "0/1": 1, "1/1": 0},
                    "filterCount": {"PASS": 0, ".": 1},
                    "qualityAvg": 9.31,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.0022624435,
                    "mafAllele": "A",
                    "mgfGenotype": "1/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 1,
                    "sampleCount": 221,
                    "maf": 0.0022624435
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 24,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 12, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 12,
                    "maf": 0
                }, {
                    "refAlleleFreq": 1,
                    "missingAlleleCount": 0,
                    "fileCount": 0,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 1, "0/1": 0, "1/1": 0},
                    "refAlleleCount": 138,
                    "altAlleleCount": 0,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 69, "0/1": 0, "1/1": 0},
                    "filterCount": {"PASS": 0},
                    "qualityAvg": "NaN",
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {},
                    "qualityCount": 0,
                    "sampleCount": 69,
                    "maf": 0
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["0/1", "2,2,0", "4", "37", ".", "0|1", "876491_C_A", "37,0,37,43,43,87", "1,1,1,1"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:876491:C:A,<NON_REF>", "alleleIndex": 0},
                    "data": {
                        "RAW_MQ": "14400.00",
                        "MQRankSum": "-0.000",
                        "FILTER": ".",
                        "MLEAC": "1,0",
                        "QUAL": "9.31",
                        "BaseQRankSum": "-0.000",
                        "ExcessHet": "3.0103",
                        "ClippingRankSum": "-0.000",
                        "MLEAF": "0.5,0",
                        "DP": "4",
                        "ReadPosRankSum": "1.383"
                    }
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 876491, "end": 876491, "reference": "C", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": [],
            "chromosome": "1",
            "reference": "C",
            "alternate": "A",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 876491,
                "reference": "C",
                "alternate": "A",
                "hgvs": ["ENST00000342066(ENSG00000187634):c.707-33C>A", "ENST00000341065(ENSG00000187634):c.430-33C>A", "ENST00000455979(ENSG00000187634):c.187-33C>A", "ENST00000478729(ENSG00000187634):n.118-33C>A", "ENST00000474461(ENSG00000187634):n.36C>A"],
                "displayConsequenceType": "non_coding_transcript_exon_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000474461",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "exonOverlap": [{"number": "1/4", "percentage": 0.43290043}],
                    "cdnaPosition": 36,
                    "sequenceOntologyTerms": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000466827",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000464948",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000483767",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000327044",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000477976",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000496938",
                    "strand": "-",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}, {
                    "sequenceOntologyTerms": [{
                        "accession": "SO:0001782",
                        "name": "TF_binding_site_variant"
                    }]
                }],
                "conservation": [{"score": -0.6050000190734863, "source": "gerp"}, {"score": 0.10899999737739563, "source": "phastCons"}, {"score": 0.1860000044107437, "source": "phylop"}],
                "geneTraitAssociation": [{
                    "id": "umls:C0035304",
                    "name": "Retinal Degeneration",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0699790",
                    "name": "Colon Carcinoma",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1140680",
                    "name": "Malignant neoplasm of ovary",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0029928",
                    "name": "Ovarian Diseases",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0028754",
                    "name": "Obesity",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1520166",
                    "name": "Xenograft Model",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007125",
                    "name": "Carcinoma, Ehrlich Tumor",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007102",
                    "name": "Malignant tumor of colon",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {"id": "umls:C0029925", "name": "OVARIAN CARCINOMA", "score": 0.00028350457, "numberOfPubmeds": 1, "associationTypes": ["Biomarker"], "sources": ["BeFree"], "source": "disgenet"}],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.7399997711181641, "source": "cadd_raw"}, {"score": 9.09000015258789, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }, {
            "deNovoQualityScore": 0,
            "evidences": [{
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000342066", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000341065", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000455979", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000478729", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000474461", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000466827", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}],
                "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000464948", "geneName": "SAMD11"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000483767", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000327044", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000477976", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}],
                "genomicFeature": {"id": "ENSG00000188976", "type": "GENE", "transcriptId": "ENST00000496938", "geneName": "NOC2L"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }, {
                "phenotypes": [],
                "consequenceTypes": [{"accession": "SO:0001782", "name": "TF_binding_site_variant"}],
                "genomicFeature": {"type": "GENE"},
                "classification": {"tier": "none", "acmg": ["BA1"], "clinicalSignificance": "BENIGN"},
                "score": 0,
                "fullyExplainPhenotypes": false,
                "compoundHeterozygousVariantIds": [],
                "actionable": false
            }],
            "comments": [],
            "status": "NOT_REVIEWED",
            "attributes": {"creationDate": 1596039541066},
            "type": "SNV",
            "end": 876499,
            "start": 876499,
            "id": "1:876499:A:G",
            "studies": [{
                "stats": [{
                    "refAlleleFreq": 0.6266968,
                    "missingAlleleCount": 0,
                    "fileCount": 84,
                    "mgf": 0.013574661,
                    "genotypeFreq": {"0/0": 0.6199095, "0/1": 0.013574661, "1/1": 0.36651585},
                    "refAlleleCount": 277,
                    "altAlleleCount": 165,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 137, "0/1": 3, "1/1": 81},
                    "filterCount": {"PASS": 0, ".": 84},
                    "qualityAvg": 58.359524,
                    "cohortId": "ALL",
                    "alleleCount": 442,
                    "altAlleleFreq": 0.37330317,
                    "mafAllele": "G",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 84,
                    "sampleCount": 221,
                    "maf": 0.37330317
                }, {
                    "refAlleleFreq": 0.5,
                    "missingAlleleCount": 0,
                    "fileCount": 6,
                    "mgf": 0,
                    "genotypeFreq": {"0/0": 0.5, "0/1": 0, "1/1": 0.5},
                    "refAlleleCount": 12,
                    "altAlleleCount": 12,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 6, "0/1": 0, "1/1": 6},
                    "filterCount": {"PASS": 0, ".": 6},
                    "qualityAvg": 42.855,
                    "cohortId": "OBE",
                    "alleleCount": 24,
                    "altAlleleFreq": 0.5,
                    "mafAllele": "A",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 6,
                    "sampleCount": 12,
                    "maf": 0.5
                }, {
                    "refAlleleFreq": 0.5869565,
                    "missingAlleleCount": 0,
                    "fileCount": 29,
                    "mgf": 0.014492754,
                    "genotypeFreq": {"0/0": 0.5797101, "0/1": 0.014492754, "1/1": 0.4057971},
                    "refAlleleCount": 81,
                    "altAlleleCount": 57,
                    "missingGenotypeCount": 0,
                    "genotypeCount": {"0/0": 40, "0/1": 1, "1/1": 28},
                    "filterCount": {"PASS": 0, ".": 29},
                    "qualityAvg": 56.771034,
                    "cohortId": "migraine",
                    "alleleCount": 138,
                    "altAlleleFreq": 0.41304347,
                    "mafAllele": "G",
                    "mgfGenotype": "0/1",
                    "filterFreq": {"PASS": 0, ".": 1},
                    "qualityCount": 29,
                    "sampleCount": 69,
                    "maf": 0.41304347
                }],
                "samples": [{"sampleId": "D000001", "fileIndex": 0, "data": ["1/1", "0,4,0", "4", "12", ".", "0|1", "876491_C_A", "139,12,0,139,12,139", "0,0,2,2"]}],
                "studyId": "emee-glh@pilot:rd",
                "files": [{
                    "fileId": "D000001_markdup_recalibrated_Haplotyper_anonymized.g.vcf.gz",
                    "call": {"variantId": "1:876499:A:G,<NON_REF>", "alleleIndex": 0},
                    "data": {"FILTER": ".", "MLEAC": "2,0", "QUAL": "111.03", "ExcessHet": "3.0103", "MLEAF": "1,0", "DP": "4", "RAW_MQ": "14400.00", "VCF_ID": "rs4372192", "DB": "true"}
                }],
                "issues": [],
                "sampleDataKeys": ["GT", "AD", "DP", "GQ", "MIN_DP", "PGT", "PID", "PL", "SB"],
                "secondaryAlternates": [{"chromosome": "1", "start": 876499, "end": 876499, "reference": "A", "alternate": "<*>", "type": "NO_VARIATION"}],
                "scores": []
            }],
            "names": ["rs4372192"],
            "chromosome": "1",
            "reference": "A",
            "alternate": "G",
            "strand": "+",
            "annotation": {
                "chromosome": "1",
                "start": 876499,
                "reference": "A",
                "alternate": "G",
                "id": "rs4372192",
                "hgvs": ["ENST00000342066(ENSG00000187634):c.707-25A>G", "ENST00000341065(ENSG00000187634):c.430-25A>G", "ENST00000455979(ENSG00000187634):c.187-25A>G", "ENST00000478729(ENSG00000187634):n.118-25A>G", "ENST00000474461(ENSG00000187634):n.44A>G"],
                "displayConsequenceType": "non_coding_transcript_exon_variant",
                "consequenceTypes": [{
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000420190",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["mRNA_end_NF", "cds_end_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0002083", "name": "2KB_downstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000342066",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000341065",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000455979",
                    "strand": "+",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["cds_start_NF", "mRNA_start_NF"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000478729",
                    "strand": "+",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001619", "name": "non_coding_transcript_variant"}, {"accession": "SO:0001627", "name": "intron_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000474461",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "exonOverlap": [{"number": "1/4", "percentage": 0.43290043}],
                    "cdnaPosition": 44,
                    "sequenceOntologyTerms": [{"accession": "SO:0001792", "name": "non_coding_transcript_exon_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000466827",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "SAMD11",
                    "ensemblGeneId": "ENSG00000187634",
                    "ensemblTranscriptId": "ENST00000464948",
                    "strand": "+",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001636", "name": "2KB_upstream_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000483767",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000327044",
                    "strand": "-",
                    "biotype": "protein_coding",
                    "transcriptAnnotationFlags": ["CCDS", "basic"],
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000477976",
                    "strand": "-",
                    "biotype": "retained_intron",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {
                    "geneName": "NOC2L",
                    "ensemblGeneId": "ENSG00000188976",
                    "ensemblTranscriptId": "ENST00000496938",
                    "strand": "-",
                    "biotype": "processed_transcript",
                    "sequenceOntologyTerms": [{"accession": "SO:0001632", "name": "downstream_gene_variant"}]
                }, {"sequenceOntologyTerms": [{"accession": "SO:0001566", "name": "regulatory_region_variant"}]}, {
                    "sequenceOntologyTerms": [{
                        "accession": "SO:0001782",
                        "name": "TF_binding_site_variant"
                    }]
                }],
                "populationFrequencies": [{
                    "study": "GNOMAD_EXOMES",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.066567704,
                    "altAlleleFreq": 0.9334323,
                    "refHomGenotypeFreq": 0.0049407883,
                    "hetGenotypeFreq": 0.12325383,
                    "altHomGenotypeFreq": 0.87180537
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06641895,
                    "altAlleleFreq": 0.93358105,
                    "refHomGenotypeFreq": 0.0037157454,
                    "hetGenotypeFreq": 0.12540641,
                    "altHomGenotypeFreq": 0.87087786
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08983957,
                    "altAlleleFreq": 0.9101604,
                    "refHomGenotypeFreq": 0.00855615,
                    "hetGenotypeFreq": 0.16256684,
                    "altHomGenotypeFreq": 0.82887703
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.04885809,
                    "altAlleleFreq": 0.9511419,
                    "refHomGenotypeFreq": 0.0028282544,
                    "hetGenotypeFreq": 0.09205968,
                    "altHomGenotypeFreq": 0.9051121
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "ASJ",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.067721665,
                    "altAlleleFreq": 0.93227834,
                    "refHomGenotypeFreq": 0.00465441,
                    "hetGenotypeFreq": 0.12613451,
                    "altHomGenotypeFreq": 0.8692111
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.039462786,
                    "altAlleleFreq": 0.9605372,
                    "refHomGenotypeFreq": 0.0015382795,
                    "hetGenotypeFreq": 0.07584901,
                    "altHomGenotypeFreq": 0.9226127
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06175331,
                    "altAlleleFreq": 0.93824667,
                    "refHomGenotypeFreq": 0.003255839,
                    "hetGenotypeFreq": 0.11699494,
                    "altHomGenotypeFreq": 0.87974924
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12775286,
                    "altAlleleFreq": 0.87224716,
                    "refHomGenotypeFreq": 0.01774062,
                    "hetGenotypeFreq": 0.22002447,
                    "altHomGenotypeFreq": 0.7622349
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "MALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06744671,
                    "altAlleleFreq": 0.9325533,
                    "refHomGenotypeFreq": 0.0047925566,
                    "hetGenotypeFreq": 0.1253083,
                    "altHomGenotypeFreq": 0.86989915
                }, {
                    "study": "GNOMAD_EXOMES",
                    "population": "FEMALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.065482676,
                    "altAlleleFreq": 0.9345173,
                    "refHomGenotypeFreq": 0.0051237624,
                    "hetGenotypeFreq": 0.12071782,
                    "altHomGenotypeFreq": 0.87415844
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.071645945,
                    "altAlleleFreq": 0.928354,
                    "refHomGenotypeFreq": 0.006021756,
                    "hetGenotypeFreq": 0.13124838,
                    "altHomGenotypeFreq": 0.86272985
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.051229507,
                    "altAlleleFreq": 0.94877046,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.10245901,
                    "altHomGenotypeFreq": 0.897541
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.086741015,
                    "altAlleleFreq": 0.91325897,
                    "refHomGenotypeFreq": 0.0049566296,
                    "hetGenotypeFreq": 0.16356878,
                    "altHomGenotypeFreq": 0.8314746
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.0548926,
                    "altAlleleFreq": 0.9451074,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.1097852,
                    "altHomGenotypeFreq": 0.8902148
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "ASJ",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07615894,
                    "altAlleleFreq": 0.92384106,
                    "refHomGenotypeFreq": 0.013245033,
                    "hetGenotypeFreq": 0.12582782,
                    "altHomGenotypeFreq": 0.86092716
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.038704127,
                    "altAlleleFreq": 0.96129584,
                    "refHomGenotypeFreq": 0.0017201835,
                    "hetGenotypeFreq": 0.07396789,
                    "altHomGenotypeFreq": 0.92431194
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.05438995,
                    "altAlleleFreq": 0.94561005,
                    "refHomGenotypeFreq": 0.0037418148,
                    "hetGenotypeFreq": 0.10129627,
                    "altHomGenotypeFreq": 0.8949619
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11546415,
                    "altAlleleFreq": 0.88453585,
                    "refHomGenotypeFreq": 0.012867647,
                    "hetGenotypeFreq": 0.20519301,
                    "altHomGenotypeFreq": 0.7819393
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "MALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07262504,
                    "altAlleleFreq": 0.92737496,
                    "refHomGenotypeFreq": 0.0059739957,
                    "hetGenotypeFreq": 0.1333021,
                    "altHomGenotypeFreq": 0.8607239
                }, {
                    "study": "GNOMAD_GENOMES",
                    "population": "FEMALE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07043579,
                    "altAlleleFreq": 0.92956424,
                    "refHomGenotypeFreq": 0.0060807876,
                    "hetGenotypeFreq": 0.12871,
                    "altHomGenotypeFreq": 0.8652092
                }, {
                    "study": "ESP6500",
                    "population": "AA",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11668959,
                    "altAlleleFreq": 0.88331044,
                    "refHomGenotypeFreq": 0.018798716,
                    "hetGenotypeFreq": 0.19578175,
                    "altHomGenotypeFreq": 0.7854195
                }, {
                    "study": "ESP6500",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08071019,
                    "altAlleleFreq": 0.9192898,
                    "refHomGenotypeFreq": 0.0122499615,
                    "hetGenotypeFreq": 0.13692045,
                    "altHomGenotypeFreq": 0.8508296
                }, {
                    "study": "ESP6500",
                    "population": "EA",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.062324274,
                    "altAlleleFreq": 0.9376757,
                    "refHomGenotypeFreq": 0.008903468,
                    "hetGenotypeFreq": 0.10684161,
                    "altHomGenotypeFreq": 0.88425493
                }, {"study": "GONL", "population": "ALL", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.061122246, "altAlleleFreq": 0.93887776}, {
                    "study": "EXAC",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.072435744,
                    "altAlleleFreq": 0.92756426,
                    "refHomGenotypeFreq": 0.003148636,
                    "hetGenotypeFreq": 0.13857421,
                    "altHomGenotypeFreq": 0.85827714
                }, {
                    "study": "EXAC",
                    "population": "OTH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.054245282,
                    "altAlleleFreq": 0.9457547,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.108490564,
                    "altHomGenotypeFreq": 0.8915094
                }, {
                    "study": "EXAC",
                    "population": "SAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08316067,
                    "altAlleleFreq": 0.9168393,
                    "refHomGenotypeFreq": 0.006404219,
                    "hetGenotypeFreq": 0.15351291,
                    "altHomGenotypeFreq": 0.8400829
                }, {
                    "study": "EXAC",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.088508554,
                    "altAlleleFreq": 0.91149145,
                    "refHomGenotypeFreq": 0.0019559902,
                    "hetGenotypeFreq": 0.17310514,
                    "altHomGenotypeFreq": 0.8249389
                }, {
                    "study": "EXAC",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.05041712,
                    "altAlleleFreq": 0.9495829,
                    "refHomGenotypeFreq": 0.0007254262,
                    "hetGenotypeFreq": 0.09938339,
                    "altHomGenotypeFreq": 0.8998912
                }, {
                    "study": "EXAC",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.04094579,
                    "altAlleleFreq": 0.95905423,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.08189158,
                    "altHomGenotypeFreq": 0.9181084
                }, {
                    "study": "EXAC",
                    "population": "NFE",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06496313,
                    "altAlleleFreq": 0.93503684,
                    "refHomGenotypeFreq": 0.0023518943,
                    "hetGenotypeFreq": 0.12522247,
                    "altHomGenotypeFreq": 0.8724256
                }, {
                    "study": "EXAC",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12451023,
                    "altAlleleFreq": 0.8754898,
                    "refHomGenotypeFreq": 0.006530257,
                    "hetGenotypeFreq": 0.23595995,
                    "altHomGenotypeFreq": 0.75750977
                }, {
                    "study": "1kG_phase3",
                    "population": "MXL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.0625,
                    "altAlleleFreq": 0.9375,
                    "refHomGenotypeFreq": 0.015625,
                    "hetGenotypeFreq": 0.09375,
                    "altHomGenotypeFreq": 0.890625
                }, {
                    "study": "1kG_phase3",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08686102,
                    "altAlleleFreq": 0.913139,
                    "refHomGenotypeFreq": 0.0063897762,
                    "hetGenotypeFreq": 0.1609425,
                    "altHomGenotypeFreq": 0.8326677
                }, {
                    "study": "1kG_phase3",
                    "population": "SAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.084867075,
                    "altAlleleFreq": 0.91513294,
                    "refHomGenotypeFreq": 0.006134969,
                    "hetGenotypeFreq": 0.1574642,
                    "altHomGenotypeFreq": 0.8364008
                }, {
                    "study": "1kG_phase3",
                    "population": "CLM",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.06382979,
                    "altAlleleFreq": 0.9361702,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12765957,
                    "altHomGenotypeFreq": 0.87234044
                }, {
                    "study": "1kG_phase3",
                    "population": "ITU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.063725494,
                    "altAlleleFreq": 0.9362745,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12745099,
                    "altHomGenotypeFreq": 0.872549
                }, {
                    "study": "1kG_phase3",
                    "population": "AFR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12632374,
                    "altAlleleFreq": 0.87367624,
                    "refHomGenotypeFreq": 0.012102874,
                    "hetGenotypeFreq": 0.22844175,
                    "altHomGenotypeFreq": 0.7594554
                }, {
                    "study": "1kG_phase3",
                    "population": "CHS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.10952381,
                    "altAlleleFreq": 0.89047617,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.21904762,
                    "altHomGenotypeFreq": 0.7809524
                }, {
                    "study": "1kG_phase3",
                    "population": "JPT",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.057692308,
                    "altAlleleFreq": 0.9423077,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.11538462,
                    "altHomGenotypeFreq": 0.88461536
                }, {
                    "study": "1kG_phase3",
                    "population": "YRI",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.16666667,
                    "altAlleleFreq": 0.8333333,
                    "refHomGenotypeFreq": 0.018518519,
                    "hetGenotypeFreq": 0.2962963,
                    "altHomGenotypeFreq": 0.6851852
                }, {
                    "study": "1kG_phase3",
                    "population": "PJL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.09375,
                    "altAlleleFreq": 0.90625,
                    "refHomGenotypeFreq": 0.010416667,
                    "hetGenotypeFreq": 0.16666667,
                    "altHomGenotypeFreq": 0.8229167
                }, {
                    "study": "1kG_phase3",
                    "population": "GWD",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.119469024,
                    "altAlleleFreq": 0.88053095,
                    "refHomGenotypeFreq": 0.0088495575,
                    "hetGenotypeFreq": 0.22123894,
                    "altHomGenotypeFreq": 0.7699115
                }, {
                    "study": "1kG_phase3",
                    "population": "STU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.063725494,
                    "altAlleleFreq": 0.9362745,
                    "refHomGenotypeFreq": 0.009803922,
                    "hetGenotypeFreq": 0.10784314,
                    "altHomGenotypeFreq": 0.88235295
                }, {
                    "study": "1kG_phase3",
                    "population": "GBR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.021978023,
                    "altAlleleFreq": 0.978022,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.043956045,
                    "altHomGenotypeFreq": 0.95604396
                }, {
                    "study": "1kG_phase3",
                    "population": "CDX",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.09139785,
                    "altAlleleFreq": 0.9086022,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.1827957,
                    "altHomGenotypeFreq": 0.8172043
                }, {
                    "study": "1kG_phase3",
                    "population": "KHV",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.08585858,
                    "altAlleleFreq": 0.9141414,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.17171717,
                    "altHomGenotypeFreq": 0.82828283
                }, {
                    "study": "1kG_phase3",
                    "population": "IBS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.060747664,
                    "altAlleleFreq": 0.9392523,
                    "refHomGenotypeFreq": 0.009345794,
                    "hetGenotypeFreq": 0.10280374,
                    "altHomGenotypeFreq": 0.88785046
                }, {
                    "study": "1kG_phase3",
                    "population": "BEB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.069767445,
                    "altAlleleFreq": 0.9302326,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.13953489,
                    "altHomGenotypeFreq": 0.8604651
                }, {
                    "study": "1kG_phase3",
                    "population": "ACB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.104166664,
                    "altAlleleFreq": 0.8958333,
                    "refHomGenotypeFreq": 0.010416667,
                    "hetGenotypeFreq": 0.1875,
                    "altHomGenotypeFreq": 0.8020833
                }, {
                    "study": "1kG_phase3",
                    "population": "ESN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.116161615,
                    "altAlleleFreq": 0.88383836,
                    "refHomGenotypeFreq": 0.01010101,
                    "hetGenotypeFreq": 0.21212122,
                    "altHomGenotypeFreq": 0.7777778
                }, {
                    "study": "1kG_phase3",
                    "population": "LWK",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.10606061,
                    "altAlleleFreq": 0.8939394,
                    "refHomGenotypeFreq": 0.01010101,
                    "hetGenotypeFreq": 0.1919192,
                    "altHomGenotypeFreq": 0.7979798
                }, {
                    "study": "1kG_phase3",
                    "population": "EUR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.049701788,
                    "altAlleleFreq": 0.9502982,
                    "refHomGenotypeFreq": 0.0019880715,
                    "hetGenotypeFreq": 0.09542744,
                    "altHomGenotypeFreq": 0.9025845
                }, {
                    "study": "1kG_phase3",
                    "population": "ASW",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.12295082,
                    "altAlleleFreq": 0.8770492,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.24590163,
                    "altHomGenotypeFreq": 0.75409836
                }, {
                    "study": "1kG_phase3",
                    "population": "AMR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07925072,
                    "altAlleleFreq": 0.9207493,
                    "refHomGenotypeFreq": 0.011527377,
                    "hetGenotypeFreq": 0.13544668,
                    "altHomGenotypeFreq": 0.8530259
                }, {
                    "study": "1kG_phase3",
                    "population": "MSL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.14705883,
                    "altAlleleFreq": 0.85294116,
                    "refHomGenotypeFreq": 0.023529412,
                    "hetGenotypeFreq": 0.24705884,
                    "altHomGenotypeFreq": 0.7294118
                }, {
                    "study": "1kG_phase3",
                    "population": "GIH",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.13106796,
                    "altAlleleFreq": 0.86893207,
                    "refHomGenotypeFreq": 0.009708738,
                    "hetGenotypeFreq": 0.24271846,
                    "altHomGenotypeFreq": 0.74757284
                }, {
                    "study": "1kG_phase3",
                    "population": "FIN",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.035353534,
                    "altAlleleFreq": 0.96464646,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.07070707,
                    "altHomGenotypeFreq": 0.9292929
                }, {
                    "study": "1kG_phase3",
                    "population": "TSI",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.060747664,
                    "altAlleleFreq": 0.9392523,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.12149532,
                    "altHomGenotypeFreq": 0.8785047
                }, {
                    "study": "1kG_phase3",
                    "population": "PUR",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07692308,
                    "altAlleleFreq": 0.9230769,
                    "refHomGenotypeFreq": 0.009615385,
                    "hetGenotypeFreq": 0.13461539,
                    "altHomGenotypeFreq": 0.8557692
                }, {
                    "study": "1kG_phase3",
                    "population": "CEU",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.065656565,
                    "altAlleleFreq": 0.93434346,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.13131313,
                    "altHomGenotypeFreq": 0.86868685
                }, {
                    "study": "1kG_phase3",
                    "population": "PEL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.11176471,
                    "altAlleleFreq": 0.8882353,
                    "refHomGenotypeFreq": 0.023529412,
                    "hetGenotypeFreq": 0.1764706,
                    "altHomGenotypeFreq": 0.8
                }, {
                    "study": "1kG_phase3",
                    "population": "EAS",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.07936508,
                    "altAlleleFreq": 0.9206349,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.15873016,
                    "altHomGenotypeFreq": 0.84126985
                }, {
                    "study": "1kG_phase3",
                    "population": "CHB",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.053398058,
                    "altAlleleFreq": 0.9466019,
                    "refHomGenotypeFreq": 0,
                    "hetGenotypeFreq": 0.106796116,
                    "altHomGenotypeFreq": 0.89320385
                }, {
                    "study": "MGP",
                    "population": "ALL",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.9868914,
                    "altAlleleFreq": 0.013108614,
                    "refHomGenotypeFreq": 0.98501873,
                    "hetGenotypeFreq": 0.0037453184,
                    "altHomGenotypeFreq": 0.011235955
                }, {"study": "UK10K", "population": "ALL", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.049722295, "altAlleleFreq": 0.9502777}, {
                    "study": "UK10K",
                    "population": "TWINSUK_NODUP",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.048684947,
                    "altAlleleFreq": 0.95131505
                }, {"study": "UK10K", "population": "ALSPAC", "refAllele": "A", "altAllele": "G", "refAlleleFreq": 0.051115725, "altAlleleFreq": 0.94888425}, {
                    "study": "UK10K",
                    "population": "TWINSUK",
                    "refAllele": "A",
                    "altAllele": "G",
                    "refAlleleFreq": 0.048274003,
                    "altAlleleFreq": 0.951726
                }],
                "conservation": [{"score": 0.8149999976158142, "source": "gerp"}, {"score": 0.12600000202655792, "source": "phastCons"}, {"score": -1.0390000343322754, "source": "phylop"}],
                "geneTraitAssociation": [{
                    "id": "umls:C0035304",
                    "name": "Retinal Degeneration",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0699790",
                    "name": "Colon Carcinoma",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1140680",
                    "name": "Malignant neoplasm of ovary",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0029928",
                    "name": "Ovarian Diseases",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0028754",
                    "name": "Obesity",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C1520166",
                    "name": "Xenograft Model",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007125",
                    "name": "Carcinoma, Ehrlich Tumor",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {
                    "id": "umls:C0007102",
                    "name": "Malignant tumor of colon",
                    "score": 0.00028350457,
                    "numberOfPubmeds": 1,
                    "associationTypes": ["Biomarker"],
                    "sources": ["BeFree"],
                    "source": "disgenet"
                }, {"id": "umls:C0029925", "name": "OVARIAN CARCINOMA", "score": 0.00028350457, "numberOfPubmeds": 1, "associationTypes": ["Biomarker"], "sources": ["BeFree"], "source": "disgenet"}],
                "geneDrugInteraction": [],
                "traitAssociation": [],
                "functionalScore": [{"score": 0.5500001907348633, "source": "cadd_raw"}, {"score": 7.860000133514404, "source": "cadd_scaled"}],
                "cytoband": [{"chromosome": "1", "stain": "gneg", "name": "p36.33", "start": 1, "end": 2300000}],
                "additionalAttributes": {"opencga": {"attribute": {"release": "1", "annotationId": "CURRENT"}}}
            },
            "length": 1
        }],
        "secondaryFindings": [],
        "comments": [],
        "status": "",
        "creationDate": "20200630181357",
        "version": 1,
        "attributes": {"modificationDate": 1596039526327},
        "internal": {"status": {"name": "NOT_REVIEWED", "date": "20200630181357", "description": ""}}
    },
    "secondaryInterpretations": [
        {
            "id": "SING-1_2",
            "uuid": "066f7e88-0173-000b-0001-62ab2590b200",
            "description": "",
            "clinicalAnalysisId": "SING-1",
            "analyst": {},
            "creationDate": "20200630181357",
            "methods": [{"name": "IVA"}],
            "primaryFindings": [
                {
                    "deNovoQualityScore": 0,
                    "evidences": [{
                        "phenotypes": [],
                        "consequenceTypes": [{"accession": "SO:0001627", "name": "intron_variant"}],
                        "genomicFeature": {"id": "ENSG00000187634", "type": "GENE", "transcriptId": "ENST00000420190", "geneName": "SAMD11"},
                        "classification": {"tier": "none", "acmg": [], "clinicalSignificance": "UNCERTAIN_SIGNIFICANCE"},
                        "score": 0,
                        "fullyExplainPhenotypes": false,
                        "compoundHeterozygousVariantIds": [],
                        "actionable": false
                    }]
                }
                ]
        }
    ],
    "consent": {"primaryFindings": "UNKNOWN", "secondaryFindings": "UNKNOWN", "carrierFindings": "UNKNOWN", "researchFindings": "UNKNOWN"},
    "analyst": {"assignee": "emee-glh", "assignedBy": "emee-glh", "date": "20200630181357"},
    "priority": "MEDIUM",
    "flags": ["low_tumour_purity", "uniparental_heterodisomy", "unusual_karyotype"],
    "creationDate": "20200630181357",
    "dueDate": "20200630191303",
    "release": 1,
    "internal": {"status": {"name": "READY_FOR_INTERPRETATION", "date": "20200630181357", "description": ""}},
    "attributes": {},
    "status": {"name": "", "description": "", "date": ""}
};
