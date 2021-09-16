const opencgaFamilyViewSettings = {
    // merge criterium: uses this array as filter for internal 1D array. Same as settings.table.columns in `clinical-review-cases.settings`.
    /**
     * works either with:
     * - `fields` an explicit list of ids. In this case each field in DataForm needs an id.
     * - `hiddenFields` a list of fields to exclude
     */
    // GEL settings
    hiddenFields: ["pedigree", "creationDate", "description"]
};
