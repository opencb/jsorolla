/*
 * Copyright 2015-present OpenCB
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

import UtilsNew from "../../../core/utils-new.js";

export default class WebUtils {

    static getDisplayName(item) {
        if (item?.id && item?.name) {
            // First case: both item.id and item.name exists and are not empty
            return `${item.name} (${item.id})`;
        } else if (item?.id) {
            // Second case: only item.id exists
            return item.id;
        } else if (item?.name) {
            // Thids case: only item.name exists
            return item.name;
        } else {
            // Fallback: neither item.id and item.name exists or item is empty
            return "-";
        }
    }

    static mergeSettingsAndBrowserConfig(settings, config, COMPONENT_ID, opencgaSession) {
        // Apply Study settings
        if (settings?.menu) {
            config.filter = WebUtils.mergeFiltersAndDetails(config?.filter, settings);
        }

        // BROWSER: Admin browser configuration merged with internal default configuration.
        if (settings?.table) {
            WebUtils.mergeTableSettings(config, settings, "CATALOG", COMPONENT_ID, opencgaSession);
        }

        // Apply User grid configuration. Only 'pageSize' and 'columns' are set
        UtilsNew.setObjectValue(config, "filter.result.grid", {
            ...config.filter?.result?.grid,
            ...opencgaSession.user?.configs?.IVA?.settings?.[COMPONENT_ID]?.grid
        });

        return config;
    }

    /**
     * It merges external filter list with internal one.
     * It handles:
     *  - filters components
     *  - canned filters
     *  - detail tabs
     *
     * @param {Array} internal Filter object
     * @param {Array} external Simplified filter object
     * @returns {Object} hydrated array
     */
    static mergeFiltersAndDetails(internal, external) {
        // console.log("internal, external", internal, external);
        let sections = internal.sections;
        let examples = internal.examples;
        const detail = internal.detail;

        if (external?.menu?.sections?.length) {
            sections = WebUtils.mergeSections(sections, external.menu.sections);
        }
        // merge canned filters
        if (external?.menu?.examples?.length) {
            examples = WebUtils.mergeExampleFilters(internal.examples, external.menu.examples);
        }

        // merge detail tab
        // it doesn't check for external.details.length and external.hiddenDetails.length because it supports empty array
        if (detail?.items) {
            if (external?.details || external?.hiddenDetails) {
                detail.items = WebUtils.mergeArray(internal.detail.items, external.details || external.hiddenDetails, !!external.hiddenDetails);
            }
        }
        return {...internal, sections, examples, detail};
    }

    static mergeTableSettings(internal, external, type, id, opencgaSession) {
        let defaultSettings = {};
        let defaultSettingsName = "";
        switch (type) {
            case "CATALOG":
                defaultSettingsName = id.replace(/-/g, "_").toUpperCase();
                defaultSettings = opencgaSession.ivaDefaultSettings
                    .settings[defaultSettingsName]
                    .table;
                break;
            case "INTERPRETER":
                defaultSettingsName = id.replace("variant-interpreter-", "").replace(/-/g, "_").toUpperCase();
                defaultSettings = opencgaSession.ivaDefaultSettings
                    .settings.VARIANT_INTERPRETER_SETTINGS.tools
                    .find(tool => tool.id === "variant-browser")
                    .browsers[defaultSettingsName]
                    .table;
                break;
        }
        // 1. Read settings from keys in browser.settings.js, BROWSER dependent.
        // const allowedSettingsKeys = Object
        //     .keys(CATALOG_SETTINGS[browserId].table);
        const allowedSettingsKeys = Object
            .keys(defaultSettings);

        // 2. Find out allowed settings for the specific browser
        const allowedExternalSettings = {};
        Object.entries(external.table)
            .forEach(([key, value]) => {
                if (allowedSettingsKeys.includes(key)) {
                    allowedExternalSettings[key] = UtilsNew.objectClone(value);
                }
            });

        // 3. From admin settings, merge allowed settings
        UtilsNew.setObjectValue(internal, "filter.result.grid", {
            ...internal.filter.result.grid,
            ...allowedExternalSettings,
        });
    }

    /**
     * Filters internal array items using external array.
     * It either uses external array as list to add or remove items from the resulting array.
     *
     * @param {Array} internal list of objects with IDs.
     * @param {Array} external can be either a plain array of string or an array of object with IDs
     * @param {Boolean} subtractive set true if the external array represents the fields to hide
     * @param {Boolean} externalObject set true if the external list is a list of objects and you want to merge internal and external items together.
     * @returns {Array} resulting array
     */
    static mergeArray(internal, external, subtractive = false, externalObject = false) {

        if (external) {
            if (!subtractive) {
                const results = [];
                external.forEach(c => {
                    const field = internal.find(f => {
                        if (typeof c === "object") {
                            if (!f.id || !c.id) {
                                console.error("fields must have an id to be merged. Check internal and external configuration", f, c);
                            }
                            return f.id === c.id;
                        } else if (typeof c === "string") {
                            return f.id === c;
                        } else {
                            console.error("array format unexpected");
                        }
                    });
                    if (field) {
                        if (externalObject) {
                            results.push({...c, ...field});
                        } else {
                            results.push(field);
                        }
                    } else {
                        // console.error("Field not found", c);
                    }
                });
                return results;
            } else {

                // in case of subtractive settings we only support `external` as plain array of string IDs
                return internal.filter(f => {
                    if (!f.id) {
                        console.error("fields must have an id to be merged", f);
                    }
                    return !~external.indexOf(f.id);
                });
            }
        } else {
            return internal;
        }
    }

    /**
     * It merges external filter list with internal one. The resulting section organisation is defined in `external`.
     *
     * @param {Array} internal Sections list containing `filters` as object
     * @param {Array} external Sections list containing `filters` as list of Ids
     * @returns {Array} hydrated array
     */
    static mergeSections(internal, external) {
        if (external) {
            // flattening the whole list of filters
            const allFilters = internal.flatMap(section => section.filters);
            const sections = external.map(section => {
                // hydrates all the fields of each external section from the pool of filters.
                const filters = WebUtils.mergeConfigById(allFilters, section.filters);
                return {...section, filters: filters};
            });
            return sections;
        }
    }

    /**
     * Hydrates `external` array with `internal` data.
     * `external` is a plain list of IDs.
     *
     * @param {Array} internal Array of objects
     * @param {Array} external Mixed array of IDs or objects (with id property)
     * @param {Boolean} subtractive set true if the external array lists the fields to hide
     * @returns {Array} hydrated array
     */
    static mergeConfigById(internal, external, subtractive = false) {
        // it doesn't check for external.length because it supports empty array
        if (external) {
            if (!subtractive) {
                const section = external.map(o => {
                    const id = typeof o === "object" ? o.id : o; // support both string ID or object
                    const obj = internal.find(e => id === e.id);
                    if (!obj) {
                        console.warn(`Config Merge failed. '${id}' field not found in internal config`);
                        return null;
                    } else {
                        return typeof o === "object" ? {...o, ...obj} : {...obj};
                    }
                });
                return section.filter(s => !!s);
            } else {
                return internal.filter(f => {
                    return !~external.indexOf(f.id);
                });
            }
        }
        console.warn("External config not available. Using default config");
        return internal;
    }

    /**
     * It merges objects with the same Ids overwriting internal fields with the external ones.
     * For the rest of object (present EITHER in internal or external arrays) it acts like an outer join.
     * Useful for merging canned filters.
     *
     * @param {Array} internal 1D or 2D array
     * @param {Array} external plain array of strings.
     * @returns {Array} filtered array.
     */
    static mergeExampleFilters(internal, external) {
        if (external?.length) {
            // convert both arrays in map
            const results = [];
            const internalMap = Object.assign({}, ...internal.map(el => ({[el.id]: el})));
            const externalMap = Object.assign({}, ...external.map(el => ({[el.id]: el})));
            for (const [k, v] of Object.entries({...internalMap, ...externalMap})) {
                // element is present in both array or just in external
                if (externalMap[k]) {
                    results.push({...v, ...externalMap[k]});
                } else {
                    // only present in internal
                    results.push(v);
                }
            }
            return results;
        } else {
            return internal;
        }
    }

    /**
     * It filters internal data-form config object with the fields defined in `external` array. Sections are fixed.
     * NOTE very similar logic as mergeFilters() (although here `external` is an array of strings)
     * NOTE this is being used in variant-interpreter-qc-overview for merging settings and internal config despite the fact we don't use data-form.
     *
     * @param {Object} internal data-form config object
     * @param {Array} external plain array of fields to show.
     * @returns {Object} filtered array.
     */
    static mergeDataFormConfig(internal, external) {
        if (external?.length) {
            const sections = internal.sections.map(section => {
                const fields = [];
                for (const ex of external) {
                    const internalField = section.elements.find(c => {
                        if (!c.id) {
                            console.error("Column fields must have an id to be merged", c);
                        }
                        return c.id === ex;
                    });
                    if (internalField) {
                        fields.push({...internalField});
                    } else {
                        // console.warn(`Field "${ex}" not found merging user settings`);
                    }
                }
                return {...section, elements: fields};
            });
            return {...internal, sections};
        }
        return internal;
    }

}
