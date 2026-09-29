# Releasing

Steps to publish a new version of `react-tooltip-contemporary` to npm.
`X.Y.Z` below stands for the new version.

## 1. Check

```sh
npm outdated        # list packages with newer versions
npm update          # update them within their package.json semver ranges
npm run lint        # runs eslint --fix; commit anything it changes
npm run typecheck
npm test
```

Then run `npm run dev` and click through Storybook in a browser: every
placement (top / bottom / left / right), every arrow position (start / center /
end), and a few `bubbleStyle` / `cornerSegments` values.

## 2. Bump the version

Edit `"version"` in `package.json` by hand, following semver:

- **patch** – bug fixes only
- **minor** – new features, backward compatible
- **major** – breaking API or behavior changes

Keep `package-lock.json` in sync. Either run `npm install` after the edit, or
make the edit with `npm version X.Y.Z --no-git-tag-version`, which changes both
files without committing or tagging.

Check that the version isn't taken yet:

```sh
npm view react-tooltip-contemporary versions
```

Commit and push:

```sh
git commit -am "release X.Y.Z"
git push
```

## 3. Build and publish

`lib/` is git-ignored and there is no `prepublishOnly` hook, so always build
right before publishing:

```sh
npm run build
npm publish
```

## 4. GitHub Release notes

```sh
gh release create vX.Y.Z --target master --title "X.Y.Z" --generate-notes
```

This creates the `vX.Y.Z` tag on GitHub (there's no local tagging step) and
drafts the notes from the commits since the previous release. Edit the notes
into a short user-facing list of changes if needed.

## 5. After publishing

- **Demo:** in `demo/index.html`, update the import map pin
  `https://esm.sh/react-tooltip-contemporary@X.Y.Z?external=react,react-dom`.
  esm.sh can only serve the version once it's on npm. After pushing, open
  https://yakunins.github.io/react-tooltip/ and check that it works.
- **README:** update the bundlephobia link
  (`https://bundlephobia.com/package/react-tooltip-contemporary@X.Y.Z`) and the
  "8kB gzipped" figure next to it with the size bundlephobia reports.

Commit and push these:

```sh
git commit -am "docs: point demo and README at X.Y.Z"
git push
```
