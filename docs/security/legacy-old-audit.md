# Legacy `old/` Audit

**Date:** 2026-09-01
**Status:** Complete

## Scope

The legacy `old/` directory was removed in commit `f4676e4`. The deleted files were:

- `old/.babelrc`
- `old/README.md`
- `old/jsconfig.json`
- `old/scripts/fix-categories.js`
- `old/scripts/fix-slugs.js`
- `old/scripts/get-products.js`
- `old/scripts/import-data.js`

## Findings

- No active application, package script, CI workflow, or documentation dependency on `old/` remains.
- The deleted files contained no detected AWS access-key pattern, private-key block, database connection string, or secret/password/token marker.
- URL references found in the deleted files were reviewed as non-credential references; their values are intentionally not reproduced here.
- The directory was touched by 14 historical commits. Its deletion does not rewrite Git history, so repository-wide credential rotation remains an operational requirement before any public release, independent of this directory audit.

## Verification

The current tree has no `old/` directory. Repository checks completed after the removal and documentation cleanup:

- `npm run check`
- `npm test -- --runInBand`
- `npm run build`

This audit is a metadata summary, not a guarantee that historical secrets do not exist elsewhere in the repository history. Use secret-scanning tools and rotate any credential found in history.
