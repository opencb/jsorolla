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

export default class OpencgaCatalogUtils {

    /**
     * Check if the user has the right the permissions in the study.
     * @param study
     * @param user
     * @param permissions
     * @returns {boolean}
     */
    static checkPermissions(study, user, permissions) {
        if (!study || !user || !permissions) {
            console.log(`No valid parameters, study: ${study}, user: ${user}, permissions: ${permissions}`);
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

}