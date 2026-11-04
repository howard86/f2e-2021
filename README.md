# f2e-2021

Monorepo for the [2021 F2E challenge](https://2021.thef2e.com/), built with
Next.js App Router, React, Chakra UI, Bun, and Turbo.

Special thanks to:

- [hexschool](https://www.hexschool.com) for the user stories
- The designers who shared mockups under the
  [CC BY-NC 3.0 TW](https://creativecommons.org/licenses/by-nc/3.0/tw/deed.en)
  license
- [Public Transport data eXchange](https://ptx.transportdata.tw/PTX/) for the
  open transport data

## Projects

- `apps/scene` — [Taiwan Scene](https://taiwan-scene.howardism.dev), designed
  by [Hanali](https://www.behance.net/cfc5cf51)
- `apps/ubike` — [YouBike](https://ubike.howardism.dev), designed by
  [Viola](https://www.linkedin.com/in/violaleeee)
- `apps/bus` — [Taiwan Bus](https://bus.howardism.dev), designed by
  [Hanali](https://www.behance.net/cfc5cf51)
- `libs/tdx` — shared transport-data client

All three apps use the Next.js App Router and
[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) for maps.

## Requirements

- [Bun](https://bun.sh/) 1.4.4 — the only runtime: Next.js runs under
  `bun --bun next`, and Vercel functions use the Bun runtime (`vercel.json`)

Install the locked dependencies:

```bash
bun install --frozen-lockfile
```

Copy the environment template for each app you want to run, then fill in its
required values:

```bash
cp apps/bus/.env.sample apps/bus/.env.local
cp apps/scene/.env.sample apps/scene/.env.local
cp apps/ubike/.env.sample apps/ubike/.env.local
```

## Commands

Run an app from the repository root:

```bash
bun run dev:bus
bun run dev:scene
bun run dev:ubike

bun run build:bus
bun run build:scene
bun run build:ubike

bun run start:bus
bun run start:scene
bun run start:ubike
```

Use Turbo directly when you need a filtered task:

```bash
bunx turbo run dev --filter=@f2e/bus
```

Quality commands:

```bash
bun run check
bun run fix
bun run typecheck
bun run knip
```

There is no test framework or test command yet. Add one when the repository
gets its first useful automated test.

## Git hooks

Husky runs these local gates:

- `pre-commit`: fixes staged files with Ultracite through lint-staged, then
  scans staged content with Gitleaks
- `pre-push`: runs Ultracite check, a forced cold Turbo typecheck, Knip, Typos,
  and Gitleaks over `origin/main..HEAD`
- `commit-msg`: validates the commit message with Commitlint

Install the external scanners on macOS:

```bash
brew install typos-cli gitleaks
```

Use Git's `--no-verify` option only when intentionally bypassing hooks:

```bash
git commit --no-verify
git push --no-verify
```

## Deployment

The apps deploy to [Vercel](https://vercel.com) under `howardism.dev`.

## License

All rights reserved.
