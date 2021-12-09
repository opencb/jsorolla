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

import UtilsNew from "../../utilsNew.js";

export default class OpencgaCatalogUtils {

    static getUsers(study) {
        const _users = study?.groups
            .find(group => group.id === "@members")
            .userIds.filter(user => user !== "*");
        return UtilsNew.sort(_users);
    }

    static getUserIds(study, groups = ["@members"]) {
        if (!Array.isArray(groups)) {
            groups = [groups];
        }

        return study?.groups
            .filter(g => groups.includes(g))
            .map(g => g.userIds)
            .filter(user => user !== "*");
    }

    static getProjectOwner(project) {
        if (!project) {
            return null;
        }
        return project.fqn.split('@')[0];
    }

    /**
     * Return an unique list of owners
     * @param projects
     * @returns {string|any[]}
     */
    static getProjectOwners(projects) {
        if (!projects) {
            return null;
        }
        return [...new Set(projects?.map(project => project.fqn.split('@')[0]))];
    }

    _checkParam(param, defaultValue) {
        if (!param) {
            return defaultValue;
        }
    }

    static checkUserAccountView(user, loggedUser) {
        if (loggedUser === "opencga") {
            return true;
        } else {
            if (loggedUser === user) {
                return true;
            }
        }
        return false;
    }

    static checkProjectPermissions(project, user) {
        if (user === "opencga") {
            return true;
        } else {
            let owner = this.getProjectOwner(project);
            if (owner === user) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the user has the right the permissions in the study.
     * @param study
     * @param user
     * @param permissions
     * @returns {boolean}
     */
    static checkPermissions(study, user, permissions) {
        if (!study || !user || !permissions) {
            console.error(`No valid parameters, study: ${study}, user: ${user}, permissions: ${permissions}`);
            return false;
        }
        // Check if user is the Study owner
        let _studyOwner = study.fqn.split("@")[0];
        if (user === _studyOwner) {
            return true;
        } else {
            // Check if user is a Study admin, belongs to @admins group
            let admins = study.groups.find(group => group.id === "@admins");
            if (admins.userIds.includes(user)) {
                return true;
            } else {
                // Check if user is in acl
                let aclUserIds = study.groups
                    .filter(group => group.userIds.includes(user))
                    .map(group => group.id);
                aclUserIds.push(user);
                for (let aclId of aclUserIds) {
                    if (Array.isArray(permissions)) {
                        for (let permission of permissions) {
                            if (study?.acl?.[aclId]?.includes(permission)) {
                                return true;
                            }
                        }
                    } else {
                        if (study?.acl?.[aclId]?.includes(permissions)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Check if the user has the right the permissions in the study.
     * @param study
     * @param user
     * @returns {boolean}
     */
        static isAdmin(study, userLogged) {
        if (!study || !userLogged) {
            console.error(`No valid parameters, study: ${study}, user: ${userLogged}`);
            return false;
        }
        // Check if user is the Study owner
        let _studyOwner = study.fqn.split("@")[0];
        if (userLogged === _studyOwner) {
            return true;
        } else {
            // Check if user is a Study admin, belongs to @admins group
            let admins = study.groups.find(group => group.id === "@admins");
            if (admins.userIds.includes(userLogged)) {
                return true;
            }
        }
        return false;
    }


}
