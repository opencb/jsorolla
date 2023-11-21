export default class Study {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data) {
        return this._post("studies", null, "acl", members, "update", data, action);
    }

    create(data, params) {
        return this._post("studies", null, null, null, "create", data, params);
    }

    search(project, params) {
        return this._get("studies", null, null, null, "search", {project, ...params});
    }

    acl(studies, params) {
        return this._get("studies", studies, null, null, "acl", params);
    }

    aggregationStats(studies, params) {
        return this._get("studies", studies, null, null, "aggregationStats", params);
    }

    info(studies, params) {
        return this._get("studies", studies, null, null, "info", params);
    }

    searchAudit(study, params) {
        return this._get("studies", study, "audit", null, "search", params);
    }

    groups(study, params) {
        return this._get("studies", study, null, null, "groups", params);
    }

    updateGroups(study, data, params) {
        return this._post("studies", study, "groups", null, "update", data, params);
    }

    updateGroupsUsers(study, group, data, params) {
        return this._post("studies", study, "groups", group, "users/update", data, params);
    }

    permissionRules(study, entity) {
        return this._get("studies", study, null, null, "permissionRules", entity);
    }

    updatePermissionRules(study, entity, data, params) {
        return this._post("studies", study, "permissionRules", null, "update", data, {entity, ...params});
    }

    runTemplates(study, data, params) {
        return this._post("studies", study, "templates", null, "run", data, params);
    }

    uploadTemplates(study, params) {
        return this._post("studies", study, "templates", null, "upload", params);
    }

    deleteTemplates(study, templateId) {
        return this._delete("studies", study, "templates", templateId, "delete");
    }

    update(study, data, params) {
        return this._post("studies", study, null, null, "update", data, params);
    }

    variableSets(study, params) {
        return this._get("studies", study, null, null, "variableSets", params);
    }

    updateVariableSets(study, data, params) {
        return this._post("studies", study, "variableSets", null, "update", data, params);
    }

    updateVariableSetsVariables(study, variableSet, data, params) {
        return this._post("studies", study, "variableSets", variableSet, "variables/update", data, params);
    }

}
