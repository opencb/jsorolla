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
                    return extension.render({
                        html: html,
                        opencgaSession: opencgaSession,
                        tabData: data,
                        tabActive: active,
                    });
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
                    return extension.render({
                        html: html,
                        opencgaSession: opencgaSession,
                    });
                },
            }));
    },

    // Returns a list of custom columns for the specified component
    // @param {array} columns - An array of columns where new columns will be injected
    // @param {string} componentId - ID of the component where this new column will be injected
    // @return {array} columns - a list of columns configurations
    injectColumns(columns, componentId) {
        // We need to check if we are in a single or multiple row levels
        const isMultipleLevel = columns.length === 2 && (Array.isArray(columns[0]) && Array.isArray(columns[1]));
        this.getByType(this.TYPES.COLUMN)
            .filter(extension => (extension.components || []).includes(componentId))
            .forEach(extension => {
                (extension.columns || []).forEach((newColumns, levelIndex) => {
                    [newColumns].flat().forEach(newColumn => {
                        const level = isMultipleLevel ? columns[levelIndex] : columns;
                        const position = newColumn.position ?? level.length;
                        level.splice(position, 0, newColumn.config);
                    });
                });
            });

        return columns;
    }
};
