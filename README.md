# GitHub Action: Pull Request Auto-Assignment for AppDev

[![Linting][img-gh-action-lint-badge]][gh-action-lint]
[![Validate Built Files][img-gh-action-vbf-badge]][gh-action-vbf]
[![Code Vulnerability Scanning][img-gh-action-cvs-badge]][gh-action-cvs]

Custom GitHub action to add pull request reviewers and assignees for AppDev

## Project Setup

Install the dependencies

```bash
npm install
```

Make your updates to the code as needed.

## Package for distribution

GitHub Actions will run the entry point from the action.yml.
Packaging assembles the code into one file that can be checked into Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.
Packaging the action will create a packaged action in the dist folder.

Run build-action

```bash
npm run build-action
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

Commit your code, pr, and merge.

## Create a release

Users shouldn't consume the action from `develop` since that would be latest code and actions can break compatibility between major versions.

Create a GitHub release for each specific version:
Creating a release like `v1.0.0` allows users to bind back to a specific version if an issue is encountered with the latest major version.

Make the new release available to those binding to the major version tag:
If this is a **new** major version, create a major version tag (`v1`, `v2`, etc.) that points to the ref of the release.
If this is a minor/patch version, move the major version tag (`v1`, `v2`, etc.) to point to the ref of the current release.
This will act as the stable release for that major version.
You should keep this tag updated to the most recent stable minor/patch release.

```bash
git tag -fa v1 -m "Update v1 tag"
git push origin v1 --force
```

The action is now published! :rocket:

## Usage

You can now consume the action by referencing the `v1` tag (or any version tag)

```yaml
uses: plantemoran-appdev/gh-action-pr-auto-assign@v1
with:
  githubToken: ${{ secrets.GITHUB_TOKEN }}
  additionalAccessPat: ${{ secrets.GH_ACTION_AUTO_ASSIGN_PAT }}
```

See the actions tab in the consuming repository for runs of this action! :rocket:

<!-- reference urls -->

[gh-action-cvs]: ../../../actions/workflows/code-analysis.yml
[gh-action-lint]: ../../../actions/workflows/linting.yaml
[gh-action-vbf]: ../../../actions/workflows/validate-built-files.yaml
[img-gh-action-cvs-badge]: ../../../actions/workflows/code-analysis.yml/badge.svg
[img-gh-action-lint-badge]: ../../../actions/workflows/linting.yaml/badge.svg
[img-gh-action-vbf-badge]: ../../../actions/workflows/validate-built-files.yaml/badge.svg
