// import UtilsNew from "../../../core/utils-new";

const GENOME_BROWSER_TRACKS_EXAMPLE = [
    {
        type: "gene-overview",
        overview: true,
        config: {},
    },
    {
        type: "sequence",
        config: {},
    },
    {
        type: "gene",
        config: {},
    },
    // {
    //     type: "opencga-variant",
    //     config: {
    //         title: "Variants",
    //         query: {
    //             sample: this.clinicalAnalysis.proband.samples.map(s => s.id).join(","),
    //         },
    //     },
    // },
    // ...(this.clinicalAnalysis.proband?.samples || []).map(sample => ({
    //     type: "opencga-alignment",
    //     config: {
    //         title: `Alignments - ${sample.id}`,
    //         sample: sample.id,
    //     },
    // })),
];
