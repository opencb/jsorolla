// Global constants for GenomeBrowser
export default class GenomeBrowserConstants {

    // CellBase constants
    static CELLBASE_HOST = "https://ws.zettagenomics.com/cellbase";
    static CELLBASE_VERSION = "v5";

    // OpenCGA Constants
    static OPENCGA_HOST = "https://ws.opencb.org/opencga-test";
    static OPENCGA_VERSION = "v2";

    // Cytobands
    static CYTOBANDS_COLORS = {
        gneg: "white",
        stalk: "#666666",
        gvar: "#CCCCCC",
        gpos25: "silver",
        gpos33: "lightgrey",
        gpos50: "gray",
        gpos66: "dimgray",
        gpos75: "darkgray",
        gpos100: "black",
        gpos: "gray",
        acen: "blue",
    };

    // Sequence colors
    static SEQUENCE_COLORS = {
        A: "#009900",
        C: "#0000FF",
        G: "#857A00",
        T: "#aa0000",
        N: "#555555",
    };

}
