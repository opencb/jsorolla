/*
 * Copyright 2015-2024 OpenCB
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

// Define custom pages. See https://github.com/opencb/jsorolla/issues/186
const CUSTOM_PAGES = [
    {
        url: "about",
        title: "About",
        content: "Content of the <b>About</b> page.",
    },
    {
        url: "contact",
        title: "Contact",
        content: "Content of the <b>Contact</b> page.",
    },
    {
        url: "terms",
        title: "Terms of service",
        content: "Content of the <b>Terms of service</b> page.",
    },
    {
        url: "faq",
        title: "Frequently Asked Questions",
        content: "Content of the <b>FAQ</b> page.",
    },
    {
        url: "getting-started",
        title: "Getting Started",
        content: `
            <h3>Login</h3>
            <p>Welcome to ....</p>

            <h3>Menu</h3>
            ...
        `,
    },
];
