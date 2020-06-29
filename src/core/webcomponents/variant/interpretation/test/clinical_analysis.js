
export const responses = [
  {
    "time" : 0,
    "events" : [ ],
    "numResults" : 1,
    "results" : [ {
      "uid" : 0,
      "id" : "AN-12",
      "studyUid" : 0,
      "uuid" : "4e870f08-0172-0009-0001-899175639aea",
      "description" : "",
      "type" : "FAMILY",
      "disorder" : {
        "id" : "OMIM:611597",
        "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
        "source" : "OMIM"
      },
      "files" : [ {
        "uid" : 0,
        "id" : "data:quartet.variants.annotated.vcf.gz",
        "studyUid" : 0,
        "annotationSets" : [ ],
        "name" : "quartet.variants.annotated.vcf.gz",
        "uuid" : "8b5d5e88-0170-0003-0001-6c68769a1f00",
        "type" : "FILE",
        "format" : "VCF",
        "bioformat" : "VARIANT",
        "uri" : "file:///mnt/resources/datasets/corpasome/data/quartet.variants.annotated.vcf.gz",
        "path" : "data/quartet.variants.annotated.vcf.gz",
        "release" : 1,
        "creationDate" : "20200228103517",
        "modificationDate" : "20200228103714",
        "external" : true,
        "size" : 21348567,
        "experiment" : { },
        "samples" : [ {
          "uid" : 0,
          "id" : "ISDBM322015",
          "studyUid" : 0,
          "uuid" : "8b5d52d0-0170-0004-0001-f3d4e4de4fb0",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103514",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322015",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz", "bam:SonsAlignedBamFile.bam" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103514",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322016",
          "studyUid" : 0,
          "uuid" : "8b5d52d0-0170-0004-0001-ef4e00e6e7e0",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103514",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322016",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103514",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322017",
          "studyUid" : 0,
          "uuid" : "8b5d56b8-0170-0004-0001-f6ba6272e528",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103515",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322017",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103515",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322018",
          "studyUid" : 0,
          "uuid" : "8b5d56b8-0170-0004-0001-476e3880c260",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103515",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322018",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103515",
              "description" : ""
            }
          },
          "attributes" : { }
        } ],
        "jobId" : "",
        "tags" : [ ],
        "relatedFiles" : [ ],
        "stats" : {
          "variantFileStats" : {
            "numVariants" : 300717,
            "variantTypeCounts" : {
              "INSERTION" : 1,
              "SV" : 0,
              "SNP" : 0,
              "SNV" : 288538,
              "INDEL" : 12177,
              "DELETION" : 1
            },
            "consequenceTypesCounts" : { },
            "meanQuality" : 562.553,
            "stdDevQuality" : 1216.2146,
            "tiTvRatio" : 2.1284614,
            "numPass" : 268617,
            "variantBiotypeCounts" : { },
            "chromosomeDensity" : {
              "10" : 1.0818627E-4,
              "11" : 1.2143118E-4,
              "12" : 1.0796261E-4,
              "13" : 7.173751E-5,
              "14" : 9.157934E-5,
              "15" : 9.863321E-5,
              "16" : 1.2129965E-4,
              "17" : 1.6289139E-4,
              "MT" : 0.0021123786,
              "18" : 8.386566E-5,
              "19" : 2.2789162E-4,
              "1" : 1.08577464E-4,
              "2" : 9.47083E-5,
              "3" : 8.6156906E-5,
              "4" : 8.032779E-5,
              "5" : 7.8854595E-5,
              "6" : 1.010548E-4,
              "7" : 9.897658E-5,
              "8" : 8.342214E-5,
              "9" : 8.9134584E-5,
              "20" : 1.1722236E-4,
              "21" : 9.343465E-5,
              "22" : 1.2599268E-4,
              "X" : 3.472004E-5,
              "Y" : 1.14697505E-5,
              "GL000219.1" : 0.0014788111,
              "GL000199.1" : 2.178085E-4,
              "GL000217.1" : 5.228029E-5,
              "GL000193.1" : 6.6389516E-4,
              "GL000195.1" : 0.0013231563,
              "GL000230.1" : 9.841844E-4,
              "GL000211.1" : 0.0010806527,
              "GL000232.1" : 0.0015251403,
              "GL000238.1" : 2.5038184E-5,
              "GL000234.1" : 0.002812662,
              "GL000209.1" : 3.455447E-4,
              "GL000228.1" : 2.0136307E-4,
              "GL000241.1" : 0.003487379,
              "GL000222.1" : 4.8164144E-5,
              "GL000220.1" : 0.0020827926,
              "GL000205.1" : 8.018879E-4,
              "GL000243.1" : 4.614568E-5,
              "GL000226.1" : 2.6652453E-4,
              "GL000224.1" : 3.1164262E-4,
              "GL000203.1" : 8.000427E-5,
              "GL000198.1" : 0.0010545596,
              "GL000218.1" : 4.405915E-4,
              "GL000192.1" : 4.5662433E-5,
              "GL000194.1" : 2.1935666E-4,
              "GL000212.1" : 0.0011506063,
              "GL000235.1" : 0.0012763242,
              "GL000237.1" : 0.00130813,
              "GL000231.1" : 0.0021178704,
              "GL000216.1" : 6.3263957E-4,
              "GL000214.1" : 0.0012271453,
              "GL000233.1" : 2.3943753E-4,
              "GL000208.1" : 1.7262026E-4,
              "GL000229.1" : 0.0042685685,
              "GL000240.1" : 2.3847567E-4,
              "GL000221.1" : 7.7221564E-5,
              "GL000204.1" : 4.919444E-5,
              "GL000225.1" : 0.003944633,
              "GL000202.1" : 7.480737E-5
            },
            "numSamples" : 4,
            "numRareVariants" : [ ]
          }
        },
        "status" : {
          "name" : "",
          "description" : "",
          "date" : ""
        },
        "internal" : {
          "status" : {
            "name" : "READY",
            "date" : "20200228103517",
            "description" : ""
          },
          "index" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103714",
              "description" : ""
            },
            "jobId" : 0,
            "release" : 1
          }
        },
        "attributes" : {
          "variantFileMetadata" : {
            "sampleIds" : [ "ISDBM322015", "ISDBM322016", "ISDBM322017", "ISDBM322018" ],
            "id" : "0",
            "path" : "quartet.variants.annotated.vcf.gz",
            "attributes" : { },
            "header" : {
              "version" : "VCFv4.2",
              "complexLines" : [ {
                "key" : "FILTER",
                "id" : "GATKStandard",
                "description" : "QD < 2.0 || ReadPosRankSum < -20.0 || FS > 200.0",
                "genericFields" : { }
              }, {
                "key" : "FILTER",
                "id" : "LowQual",
                "description" : "Low quality",
                "genericFields" : { }
              }, {
                "key" : "FILTER",
                "id" : "VQSRTrancheSNP99.00to99.90",
                "description" : "Truth sensitivity tranche level for SNP model at VQS Lod: -5.6494 <= x < 1.6606",
                "genericFields" : { }
              }, {
                "key" : "FILTER",
                "id" : "VQSRTrancheSNP99.90to100.00+",
                "description" : "Truth sensitivity tranche level for SNP model at VQS Lod < -2277.7485",
                "genericFields" : { }
              }, {
                "key" : "FILTER",
                "id" : "VQSRTrancheSNP99.90to100.00",
                "description" : "Truth sensitivity tranche level for SNP model at VQS Lod: -2277.7485 <= x < -5.6494",
                "genericFields" : { }
              }, {
                "key" : "FORMAT",
                "id" : "AD",
                "description" : "Allelic depths for the ref and alt alleles in the order listed",
                "number" : "R",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "FORMAT",
                "id" : "DP",
                "description" : "Approximate read depth (reads with MQ=255 or with bad mates are filtered)",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "FORMAT",
                "id" : "GQ",
                "description" : "Genotype Quality",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "FORMAT",
                "id" : "GT",
                "description" : "Genotype",
                "number" : "1",
                "type" : "String",
                "genericFields" : { }
              }, {
                "key" : "FORMAT",
                "id" : "PL",
                "description" : "Normalized, Phred-scaled likelihoods for genotypes as defined in the VCF specification",
                "number" : "G",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "ABHet",
                "description" : "Allele Balance for hets (ref/(ref+alt))",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "ABHom",
                "description" : "Allele Balance for homs (A/(A+O))",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "AC",
                "description" : "Allele count in genotypes, for each ALT allele, in the same order as listed",
                "number" : "A",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "AF",
                "description" : "Allele Frequency, for each ALT allele, in the same order as listed",
                "number" : "A",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "AN",
                "description" : "Total number of alleles in called genotypes",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "BaseQRankSum",
                "description" : "Z-score from Wilcoxon rank sum test of Alt Vs. Ref base qualities",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "DB",
                "description" : "dbSNP Membership",
                "number" : "0",
                "type" : "Flag",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "DP",
                "description" : "Approximate read depth; some reads may have been filtered",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "DS",
                "description" : "Were any of the samples downsampled?",
                "number" : "0",
                "type" : "Flag",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "Dels",
                "description" : "Fraction of Reads Containing Spanning Deletions",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "END",
                "description" : "Stop position of the interval",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "FS",
                "description" : "Phred-scaled p-value using Fisher's exact test to detect strand bias",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "HaplotypeScore",
                "description" : "Consistency of the site with at most two segregating haplotypes",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "InbreedingCoeff",
                "description" : "Inbreeding coefficient as estimated from the genotype likelihoods per-sample when compared against the Hardy-Weinberg expectation",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "MLEAC",
                "description" : "Maximum likelihood expectation (MLE) for the allele counts (not necessarily the same as the AC), for each ALT allele, in the same order as listed",
                "number" : "A",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "MLEAF",
                "description" : "Maximum likelihood expectation (MLE) for the allele frequency (not necessarily the same as the AF), for each ALT allele, in the same order as listed",
                "number" : "A",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "MQ",
                "description" : "RMS Mapping Quality",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "MQ0",
                "description" : "Total Mapping Quality Zero Reads",
                "number" : "1",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "MQRankSum",
                "description" : "Z-score From Wilcoxon rank sum test of Alt vs. Ref read mapping qualities",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "OND",
                "description" : "Overall non-diploid ratio (alleles/(alleles+non-alleles))",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "QD",
                "description" : "Variant Confidence/Quality by Depth",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "RPA",
                "description" : "Number of times tandem repeat unit is repeated, for each allele (including reference)",
                "number" : ".",
                "type" : "Integer",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "RU",
                "description" : "Tandem repeat unit (bases)",
                "number" : "1",
                "type" : "String",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "ReadPosRankSum",
                "description" : "Z-score from Wilcoxon rank sum test of Alt vs. Ref read position bias",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "SB",
                "description" : "Strand Bias",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "STR",
                "description" : "Variant is a short tandem repeat",
                "number" : "0",
                "type" : "Flag",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "VQSLOD",
                "description" : "Log odds ratio of being a true variant versus being false under the trained gaussian mixture model",
                "number" : "1",
                "type" : "Float",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "culprit",
                "description" : "The annotation which was the worst performing in the Gaussian mixture model, likely the reason why the variant was filtered out",
                "number" : "1",
                "type" : "String",
                "genericFields" : { }
              }, {
                "key" : "INFO",
                "id" : "set",
                "description" : "Source VCF for the merged record in CombineVariants",
                "number" : "1",
                "type" : "String",
                "genericFields" : { }
              }, {
                "key" : "contig",
                "id" : "1",
                "genericFields" : {
                  "length" : "249250621",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "2",
                "genericFields" : {
                  "length" : "243199373",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "3",
                "genericFields" : {
                  "length" : "198022430",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "4",
                "genericFields" : {
                  "length" : "191154276",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "5",
                "genericFields" : {
                  "length" : "180915260",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "6",
                "genericFields" : {
                  "length" : "171115067",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "7",
                "genericFields" : {
                  "length" : "159138663",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "8",
                "genericFields" : {
                  "length" : "146364022",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "9",
                "genericFields" : {
                  "length" : "141213431",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "10",
                "genericFields" : {
                  "length" : "135534747",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "11",
                "genericFields" : {
                  "length" : "135006516",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "12",
                "genericFields" : {
                  "length" : "133851895",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "13",
                "genericFields" : {
                  "length" : "115169878",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "14",
                "genericFields" : {
                  "length" : "107349540",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "15",
                "genericFields" : {
                  "length" : "102531392",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "16",
                "genericFields" : {
                  "length" : "90354753",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "17",
                "genericFields" : {
                  "length" : "81195210",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "18",
                "genericFields" : {
                  "length" : "78077248",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "19",
                "genericFields" : {
                  "length" : "59128983",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "20",
                "genericFields" : {
                  "length" : "63025520",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "21",
                "genericFields" : {
                  "length" : "48129895",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "22",
                "genericFields" : {
                  "length" : "51304566",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "X",
                "genericFields" : {
                  "length" : "155270560",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "Y",
                "genericFields" : {
                  "length" : "59373566",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "MT",
                "genericFields" : {
                  "length" : "16569",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000207.1",
                "genericFields" : {
                  "length" : "4262",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000226.1",
                "genericFields" : {
                  "length" : "15008",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000229.1",
                "genericFields" : {
                  "length" : "19913",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000231.1",
                "genericFields" : {
                  "length" : "27386",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000210.1",
                "genericFields" : {
                  "length" : "27682",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000239.1",
                "genericFields" : {
                  "length" : "33824",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000235.1",
                "genericFields" : {
                  "length" : "34474",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000201.1",
                "genericFields" : {
                  "length" : "36148",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000247.1",
                "genericFields" : {
                  "length" : "36422",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000245.1",
                "genericFields" : {
                  "length" : "36651",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000197.1",
                "genericFields" : {
                  "length" : "37175",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000203.1",
                "genericFields" : {
                  "length" : "37498",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000246.1",
                "genericFields" : {
                  "length" : "38154",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000249.1",
                "genericFields" : {
                  "length" : "38502",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000196.1",
                "genericFields" : {
                  "length" : "38914",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000248.1",
                "genericFields" : {
                  "length" : "39786",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000244.1",
                "genericFields" : {
                  "length" : "39929",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000238.1",
                "genericFields" : {
                  "length" : "39939",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000202.1",
                "genericFields" : {
                  "length" : "40103",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000234.1",
                "genericFields" : {
                  "length" : "40531",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000232.1",
                "genericFields" : {
                  "length" : "40652",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000206.1",
                "genericFields" : {
                  "length" : "41001",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000240.1",
                "genericFields" : {
                  "length" : "41933",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000236.1",
                "genericFields" : {
                  "length" : "41934",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000241.1",
                "genericFields" : {
                  "length" : "42152",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000243.1",
                "genericFields" : {
                  "length" : "43341",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000242.1",
                "genericFields" : {
                  "length" : "43523",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000230.1",
                "genericFields" : {
                  "length" : "43691",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000237.1",
                "genericFields" : {
                  "length" : "45867",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000233.1",
                "genericFields" : {
                  "length" : "45941",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000204.1",
                "genericFields" : {
                  "length" : "81310",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000198.1",
                "genericFields" : {
                  "length" : "90085",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000208.1",
                "genericFields" : {
                  "length" : "92689",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000191.1",
                "genericFields" : {
                  "length" : "106433",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000227.1",
                "genericFields" : {
                  "length" : "128374",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000228.1",
                "genericFields" : {
                  "length" : "129120",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000214.1",
                "genericFields" : {
                  "length" : "137718",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000221.1",
                "genericFields" : {
                  "length" : "155397",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000209.1",
                "genericFields" : {
                  "length" : "159169",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000218.1",
                "genericFields" : {
                  "length" : "161147",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000220.1",
                "genericFields" : {
                  "length" : "161802",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000213.1",
                "genericFields" : {
                  "length" : "164239",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000211.1",
                "genericFields" : {
                  "length" : "166566",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000199.1",
                "genericFields" : {
                  "length" : "169874",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000217.1",
                "genericFields" : {
                  "length" : "172149",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000216.1",
                "genericFields" : {
                  "length" : "172294",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000215.1",
                "genericFields" : {
                  "length" : "172545",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000205.1",
                "genericFields" : {
                  "length" : "174588",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000219.1",
                "genericFields" : {
                  "length" : "179198",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000224.1",
                "genericFields" : {
                  "length" : "179693",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000223.1",
                "genericFields" : {
                  "length" : "180455",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000195.1",
                "genericFields" : {
                  "length" : "182896",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000212.1",
                "genericFields" : {
                  "length" : "186858",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000222.1",
                "genericFields" : {
                  "length" : "186861",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000200.1",
                "genericFields" : {
                  "length" : "187035",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000193.1",
                "genericFields" : {
                  "length" : "189789",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000194.1",
                "genericFields" : {
                  "length" : "191469",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000225.1",
                "genericFields" : {
                  "length" : "211173",
                  "assembly" : "b37"
                }
              }, {
                "key" : "contig",
                "id" : "GL000192.1",
                "genericFields" : {
                  "length" : "547496",
                  "assembly" : "b37"
                }
              }, {
                "key" : "INFO",
                "id" : "EFF",
                "description" : "Predicted effects for this variant.Format: 'Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_change| Amino_Acid_length | Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon  | GenotypeNum [ | ERRORS | WARNINGS ] )'",
                "number" : ".",
                "type" : "String",
                "genericFields" : { }
              } ],
              "simpleLines" : [ {
                "key" : "ApplyRecalibration",
                "value" : "\"analysis_type=ApplyRecalibration input_file=[] read_buffer_size=null phone_home=STANDARD gatk_key=null read_filter=[] intervals=null excludeIntervals=null interval_set_rule=UNION interval_merging=ALL interval_padding=0 reference_sequence=/tmp/generate_APPLY_RECALIBRATOR.py/d2cd22743d3eea79f59dd21ebb84a0d7/human_g1k_v37.fasta nonDeterministicRandomSeed=false downsampling_type=BY_SAMPLE downsample_to_fraction=null downsample_to_coverage=1000 baq=OFF baqGapOpenPenalty=40.0 performanceLog=null useOriginalQualities=false BQSR=null quantize_quals=0 disable_indel_quals=false emit_original_quals=false preserve_qscores_less_than=6 defaultBaseQualities=-1 validation_strictness=SILENT remove_program_records=false keep_program_records=false unsafe=null num_threads=1 num_cpu_threads=null num_io_threads=null num_bam_file_handles=null read_group_black_list=null pedigree=[] pedigreeString=[] pedigreeValidationType=STRICT allow_intervals_with_unindexed_bam=false generateShadowBCF=false logging_level=INFO log_to_file=/storage/gluster/insilico/data/GenomicsData/Series//ISDB11122GPL11154/apply_recalibrator/d2cd22743d3eea79f59dd21ebb84a0d7/SM.recal.snps.vcf.log help=false input=[(RodBinding name=input source=/tmp/generate_APPLY_RECALIBRATOR.py/d2cd22743d3eea79f59dd21ebb84a0d7/ISDB11122.snps.raw.vcf)] recal_file=(RodBinding name=recal_file source=/tmp/generate_APPLY_RECALIBRATOR.py/d2cd22743d3eea79f59dd21ebb84a0d7/ISDB11122.snps.VarRecal.recal) tranches_file=/tmp/generate_APPLY_RECALIBRATOR.py/d2cd22743d3eea79f59dd21ebb84a0d7/ISDB11122.snps.VarRecal.tranches out=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub no_cmdline_in_header=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sites_only=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub bcf=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub ts_filter_level=99.0 ignore_filter=null mode=SNP filter_mismatching_base_and_quals=false\""
              }, {
                "key" : "CombineVariants",
                "value" : "\"analysis_type=CombineVariants input_file=[] read_buffer_size=null phone_home=STANDARD gatk_key=null read_filter=[] intervals=null excludeIntervals=null interval_set_rule=UNION interval_merging=ALL interval_padding=0 reference_sequence=/tmp/generate_COMBINE_VARIANTS.py/00e90c599e331929a09028693bed91f7/human_g1k_v37.fasta nonDeterministicRandomSeed=false downsampling_type=BY_SAMPLE downsample_to_fraction=null downsample_to_coverage=1000 baq=OFF baqGapOpenPenalty=40.0 performanceLog=null useOriginalQualities=false BQSR=null quantize_quals=0 disable_indel_quals=false emit_original_quals=false preserve_qscores_less_than=6 defaultBaseQualities=-1 validation_strictness=SILENT remove_program_records=false keep_program_records=false unsafe=null num_threads=1 num_cpu_threads=null num_io_threads=null num_bam_file_handles=null read_group_black_list=null pedigree=[] pedigreeString=[] pedigreeValidationType=STRICT allow_intervals_with_unindexed_bam=false generateShadowBCF=false logging_level=INFO log_to_file=/storage/gluster/insilico/data/GenomicsData/Series//ISDB11122GPL11154/combine_variants/00e90c599e331929a09028693bed91f7/ISDB11122.SNPrecal.IndelFiltered.vcf.log help=false variant=[(RodBinding name=variant source=/tmp/generate_COMBINE_VARIANTS.py/00e90c599e331929a09028693bed91f7/ISDB11122.indel.filtered.vcf), (RodBinding name=variant2 source=/tmp/generate_COMBINE_VARIANTS.py/00e90c599e331929a09028693bed91f7/SM.recal.snps.vcf)] out=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub no_cmdline_in_header=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sites_only=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub bcf=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub genotypemergeoption=UNSORTED filteredrecordsmergetype=KEEP_IF_ANY_UNFILTERED multipleallelesmergetype=BY_TYPE rod_priority_list=null printComplexMerges=false filteredAreUncalled=false minimalVCF=false setKey=set assumeIdenticalSamples=false minimumN=1 suppressCommandLineHeader=false mergeInfoWithMaxAC=false filter_mismatching_base_and_quals=false\""
              }, {
                "key" : "SelectVariants",
                "value" : "\"analysis_type=SelectVariants input_file=[] read_buffer_size=null phone_home=STANDARD gatk_key=null read_filter=[] intervals=null excludeIntervals=null interval_set_rule=UNION interval_merging=ALL interval_padding=0 reference_sequence=/tmp/generate_SELECTEDVARIANTS.py/3aed2f246e8c0249ff8a031bd209dc10/human_g1k_v37.fasta nonDeterministicRandomSeed=false downsampling_type=BY_SAMPLE downsample_to_fraction=null downsample_to_coverage=1000 baq=OFF baqGapOpenPenalty=40.0 performanceLog=null useOriginalQualities=false BQSR=null quantize_quals=0 disable_indel_quals=false emit_original_quals=false preserve_qscores_less_than=6 defaultBaseQualities=-1 validation_strictness=SILENT remove_program_records=false keep_program_records=false unsafe=null num_threads=1 num_cpu_threads=null num_io_threads=null num_bam_file_handles=null read_group_black_list=null pedigree=[] pedigreeString=[] pedigreeValidationType=STRICT allow_intervals_with_unindexed_bam=false generateShadowBCF=false logging_level=INFO log_to_file=null help=false variant=(RodBinding name=variant source=/tmp/generate_SELECTEDVARIANTS.py/3aed2f246e8c0249ff8a031bd209dc10/ISDB11122.variants.raw.vcf) discordance=(RodBinding name= source=UNBOUND) concordance=(RodBinding name= source=UNBOUND) out=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub no_cmdline_in_header=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sites_only=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub bcf=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sample_name=[] sample_expressions=null sample_file=null exclude_sample_name=[] exclude_sample_file=[] select_expressions=[] excludeNonVariants=false excludeFiltered=false regenotype=false restrictAllelesTo=ALL keepOriginalAC=false mendelianViolation=false mendelianViolationQualThreshold=0.0 select_random_number=0 select_random_fraction=0.0 remove_fraction_genotypes=0.0 selectTypeToInclude=[SNP] keepIDs=null fullyDecode=false forceGenotypesDecode=false justRead=false filter_mismatching_base_and_quals=false\""
              }, {
                "key" : "UnifiedGenotyper",
                "value" : "\"analysis_type=UnifiedGenotyper input_file=[/storage/gluster/insilico/data/GenomicsData/ISDBM32/ISDBM322016/printreads/880ddadd1566253466a7e6761e854445/ISDBM322016.recal.bam, /storage/gluster/insilico/data/GenomicsData/ISDBM32/ISDBM322018/printreads/c3a712cdc76c431297effdb013de7bd2/ISDBM322018.recal.bam, /storage/gluster/insilico/data/GenomicsData/ISDBM32/ISDBM322017/printreads/b43e7abc909888a6a066fc3da4c305e7/ISDBM322017.recal.bam, /storage/gluster/insilico/data/GenomicsData/ISDBM32/ISDBM322015/printreads/8eb77fc396f7325f7da846402d1a6df9/ISDBM322015.recal.bam] read_buffer_size=null phone_home=STANDARD gatk_key=null read_filter=[] intervals=null excludeIntervals=null interval_set_rule=UNION interval_merging=ALL interval_padding=0 reference_sequence=/tmp/generate_UNIFIEDGENOTYPER.py/dbe01e32e5f0143c1e3d62bfa4a46bd0/human_g1k_v37.fasta nonDeterministicRandomSeed=false downsampling_type=BY_SAMPLE downsample_to_fraction=null downsample_to_coverage=250 baq=OFF baqGapOpenPenalty=40.0 performanceLog=null useOriginalQualities=false BQSR=null quantize_quals=0 disable_indel_quals=false emit_original_quals=false preserve_qscores_less_than=6 defaultBaseQualities=-1 validation_strictness=SILENT remove_program_records=false keep_program_records=false unsafe=null num_threads=6 num_cpu_threads=null num_io_threads=null num_bam_file_handles=null read_group_black_list=null pedigree=[] pedigreeString=[] pedigreeValidationType=STRICT allow_intervals_with_unindexed_bam=false generateShadowBCF=false logging_level=INFO log_to_file=null help=false genotype_likelihoods_model=BOTH p_nonref_model=EXACT pcr_error_rate=1.0E-4 noSLOD=false annotateNDA=false min_base_quality_score=17 max_deletion_fraction=0.05 cap_max_alternate_alleles_for_indels=false min_indel_count_for_genotyping=5 min_indel_fraction_per_sample=0.25 indel_heterozygosity=1.25E-4 indelGapContinuationPenalty=10 indelGapOpenPenalty=45 indelHaplotypeSize=80 noBandedIndel=false indelDebug=false ignoreSNPAlleles=false allReadsSP=false ignoreLaneInfo=false reference_sample_calls=(RodBinding name= source=UNBOUND) reference_sample_name=null sample_ploidy=2 min_quality_score=1 max_quality_score=40 site_quality_prior=20 min_power_threshold_for_calling=0.95 min_reference_depth=100 exclude_filtered_reference_sites=false heterozygosity=0.0010 genotyping_mode=DISCOVERY output_mode=EMIT_VARIANTS_ONLY standard_min_confidence_threshold_for_calling=30.0 standard_min_confidence_threshold_for_emitting=30.0 alleles=(RodBinding name= source=UNBOUND) max_alternate_alleles=3 dbsnp=(RodBinding name=dbsnp source=/tmp/generate_UNIFIEDGENOTYPER.py/dbe01e32e5f0143c1e3d62bfa4a46bd0/dbsnp_135.b37.vcf) comp=[] out=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub no_cmdline_in_header=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sites_only=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub bcf=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub debug_file=null metrics_file=null annotation=[AlleleBalance, DepthOfCoverage, FisherStrand] excludeAnnotation=[] filter_mismatching_base_and_quals=false\""
              }, {
                "key" : "VariantFiltration",
                "value" : "\"analysis_type=VariantFiltration input_file=[] read_buffer_size=null phone_home=STANDARD gatk_key=null read_filter=[] intervals=null excludeIntervals=null interval_set_rule=UNION interval_merging=ALL interval_padding=0 reference_sequence=/tmp/generate_VARIANT_FILTRATION.py/af94a8015760f0c3d105ae21bdcee583/human_g1k_v37.fasta nonDeterministicRandomSeed=false downsampling_type=BY_SAMPLE downsample_to_fraction=null downsample_to_coverage=1000 baq=OFF baqGapOpenPenalty=40.0 performanceLog=null useOriginalQualities=false BQSR=null quantize_quals=0 disable_indel_quals=false emit_original_quals=false preserve_qscores_less_than=6 defaultBaseQualities=-1 validation_strictness=SILENT remove_program_records=false keep_program_records=false unsafe=null num_threads=1 num_cpu_threads=null num_io_threads=null num_bam_file_handles=null read_group_black_list=null pedigree=[] pedigreeString=[] pedigreeValidationType=STRICT allow_intervals_with_unindexed_bam=false generateShadowBCF=false logging_level=INFO log_to_file=/storage/gluster/insilico/data/GenomicsData/Series//ISDB11122GPL11154/variant_filtration/af94a8015760f0c3d105ae21bdcee583/ISDB11122.indel.filtered.vcf.log help=false variant=(RodBinding name=variant source=/tmp/generate_VARIANT_FILTRATION.py/af94a8015760f0c3d105ae21bdcee583/ISDB11122.indels.raw.vcf) mask=(RodBinding name= source=UNBOUND) out=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub no_cmdline_in_header=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub sites_only=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub bcf=org.broadinstitute.sting.gatk.io.stubs.VariantContextWriterStub filterExpression=[QD < 2.0 || ReadPosRankSum < -20.0 || FS > 200.0] filterName=[GATKStandard] genotypeFilterExpression=[] genotypeFilterName=[] clusterSize=3 clusterWindowSize=0 maskExtension=0 maskName=Mask missingValuesInExpressionsShouldEvaluateAsFailing=true invalidatePreviousFilters=false filter_mismatching_base_and_quals=false\""
              }, {
                "key" : "reference",
                "value" : "file:///tmp/generate_COMBINE_VARIANTS.py/00e90c599e331929a09028693bed91f7/human_g1k_v37.fasta"
              }, {
                "key" : "source",
                "value" : "SelectVariants"
              }, {
                "key" : "SnpEffVersion",
                "value" : "\"3.3c (build 2013-06-28), by Pablo Cingolani\""
              }, {
                "key" : "SnpEffCmd",
                "value" : "\"SnpEff  -t hg19 /tmp/generate_SNPEFF.py/98b17a7321fce5a67e5dcd5a1c24a311/ISDB11122.SNPrecal.IndelFiltered.vcf \""
              } ]
            }
          },
          "storagePipelineResult" : {
            "input" : "file:///mnt/resources/datasets/corpasome/data/quartet.variants.annotated.vcf.gz",
            "preTransformResult" : "file:///mnt/resources/datasets/corpasome/data/quartet.variants.annotated.vcf.gz",
            "transformResult" : "file:/mnt/data/opencga-prod/sessions/jobs/JOBS/demo/20200228/variant-index.20200228103518.bPw8hW/scratch_variant-index3sOZgqcthw/quartet.variants.annotated.vcf.gz.variants.avro.gz",
            "postTransformResult" : "file:/mnt/data/opencga-prod/sessions/jobs/JOBS/demo/20200228/variant-index.20200228103518.bPw8hW/scratch_variant-index3sOZgqcthw/quartet.variants.annotated.vcf.gz.variants.avro.gz",
            "preLoadResult" : "file:/mnt/data/opencga-prod/sessions/jobs/JOBS/demo/20200228/variant-index.20200228103518.bPw8hW/scratch_variant-index3sOZgqcthw/quartet.variants.annotated.vcf.gz.variants.avro.gz",
            "loadResult" : "file:/mnt/data/opencga-prod/sessions/jobs/JOBS/demo/20200228/variant-index.20200228103518.bPw8hW/scratch_variant-index3sOZgqcthw/quartet.variants.annotated.vcf.gz.variants.avro.gz",
            "postLoadResult" : "file:/mnt/data/opencga-prod/sessions/jobs/JOBS/demo/20200228/variant-index.20200228103518.bPw8hW/scratch_variant-index3sOZgqcthw/quartet.variants.annotated.vcf.gz.variants.avro.gz",
            "transformExecuted" : true,
            "transformTimeMillis" : 8758,
            "transformStats" : { },
            "loadExecuted" : true,
            "loadTimeMillis" : 91687,
            "loadStats" : { }
          }
        }
      }, {
        "uid" : 0,
        "id" : "bam:SonsAlignedBamFile.bam",
        "studyUid" : 0,
        "annotationSets" : [ {
          "id" : "opencga_alignment_stats",
          "name" : "opencga_alignment_stats",
          "variableSetId" : "opencga_alignment_stats",
          "annotations" : {
            "readsDuplicated" : 1121410,
            "inwardOrientedPairs" : 15081995,
            "totalLastFragmentLength" : 1445257260,
            "basesMapped" : -1478038666,
            "rawTotalSequences" : 32116828,
            "averageFirstFragmentLength" : 90.0,
            "readsUnmapped" : 817621,
            "sequences" : 32116828,
            "readsProperlyPaired" : 30066492,
            "insertSizeStandardDeviation" : 46.3,
            "nonPrimaryAlignments" : 0,
            "basesTrimmed" : 0,
            "maximumLength" : 90,
            "percentageOfProperlyPairedReads" : 93.6,
            "basesMappedCigar" : -1482681607,
            "readsPaired" : 32116828,
            "filteredSequences" : 0,
            "mismatches" : 8428924,
            "readsMapped" : 31299207,
            "averageLastFragmentLength" : 90.0,
            "outwardOrientedPairs" : 452217,
            "pairsOnDifferentChromosomes" : 13380,
            "readsQcFailed" : 0,
            "sampleId" : "ISDBM322015",
            "averageLength" : 90.0,
            "lastFragments" : 16058414,
            "basesDuplicated" : 100926900,
            "totalLength" : -1404452776,
            "errorRate" : 0.002997179,
            "readsMappedAndPaired" : 31120474,
            "maximumFirstFragmentLength" : 90,
            "maximumLastFragmentLength" : 90,
            "totalFirstFragmentLength" : 1445257260,
            "insertSizeAverage" : 153.6,
            "firstFragments" : 16058414,
            "readsMq0" : 2369927,
            "pairsWithOtherOrientation" : 12645,
            "averageQuality" : 34.8,
            "isSorted" : 1,
            "fileId" : "bam:SonsAlignedBamFile.bam"
          },
          "creationDate" : "20200526010933",
          "release" : 1,
          "attributes" : { }
        } ],
        "name" : "SonsAlignedBamFile.bam",
        "uuid" : "0753f502-0172-0003-0001-cdcfee722b66",
        "type" : "FILE",
        "format" : "BAM",
        "bioformat" : "ALIGNMENT",
        "uri" : "file:///mnt/resources/datasets/corpasome/data/SonsAlignedBamFile.bam",
        "path" : "bam/SonsAlignedBamFile.bam",
        "release" : 1,
        "creationDate" : "20200512052042",
        "modificationDate" : "20200512052042",
        "external" : true,
        "size" : 4260773037,
        "software" : { },
        "experiment" : { },
        "samples" : [ {
          "uid" : 0,
          "id" : "ISDBM322015",
          "studyUid" : 0,
          "uuid" : "8b5d52d0-0170-0004-0001-f3d4e4de4fb0",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103514",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322015",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz", "bam:SonsAlignedBamFile.bam" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103514",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "manuel",
          "studyUid" : 0,
          "uuid" : "0753f6a4-0172-0004-0001-b860fc2e7a69",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200512052042",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "",
          "fileIds" : [ "bam:SonsAlignedBamFile.bam" ],
          "status" : {
            "name" : "",
            "description" : "",
            "date" : ""
          },
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200512052042",
              "description" : ""
            }
          },
          "attributes" : { }
        } ],
        "jobId" : "",
        "tags" : [ ],
        "relatedFiles" : [ ],
        "stats" : { },
        "status" : {
          "name" : "",
          "description" : "",
          "date" : ""
        },
        "internal" : {
          "status" : {
            "name" : "READY",
            "date" : "20200512052042",
            "description" : ""
          },
          "index" : {
            "userId" : "",
            "creationDate" : "",
            "status" : {
              "name" : "NONE",
              "date" : "20200512052042",
              "description" : ""
            },
            "jobId" : -1,
            "release" : 0,
            "attributes" : { }
          },
          "sampleMap" : { }
        },
        "attributes" : {
          "alignmentHeader" : {
            "sortOrder" : "coordinate",
            "groupOrder" : "none",
            "sequenceDictionary" : {
              "sequences" : [ {
                "sequenceIndex" : 0,
                "sequenceLength" : 249250621
              }, {
                "sequenceIndex" : 1,
                "sequenceLength" : 243199373
              }, {
                "sequenceIndex" : 2,
                "sequenceLength" : 198022430
              }, {
                "sequenceIndex" : 3,
                "sequenceLength" : 191154276
              }, {
                "sequenceIndex" : 4,
                "sequenceLength" : 180915260
              }, {
                "sequenceIndex" : 5,
                "sequenceLength" : 171115067
              }, {
                "sequenceIndex" : 6,
                "sequenceLength" : 159138663
              }, {
                "sequenceIndex" : 7,
                "sequenceLength" : 146364022
              }, {
                "sequenceIndex" : 8,
                "sequenceLength" : 141213431
              }, {
                "sequenceIndex" : 9,
                "sequenceLength" : 135534747
              }, {
                "sequenceIndex" : 10,
                "sequenceLength" : 135006516
              }, {
                "sequenceIndex" : 11,
                "sequenceLength" : 133851895
              }, {
                "sequenceIndex" : 12,
                "sequenceLength" : 115169878
              }, {
                "sequenceIndex" : 13,
                "sequenceLength" : 107349540
              }, {
                "sequenceIndex" : 14,
                "sequenceLength" : 102531392
              }, {
                "sequenceIndex" : 15,
                "sequenceLength" : 90354753
              }, {
                "sequenceIndex" : 16,
                "sequenceLength" : 81195210
              }, {
                "sequenceIndex" : 17,
                "sequenceLength" : 78077248
              }, {
                "sequenceIndex" : 18,
                "sequenceLength" : 59128983
              }, {
                "sequenceIndex" : 19,
                "sequenceLength" : 63025520
              }, {
                "sequenceIndex" : 20,
                "sequenceLength" : 48129895
              }, {
                "sequenceIndex" : 21,
                "sequenceLength" : 51304566
              }, {
                "sequenceIndex" : 22,
                "sequenceLength" : 155270560
              }, {
                "sequenceIndex" : 23,
                "sequenceLength" : 59373566
              }, {
                "sequenceIndex" : 24,
                "sequenceLength" : 16569
              }, {
                "sequenceIndex" : 25,
                "sequenceLength" : 4262
              }, {
                "sequenceIndex" : 26,
                "sequenceLength" : 15008
              }, {
                "sequenceIndex" : 27,
                "sequenceLength" : 19913
              }, {
                "sequenceIndex" : 28,
                "sequenceLength" : 27386
              }, {
                "sequenceIndex" : 29,
                "sequenceLength" : 27682
              }, {
                "sequenceIndex" : 30,
                "sequenceLength" : 33824
              }, {
                "sequenceIndex" : 31,
                "sequenceLength" : 34474
              }, {
                "sequenceIndex" : 32,
                "sequenceLength" : 36148
              }, {
                "sequenceIndex" : 33,
                "sequenceLength" : 36422
              }, {
                "sequenceIndex" : 34,
                "sequenceLength" : 36651
              }, {
                "sequenceIndex" : 35,
                "sequenceLength" : 37175
              }, {
                "sequenceIndex" : 36,
                "sequenceLength" : 37498
              }, {
                "sequenceIndex" : 37,
                "sequenceLength" : 38154
              }, {
                "sequenceIndex" : 38,
                "sequenceLength" : 38502
              }, {
                "sequenceIndex" : 39,
                "sequenceLength" : 38914
              }, {
                "sequenceIndex" : 40,
                "sequenceLength" : 39786
              }, {
                "sequenceIndex" : 41,
                "sequenceLength" : 39929
              }, {
                "sequenceIndex" : 42,
                "sequenceLength" : 39939
              }, {
                "sequenceIndex" : 43,
                "sequenceLength" : 40103
              }, {
                "sequenceIndex" : 44,
                "sequenceLength" : 40531
              }, {
                "sequenceIndex" : 45,
                "sequenceLength" : 40652
              }, {
                "sequenceIndex" : 46,
                "sequenceLength" : 41001
              }, {
                "sequenceIndex" : 47,
                "sequenceLength" : 41933
              }, {
                "sequenceIndex" : 48,
                "sequenceLength" : 41934
              }, {
                "sequenceIndex" : 49,
                "sequenceLength" : 42152
              }, {
                "sequenceIndex" : 50,
                "sequenceLength" : 43341
              }, {
                "sequenceIndex" : 51,
                "sequenceLength" : 43523
              }, {
                "sequenceIndex" : 52,
                "sequenceLength" : 43691
              }, {
                "sequenceIndex" : 53,
                "sequenceLength" : 45867
              }, {
                "sequenceIndex" : 54,
                "sequenceLength" : 45941
              }, {
                "sequenceIndex" : 55,
                "sequenceLength" : 81310
              }, {
                "sequenceIndex" : 56,
                "sequenceLength" : 90085
              }, {
                "sequenceIndex" : 57,
                "sequenceLength" : 92689
              }, {
                "sequenceIndex" : 58,
                "sequenceLength" : 106433
              }, {
                "sequenceIndex" : 59,
                "sequenceLength" : 128374
              }, {
                "sequenceIndex" : 60,
                "sequenceLength" : 129120
              }, {
                "sequenceIndex" : 61,
                "sequenceLength" : 137718
              }, {
                "sequenceIndex" : 62,
                "sequenceLength" : 155397
              }, {
                "sequenceIndex" : 63,
                "sequenceLength" : 159169
              }, {
                "sequenceIndex" : 64,
                "sequenceLength" : 161147
              }, {
                "sequenceIndex" : 65,
                "sequenceLength" : 161802
              }, {
                "sequenceIndex" : 66,
                "sequenceLength" : 164239
              }, {
                "sequenceIndex" : 67,
                "sequenceLength" : 166566
              }, {
                "sequenceIndex" : 68,
                "sequenceLength" : 169874
              }, {
                "sequenceIndex" : 69,
                "sequenceLength" : 172149
              }, {
                "sequenceIndex" : 70,
                "sequenceLength" : 172294
              }, {
                "sequenceIndex" : 71,
                "sequenceLength" : 172545
              }, {
                "sequenceIndex" : 72,
                "sequenceLength" : 174588
              }, {
                "sequenceIndex" : 73,
                "sequenceLength" : 179198
              }, {
                "sequenceIndex" : 74,
                "sequenceLength" : 179693
              }, {
                "sequenceIndex" : 75,
                "sequenceLength" : 180455
              }, {
                "sequenceIndex" : 76,
                "sequenceLength" : 182896
              }, {
                "sequenceIndex" : 77,
                "sequenceLength" : 186858
              }, {
                "sequenceIndex" : 78,
                "sequenceLength" : 186861
              }, {
                "sequenceIndex" : 79,
                "sequenceLength" : 187035
              }, {
                "sequenceIndex" : 80,
                "sequenceLength" : 189789
              }, {
                "sequenceIndex" : 81,
                "sequenceLength" : 191469
              }, {
                "sequenceIndex" : 82,
                "sequenceLength" : 211173
              }, {
                "sequenceIndex" : 83,
                "sequenceLength" : 547496
              } ]
            },
            "comments" : [ ],
            "readGroups" : [ {
              "platform" : "ILLUMINA",
              "sample" : "manuel"
            }, {
              "platform" : "ILLUMINA",
              "sample" : "ISDBM322015"
            } ],
            "validationErrors" : [ ],
            "programRecords" : [ {
              "commandLine" : "knownAlleles=[(RodBinding name=knownAlleles source=/ReferenceData/GATKbundle/b37/dbsnp_132.b37.vcf), (RodBinding name=knownAlleles2 source=/ReferenceData/GATKbundle/5974/1000G_indels_for_realignment.b37.vcf)] targetIntervals=manuel_analysis/Aligned/manuel.intervals LODThresholdForCleaning=5.0 consensusDeterminationModel=USE_READS entropyThreshold=0.15 maxReadsInMemory=150000 maxIsizeForMovement=3000 maxPositionalMoveAllowed=200 maxConsensuses=30 maxReadsForConsensuses=120 maxReadsForRealignment=20000 noOriginalAlignmentTags=false nWayOut=null generate_nWayOut_md5s=false check_early=false noPGTag=false keepPGTags=false indelsFileForDebugging=null statisticsFileForDebugging=null SNPsFileForDebugging=null",
              "programVersion" : "1.4-7-gc96fee4"
            }, {
              "programName" : "bwa",
              "programVersion" : "0.6.1-r104"
            }, {
              "commandLine" : "default_read_group=null default_platform=null force_read_group=null force_platform=null window_size_nqs=5 homopolymer_nback=7 exception_if_no_tile=false solid_recal_mode=SET_Q_ZERO solid_nocall_strategy=THROW_EXCEPTION recal_file=manuel_analysis/Aligned/manuel.covariate_table.csv preserve_qscores_less_than=5 smoothing=1 max_quality_score=50 doNotWriteOriginalQuals=false no_pg_tag=false fail_with_no_eof_marker=false skipUQUpdate=false Covariates=[ReadGroupCovariate, QualityScoreCovariate, CycleCovariate, DinucCovariate] ",
              "programVersion" : "1.4-7-gc96fee4"
            } ]
          }
        }
      } ],
      "proband" : {
        "uid" : 0,
        "id" : "ISDBM322015",
        "studyUid" : 0,
        "name" : "ISDBM322015",
        "uuid" : "8b5d4718-0170-0006-0001-da8ae467ea50",
        "father" : {
          "uid" : 0,
          "id" : "ISDBM322016",
          "studyUid" : 0,
          "uuid" : "8b5d4b00-0170-0006-0001-ff77edf90e20",
          "release" : 0,
          "version" : 0,
          "parentalConsanguinity" : false
        },
        "mother" : {
          "uid" : 0,
          "id" : "ISDBM322018",
          "studyUid" : 0,
          "uuid" : "8b5d4b00-0170-0006-0001-4ab540daf50c",
          "release" : 0,
          "version" : 0,
          "parentalConsanguinity" : false
        },
        "qualityControl": {
          "metrics": [
            {
              "sampleId": "ISDBM322015",
              "inferredSexReport": {
                "method": "Plink/IBD",
                "inferredKaryotypicSex": "XY",
                "values": {
                  "ratioX": 0.509,
                  "ratioY": 0.411
                }
              },
              "relatednessReport": {
                "method": "Plink/IBD",
                "scores": [
                  {
                    "sampleId1": "ISDBM322015",
                    "sampleId2": "ISDBM322016",
                    "inferredRelationship": "FATHER",
                    "values": {
                      "IBD0": 1,
                      "IBD1": 0,
                      "IBD2": 0,
                      "PiHat": 0,
                    }
                  },
                  {
                    "sampleId1": "ISDBM322015",
                    "sampleId2": "ISDBM322018",
                    "inferredRelationship": "MOTHER",
                    "values": {
                      "IBD0": 0.1,
                      "IBD1": 0.9,
                      "IBD2": 0,
                      "PiHat": 0,
                    }
                  },
                  {
                    "sampleId1": "ISDBM322016",
                    "sampleId2": "ISDBM322018",
                    "inferredRelationship": "COUSIN",
                    "values": {
                      "IBD0": 0.98,
                      "IBD1": 0.02,
                      "IBD2": 0,
                      "PiHat": 0,
                    }
                  },
                  {
                    "sampleId1": "ISDBM322015",
                    "sampleId2": "ISDBM322017",
                    "inferredRelationship": "SISTER",
                    "values": {
                      "IBD0": 0.5,
                      "IBD1": 0.5,
                      "IBD2": 0,
                      "PiHat": 0,
                    }
                  }
                ]
              },
              "mendelianErrorReport": {
                "numErrors": 12311,
                "sampleAggregation": [
                  {
                    "sample": "ISDBM322015",
                    "numErrors": 1212,
                    "ratio": 0.087,
                    "chromAggregation": [
                      {
                        "chromosome": "1",
                        "numErrors": 65,
                        "errorCodeAggregation": {
                          "2": 12,
                          "3": 3,
                          "5": 7
                        }
                      },
                      {
                        "chromosome": "2",
                        "numErrors": 65,
                        "errorCodeAggregation": {
                          "2": 12,
                          "3": 3,
                          "5": 7
                        }
                      },
                      {
                        "chromosome": "3",
                        "numErrors": 65,
                        "errorCodeAggregation": {
                          "2": 12,
                          "3": 3,
                          "5": 7
                        }
                      }
                    ]
                  },
                  {
                    "sample": "ISDBM322016",
                    "numErrors": 2242,
                    "ratio": 0.047,
                    "chromAggregation": []
                  },
                  {
                    "sample": "ISDBM322018",
                    "numErrors": 2212,
                    "ratio": 0.097,
                    "chromAggregation": []
                  }
                ]
              }
            }
          ]
        },
        "location" : { },
        "sex" : "MALE",
        "karyotypicSex" : "XY",
        "ethnicity" : "",
        "population" : {
          "name" : "",
          "subpopulation" : "",
          "description" : ""
        },
        "release" : 1,
        "version" : 1,
        "creationDate" : "20200228103511",
        "modificationDate" : "20200228103514",
        "lifeStatus" : "ALIVE",
        "phenotypes" : [ {
          "id" : "HP:0000519",
          "name" : "Developmental cataract",
          "source" : "HPO",
          "status" : "OBSERVED"
        }, {
          "id" : "HP:00005456",
          "name" : "Myopia",
          "source" : "HPO",
          "status" : "OBSERVED"
        } ],
        "disorders" : [ {
          "id" : "OMIM:611597",
          "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
          "source" : "OMIM"
        } ],
        "samples" : [ {
          "uid" : 0,
          "id" : "ISDBM322015",
          "studyUid" : 0,
          "qualityControl": {
            "metrics": [
              {
                "bamFile": "SonsAlignedBamFile.bam",
                "variantStats": [
                  {
                    "id": "ALL",
                    "query": {},
                    "stats": {
                      "tiTvRatio" : 2.184589,
                      "biotypeCount" : {
                        "IG_V_pseudogene" : 471,
                        "TR_J_pseudogene" : 8,
                        "nonsense_mediated_decay" : 38790,
                        "snRNA" : 1289,
                        "IG_V_gene" : 536,
                        "unitary_pseudogene" : 294,
                        "TR_V_gene" : 261,
                        "non_stop_decay" : 252,
                        "processed_pseudogene" : 13581,
                        "sense_overlapping" : 554,
                        "lincRNA" : 10046,
                        "misc_RNA" : 1455,
                        "miRNA" : 3205,
                        "IG_C_pseudogene" : 51,
                        "IG_J_pseudogene" : 7,
                        "protein_coding" : 117967,
                        "rRNA" : 431,
                        "TR_V_pseudogene" : 52,
                        "IG_D_gene" : 72,
                        "Mt_rRNA" : 10,
                        "retained_intron" : 43383,
                        "3prime_overlapping_ncrna" : 66,
                        "Mt_tRNA" : 26,
                        "snoRNA" : 1301,
                        "transcribed_processed_pseudogene" : 785,
                        "pseudogene" : 577,
                        "transcribed_unprocessed_pseudogene" : 2866,
                        "IG_J_gene" : 29,
                        "IG_C_gene" : 137,
                        "sense_intronic" : 795,
                        "TR_C_gene" : 49,
                        "unprocessed_pseudogene" : 5287,
                        "translated_processed_pseudogene" : 1,
                        "TR_J_gene" : 77,
                        "processed_transcript" : 51934,
                        "antisense" : 13692,
                        "polymorphic_pseudogene" : 437
                      },
                      "genotypeCount" : {
                        "0/1" : 56550,
                        "1/1" : 115739,
                        "1/2" : 324,
                        "1/3" : 5
                      },
                      "chromosomeCount" : {
                        "22" : 4095,
                        "X" : 2377,
                        "Y" : 437,
                        "10" : 8451,
                        "11" : 9511,
                        "12" : 8233,
                        "13" : 4339,
                        "14" : 5891,
                        "15" : 5804,
                        "16" : 6749,
                        "17" : 8074,
                        "18" : 3711,
                        "MT" : 26,
                        "19" : 8629,
                        "1" : 15814,
                        "2" : 12636,
                        "3" : 9349,
                        "4" : 8176,
                        "5" : 8052,
                        "6" : 9712,
                        "7" : 8812,
                        "8" : 6821,
                        "9" : 7318,
                        "20" : 4502,
                        "21" : 2657
                      },
                      "variantCount" : 172618,
                      "consequenceTypeCount" : {
                        "intergenic_variant" : 28802,
                        "frameshift_variant" : 175,
                        "3_prime_UTR_variant" : 7978,
                        "2KB_downstream_variant" : 30855,
                        "splice_acceptor_variant" : 95,
                        "intron_variant" : 105346,
                        "splice_region_variant" : 2905,
                        "upstream_gene_variant" : 28712,
                        "5_prime_UTR_variant" : 3311,
                        "non_coding_transcript_exon_variant" : 27805,
                        "stop_gained" : 114,
                        "non_coding_transcript_variant" : 57030,
                        "2KB_upstream_variant" : 27239,
                        "start_lost" : 30,
                        "splice_donor_variant" : 84,
                        "NMD_transcript_variant" : 31871,
                        "synonymous_variant" : 11338,
                        "missense_variant" : 10527,
                        "mature_miRNA_variant" : 6,
                        "feature_truncation" : 1,
                        "stop_lost" : 45,
                        "regulatory_region_variant" : 142317,
                        "downstream_gene_variant" : 32859,
                        "stop_retained_variant" : 26,
                        "TF_binding_site_variant" : 20588,
                        "coding_sequence_variant" : 11,
                        "inframe_deletion" : 87,
                        "inframe_insertion" : 64,
                        "incomplete_terminal_codon_variant" : 6
                      },
                      "indelLengthCount" : {
                        "lt20" : 15,
                        "lt10" : 63,
                        "gte20" : 11,
                        "lt5" : 7114,
                        "lt15" : 17
                      },
                      "qualityStdDev" : 1507.8727,
                      "mendelianErrorCount" : {
                        "1" : 649
                      },
                      "heterozygosityRate" : 0.32950792,
                      "id" : "ISDBM322015",
                      "typeCount" : {
                        "INSERTION" : 1,
                        "SNV" : 165398,
                        "DELETION" : 1,
                        "INDEL" : 7218
                      },
                      "qualityAvg" : 805.0968,
                      "filterCount" : {
                        "PASS" : 153588.0
                      }
                    }
                  },
                ],
                "mutationalSignatures" : [
                  {

                  }
                ],
                "fastqc": {},
                "hsMetrics": {},
                "samtoolsFlagStats": {},
                "geneCoverageStats": [
                  {
                    "sampleId" : "ISDBM322015",
                    "geneName" : "CEL",
                    "stats" : [ {
                      "id" : "ENST00000372080",
                      "name" : "CEL-001",
                      "biotype" : "protein_coding",
                      "chromosome" : "9",
                      "start" : 135937365,
                      "end" : 135947248,
                      "length" : 2384,
                      "depths" : [ 88.96812080536914, 77.09731543624162, 69.21140939597315, 60.90604026845637, 55.28523489932886, 48.86744966442953, 45.93120805369127, 36.91275167785235, 26.090604026845636, 21.686241610738254, 10.234899328859061, 6.9630872483221475 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "9",
                        "start" : 135937365,
                        "end" : 135937455,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939791,
                        "end" : 135939874,
                        "depthAvg" : 23.44047619047619,
                        "depthMin" : 18.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939876,
                        "end" : 135939878,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939889,
                        "end" : 135939892,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939895,
                        "end" : 135939897,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939925,
                        "end" : 135939941,
                        "depthAvg" : 27.58823529411765,
                        "depthMin" : 23.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135942225,
                        "end" : 135942332,
                        "depthAvg" : 9.50925925925926,
                        "depthMin" : 6.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135942500,
                        "end" : 135942592,
                        "depthAvg" : 14.67741935483871,
                        "depthMin" : 4.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135944638,
                        "end" : 135944646,
                        "depthAvg" : 28.555555555555557,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135945848,
                        "end" : 135945870,
                        "depthAvg" : 24.08695652173913,
                        "depthMin" : 20.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135946374,
                        "end" : 135947248,
                        "depthAvg" : 7.410285714285714,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001662100",
                        "chromosome" : "9",
                        "start" : 135937365,
                        "end" : 135937455,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0,
                        "depthMax" : 0.0
                      }, {
                        "id" : "ENSE00001136823",
                        "chromosome" : "9",
                        "start" : 135939791,
                        "end" : 135939941,
                        "depthAvg" : 26.52980132450331,
                        "depthMin" : 18.0,
                        "depthMax" : 33.0
                      }, {
                        "id" : "ENSE00001136821",
                        "chromosome" : "9",
                        "start" : 135940027,
                        "end" : 135940149,
                        "depthAvg" : 44.50406504065041,
                        "depthMin" : 35.0,
                        "depthMax" : 51.0
                      }, {
                        "id" : "ENSE00001136814",
                        "chromosome" : "9",
                        "start" : 135940427,
                        "end" : 135940624,
                        "depthAvg" : 173.96464646464648,
                        "depthMin" : 45.0,
                        "depthMax" : 257.0
                      }, {
                        "id" : "ENSE00001136809",
                        "chromosome" : "9",
                        "start" : 135941917,
                        "end" : 135942047,
                        "depthAvg" : 54.458015267175576,
                        "depthMin" : 35.0,
                        "depthMax" : 68.0
                      }, {
                        "id" : "ENSE00001136804",
                        "chromosome" : "9",
                        "start" : 135942225,
                        "end" : 135942332,
                        "depthAvg" : 9.50925925925926,
                        "depthMin" : 6.0,
                        "depthMax" : 13.0
                      }, {
                        "id" : "ENSE00001136798",
                        "chromosome" : "9",
                        "start" : 135942475,
                        "end" : 135942592,
                        "depthAvg" : 18.440677966101696,
                        "depthMin" : 4.0,
                        "depthMax" : 34.0
                      }, {
                        "id" : "ENSE00001679789",
                        "chromosome" : "9",
                        "start" : 135944059,
                        "end" : 135944245,
                        "depthAvg" : 65.75935828877006,
                        "depthMin" : 47.0,
                        "depthMax" : 77.0
                      }, {
                        "id" : "ENSE00001593673",
                        "chromosome" : "9",
                        "start" : 135944443,
                        "end" : 135944646,
                        "depthAvg" : 39.495098039215684,
                        "depthMin" : 24.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00001240014",
                        "chromosome" : "9",
                        "start" : 135945848,
                        "end" : 135946045,
                        "depthAvg" : 59.843434343434346,
                        "depthMin" : 20.0,
                        "depthMax" : 83.0
                      }, {
                        "id" : "ENSE00001456865",
                        "chromosome" : "9",
                        "start" : 135946374,
                        "end" : 135947248,
                        "depthAvg" : 7.410285714285714,
                        "depthMin" : 0.0,
                        "depthMax" : 27.0
                      } ]
                    }, {
                      "id" : "ENST00000351304",
                      "name" : "CEL-201",
                      "biotype" : "protein_coding",
                      "chromosome" : "9",
                      "start" : 135937365,
                      "end" : 135947248,
                      "length" : 2186,
                      "depths" : [ 87.96889295516927, 75.02287282708143, 66.42268984446477, 57.36505032021958, 51.23513266239708, 44.69350411710887, 42.086001829826166, 32.7996340347667, 21.7291857273559, 18.7099725526075, 8.325709057639525, 7.593778591033852 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "9",
                        "start" : 135937365,
                        "end" : 135937455,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939791,
                        "end" : 135939874,
                        "depthAvg" : 23.44047619047619,
                        "depthMin" : 18.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939876,
                        "end" : 135939878,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939889,
                        "end" : 135939892,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939895,
                        "end" : 135939897,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135939925,
                        "end" : 135939941,
                        "depthAvg" : 27.58823529411765,
                        "depthMin" : 23.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135942225,
                        "end" : 135942332,
                        "depthAvg" : 9.50925925925926,
                        "depthMin" : 6.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135942500,
                        "end" : 135942592,
                        "depthAvg" : 14.67741935483871,
                        "depthMin" : 4.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135944638,
                        "end" : 135944646,
                        "depthAvg" : 28.555555555555557,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "9",
                        "start" : 135946374,
                        "end" : 135947248,
                        "depthAvg" : 7.410285714285714,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001662100",
                        "chromosome" : "9",
                        "start" : 135937365,
                        "end" : 135937455,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0,
                        "depthMax" : 0.0
                      }, {
                        "id" : "ENSE00001136823",
                        "chromosome" : "9",
                        "start" : 135939791,
                        "end" : 135939941,
                        "depthAvg" : 26.52980132450331,
                        "depthMin" : 18.0,
                        "depthMax" : 33.0
                      }, {
                        "id" : "ENSE00001136821",
                        "chromosome" : "9",
                        "start" : 135940027,
                        "end" : 135940149,
                        "depthAvg" : 44.50406504065041,
                        "depthMin" : 35.0,
                        "depthMax" : 51.0
                      }, {
                        "id" : "ENSE00001136814",
                        "chromosome" : "9",
                        "start" : 135940427,
                        "end" : 135940624,
                        "depthAvg" : 173.96464646464648,
                        "depthMin" : 45.0,
                        "depthMax" : 257.0
                      }, {
                        "id" : "ENSE00001136809",
                        "chromosome" : "9",
                        "start" : 135941917,
                        "end" : 135942047,
                        "depthAvg" : 54.458015267175576,
                        "depthMin" : 35.0,
                        "depthMax" : 68.0
                      }, {
                        "id" : "ENSE00001136804",
                        "chromosome" : "9",
                        "start" : 135942225,
                        "end" : 135942332,
                        "depthAvg" : 9.50925925925926,
                        "depthMin" : 6.0,
                        "depthMax" : 13.0
                      }, {
                        "id" : "ENSE00001136798",
                        "chromosome" : "9",
                        "start" : 135942475,
                        "end" : 135942592,
                        "depthAvg" : 18.440677966101696,
                        "depthMin" : 4.0,
                        "depthMax" : 34.0
                      }, {
                        "id" : "ENSE00001679789",
                        "chromosome" : "9",
                        "start" : 135944059,
                        "end" : 135944245,
                        "depthAvg" : 65.75935828877006,
                        "depthMin" : 47.0,
                        "depthMax" : 77.0
                      }, {
                        "id" : "ENSE00001593673",
                        "chromosome" : "9",
                        "start" : 135944443,
                        "end" : 135944646,
                        "depthAvg" : 39.495098039215684,
                        "depthMin" : 24.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00001456865",
                        "chromosome" : "9",
                        "start" : 135946374,
                        "end" : 135947248,
                        "depthAvg" : 7.410285714285714,
                        "depthMin" : 0.0,
                        "depthMax" : 27.0
                      } ]
                    } ]
                  },
                  {
                    "sampleId" : "ISDBM322015",
                    "geneName" : "ADSL",
                    "stats" : [ {
                      "id" : "ENST00000216194",
                      "name" : "ADSL-001",
                      "biotype" : "protein_coding",
                      "chromosome" : "22",
                      "start" : 40742507,
                      "end" : 40763008,
                      "length" : 1993,
                      "depths" : [ 88.10837932764677, 77.27044656297039, 67.23532363271451, 66.4826894129453, 63.07074761665831, 59.85950827897641, 56.84897139989965, 45.60963371801304, 33.81836427496237, 29.75413948820873, 24.234821876567988, 11.138986452584044 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40742507,
                        "end" : 40742715,
                        "depthAvg" : 5.559808612440191,
                        "depthMin" : 2.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40745855,
                        "depthAvg" : 27.15,
                        "depthMin" : 25.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745873,
                        "end" : 40745876,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40746022,
                        "end" : 40746039,
                        "depthAvg" : 25.444444444444443,
                        "depthMin" : 21.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755026,
                        "end" : 40755029,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755031,
                        "end" : 40755039,
                        "depthAvg" : 28.333333333333332,
                        "depthMin" : 26.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762463,
                        "depthAvg" : 27.208333333333332,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762506,
                        "end" : 40763008,
                        "depthAvg" : 3.234592445328032,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001803419",
                        "chromosome" : "22",
                        "start" : 40742507,
                        "end" : 40742715,
                        "depthAvg" : 5.559808612440191,
                        "depthMin" : 2.0,
                        "depthMax" : 7.0
                      }, {
                        "id" : "ENSE00002140508",
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40746039,
                        "depthAvg" : 39.48039215686274,
                        "depthMin" : 21.0,
                        "depthMax" : 59.0
                      }, {
                        "id" : "ENSE00002160623",
                        "chromosome" : "22",
                        "start" : 40749077,
                        "end" : 40749121,
                        "depthAvg" : 34.977777777777774,
                        "depthMin" : 32.0,
                        "depthMax" : 37.0
                      }, {
                        "id" : "ENSE00003149424",
                        "chromosome" : "22",
                        "start" : 40750252,
                        "end" : 40750331,
                        "depthAvg" : 221.3,
                        "depthMin" : 178.0,
                        "depthMax" : 243.0
                      }, {
                        "id" : "ENSE00002187494",
                        "chromosome" : "22",
                        "start" : 40754868,
                        "end" : 40755039,
                        "depthAvg" : 56.151162790697676,
                        "depthMin" : 26.0,
                        "depthMax" : 82.0
                      }, {
                        "id" : "ENSE00003503675",
                        "chromosome" : "22",
                        "start" : 40755264,
                        "end" : 40755310,
                        "depthAvg" : 97.65957446808511,
                        "depthMin" : 86.0,
                        "depthMax" : 104.0
                      }, {
                        "id" : "ENSE00003459954",
                        "chromosome" : "22",
                        "start" : 40756406,
                        "end" : 40756496,
                        "depthAvg" : 43.26373626373626,
                        "depthMin" : 35.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00002197530",
                        "chromosome" : "22",
                        "start" : 40757277,
                        "end" : 40757346,
                        "depthAvg" : 112.98571428571428,
                        "depthMin" : 88.0,
                        "depthMax" : 136.0
                      }, {
                        "id" : "ENSE00000654864",
                        "chromosome" : "22",
                        "start" : 40757492,
                        "end" : 40757639,
                        "depthAvg" : 86.45270270270271,
                        "depthMin" : 37.0,
                        "depthMax" : 134.0
                      }, {
                        "id" : "ENSE00000654865",
                        "chromosome" : "22",
                        "start" : 40758985,
                        "end" : 40759075,
                        "depthAvg" : 61.76923076923077,
                        "depthMin" : 43.0,
                        "depthMax" : 75.0
                      }, {
                        "id" : "ENSE00000654866",
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0,
                        "depthMax" : 22.0
                      }, {
                        "id" : "ENSE00000654867",
                        "chromosome" : "22",
                        "start" : 40760884,
                        "end" : 40761060,
                        "depthAvg" : 84.15254237288136,
                        "depthMin" : 43.0,
                        "depthMax" : 105.0
                      }, {
                        "id" : "ENSE00001838342",
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40763008,
                        "depthAvg" : 6.483304042179262,
                        "depthMin" : 0.0,
                        "depthMax" : 37.0
                      } ]
                    }, {
                      "id" : "ENST00000466863",
                      "name" : "ADSL-003",
                      "biotype" : "retained_intron",
                      "chromosome" : "22",
                      "start" : 40742522,
                      "end" : 40746327,
                      "length" : 686,
                      "depths" : [ 97.667638483965, 61.80758017492711, 33.965014577259474, 31.195335276967928, 30.174927113702626, 28.425655976676385, 25.364431486880466, 15.160349854227405, 4.373177842565598, 0.0, 0.0, 0.0 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40742522,
                        "end" : 40742715,
                        "depthAvg" : 5.762886597938144,
                        "depthMin" : 4.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40745855,
                        "depthAvg" : 27.15,
                        "depthMin" : 25.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745873,
                        "end" : 40745876,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40746022,
                        "end" : 40746327,
                        "depthAvg" : 4.369281045751634,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00002726378",
                        "chromosome" : "22",
                        "start" : 40742522,
                        "end" : 40742715,
                        "depthAvg" : 5.762886597938144,
                        "depthMin" : 4.0,
                        "depthMax" : 7.0
                      }, {
                        "id" : "ENSE00001838642",
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40746327,
                        "depthAvg" : 18.15650406504065,
                        "depthMin" : 0.0,
                        "depthMax" : 59.0
                      } ]
                    }, {
                      "id" : "ENST00000454266",
                      "name" : "ADSL-201",
                      "biotype" : "protein_coding",
                      "chromosome" : "22",
                      "start" : 40742532,
                      "end" : 40762618,
                      "length" : 1620,
                      "depths" : [ 95.86419753086419, 91.85185185185185, 79.93827160493827, 79.01234567901234, 74.81481481481481, 70.86419753086419, 67.1604938271605, 56.111111111111114, 41.604938271604944, 36.60493827160494, 29.814814814814817, 13.703703703703704 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40742532,
                        "end" : 40742715,
                        "depthAvg" : 5.820652173913044,
                        "depthMin" : 4.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40745855,
                        "depthAvg" : 27.15,
                        "depthMin" : 25.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745873,
                        "end" : 40745876,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40746022,
                        "end" : 40746039,
                        "depthAvg" : 25.444444444444443,
                        "depthMin" : 21.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40749337,
                        "end" : 40749423,
                        "depthAvg" : 0.22988505747126436,
                        "depthMin" : 0.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755026,
                        "end" : 40755029,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755031,
                        "end" : 40755039,
                        "depthAvg" : 28.333333333333332,
                        "depthMin" : 26.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762463,
                        "depthAvg" : 27.208333333333332,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762506,
                        "end" : 40762618,
                        "depthAvg" : 12.451327433628318,
                        "depthMin" : 1.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001789077",
                        "chromosome" : "22",
                        "start" : 40742532,
                        "end" : 40742715,
                        "depthAvg" : 5.820652173913044,
                        "depthMin" : 4.0,
                        "depthMax" : 7.0
                      }, {
                        "id" : "ENSE00002140508",
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40746039,
                        "depthAvg" : 39.48039215686274,
                        "depthMin" : 21.0,
                        "depthMax" : 59.0
                      }, {
                        "id" : "ENSE00001632428",
                        "chromosome" : "22",
                        "start" : 40749337,
                        "end" : 40749423,
                        "depthAvg" : 0.22988505747126436,
                        "depthMin" : 0.0,
                        "depthMax" : 1.0
                      }, {
                        "id" : "ENSE00003149424",
                        "chromosome" : "22",
                        "start" : 40750252,
                        "end" : 40750331,
                        "depthAvg" : 221.3,
                        "depthMin" : 178.0,
                        "depthMax" : 243.0
                      }, {
                        "id" : "ENSE00002187494",
                        "chromosome" : "22",
                        "start" : 40754868,
                        "end" : 40755039,
                        "depthAvg" : 56.151162790697676,
                        "depthMin" : 26.0,
                        "depthMax" : 82.0
                      }, {
                        "id" : "ENSE00003503675",
                        "chromosome" : "22",
                        "start" : 40755264,
                        "end" : 40755310,
                        "depthAvg" : 97.65957446808511,
                        "depthMin" : 86.0,
                        "depthMax" : 104.0
                      }, {
                        "id" : "ENSE00003459954",
                        "chromosome" : "22",
                        "start" : 40756406,
                        "end" : 40756496,
                        "depthAvg" : 43.26373626373626,
                        "depthMin" : 35.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00002197530",
                        "chromosome" : "22",
                        "start" : 40757277,
                        "end" : 40757346,
                        "depthAvg" : 112.98571428571428,
                        "depthMin" : 88.0,
                        "depthMax" : 136.0
                      }, {
                        "id" : "ENSE00000654864",
                        "chromosome" : "22",
                        "start" : 40757492,
                        "end" : 40757639,
                        "depthAvg" : 86.45270270270271,
                        "depthMin" : 37.0,
                        "depthMax" : 134.0
                      }, {
                        "id" : "ENSE00000654865",
                        "chromosome" : "22",
                        "start" : 40758985,
                        "end" : 40759075,
                        "depthAvg" : 61.76923076923077,
                        "depthMin" : 43.0,
                        "depthMax" : 75.0
                      }, {
                        "id" : "ENSE00000654866",
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0,
                        "depthMax" : 22.0
                      }, {
                        "id" : "ENSE00000654867",
                        "chromosome" : "22",
                        "start" : 40760884,
                        "end" : 40761060,
                        "depthAvg" : 84.15254237288136,
                        "depthMin" : 43.0,
                        "depthMax" : 105.0
                      }, {
                        "id" : "ENSE00002255094",
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762618,
                        "depthAvg" : 19.379888268156424,
                        "depthMin" : 1.0,
                        "depthMax" : 37.0
                      } ]
                    }, {
                      "id" : "ENST00000342312",
                      "name" : "ADSL-002",
                      "biotype" : "protein_coding",
                      "chromosome" : "22",
                      "start" : 40742536,
                      "end" : 40763000,
                      "length" : 1779,
                      "depths" : [ 87.12759977515458, 75.99775154581225, 65.37380550871276, 64.53063518830804, 60.70826306913997, 57.11073636874649, 53.7380550871276, 41.14671163575042, 28.3867341202923, 24.45193929173693, 19.224283305227654, 11.973018549747048 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40742536,
                        "end" : 40742715,
                        "depthAvg" : 5.838888888888889,
                        "depthMin" : 4.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40745855,
                        "depthAvg" : 27.15,
                        "depthMin" : 25.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40745873,
                        "end" : 40745876,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40746022,
                        "end" : 40746039,
                        "depthAvg" : 25.444444444444443,
                        "depthMin" : 21.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755026,
                        "end" : 40755029,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755031,
                        "end" : 40755039,
                        "depthAvg" : 28.333333333333332,
                        "depthMin" : 26.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762463,
                        "depthAvg" : 27.208333333333332,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40762506,
                        "end" : 40763000,
                        "depthAvg" : 3.286868686868687,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001928680",
                        "chromosome" : "22",
                        "start" : 40742536,
                        "end" : 40742715,
                        "depthAvg" : 5.838888888888889,
                        "depthMin" : 4.0,
                        "depthMax" : 7.0
                      }, {
                        "id" : "ENSE00002140508",
                        "chromosome" : "22",
                        "start" : 40745836,
                        "end" : 40746039,
                        "depthAvg" : 39.48039215686274,
                        "depthMin" : 21.0,
                        "depthMax" : 59.0
                      }, {
                        "id" : "ENSE00002160623",
                        "chromosome" : "22",
                        "start" : 40749077,
                        "end" : 40749121,
                        "depthAvg" : 34.977777777777774,
                        "depthMin" : 32.0,
                        "depthMax" : 37.0
                      }, {
                        "id" : "ENSE00003149424",
                        "chromosome" : "22",
                        "start" : 40750252,
                        "end" : 40750331,
                        "depthAvg" : 221.3,
                        "depthMin" : 178.0,
                        "depthMax" : 243.0
                      }, {
                        "id" : "ENSE00002187494",
                        "chromosome" : "22",
                        "start" : 40754868,
                        "end" : 40755039,
                        "depthAvg" : 56.151162790697676,
                        "depthMin" : 26.0,
                        "depthMax" : 82.0
                      }, {
                        "id" : "ENSE00003503675",
                        "chromosome" : "22",
                        "start" : 40755264,
                        "end" : 40755310,
                        "depthAvg" : 97.65957446808511,
                        "depthMin" : 86.0,
                        "depthMax" : 104.0
                      }, {
                        "id" : "ENSE00003459954",
                        "chromosome" : "22",
                        "start" : 40756406,
                        "end" : 40756496,
                        "depthAvg" : 43.26373626373626,
                        "depthMin" : 35.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00002197530",
                        "chromosome" : "22",
                        "start" : 40757277,
                        "end" : 40757346,
                        "depthAvg" : 112.98571428571428,
                        "depthMin" : 88.0,
                        "depthMax" : 136.0
                      }, {
                        "id" : "ENSE00000654864",
                        "chromosome" : "22",
                        "start" : 40757492,
                        "end" : 40757639,
                        "depthAvg" : 86.45270270270271,
                        "depthMin" : 37.0,
                        "depthMax" : 134.0
                      }, {
                        "id" : "ENSE00000654865",
                        "chromosome" : "22",
                        "start" : 40758985,
                        "end" : 40759075,
                        "depthAvg" : 61.76923076923077,
                        "depthMin" : 43.0,
                        "depthMax" : 75.0
                      }, {
                        "id" : "ENSE00000654866",
                        "chromosome" : "22",
                        "start" : 40760280,
                        "end" : 40760369,
                        "depthAvg" : 18.666666666666668,
                        "depthMin" : 14.0,
                        "depthMax" : 22.0
                      }, {
                        "id" : "ENSE00001826622",
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40763000,
                        "depthAvg" : 6.575757575757576,
                        "depthMin" : 0.0,
                        "depthMax" : 37.0
                      } ]
                    }, {
                      "id" : "ENST00000477111",
                      "name" : "ADSL-005",
                      "biotype" : "retained_intron",
                      "chromosome" : "22",
                      "start" : 40745887,
                      "end" : 40755306,
                      "length" : 592,
                      "depths" : [ 100.0, 98.1418918918919, 88.68243243243244, 84.7972972972973, 77.53378378378379, 71.95945945945947, 68.58108108108108, 54.560810810810814, 34.29054054054054, 25.675675675675674, 19.08783783783784, 3.209459459459459 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40746022,
                        "end" : 40746039,
                        "depthAvg" : 25.444444444444443,
                        "depthMin" : 21.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755026,
                        "end" : 40755029,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755031,
                        "end" : 40755204,
                        "depthAvg" : 13.75287356321839,
                        "depthMin" : 4.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001834725",
                        "chromosome" : "22",
                        "start" : 40745887,
                        "end" : 40746039,
                        "depthAvg" : 42.59477124183007,
                        "depthMin" : 21.0,
                        "depthMax" : 59.0
                      }, {
                        "id" : "ENSE00001850340",
                        "chromosome" : "22",
                        "start" : 40754868,
                        "end" : 40755306,
                        "depthAvg" : 44.523917995444194,
                        "depthMin" : 4.0,
                        "depthMax" : 104.0
                      } ]
                    }, {
                      "id" : "ENST00000480775",
                      "name" : "ADSL-006",
                      "biotype" : "processed_transcript",
                      "chromosome" : "22",
                      "start" : 40754972,
                      "end" : 40757594,
                      "length" : 564,
                      "depths" : [ 100.0, 98.04964539007092, 91.48936170212765, 89.8936170212766, 89.00709219858156, 87.7659574468085, 84.75177304964538, 73.75886524822694, 54.78723404255319, 52.304964539007095, 48.40425531914894, 31.914893617021278 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40755026,
                        "end" : 40755029,
                        "depthAvg" : 30.0,
                        "depthMin" : 30.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40755031,
                        "end" : 40755039,
                        "depthAvg" : 28.333333333333332,
                        "depthMin" : 26.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40757092,
                        "end" : 40757169,
                        "depthAvg" : 11.487179487179487,
                        "depthMin" : 2.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001925305",
                        "chromosome" : "22",
                        "start" : 40754972,
                        "end" : 40755039,
                        "depthAvg" : 37.25,
                        "depthMin" : 26.0,
                        "depthMax" : 47.0
                      }, {
                        "id" : "ENSE00003676673",
                        "chromosome" : "22",
                        "start" : 40755264,
                        "end" : 40755310,
                        "depthAvg" : 97.65957446808511,
                        "depthMin" : 86.0,
                        "depthMax" : 104.0
                      }, {
                        "id" : "ENSE00003647656",
                        "chromosome" : "22",
                        "start" : 40756406,
                        "end" : 40756496,
                        "depthAvg" : 43.26373626373626,
                        "depthMin" : 35.0,
                        "depthMax" : 48.0
                      }, {
                        "id" : "ENSE00001919861",
                        "chromosome" : "22",
                        "start" : 40757092,
                        "end" : 40757346,
                        "depthAvg" : 71.17647058823529,
                        "depthMin" : 2.0,
                        "depthMax" : 138.0
                      }, {
                        "id" : "ENSE00001924350",
                        "chromosome" : "22",
                        "start" : 40757492,
                        "end" : 40757594,
                        "depthAvg" : 104.63106796116504,
                        "depthMin" : 58.0,
                        "depthMax" : 134.0
                      } ]
                    }, {
                      "id" : "ENST00000498234",
                      "name" : "ADSL-010",
                      "biotype" : "protein_coding",
                      "chromosome" : "22",
                      "start" : 40761043,
                      "end" : 40786467,
                      "length" : 315,
                      "depths" : [ 25.71428571428571, 25.71428571428571, 25.71428571428571, 25.71428571428571, 25.71428571428571, 25.07936507936508, 18.73015873015873, 5.714285714285714, 3.1746031746031744, 0.0, 0.0, 0.0 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762463,
                        "depthAvg" : 27.208333333333332,
                        "depthMin" : 24.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40786234,
                        "end" : 40786467,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001916199",
                        "chromosome" : "22",
                        "start" : 40761043,
                        "end" : 40761060,
                        "depthAvg" : 49.72222222222222,
                        "depthMin" : 43.0,
                        "depthMax" : 57.0
                      }, {
                        "id" : "ENSE00001691760",
                        "chromosome" : "22",
                        "start" : 40762440,
                        "end" : 40762502,
                        "depthAvg" : 31.253968253968253,
                        "depthMin" : 24.0,
                        "depthMax" : 37.0
                      }, {
                        "id" : "ENSE00001896352",
                        "chromosome" : "22",
                        "start" : 40786234,
                        "end" : 40786467,
                        "depthAvg" : 0.0,
                        "depthMin" : 0.0,
                        "depthMax" : 0.0
                      } ]
                    }, {
                      "id" : "ENST00000423176",
                      "name" : "ADSL-009",
                      "biotype" : "retained_intron",
                      "chromosome" : "22",
                      "start" : 40761329,
                      "end" : 40765371,
                      "length" : 3073,
                      "depths" : [ 17.83273673934266, 4.067686300032541, 3.0914415880247317, 2.8961926456231692, 2.668402212821347, 1.9850309144158802, 1.3342011064106736, 0.0, 0.0, 0.0, 0.0, 0.0 ],
                      "lowCoverageThreshold" : 30,
                      "lowCoverageRegionStats" : [ {
                        "chromosome" : "22",
                        "start" : 40761329,
                        "end" : 40762463,
                        "depthAvg" : 1.5277533039647577,
                        "depthMin" : 0.0
                      }, {
                        "chromosome" : "22",
                        "start" : 40763473,
                        "end" : 40765371,
                        "depthAvg" : 0.1416535018430753,
                        "depthMin" : 0.0
                      } ],
                      "exonStats" : [ {
                        "id" : "ENSE00001787493",
                        "chromosome" : "22",
                        "start" : 40761329,
                        "end" : 40762502,
                        "depthAvg" : 2.597955706984668,
                        "depthMin" : 0.0,
                        "depthMax" : 37.0
                      }, {
                        "id" : "ENSE00001695427",
                        "chromosome" : "22",
                        "start" : 40763473,
                        "end" : 40765371,
                        "depthAvg" : 0.1416535018430753,
                        "depthMin" : 0.0,
                        "depthMax" : 2.0
                      } ]
                    } ]
                  }
                ]
              }
            ]
          },
          "annotationSets" : [ {
            "id" : "opencga_sample_variant_stats",
            "name" : "opencga_sample_variant_stats",
            "variableSetId" : "opencga_sample_variant_stats",
            "annotations" : {
              "tiTvRatio" : 2.184589,
              "biotypeCount" : {
                "IG_V_pseudogene" : 471,
                "TR_J_pseudogene" : 8,
                "nonsense_mediated_decay" : 38790,
                "snRNA" : 1289,
                "IG_V_gene" : 536,
                "unitary_pseudogene" : 294,
                "TR_V_gene" : 261,
                "non_stop_decay" : 252,
                "processed_pseudogene" : 13581,
                "sense_overlapping" : 554,
                "lincRNA" : 10046,
                "misc_RNA" : 1455,
                "miRNA" : 3205,
                "IG_C_pseudogene" : 51,
                "IG_J_pseudogene" : 7,
                "protein_coding" : 117967,
                "rRNA" : 431,
                "TR_V_pseudogene" : 52,
                "IG_D_gene" : 72,
                "Mt_rRNA" : 10,
                "retained_intron" : 43383,
                "3prime_overlapping_ncrna" : 66,
                "Mt_tRNA" : 26,
                "snoRNA" : 1301,
                "transcribed_processed_pseudogene" : 785,
                "pseudogene" : 577,
                "transcribed_unprocessed_pseudogene" : 2866,
                "IG_J_gene" : 29,
                "IG_C_gene" : 137,
                "sense_intronic" : 795,
                "TR_C_gene" : 49,
                "unprocessed_pseudogene" : 5287,
                "translated_processed_pseudogene" : 1,
                "TR_J_gene" : 77,
                "processed_transcript" : 51934,
                "antisense" : 13692,
                "polymorphic_pseudogene" : 437
              },
              "genotypeCount" : {
                "0/1" : 56550,
                "1/1" : 115739,
                "1/2" : 324,
                "1/3" : 5
              },
              "chromosomeCount" : {
                "22" : 4095,
                "X" : 2377,
                "Y" : 437,
                "10" : 8451,
                "11" : 9511,
                "12" : 8233,
                "13" : 4339,
                "14" : 5891,
                "15" : 5804,
                "16" : 6749,
                "17" : 8074,
                "18" : 3711,
                "MT" : 26,
                "19" : 8629,
                "1" : 15814,
                "2" : 12636,
                "3" : 9349,
                "4" : 8176,
                "5" : 8052,
                "6" : 9712,
                "7" : 8812,
                "8" : 6821,
                "9" : 7318,
                "20" : 4502,
                "21" : 2657
              },
              "variantCount" : 172618,
              "consequenceTypeCount" : {
                "intergenic_variant" : 28802,
                "frameshift_variant" : 175,
                "3_prime_UTR_variant" : 7978,
                "2KB_downstream_variant" : 30855,
                "splice_acceptor_variant" : 95,
                "intron_variant" : 105346,
                "splice_region_variant" : 2905,
                "upstream_gene_variant" : 28712,
                "5_prime_UTR_variant" : 3311,
                "non_coding_transcript_exon_variant" : 27805,
                "stop_gained" : 114,
                "non_coding_transcript_variant" : 57030,
                "2KB_upstream_variant" : 27239,
                "start_lost" : 30,
                "splice_donor_variant" : 84,
                "NMD_transcript_variant" : 31871,
                "synonymous_variant" : 11338,
                "missense_variant" : 10527,
                "mature_miRNA_variant" : 6,
                "feature_truncation" : 1,
                "stop_lost" : 45,
                "regulatory_region_variant" : 142317,
                "downstream_gene_variant" : 32859,
                "stop_retained_variant" : 26,
                "TF_binding_site_variant" : 20588,
                "coding_sequence_variant" : 11,
                "inframe_deletion" : 87,
                "inframe_insertion" : 64,
                "incomplete_terminal_codon_variant" : 6
              },
              "indelLengthCount" : {
                "lt20" : 15,
                "lt10" : 63,
                "gte20" : 11,
                "lt5" : 7114,
                "lt15" : 17
              },
              "qualityStdDev" : 1507.8727,
              "mendelianErrorCount" : {
                "1" : 649
              },
              "heterozygosityRate" : 0.32950792,
              "id" : "ISDBM322015",
              "typeCount" : {
                "INSERTION" : 1,
                "SNV" : 165398,
                "DELETION" : 1,
                "INDEL" : 7218
              },
              "qualityAvg" : 805.0968,
              "filterCount" : {
                "PASS" : 153588.0
              }
            },
            "creationDate" : "20200526010932",
            "release" : 1,
            "attributes" : { }
          } ],
          "uuid" : "8b5d52d0-0170-0004-0001-f3d4e4de4fb0",
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103514",
          "description" : "",
          "somatic" : false,
          "phenotypes" : [ ],
          "individualId" : "ISDBM322015",
          "fileIds" : [ "data:quartet.variants.annotated.vcf.gz", "bam:SonsAlignedBamFile.bam" ],
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103514",
              "description" : ""
            }
          },
          "attributes" : {
            "OPENCGA_INDIVIDUAL" : {
              "uid" : 26301,
              "id" : "ISDBM322015",
              "studyUid" : 26294,
              "name" : "ISDBM322015",
              "uuid" : "8b5d4718-0170-0006-0001-da8ae467ea50",
              "father" : {
                "uid" : 26303,
                "studyUid" : 0,
                "release" : 0,
                "version" : 0,
                "parentalConsanguinity" : false
              },
              "mother" : {
                "uid" : 26304,
                "studyUid" : 0,
                "release" : 0,
                "version" : 0,
                "parentalConsanguinity" : false
              },
              "location" : { },
              "sex" : "MALE",
              "karyotypicSex" : "XY",
              "ethnicity" : "",
              "population" : {
                "name" : "",
                "subpopulation" : "",
                "description" : ""
              },
              "release" : 1,
              "version" : 1,
              "creationDate" : "20200228103511",
              "modificationDate" : "20200228103514",
              "lifeStatus" : "ALIVE",
              "phenotypes" : [ {
                "id" : "HP:0000519",
                "name" : "Developmental cataract",
                "source" : "HPO",
                "status" : "OBSERVED"
              }, {
                "id" : "HP:00005456",
                "name" : "Myopia",
                "source" : "HPO",
                "status" : "OBSERVED"
              } ],
              "disorders" : [ {
                "id" : "OMIM:611597",
                "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
                "source" : "OMIM"
              } ],
              "parentalConsanguinity" : false,
              "internal" : {
                "status" : {
                  "name" : "READY",
                  "date" : "20200228103511",
                  "description" : ""
                }
              },
              "attributes" : { }
            }
          }
        } ],
        "parentalConsanguinity" : false,
        "internal" : {
          "status" : {
            "name" : "READY",
            "date" : "20200228103511",
            "description" : ""
          }
        },
        "attributes" : { }
      },
      "family" : {
        "uid" : 0,
        "id" : "corpas",
        "studyUid" : 0,
        "annotationSets" : [ ],
        "name" : "Corpas",
        "uuid" : "8b5d56b8-0170-0007-0001-5ad13cc22fe8",
        "members" : [ {
          "uid" : 0,
          "id" : "ISDBM322015",
          "studyUid" : 0,
          "name" : "ISDBM322015",
          "uuid" : "8b5d4718-0170-0006-0001-da8ae467ea50",
          "father" : {
            "uid" : 0,
            "id" : "ISDBM322016",
            "studyUid" : 0,
            "uuid" : "8b5d4b00-0170-0006-0001-ff77edf90e20",
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "mother" : {
            "uid" : 0,
            "id" : "ISDBM322018",
            "studyUid" : 0,
            "uuid" : "8b5d4b00-0170-0006-0001-4ab540daf50c",
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "qualityControl": {
            "metrics": [
              {
                "sampleId": "ISDBM322015",
                "inferredSexReport": {
                  "method": "Ratio",
                  "inferredKaryotypicSex": "XY",
                  "values": {
                    "ratioX": 0.509,
                    "ratioY": 0.411
                  }
                },
                "relatednessReport": {
                  "method": "Plink/IBD",
                  "scores": [
                    {
                      "sampleId1": "ISDBM322015",
                      "sampleId2": "ISDBM322016",
                      "inferredRelationship": "FATHER",
                      "values": {
                        "IBD0": 1,
                        "IBD1": 0,
                        "IBD2": 0,
                        "PiHat": 0,
                      }
                    },
                    {
                      "sampleId1": "ISDBM322015",
                      "sampleId2": "ISDBM322018",
                      "inferredRelationship": "MOTHER",
                      "values": {
                        "IBD0": 0.1,
                        "IBD1": 0.9,
                        "IBD2": 0,
                        "PiHat": 0,
                      }
                    },
                    {
                      "sampleId1": "ISDBM322016",
                      "sampleId2": "ISDBM322018",
                      "inferredRelationship": "COUSIN",
                      "values": {
                        "IBD0": 0.98,
                        "IBD1": 0.02,
                        "IBD2": 0,
                        "PiHat": 0,
                      }
                    },
                    {
                      "sampleId1": "ISDBM322015",
                      "sampleId2": "ISDBM322017",
                      "inferredRelationship": "SISTER",
                      "values": {
                        "IBD0": 0.5,
                        "IBD1": 0.5,
                        "IBD2": 0,
                        "PiHat": 0,
                      }
                    }
                  ]
                },
                "mendelianErrorReport": {

                }
              }
            ]
          },
          "location" : { },
          "sex" : "MALE",
          "karyotypicSex" : "XY",
          "ethnicity" : "",
          "population" : {
            "name" : "",
            "subpopulation" : "",
            "description" : ""
          },
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103511",
          "modificationDate" : "20200228103514",
          "lifeStatus" : "ALIVE",
          "phenotypes" : [ {
            "id" : "HP:0000519",
            "name" : "Developmental cataract",
            "source" : "HPO",
            "status" : "OBSERVED"
          }, {
            "id" : "HP:00005456",
            "name" : "Myopia",
            "source" : "HPO",
            "status" : "OBSERVED"
          } ],
          "disorders" : [ {
            "id" : "OMIM:611597",
            "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
            "source" : "OMIM"
          } ],
          "samples" : [ {
            "uid" : 0,
            "id" : "ISDBM322015",
            "studyUid" : 0,
            "annotationSets" : [ {
              "id" : "opencga_sample_variant_stats",
              "name" : "opencga_sample_variant_stats",
              "variableSetId" : "opencga_sample_variant_stats",
              "annotations" : {
                "tiTvRatio" : 2.184589,
                "biotypeCount" : {
                  "IG_V_pseudogene" : 471,
                  "TR_J_pseudogene" : 8,
                  "nonsense_mediated_decay" : 38790,
                  "snRNA" : 1289,
                  "IG_V_gene" : 536,
                  "unitary_pseudogene" : 294,
                  "TR_V_gene" : 261,
                  "non_stop_decay" : 252,
                  "processed_pseudogene" : 13581,
                  "sense_overlapping" : 554,
                  "lincRNA" : 10046,
                  "misc_RNA" : 1455,
                  "miRNA" : 3205,
                  "IG_C_pseudogene" : 51,
                  "IG_J_pseudogene" : 7,
                  "protein_coding" : 117967,
                  "rRNA" : 431,
                  "TR_V_pseudogene" : 52,
                  "IG_D_gene" : 72,
                  "Mt_rRNA" : 10,
                  "retained_intron" : 43383,
                  "3prime_overlapping_ncrna" : 66,
                  "Mt_tRNA" : 26,
                  "snoRNA" : 1301,
                  "transcribed_processed_pseudogene" : 785,
                  "pseudogene" : 577,
                  "transcribed_unprocessed_pseudogene" : 2866,
                  "IG_J_gene" : 29,
                  "IG_C_gene" : 137,
                  "sense_intronic" : 795,
                  "TR_C_gene" : 49,
                  "unprocessed_pseudogene" : 5287,
                  "translated_processed_pseudogene" : 1,
                  "TR_J_gene" : 77,
                  "processed_transcript" : 51934,
                  "antisense" : 13692,
                  "polymorphic_pseudogene" : 437
                },
                "genotypeCount" : {
                  "0/1" : 56550,
                  "1/1" : 115739,
                  "1/2" : 324,
                  "1/3" : 5
                },
                "chromosomeCount" : {
                  "22" : 4095,
                  "X" : 2377,
                  "Y" : 437,
                  "10" : 8451,
                  "11" : 9511,
                  "12" : 8233,
                  "13" : 4339,
                  "14" : 5891,
                  "15" : 5804,
                  "16" : 6749,
                  "17" : 8074,
                  "18" : 3711,
                  "MT" : 26,
                  "19" : 8629,
                  "1" : 15814,
                  "2" : 12636,
                  "3" : 9349,
                  "4" : 8176,
                  "5" : 8052,
                  "6" : 9712,
                  "7" : 8812,
                  "8" : 6821,
                  "9" : 7318,
                  "20" : 4502,
                  "21" : 2657
                },
                "variantCount" : 172618,
                "consequenceTypeCount" : {
                  "intergenic_variant" : 28802,
                  "frameshift_variant" : 175,
                  "3_prime_UTR_variant" : 7978,
                  "2KB_downstream_variant" : 30855,
                  "splice_acceptor_variant" : 95,
                  "intron_variant" : 105346,
                  "splice_region_variant" : 2905,
                  "upstream_gene_variant" : 28712,
                  "5_prime_UTR_variant" : 3311,
                  "non_coding_transcript_exon_variant" : 27805,
                  "stop_gained" : 114,
                  "non_coding_transcript_variant" : 57030,
                  "2KB_upstream_variant" : 27239,
                  "start_lost" : 30,
                  "splice_donor_variant" : 84,
                  "NMD_transcript_variant" : 31871,
                  "synonymous_variant" : 11338,
                  "missense_variant" : 10527,
                  "mature_miRNA_variant" : 6,
                  "feature_truncation" : 1,
                  "stop_lost" : 45,
                  "regulatory_region_variant" : 142317,
                  "downstream_gene_variant" : 32859,
                  "stop_retained_variant" : 26,
                  "TF_binding_site_variant" : 20588,
                  "coding_sequence_variant" : 11,
                  "inframe_deletion" : 87,
                  "inframe_insertion" : 64,
                  "incomplete_terminal_codon_variant" : 6
                },
                "indelLengthCount" : {
                  "lt20" : 15,
                  "lt10" : 63,
                  "gte20" : 11,
                  "lt5" : 7114,
                  "lt15" : 17
                },
                "qualityStdDev" : 1507.8727,
                "mendelianErrorCount" : {
                  "1" : 649
                },
                "heterozygosityRate" : 0.32950792,
                "id" : "ISDBM322015",
                "typeCount" : {
                  "INSERTION" : 1,
                  "SNV" : 165398,
                  "DELETION" : 1,
                  "INDEL" : 7218
                },
                "qualityAvg" : 805.0968,
                "filterCount" : {
                  "PASS" : 153588.0
                }
              },
              "creationDate" : "20200526010932",
              "release" : 1,
              "attributes" : { }
            } ],
            "uuid" : "8b5d52d0-0170-0004-0001-f3d4e4de4fb0",
            "release" : 1,
            "version" : 1,
            "creationDate" : "20200228103514",
            "description" : "",
            "somatic" : false,
            "phenotypes" : [ ],
            "individualId" : "ISDBM322015",
            "fileIds" : [ "data:quartet.variants.annotated.vcf.gz", "bam:SonsAlignedBamFile.bam" ],
            "internal" : {
              "status" : {
                "name" : "READY",
                "date" : "20200228103514",
                "description" : ""
              }
            },
            "attributes" : {
              "OPENCGA_INDIVIDUAL" : {
                "uid" : 26301,
                "id" : "ISDBM322015",
                "studyUid" : 26294,
                "name" : "ISDBM322015",
                "uuid" : "8b5d4718-0170-0006-0001-da8ae467ea50",
                "father" : {
                  "uid" : 26303,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "mother" : {
                  "uid" : 26304,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "location" : { },
                "sex" : "MALE",
                "karyotypicSex" : "XY",
                "ethnicity" : "",
                "population" : {
                  "name" : "",
                  "subpopulation" : "",
                  "description" : ""
                },
                "release" : 1,
                "version" : 1,
                "creationDate" : "20200228103511",
                "modificationDate" : "20200228103514",
                "lifeStatus" : "ALIVE",
                "phenotypes" : [ {
                  "id" : "HP:0000519",
                  "name" : "Developmental cataract",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                }, {
                  "id" : "HP:00005456",
                  "name" : "Myopia",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                } ],
                "disorders" : [ {
                  "id" : "OMIM:611597",
                  "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
                  "source" : "OMIM"
                } ],
                "parentalConsanguinity" : false,
                "internal" : {
                  "status" : {
                    "name" : "READY",
                    "date" : "20200228103511",
                    "description" : ""
                  }
                },
                "attributes" : { }
              }
            }
          } ],
          "parentalConsanguinity" : false,
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103511",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322016",
          "studyUid" : 0,
          "name" : "ISDBM322016",
          "uuid" : "8b5d4b00-0170-0006-0001-ff77edf90e20",
          "father" : {
            "uid" : 0,
            "studyUid" : 0,
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "mother" : {
            "uid" : 0,
            "studyUid" : 0,
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "qualityControl": {
            "metrics": [
              {
                "sampleId": "ISDBM322016",
                "inferredSexReport": {
                  "method": "Ratio",
                  "inferredKaryotypicSex": "XY",
                  "values": {
                    "ratioX": 0.986,
                    "ratioY": 0.016
                  }
                },
                "relatednessReport": {

                },
                "mendelianErrorReport": {

                }
              }
            ]
          },
          "location" : { },
          "sex" : "MALE",
          "karyotypicSex" : "XY",
          "ethnicity" : "",
          "population" : {
            "name" : "",
            "subpopulation" : "",
            "description" : ""
          },
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103512",
          "modificationDate" : "20200228103514",
          "lifeStatus" : "ALIVE",
          "phenotypes" : [ {
            "id" : "HP:00005456",
            "name" : "Myopia",
            "source" : "HPO",
            "status" : "OBSERVED"
          }, {
            "id" : "HP:0000519",
            "name" : "Developmental cataract",
            "source" : "HPO",
            "status" : "OBSERVED"
          } ],
          "disorders" : [ {
            "id" : "OMIM:611597",
            "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
            "source" : "OMIM"
          } ],
          "samples" : [ {
            "uid" : 0,
            "id" : "ISDBM322016",
            "studyUid" : 0,
            "annotationSets" : [ {
              "id" : "opencga_sample_variant_stats",
              "name" : "opencga_sample_variant_stats",
              "variableSetId" : "opencga_sample_variant_stats",
              "annotations" : {
                "tiTvRatio" : 2.1805115,
                "biotypeCount" : {
                  "IG_V_pseudogene" : 368,
                  "TR_J_pseudogene" : 12,
                  "nonsense_mediated_decay" : 41359,
                  "snRNA" : 1390,
                  "IG_V_gene" : 425,
                  "unitary_pseudogene" : 333,
                  "TR_V_gene" : 292,
                  "non_stop_decay" : 268,
                  "processed_pseudogene" : 14505,
                  "sense_overlapping" : 533,
                  "lincRNA" : 7908,
                  "misc_RNA" : 1460,
                  "miRNA" : 3472,
                  "IG_C_pseudogene" : 55,
                  "IG_J_pseudogene" : 7,
                  "protein_coding" : 121825,
                  "rRNA" : 359,
                  "TR_V_pseudogene" : 73,
                  "IG_D_gene" : 50,
                  "Mt_rRNA" : 9,
                  "retained_intron" : 45662,
                  "3prime_overlapping_ncrna" : 74,
                  "Mt_tRNA" : 19,
                  "snoRNA" : 1499,
                  "transcribed_processed_pseudogene" : 829,
                  "pseudogene" : 589,
                  "transcribed_unprocessed_pseudogene" : 3622,
                  "IG_J_gene" : 32,
                  "IG_C_gene" : 134,
                  "sense_intronic" : 746,
                  "TR_C_gene" : 51,
                  "unprocessed_pseudogene" : 6161,
                  "translated_processed_pseudogene" : 2,
                  "TR_J_gene" : 91,
                  "processed_transcript" : 53915,
                  "antisense" : 13006,
                  "polymorphic_pseudogene" : 500
                },
                "genotypeCount" : {
                  "0/1" : 68279,
                  "1/1" : 96043,
                  "1/2" : 439,
                  "1/3" : 13
                },
                "chromosomeCount" : {
                  "GL000192" : {
                    "1" : 15
                  },
                  "GL000220" : {
                    "1" : 198
                  },
                  "GL000221" : {
                    "1" : 8
                  },
                  "GL000222" : {
                    "1" : 3
                  },
                  "GL000224" : {
                    "1" : 31
                  },
                  "GL000225" : {
                    "1" : 614
                  },
                  "GL000226" : {
                    "1" : 4
                  },
                  "GL000228" : {
                    "1" : 13
                  },
                  "GL000229" : {
                    "1" : 57
                  },
                  "10" : 7964,
                  "11" : 9405,
                  "12" : 8206,
                  "13" : 4375,
                  "14" : 5405,
                  "15" : 5617,
                  "16" : 5994,
                  "17" : 7697,
                  "18" : 3297,
                  "MT" : 19,
                  "19" : 7749,
                  "1" : 15188,
                  "2" : 12849,
                  "3" : 9321,
                  "4" : 7984,
                  "5" : 7635,
                  "6" : 9195,
                  "GL000211" : {
                    "1" : 155
                  },
                  "7" : 8511,
                  "8" : 6112,
                  "GL000212" : {
                    "1" : 179
                  },
                  "9" : 6994,
                  "GL000214" : {
                    "1" : 127
                  },
                  "GL000216" : {
                    "1" : 68
                  },
                  "GL000217" : {
                    "1" : 6
                  },
                  "20" : 3992,
                  "GL000218" : {
                    "1" : 43
                  },
                  "GL000219" : {
                    "1" : 167
                  },
                  "21" : 2428,
                  "GL000209" : {
                    "1" : 9
                  },
                  "22" : 3473,
                  "GL000240" : {
                    "1" : 7
                  },
                  "GL000241" : {
                    "1" : 123
                  },
                  "GL000243" : {
                    "1" : 2
                  },
                  "X" : 2469,
                  "Y" : 474,
                  "GL000204" : {
                    "1" : 1
                  },
                  "GL000205" : {
                    "1" : 69
                  },
                  "GL000208" : {
                    "1" : 9
                  },
                  "GL000193" : {
                    "1" : 73
                  },
                  "GL000194" : {
                    "1" : 26
                  },
                  "GL000195" : {
                    "1" : 118
                  },
                  "GL000230" : {
                    "1" : 36
                  },
                  "GL000198" : {
                    "1" : 25
                  },
                  "GL000231" : {
                    "1" : 41
                  },
                  "GL000199" : {
                    "1" : 32
                  },
                  "GL000232" : {
                    "1" : 24
                  },
                  "GL000233" : {
                    "1" : 4
                  },
                  "GL000234" : {
                    "1" : 65
                  },
                  "GL000235" : {
                    "1" : 26
                  },
                  "GL000237" : {
                    "1" : 42
                  },
                  "GL000238" : {
                    "1" : 1
                  }
                },
                "variantCount" : 164774,
                "consequenceTypeCount" : {
                  "intergenic_variant" : 18363,
                  "frameshift_variant" : 204,
                  "3_prime_UTR_variant" : 8790,
                  "2KB_downstream_variant" : 33688,
                  "splice_acceptor_variant" : 114,
                  "intron_variant" : 109614,
                  "splice_region_variant" : 2994,
                  "upstream_gene_variant" : 28677,
                  "5_prime_UTR_variant" : 3180,
                  "non_coding_transcript_exon_variant" : 29051,
                  "stop_gained" : 125,
                  "non_coding_transcript_variant" : 58392,
                  "2KB_upstream_variant" : 28504,
                  "start_lost" : 37,
                  "splice_donor_variant" : 97,
                  "NMD_transcript_variant" : 34561,
                  "synonymous_variant" : 11301,
                  "missense_variant" : 10912,
                  "mature_miRNA_variant" : 10,
                  "feature_truncation" : 1,
                  "stop_lost" : 52,
                  "regulatory_region_variant" : 135401,
                  "downstream_gene_variant" : 33394,
                  "stop_retained_variant" : 25,
                  "TF_binding_site_variant" : 16940,
                  "coding_sequence_variant" : 10,
                  "inframe_deletion" : 93,
                  "inframe_insertion" : 60,
                  "incomplete_terminal_codon_variant" : 4
                },
                "indelLengthCount" : {
                  "lt20" : 15,
                  "lt10" : 85,
                  "gte20" : 12,
                  "lt5" : 9542,
                  "lt15" : 16
                },
                "qualityStdDev" : 1527.1594,
                "heterozygosityRate" : 0.41712284,
                "id" : "ISDBM322016",
                "typeCount" : {
                  "INSERTION" : 1,
                  "SNV" : 155104,
                  "DELETION" : 1,
                  "INDEL" : 9668
                },
                "filterCount" : {
                  "PASS" : 143521,
                  "VQSRTrancheSNP99" : {
                    "00to99" : {
                      "90" : 13147
                    },
                    "90to100" : {
                      "00" : 7908
                    }
                  },
                  "GATKStandard" : 198
                },
                "qualityAvg" : 866.9453
              },
              "creationDate" : "20200526010933",
              "release" : 1,
              "attributes" : { }
            } ],
            "uuid" : "8b5d52d0-0170-0004-0001-ef4e00e6e7e0",
            "release" : 1,
            "version" : 1,
            "creationDate" : "20200228103514",
            "description" : "",
            "somatic" : false,
            "phenotypes" : [ ],
            "individualId" : "ISDBM322016",
            "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
            "internal" : {
              "status" : {
                "name" : "READY",
                "date" : "20200228103514",
                "description" : ""
              }
            },
            "attributes" : {
              "OPENCGA_INDIVIDUAL" : {
                "uid" : 26303,
                "id" : "ISDBM322016",
                "studyUid" : 26294,
                "name" : "ISDBM322016",
                "uuid" : "8b5d4b00-0170-0006-0001-ff77edf90e20",
                "father" : {
                  "uid" : 0,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "mother" : {
                  "uid" : 0,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "location" : { },
                "sex" : "MALE",
                "karyotypicSex" : "XY",
                "ethnicity" : "",
                "population" : {
                  "name" : "",
                  "subpopulation" : "",
                  "description" : ""
                },
                "release" : 1,
                "version" : 1,
                "creationDate" : "20200228103512",
                "modificationDate" : "20200228103514",
                "lifeStatus" : "ALIVE",
                "phenotypes" : [ {
                  "id" : "HP:00005456",
                  "name" : "Myopia",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                }, {
                  "id" : "HP:0000519",
                  "name" : "Developmental cataract",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                } ],
                "disorders" : [ {
                  "id" : "OMIM:611597",
                  "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
                  "source" : "OMIM"
                } ],
                "parentalConsanguinity" : false,
                "internal" : {
                  "status" : {
                    "name" : "READY",
                    "date" : "20200228103512",
                    "description" : ""
                  }
                },
                "attributes" : { }
              }
            }
          } ],
          "parentalConsanguinity" : false,
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103512",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322018",
          "studyUid" : 0,
          "name" : "ISDBM322018",
          "uuid" : "8b5d4b00-0170-0006-0001-4ab540daf50c",
          "father" : {
            "uid" : 0,
            "studyUid" : 0,
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "mother" : {
            "uid" : 0,
            "studyUid" : 0,
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "qualityControl": {
            "metrics": [
              {
                "sampleId": "ISDBM322018",
                "inferredSexReport": {
                  "method": "Ratio",
                  "inferredKaryotypicSex": "XY",
                  "values": {
                    "ratioX": 0.503,
                    "ratioY": 0.406
                  }
                },
                "relatednessReport": {

                },
                "mendelianErrorReport": {

                }
              }
            ]
          },
          "location" : { },
          "sex" : "FEMALE",
          "karyotypicSex" : "XX",
          "ethnicity" : "",
          "population" : {
            "name" : "",
            "subpopulation" : "",
            "description" : ""
          },
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103512",
          "modificationDate" : "20200228103515",
          "lifeStatus" : "ALIVE",
          "phenotypes" : [ {
            "id" : "HP:0002077",
            "name" : "Migraine with aura",
            "source" : "HPO",
            "status" : "OBSERVED"
          }, {
            "id" : "HP:0000958",
            "name" : "Dry skin",
            "source" : "HPO",
            "status" : "OBSERVED"
          } ],
          "disorders" : [ {
            "id" : "OMIM:300125",
            "name" : "Migraine, Familial Typical, Susceptibility To, 2",
            "source" : "OMIM"
          } ],
          "samples" : [ {
            "uid" : 0,
            "id" : "ISDBM322018",
            "studyUid" : 0,
            "annotationSets" : [ {
              "id" : "opencga_sample_variant_stats",
              "name" : "opencga_sample_variant_stats",
              "variableSetId" : "opencga_sample_variant_stats",
              "annotations" : {
                "tiTvRatio" : 2.1839352,
                "biotypeCount" : {
                  "IG_V_pseudogene" : 520,
                  "TR_J_pseudogene" : 15,
                  "nonsense_mediated_decay" : 41589,
                  "snRNA" : 1442,
                  "IG_V_gene" : 550,
                  "unitary_pseudogene" : 343,
                  "TR_V_gene" : 252,
                  "non_stop_decay" : 251,
                  "processed_pseudogene" : 14729,
                  "sense_overlapping" : 501,
                  "lincRNA" : 8254,
                  "misc_RNA" : 1506,
                  "miRNA" : 3423,
                  "IG_C_pseudogene" : 36,
                  "IG_J_pseudogene" : 5,
                  "protein_coding" : 122136,
                  "rRNA" : 373,
                  "TR_V_pseudogene" : 61,
                  "IG_D_gene" : 46,
                  "Mt_rRNA" : 10,
                  "retained_intron" : 45521,
                  "3prime_overlapping_ncrna" : 59,
                  "Mt_tRNA" : 27,
                  "snoRNA" : 1457,
                  "transcribed_processed_pseudogene" : 808,
                  "pseudogene" : 594,
                  "transcribed_unprocessed_pseudogene" : 3503,
                  "IG_J_gene" : 24,
                  "IG_C_gene" : 125,
                  "sense_intronic" : 751,
                  "TR_C_gene" : 51,
                  "unprocessed_pseudogene" : 6182,
                  "translated_processed_pseudogene" : 1,
                  "TR_J_gene" : 87,
                  "processed_transcript" : 53544,
                  "antisense" : 13214,
                  "polymorphic_pseudogene" : 383
                },
                "genotypeCount" : {
                  "0/1" : 68794,
                  "1/1" : 98882,
                  "1/2" : 416,
                  "1/3" : 4
                },
                "chromosomeCount" : {
                  "GL000192" : {
                    "1" : 21
                  },
                  "GL000220" : {
                    "1" : 234
                  },
                  "GL000221" : {
                    "1" : 11
                  },
                  "GL000222" : {
                    "1" : 5
                  },
                  "GL000224" : {
                    "1" : 36
                  },
                  "GL000225" : {
                    "1" : 594
                  },
                  "GL000228" : {
                    "1" : 18
                  },
                  "GL000229" : {
                    "1" : 65
                  },
                  "10" : 7911,
                  "11" : 9334,
                  "12" : 8316,
                  "13" : 4498,
                  "14" : 5703,
                  "15" : 5520,
                  "16" : 5839,
                  "17" : 7611,
                  "18" : 3455,
                  "MT" : 27,
                  "19" : 7781,
                  "1" : 15544,
                  "2" : 12775,
                  "3" : 9540,
                  "4" : 8391,
                  "5" : 7781,
                  "6" : 9896,
                  "GL000211" : {
                    "1" : 139
                  },
                  "7" : 8688,
                  "8" : 6570,
                  "GL000212" : {
                    "1" : 176
                  },
                  "9" : 6798,
                  "GL000214" : {
                    "1" : 121
                  },
                  "GL000216" : {
                    "1" : 74
                  },
                  "GL000217" : {
                    "1" : 8
                  },
                  "20" : 3742,
                  "GL000218" : {
                    "1" : 41
                  },
                  "GL000219" : {
                    "1" : 199
                  },
                  "21" : 2520,
                  "GL000209" : {
                    "1" : 48
                  },
                  "22" : 3482,
                  "GL000240" : {
                    "1" : 6
                  },
                  "GL000241" : {
                    "1" : 112
                  },
                  "X" : 3413,
                  "Y" : 421,
                  "GL000203" : {
                    "1" : 3
                  },
                  "GL000205" : {
                    "1" : 75
                  },
                  "GL000208" : {
                    "1" : 1
                  },
                  "GL000193" : {
                    "1" : 75
                  },
                  "GL000194" : {
                    "1" : 25
                  },
                  "GL000195" : {
                    "1" : 132
                  },
                  "GL000230" : {
                    "1" : 37
                  },
                  "GL000198" : {
                    "1" : 52
                  },
                  "GL000231" : {
                    "1" : 34
                  },
                  "GL000199" : {
                    "1" : 25
                  },
                  "GL000232" : {
                    "1" : 39
                  },
                  "GL000233" : {
                    "1" : 6
                  },
                  "GL000234" : {
                    "1" : 67
                  },
                  "GL000235" : {
                    "1" : 33
                  },
                  "GL000237" : {
                    "1" : 28
                  }
                },
                "variantCount" : 168096,
                "consequenceTypeCount" : {
                  "intergenic_variant" : 20593,
                  "frameshift_variant" : 193,
                  "3_prime_UTR_variant" : 8828,
                  "2KB_downstream_variant" : 33185,
                  "splice_acceptor_variant" : 113,
                  "intron_variant" : 110483,
                  "splice_region_variant" : 2972,
                  "upstream_gene_variant" : 28514,
                  "5_prime_UTR_variant" : 3146,
                  "non_coding_transcript_exon_variant" : 28902,
                  "stop_gained" : 121,
                  "non_coding_transcript_variant" : 59048,
                  "2KB_upstream_variant" : 28136,
                  "start_lost" : 28,
                  "splice_donor_variant" : 109,
                  "NMD_transcript_variant" : 34903,
                  "synonymous_variant" : 11209,
                  "missense_variant" : 10705,
                  "mature_miRNA_variant" : 9,
                  "stop_lost" : 50,
                  "regulatory_region_variant" : 135881,
                  "downstream_gene_variant" : 33035,
                  "stop_retained_variant" : 22,
                  "TF_binding_site_variant" : 16627,
                  "coding_sequence_variant" : 11,
                  "inframe_deletion" : 82,
                  "inframe_insertion" : 61,
                  "incomplete_terminal_codon_variant" : 4
                },
                "indelLengthCount" : {
                  "lt20" : 13,
                  "lt10" : 80,
                  "gte20" : 9,
                  "lt5" : 9380,
                  "lt15" : 19
                },
                "qualityStdDev" : 1516.3003,
                "heterozygosityRate" : 0.41175282,
                "id" : "ISDBM322018",
                "typeCount" : {
                  "SNV" : 158595,
                  "INDEL" : 9501
                },
                "filterCount" : {
                  "PASS" : 146904,
                  "VQSRTrancheSNP99" : {
                    "00to99" : {
                      "90" : 13218
                    },
                    "90to100" : {
                      "00" : 7793
                    }
                  },
                  "GATKStandard" : 181
                },
                "qualityAvg" : 849.3339
              },
              "creationDate" : "20200526010932",
              "release" : 1,
              "attributes" : { }
            } ],
            "uuid" : "8b5d56b8-0170-0004-0001-476e3880c260",
            "release" : 1,
            "version" : 1,
            "creationDate" : "20200228103515",
            "description" : "",
            "somatic" : false,
            "phenotypes" : [ ],
            "individualId" : "ISDBM322018",
            "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
            "internal" : {
              "status" : {
                "name" : "READY",
                "date" : "20200228103515",
                "description" : ""
              }
            },
            "attributes" : {
              "OPENCGA_INDIVIDUAL" : {
                "uid" : 26304,
                "id" : "ISDBM322018",
                "studyUid" : 26294,
                "name" : "ISDBM322018",
                "uuid" : "8b5d4b00-0170-0006-0001-4ab540daf50c",
                "father" : {
                  "uid" : 0,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "mother" : {
                  "uid" : 0,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "location" : { },
                "sex" : "FEMALE",
                "karyotypicSex" : "XX",
                "ethnicity" : "",
                "population" : {
                  "name" : "",
                  "subpopulation" : "",
                  "description" : ""
                },
                "release" : 1,
                "version" : 1,
                "creationDate" : "20200228103512",
                "modificationDate" : "20200228103515",
                "lifeStatus" : "ALIVE",
                "phenotypes" : [ {
                  "id" : "HP:0002077",
                  "name" : "Migraine with aura",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                }, {
                  "id" : "HP:0000958",
                  "name" : "Dry skin",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                } ],
                "disorders" : [ {
                  "id" : "OMIM:300125",
                  "name" : "Migraine, Familial Typical, Susceptibility To, 2",
                  "source" : "OMIM"
                } ],
                "parentalConsanguinity" : false,
                "internal" : {
                  "status" : {
                    "name" : "READY",
                    "date" : "20200228103512",
                    "description" : ""
                  }
                },
                "attributes" : { }
              }
            }
          } ],
          "parentalConsanguinity" : false,
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103512",
              "description" : ""
            }
          },
          "attributes" : { }
        }, {
          "uid" : 0,
          "id" : "ISDBM322017",
          "studyUid" : 0,
          "name" : "ISDBM322017",
          "uuid" : "8b5d4b00-0170-0006-0001-30c5b0f8eee0",
          "father" : {
            "uid" : 0,
            "id" : "ISDBM322016",
            "studyUid" : 0,
            "uuid" : "8b5d4b00-0170-0006-0001-ff77edf90e20",
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "mother" : {
            "uid" : 0,
            "id" : "ISDBM322018",
            "studyUid" : 0,
            "uuid" : "8b5d4b00-0170-0006-0001-4ab540daf50c",
            "release" : 0,
            "version" : 0,
            "parentalConsanguinity" : false
          },
          "qualityControl": {
            "metrics": [
              {
                "sampleId": "ISDBM322017",
                "inferredSexReport": {
                  "method": "Ratio",
                  "inferredKaryotypicSex": "XY",
                  "values": {
                    "ratioX": 0.509,
                    "ratioY": 0.411
                  }
                },
                "relatednessReport": {

                },
                "mendelianErrorReport": {

                }
              }
            ]
          },
          "location" : { },
          "sex" : "FEMALE",
          "karyotypicSex" : "XX",
          "ethnicity" : "",
          "population" : {
            "name" : "",
            "subpopulation" : "",
            "description" : ""
          },
          "release" : 1,
          "version" : 1,
          "creationDate" : "20200228103512",
          "modificationDate" : "20200228103515",
          "lifeStatus" : "ALIVE",
          "phenotypes" : [ {
            "id" : "HP:00005456",
            "name" : "Myopia",
            "source" : "HPO",
            "status" : "OBSERVED"
          }, {
            "id" : "HP:0002077",
            "name" : "Migraine with aura",
            "source" : "HPO",
            "status" : "OBSERVED"
          } ],
          "disorders" : [ {
            "id" : "OMIM:300125",
            "name" : "Migraine, Familial Typical, Susceptibility To, 2",
            "source" : "OMIM"
          } ],
          "samples" : [ {
            "uid" : 0,
            "id" : "ISDBM322017",
            "studyUid" : 0,
            "annotationSets" : [ {
              "id" : "opencga_sample_variant_stats",
              "name" : "opencga_sample_variant_stats",
              "variableSetId" : "opencga_sample_variant_stats",
              "annotations" : {
                "tiTvRatio" : 2.2441642,
                "biotypeCount" : {
                  "IG_V_pseudogene" : 462,
                  "TR_J_pseudogene" : 14,
                  "nonsense_mediated_decay" : 39275,
                  "snRNA" : 1327,
                  "IG_V_gene" : 573,
                  "unitary_pseudogene" : 335,
                  "TR_V_gene" : 239,
                  "non_stop_decay" : 243,
                  "processed_pseudogene" : 14029,
                  "sense_overlapping" : 465,
                  "lincRNA" : 5913,
                  "misc_RNA" : 1360,
                  "miRNA" : 3190,
                  "IG_C_pseudogene" : 57,
                  "IG_J_pseudogene" : 6,
                  "protein_coding" : 113304,
                  "rRNA" : 301,
                  "TR_V_pseudogene" : 61,
                  "IG_D_gene" : 46,
                  "Mt_rRNA" : 6,
                  "retained_intron" : 44078,
                  "3prime_overlapping_ncrna" : 75,
                  "Mt_tRNA" : 16,
                  "snoRNA" : 1428,
                  "transcribed_processed_pseudogene" : 733,
                  "pseudogene" : 559,
                  "transcribed_unprocessed_pseudogene" : 3491,
                  "IG_J_gene" : 31,
                  "IG_C_gene" : 108,
                  "sense_intronic" : 708,
                  "TR_C_gene" : 53,
                  "unprocessed_pseudogene" : 6011,
                  "translated_processed_pseudogene" : 2,
                  "TR_J_gene" : 89,
                  "processed_transcript" : 50147,
                  "antisense" : 11993,
                  "polymorphic_pseudogene" : 458
                },
                "genotypeCount" : {
                  "0/1" : 69055,
                  "1/1" : 74875,
                  "1/2" : 455,
                  "1/3" : 8
                },
                "chromosomeCount" : {
                  "GL000192" : {
                    "1" : 20
                  },
                  "GL000220" : {
                    "1" : 150
                  },
                  "GL000221" : {
                    "1" : 9
                  },
                  "GL000222" : {
                    "1" : 6
                  },
                  "GL000224" : {
                    "1" : 16
                  },
                  "GL000225" : {
                    "1" : 551
                  },
                  "GL000228" : {
                    "1" : 20
                  },
                  "GL000229" : {
                    "1" : 55
                  },
                  "10" : 6551,
                  "11" : 8046,
                  "12" : 7081,
                  "13" : 3546,
                  "14" : 4941,
                  "15" : 4972,
                  "16" : 5288,
                  "17" : 7076,
                  "18" : 2808,
                  "MT" : 16,
                  "19" : 7437,
                  "1" : 13461,
                  "2" : 10725,
                  "3" : 8020,
                  "4" : 6495,
                  "5" : 6515,
                  "6" : 8590,
                  "GL000211" : {
                    "1" : 149
                  },
                  "7" : 7532,
                  "8" : 5268,
                  "GL000212" : {
                    "1" : 173
                  },
                  "9" : 5920,
                  "GL000214" : {
                    "1" : 100
                  },
                  "GL000216" : {
                    "1" : 42
                  },
                  "GL000217" : {
                    "1" : 6
                  },
                  "20" : 3427,
                  "GL000218" : {
                    "1" : 38
                  },
                  "GL000219" : {
                    "1" : 143
                  },
                  "21" : 2047,
                  "GL000209" : {
                    "1" : 8
                  },
                  "22" : 3320,
                  "GL000240" : {
                    "1" : 8
                  },
                  "GL000241" : {
                    "1" : 110
                  },
                  "X" : 2904,
                  "Y" : 337,
                  "GL000205" : {
                    "1" : 60
                  },
                  "GL000208" : {
                    "1" : 2
                  },
                  "GL000193" : {
                    "1" : 65
                  },
                  "GL000194" : {
                    "1" : 28
                  },
                  "GL000195" : {
                    "1" : 93
                  },
                  "GL000230" : {
                    "1" : 32
                  },
                  "GL000198" : {
                    "1" : 20
                  },
                  "GL000231" : {
                    "1" : 33
                  },
                  "GL000199" : {
                    "1" : 8
                  },
                  "GL000232" : {
                    "1" : 12
                  },
                  "GL000234" : {
                    "1" : 53
                  },
                  "GL000235" : {
                    "1" : 23
                  },
                  "GL000237" : {
                    "1" : 36
                  },
                  "GL000238" : {
                    "1" : 1
                  }
                },
                "variantCount" : 144393,
                "consequenceTypeCount" : {
                  "intergenic_variant" : 9634,
                  "frameshift_variant" : 210,
                  "3_prime_UTR_variant" : 8732,
                  "2KB_downstream_variant" : 32628,
                  "splice_acceptor_variant" : 112,
                  "intron_variant" : 99644,
                  "splice_region_variant" : 3005,
                  "upstream_gene_variant" : 26944,
                  "5_prime_UTR_variant" : 3199,
                  "non_coding_transcript_exon_variant" : 29267,
                  "stop_gained" : 129,
                  "non_coding_transcript_variant" : 52583,
                  "2KB_upstream_variant" : 27216,
                  "start_lost" : 27,
                  "splice_donor_variant" : 108,
                  "NMD_transcript_variant" : 32800,
                  "synonymous_variant" : 11420,
                  "missense_variant" : 11072,
                  "mature_miRNA_variant" : 7,
                  "feature_truncation" : 1,
                  "stop_lost" : 48,
                  "regulatory_region_variant" : 122240,
                  "downstream_gene_variant" : 31546,
                  "stop_retained_variant" : 21,
                  "TF_binding_site_variant" : 15159,
                  "coding_sequence_variant" : 10,
                  "inframe_deletion" : 89,
                  "inframe_insertion" : 65,
                  "incomplete_terminal_codon_variant" : 4
                },
                "indelLengthCount" : {
                  "lt20" : 14,
                  "lt10" : 84,
                  "gte20" : 9,
                  "lt5" : 9738,
                  "lt15" : 19
                },
                "qualityStdDev" : 1603.3947,
                "mendelianErrorCount" : {
                  "1" : 836
                },
                "heterozygosityRate" : 0.48144993,
                "id" : "ISDBM322017",
                "typeCount" : {
                  "INSERTION" : 1,
                  "SNV" : 134529,
                  "DELETION" : 1,
                  "INDEL" : 9862
                },
                "filterCount" : {
                  "PASS" : 124203,
                  "VQSRTrancheSNP99" : {
                    "00to99" : {
                      "90" : 12429
                    },
                    "90to100" : {
                      "00" : 7574
                    }
                  },
                  "GATKStandard" : 187
                },
                "qualityAvg" : 1017.8097
              },
              "creationDate" : "20200526010933",
              "release" : 1,
              "attributes" : { }
            } ],
            "uuid" : "8b5d56b8-0170-0004-0001-f6ba6272e528",
            "release" : 1,
            "version" : 1,
            "creationDate" : "20200228103515",
            "description" : "",
            "somatic" : false,
            "phenotypes" : [ ],
            "individualId" : "ISDBM322017",
            "fileIds" : [ "data:quartet.variants.annotated.vcf.gz" ],
            "internal" : {
              "status" : {
                "name" : "READY",
                "date" : "20200228103515",
                "description" : ""
              }
            },
            "attributes" : {
              "OPENCGA_INDIVIDUAL" : {
                "uid" : 26302,
                "id" : "ISDBM322017",
                "studyUid" : 26294,
                "name" : "ISDBM322017",
                "uuid" : "8b5d4b00-0170-0006-0001-30c5b0f8eee0",
                "father" : {
                  "uid" : 26303,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "mother" : {
                  "uid" : 26304,
                  "studyUid" : 0,
                  "release" : 0,
                  "version" : 0,
                  "parentalConsanguinity" : false
                },
                "location" : { },
                "sex" : "FEMALE",
                "karyotypicSex" : "XX",
                "ethnicity" : "",
                "population" : {
                  "name" : "",
                  "subpopulation" : "",
                  "description" : ""
                },
                "release" : 1,
                "version" : 1,
                "creationDate" : "20200228103512",
                "modificationDate" : "20200228103515",
                "lifeStatus" : "ALIVE",
                "phenotypes" : [ {
                  "id" : "HP:00005456",
                  "name" : "Myopia",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                }, {
                  "id" : "HP:0002077",
                  "name" : "Migraine with aura",
                  "source" : "HPO",
                  "status" : "OBSERVED"
                } ],
                "disorders" : [ {
                  "id" : "OMIM:300125",
                  "name" : "Migraine, Familial Typical, Susceptibility To, 2",
                  "source" : "OMIM"
                } ],
                "parentalConsanguinity" : false,
                "internal" : {
                  "status" : {
                    "name" : "READY",
                    "date" : "20200228103512",
                    "description" : ""
                  }
                },
                "attributes" : { }
              }
            }
          } ],
          "parentalConsanguinity" : false,
          "internal" : {
            "status" : {
              "name" : "READY",
              "date" : "20200228103512",
              "description" : ""
            }
          },
          "attributes" : { }
        } ],
        "phenotypes" : [ {
          "id" : "HP:00005456",
          "name" : "Myopia",
          "source" : "HPO",
          "ageOfOnset" : "-1",
          "status" : "UNKNOWN"
        }, {
          "id" : "HP:0002077",
          "name" : "Migraine with aura",
          "source" : "HPO",
          "ageOfOnset" : "-1",
          "status" : "UNKNOWN"
        }, {
          "id" : "HP:0000519",
          "name" : "Developmental cataract",
          "source" : "HPO",
          "ageOfOnset" : "-1",
          "status" : "UNKNOWN"
        }, {
          "id" : "HP:0000958",
          "name" : "Dry skin",
          "source" : "HPO",
          "ageOfOnset" : "-1",
          "status" : "UNKNOWN"
        } ],
        "disorders" : [ {
          "id" : "OMIM:611597",
          "name" : "Cataract, Autosomal Dominant, Multiple Types 1",
          "source" : "OMIM"
        }, {
          "id" : "OMIM:300125",
          "name" : "Migraine, Familial Typical, Susceptibility To, 2",
          "source" : "OMIM"
        } ],
        "creationDate" : "20200228103515",
        "expectedSize" : 0,
        "description" : "",
        "release" : 1,
        "version" : 1,
        "internal" : {
          "status" : {
            "name" : "READY",
            "date" : "20200228103515",
            "description" : ""
          }
        },
        "attributes" : { }
      },
      "roleToProband" : {
        "ISDBM322015" : "PROBAND",
        "ISDBM322016" : "FATHER",
        "ISDBM322017" : "SISTER",
        "ISDBM322018" : "MOTHER"
      },
      "qualityControl" : {
        "quality" : "UNKNOWN",
        "variant" : {
          "stats" : [ ],
          "files" : [ ]
        },
        "alignment" : {
          "stats" : [ ],
          "geneCoverageStats" : [ ],
          "files" : [ ]
        },
        "analyst" : {
          "name" : "",
          "email" : "",
          "company" : ""
        },
        "comments" : [ ],
        "date" : "20200526010933"
      },
      "secondaryInterpretations" : [ ],
      "consent" : {
        "primaryFindings" : "UNKNOWN",
        "secondaryFindings" : "UNKNOWN",
        "carrierFindings" : "UNKNOWN",
        "researchFindings" : "UNKNOWN"
      },
      "analyst" : {
        "assignee" : "",
        "assignedBy" : "",
        "date" : "20200526010932"
      },
      "priority" : "MEDIUM",
      "flags" : [ ],
      "creationDate" : "20200526010933",
      "dueDate" : "20200526020923",
      "release" : 1,
      "internal" : {
        "status" : {
          "name" : "READY_FOR_INTERPRETATION",
          "date" : "20200526010932",
          "description" : ""
        }
      },
      "attributes" : { },
      "status" : {
        "name" : "",
        "description" : "",
        "date" : ""
      }
    } ],
    "resultType" : "",
    "numTotalResults" : 1,
    "numMatches" : 1,
    "numInserted" : 0,
    "numUpdated" : 0,
    "numDeleted" : 0,
    "attributes" : { }
  }
];
