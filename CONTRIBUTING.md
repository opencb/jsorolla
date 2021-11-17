# Contributing


## Code of Conduct

**OpenCB** has adopted the Contributor Covenant as its Code of Conduct, and we expect project participants to adhere to it. Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.


## Open Development

All work on OpenCB happens directly on GitHub. Both core team members and external contributors send pull requests which go through the same review process.


## Semantic Versioning

All projects under the OpenCB umbrella follow [semantic versioning](https://semver.org/). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes. When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance. 


## Branch Organization

We use separate branches for development or for upcoming releases. Please submit all changes in a new branch with the format `issue-{issue_number}` from the `develop` branch. 


## Filing Issues

Issues are one of the most important ways to contribute to OpenCB.

Please search though open and closed issues to see if a similar issue already exists. If not, open an issue and try to provide a minimal reproduction if you can.

Occasionally we'll close issues if they appear stale or are too vague - please don't take this personally! Please feel free to re-open issues we've closed if there's something we've missed and they still need to be addressed.


## Pull Requests

Pull requests are greatly appreciated! To ensure a smooth review process, please follow these steps:

1.  Make sure there's an open issue that the PR addresses. Add "Fixes #(issue number)" to the PR description.
2.  Please discuss the general shape of the change ahead of time. This can save much time for reviewers and submitters alike. Many times there may be existing ideas on how to handle an issue that are not fully written out, and asking about it will bring out more details.
3.  All PRs that change behavior or fix bugs should have new or updated tests.
4.  Try to create a set of descriptive commits that each do one focused change. Avoid commits like "oops", and prefer commits like "Added method foo to Bar".
5.  When addressing review comments, try to add new commits, rather than modifying previous commits. This makes it easier for reviewers to see what changed since the last review. `git commit --fixup {SHA}` is really useful for this. Obviously, requests like "Please rebase onto master" require changing commits.
6.  If you [allow changes to be committed to your PR branches](https://help.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork/) we can fix some small things in the PR for you, speeding up the review process. 


## License

By contributing your code, you agree to license your contribution under the [Apache License v2.0](./LICENSE).
By contributing to the documentation, you agree to license your contribution under the [Creative Commons Attribution 3.0 Unported License](https://creativecommons.org/licenses/by/3.0/).

