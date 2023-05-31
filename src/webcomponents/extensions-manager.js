import {html} from "lit";

export default {
    TYPES: {
        DETAIL_TAB: "detail_tab",
        TOOL: "tool",
        COLUMN: "column",
    },

    // Allows to get a list with all extensions of the specified type
    // @param {string} type - the extension type (e.g. "tool")
    // @return {array} extensions - an array with the extesions of the specified type
    getByType(type) {
        return (window?.IVA_EXTENSIONS?.extensions || []).filter(extension => extension.type === type);
    },

    // Gets a list of detail tabs generated from the extensions for the specified component
    // @param {string} toolId - ID of the tool where the new detail tabs will be injected
    // @return {array} tabs - a list of detail tabs configuration
    getDetailTabs(toolId) {
        return this.getByType(this.TYPES.DETAIL_TAB)
            .filter(extension => (extension.tools || []).includes(toolId))
            .map(extension => ({
                id: extension.id,
                name: extension.name,
                active: false,
                render: (data, active, opencgaSession) => {
                    return extension.render(html, data, active, opencgaSession);
                },
            }));
    },

    // Gets a list of custom tools
    // @return {array} tools - list of tools configurations
    getTools() {
        return this.getByType(this.TYPES.TOOL)
            .map(extension => ({
                id: extension.id,
                name: extension.name,
                render: opencgaSession => {
                    return extension.render(html, opencgaSession);
                },
            }));
    },

    // Returns a list of custom columns for the specified component
    // @param {string} componentId - ID of the component whenre this new column will be injected
    // @return {array} columns - a list of columns configurations
    // getColumns(componentId) {
    //     return this.getByType(this.TYPES.COLUMN)
    //         .filter(extension => (extension.components || []).includes(componentId))
    //         .map(extension => ({
    //             id: extension.id,
    //             title: extension.columnTitle ?? extension.name ?? "",
    //             field: extension.columnField ?? "",
    //             rowspan: extension.columnRowspan ?? 1,
    //             colspan: extension.columnColspan ?? 1,
    //             halign: extension.columnHalign ?? "center",
    //             // visible: extension.columnVisible ?? true,
    //             formatter: (value, row, index) => {
    //                 return extension.columnFormatter?.(value, row, index) || "-";
    //             },
    //         }));
    // },

    injectColumns(columns, componentId) {
        this.getByType(this.TYPES.COLUMN)
            .filter(extension => (extension.components || []).includes(componentId))
            .forEach(extension => {
                (extension.columns || []).forEach((newColumns, level) => {
                    [newColumns].flat().forEach(newColumn => {
                        columns[level].splice(newColumn["_injectPosition"] ?? columns[level].length, 0, newColumn);
                    });
                });
            });

        return columns;
    }
};
