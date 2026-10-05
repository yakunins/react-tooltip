# Releasing

## 0. One-time setup

```sh
npx vercel login
npx vercel link --project react-tooltip-contemporary --scope yakunins
```

## 1. Update packages

```sh
npm outdated
npm update
```

- Upgrade major versions listed by `npm outdated`, if wanted: `npm install <pkg>@latest -D`

## 2. Check

```sh
npm run lint
npm run typecheck
npm test
npm run dev
```

- Click through Storybook: placements, arrow positions, triggers, Scroll Container
- Commit any changes made by `npm run lint`

## 3. Bump version

- Check the version is free: `npm view react-tooltip-contemporary versions`
- Change `"version"` in `package.json` to `X.Y.Z`

```sh
npm install
git commit -am "release X.Y.Z"
git push
```

## 4. Publish

```sh
npm run build
npm pack --dry-run
```

- Check the list has `lib/index.js` and no `lib/src/` or `lib/test/`

```sh
npm publish
```

## 5. GitHub Release

```sh
git fetch --tags
git log --pretty="- %s" vPREV..HEAD
```

- Write `release-notes/vX.Y.Z.md` from that list: Features, Changes, Fixes, Internal

```sh
git add release-notes/vX.Y.Z.md
git commit -m "docs: release notes X.Y.Z"
git push
gh release create vX.Y.Z --target master --title "X.Y.Z" --notes-file release-notes/vX.Y.Z.md
```

## 6. Update demo and README

- `demo/index.html`: change `react-tooltip-contemporary@...` to `@X.Y.Z`
- `README.md`: change `bundlephobia.com/package/react-tooltip-contemporary@...` to `@X.Y.Z`
- `README.md`: update the gzipped size from bundlephobia

```sh
git commit -am "docs: point demo and README at X.Y.Z"
git push
```

- Open https://yakunins.github.io/react-tooltip/ and check the demo works

## 7. Deploy Storybook

```sh
npm run deploy-storybook
```

- Open https://react-tooltip-contemporary.vercel.app/ and check it works
