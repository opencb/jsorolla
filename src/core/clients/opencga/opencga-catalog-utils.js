/*
 * Copyright 2015-2016 OpenCB
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

import UtilsNew from "../../utils-new.js";

export default class OpencgaCatalogUtils {

    static getUsers(study) {
        const users = study?.groups
            .find(group => group.id === "@members")
            .userIds.filter(user => user !== "*");
        return UtilsNew.sort(users);
    }

    static getUserIds(study, groups = ["@members"]) {
        const groupsList = !Array.isArray(groups) ? [groups] : groups;
        return study?.groups
            .filter(g => groupsList.includes(g))
            .map(g => g.userIds)
            .filter(user => user !== "*");
    }

    static getProjectOwner(project) {
        return project ? project.fqn.split("@")[0] : null;
    }

    // Return a unique list of owners
    static getProjectOwners(projects) {
        return projects ? [...new Set(projects.map(project => project.fqn.split("@")[0]))] : null;
    }

    _checkParam(param, defaultValue) {
        if (!param) {
            return defaultValue;
        }
    }

    static checkUserAccountView(user, loggedUser) {
        return loggedUser === "opencga" || loggedUser === user;
    }

    // Check if the user has the right the permissions in the study.
    static checkPermissions(study, userId, permissions, simplifyPermissions = false) {

        let [operation, ...resource] = permissions.split("_");
        resource = resource.join("_");

        // VALIDATION
        if (!study || !userId || !permissions || !resource) {
            console.error(`No valid parameters, study: ${study}, user: ${userId}, permissions: ${permissions}, catalogEntity: ${resource}`);
            return false;
        }
        const permissionLevel = {};
        permissionLevel[`VIEW_${resource}`] = 1;
        permissionLevel[`WRITE_${resource}`] = 2;
        permissionLevel[`DELETE_${resource}`] = 3;

        const getPermissionLevel = permissionList => {
            const levels = permissionList
                .map(p => permissionLevel[p])
                .filter(p => typeof p === "number");
            return levels.length > 0 ? Math.max(...levels) : 0;
        };

        const getEffectivePermission = (userPermission, groupPermissions) => {
            // It is possible to simplify permissions.
            if (!simplifyPermissions) {
                // First, find permission level at user level
                return getPermissionLevel(userPermission) ||
                // Second, check permission level at groups level. No hierarchy defined here. Example:
                // If a user belongs to two groups:
                //  - groupA - Has permission VIEW_SAMPLES
                //  - groupB - Has permission WRITE_SAMPLES
                // The dominant permission will be the highest, i.e. WRITE_SAMPLES
                Math.max(0, ...groupPermissions.map(g => getPermissionLevel(g)));
            } else {
                // If "simplifyPermissions = true" permissions become more flexible.
                // As long as the user has the necessary permission at the user or group level it'll be able to perform the action.
                // I.e., there's no hierarchy where user-level permissions override group-level ones
                groupPermissions.push(userPermission);
                return Math.max(0, ...groupPermissions.map(g => getPermissionLevel(g)));
            }
        };

        // ALGORITHM
        // 1. If userId is the installation admin grant permission
        if (userId === "opencga") {
            return true;
        }
        // 2. If userId is a Study admin, belongs to @admins group. Grant permission
        const admins = study.groups.find(group => group.id === "@admins");
        if (admins.userIds.includes(userId)) {
            return true;
        }
        // 3. Permissions for member
        const userPermissionsStudy = study?.acl
            ?.find(acl => acl.member === userId)
            ?.permissions || [];

        // 4. Permissions for groups where the member belongs to
        const aclUserIds = study.groups
            .filter(group => group.userIds.includes(userId))
            .map(group => group.id);
        aclUserIds.push(userId);

        const groupPermissions = aclUserIds.map(aclId => study?.acl
            ?.find(acl => acl.member === userId)?.groups
            ?.find(group => group.id === aclId)?.permissions || []);

        // If the effective permission retrieved is greater or equal than the permission level requested, grant permission.
        // If not, deny permission
        return getEffectivePermission(userPermissionsStudy, groupPermissions) >= permissionLevel[permissions];
    }

    // Check if the user has the right the permissions in the study.
    static isAdmin(study, userLogged) {
        if (!study || !userLogged) {
            console.error(`No valid parameters, study: ${study}, user: ${userLogged}`);
            return false;
        }
        const admins = study.groups.find(group => group.id === "@admins");
        return !!admins.userIds.includes(userLogged);
    }

    // Check if the provided user is admin in the organization
    static isOrganizationAdmin(organization, userId) {
        if (!organization || !userId) {
            return false;
        }
        // 1. Check if user is the organization admin
        if (organization?.owner === userId) {
            return true;
        } else {
            // Check if user is an admin of the organization
            if (organization?.admins?.includes?.(userId)) {
                return true;
            }
        }
        // Other case, user is not admin of the organization
        return false;
    }

    // Find study object in opencgaSession
    static getStudyInSession(opencgaSession, studyId) {
        let study = {};
        for (const p of opencgaSession?.projects) {
            for (const s of p.studies) {
                if (s.id === studyId || s.fqn === studyId) {
                    study = s;
                    break;
                }
            }
        }
        return study;
    }

    // Update grid configuration of the specified browser
    static updateGridConfig(id = "IVA", opencgaSession, toolId, gridConfig) {
        const userGridSettings = {
            settings: {
                ...opencgaSession.user.configs?.[id]?.settings,
                [toolId]: {
                    ...opencgaSession.user.configs?.[id][toolId],
                    grid: gridConfig,
                },
            }
        };
        const newGridConfig = {
            ...opencgaSession.user.configs?.[id],
            ...userGridSettings
        };

        return opencgaSession.opencgaClient.updateUserConfig(id, newGridConfig)
            .then(response => {
                // Update user configuration in opencgaSession object
                // eslint-disable-next-line no-param-reassign
                opencgaSession.user.configs.IVA = response.responses[0].results[0];
            }).
            catch(error => {
                console.error(error);
            });
    }

    /** Prepares the study tool settings params that will be updated. If no settings are provided,
     * it will restore its default settings.
     * @param {object} opencgaSession   Session
     * @param {object} study            Study
     * @param {string} toolName         Tool name
     * @param {object} settings         OPTIONAL: if no settings, the default settings will be stored
     * @returns {Object}                Tool settings to be updated
     */
    static getNewToolIVASettings(opencgaSession, study, toolName, settings) {

        // 1. Retrieve other study attributes to avoid overwriting
        const otherAttributes = UtilsNew.objectCloneExclude(
            study.attributes,
            [
                // eslint-disable-next-line no-undef
                `${SETTINGS_NAME}_BACKUP`,
                // eslint-disable-next-line no-undef
                SETTINGS_NAME
            ]
        );
        // 2. The params that will be updated
        return {
            attributes: {
                // 1. Other attributes that the study might have
                ...otherAttributes,
                // 2. BACKUP previous settings
                // eslint-disable-next-line no-undef
                [SETTINGS_NAME + "_BACKUP"]:
                // eslint-disable-next-line no-undef
                    UtilsNew.objectClone(study.attributes[SETTINGS_NAME]),
                // 3. New tool settings
                // eslint-disable-next-line no-undef
                [SETTINGS_NAME]: {
                    userId: opencgaSession.user.id,
                    version: opencgaSession.ivaDefaultSettings.version.split("-")[0],
                    date: UtilsNew.getDatetime(), // Update date
                    settings: {
                        ...(
                            // If settings param exists, save settings. If not, save defaultSettings
                            UtilsNew.objectCloneReplace(
                                // eslint-disable-next-line no-undef
                                study.attributes[SETTINGS_NAME].settings,
                                `${[toolName]}`,
                                settings ?? opencgaSession.ivaDefaultSettings)
                        )
                    },
                },
            },
        };
    }

    /** Gets study IVA DEFAULT settings
     * @param {object} opencgaSession   Session
     * @param {object} study            Study
     * @param {string} type             Type of restore, default or backup
     * @returns {object}                Study attributes with default IVA settings
     */
    static getRestoreIVASettings(opencgaSession, study, type) {
        const getSettings = () => {
            switch (type) {
                case "default":
                    return UtilsNew.objectClone(opencgaSession.ivaDefaultSettings.settings);
                case "backup":
                    return UtilsNew.objectClone(study.attributes[SETTINGS_NAME + "_BACKUP"].settings);
            }
        };
        return {
            attributes: {
                ...study.attributes,
                // eslint-disable-next-line no-undef
                [SETTINGS_NAME]: {
                    userId: opencgaSession.user.id,
                    version: opencgaSession.ivaDefaultSettings.version.split("-")[0],
                    date: UtilsNew.getDatetime(),
                    settings: getSettings(),
                },
            }
        };
    }

}
