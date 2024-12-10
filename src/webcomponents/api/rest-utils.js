// ********************************************************************
// 0. Functions for checking if the param is: enum | primitive | object
// ********************************************************************
import UtilsNew from "../../core/utils-new.js";
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";

export default {

    getParameterType(parameter) {
        if (this.isPrimitiveOrEnum(parameter)) {
            return "primitive_enum";
        }
        if (this.isObjectOrList(parameter)) {
            return "object-list";
        }
        if (this.isListString(parameter)) {
            return "list-string";
        }
    },

    getComponentType(parameter) {
        const filterParams = ["include", "exclude", "skip", "version", "limit", "release", "count", "attributes"];
        return filterParams.includes(parameter.name) ? "filter" : parameter.param;
    },

    isPrimitiveOrEnum(parameter) {
        return !parameter.complex || parameter.type === "enum";
    },

    isObjectOrList(parameter) {
        return parameter.complex && UtilsNew.isNotEmptyArray(parameter?.data);
    },

    isListString(parameter) {
        return parameter.complex && (parameter.type === "List") && (typeof parameter["data"] === "undefined");
    },

    isNotEndPointAdmin(endpoint) {
        return !endpoint.path.includes("/admin/");
    },

    isAdministrator(opencgaSession) {
        return opencgaSession?.user?.id?.toUpperCase() === "OPENCGA" || CatalogUtils.isOrganizationAdmin(opencgaSession?.organization, opencgaSession?.user?.id);
    },

    sortArray(elements) {
        const _elements = elements;
        _elements.sort((a, b) => {
            const _nameA = a.title.toLowerCase();
            const _nameB = b.title.toLowerCase();

            // If both have the same required value, sort in alphabetical order
            if (a.required === b.required) {
                if (_nameA < _nameB) {
                    return -1;
                }

                if (_nameA > _nameB) {
                    return 1;
                }
            }

            if (a.required) {
                return -1;
            } else {
                return 1;
            }
        });

        return _elements;
    },

    mapParamToDataformType(param) {
        // NOTE 20230620 It is important to check first the name of the param, and if not found, the type.
        //  The type the following params in Opencga in "string" but the dataform type needs to be different.
        // Type not support by the moment: Format, BioFormat, List, software, Map, ResourceType, Resource, Query, QueryOptions
        const mapSpecial = {
            "input-password": ["password", "newPassword"],
            "input-date": ["creationDate", "modificationDate", "dateOfBirth", "date"],
        };
        const map = {
            "input-text": ["string", "integer", "int"],
            "checkbox": ["boolean"],
            "select": ["enum"],
            "object-list": ["list"],
        };

        if (this.isObjectOrList(param) && param.type !== "List") {
            return "object";
        } else {
            return Object.keys(mapSpecial).find(key => mapSpecial[key].includes(param.name)) ||
                Object.keys(map).find(key => map[key].includes(param.type?.toLowerCase()));
        }
    }

};

