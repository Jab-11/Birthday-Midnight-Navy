# Setup and running the project

## Quick start

You need **Node.js 22.12 or newer** (the project uses TanStack Start, which requires it).

```sh
nvm use 22            # or: nvm install 22
npm install           # first run downloads a lot; later runs are fast (see below)
cp .env.example .env  # then fill in the three EmailJS values
npm run dev
```

Open http://localhost:8080/. The home page stays blank until the URL has a valid `experience`
value. That is intentional.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build into `.output/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (warnings are expected, errors are not) |
| `npm test` | Run the tests once |
| `npx tsc --noEmit` | Typecheck |
| `npm run format` | Prettier |

## Environment variables

The wish form sends email from the browser with [EmailJS](https://www.emailjs.com/).
Put these in `.env` (it is git-ignored, so never commit it):

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

- Restart `npm run dev` after changing `.env`.
- Your EmailJS template must contain `{{wish}}` in its body and have the recipient set.
- On your hosting platform, add the same three variables. For GitHub Actions, add them as
  repository secrets (Settings > Secrets and variables > Actions).

## Why `npm i` was slow (and how it is fixed)

When this was first run, `npm install` took many minutes and then crashed. There were three causes.

1. **No npm lockfile.** The project came with only `bun.lock`, which npm ignores. With no
   `package-lock.json`, npm had to work out the whole dependency tree from scratch by downloading
   package metadata for every package. Some are huge (the `vite` metadata alone is about 39 MB;
   `typescript`, `eslint` and `@types/node` are each many MB).
2. **A slow, unreliable connection to the npm registry.** Downloads ran at a few hundred KB/s and
   some failed with `ETIMEDOUT` / `ENETUNREACH`. A failed run left a half-built `node_modules`
   (no `.bin` folder), so nothing could start.
3. **An npm bug.** After downloading everything, npm 10 crashed while resolving peer
   dependencies: `Cannot read properties of null (reading 'edgesOut')`.

What fixed it:

- A **`package-lock.json`** now exists, so npm installs exact versions and skips the metadata crawl.
- A **`.npmrc`** with `legacy-peer-deps=true` skips the peer resolver that crashed.
- Packages are in the npm cache after the first successful run, so later installs take seconds.

If an install ever goes wrong, a clean retry usually works:

```sh
rm -rf node_modules
npm install
```

Use `npm ci` (not `npm install`) when you want an exact, repeatable install from the lockfile,
as CI does.

### Lockfiles

`package-lock.json` is the lockfile and must stay with the project: it is what makes installs fast
and repeatable on another machine. The old Lovable `bun.lock` was removed because npm ignores it.
Use one package manager only (an earlier pnpm attempt was removed for this reason).

### Moving the project to another machine

Copy everything except `node_modules/` and build output (`.output/`, `.wrangler/`, `dist/`,
`.tanstack/`), which are regenerated, then run `npm install` there. Copy `.env` separately and
privately, since it holds your EmailJS values.

## Network problems

- **Corporate networks:** a web filter (for example Zscaler) can block `api.emailjs.com`. The wish
  email then fails with `TypeError: Failed to fetch` in the console and no status code. Try
  another network (a phone hotspot) or ask IT to allow `api.emailjs.com`.
- **Slow installs on a restricted network** can use a closer mirror:
  `npm config set registry <your-mirror-url>`.

## GitHub and CI

`.github/workflows/ci.yml` runs on every push to `main`, on pull requests, and on demand
(Actions tab > CI > Run workflow). It installs with `npm ci`, then runs the typecheck, lint,
tests and build, and uploads the `.output` folder as a downloadable artifact.

Before the first push:

1. Create the repository and push (`git init` and the remote are up to you).
2. Add the three `VITE_EMAILJS_*` secrets if you want the build to include them.
3. Make sure `.env` is not committed (it is already in `.gitignore`).

### About hosting

This is a server-rendered TanStack Start app (it has server functions) built for **Cloudflare**
(`npm run build` produces `.output/server` and a `wrangler.json`). **GitHub Pages cannot host
it**, because Pages only serves static files. To publish it, use Cloudflare Workers/Pages
(`npx nitro deploy --prebuilt` after a build), or another host that runs Node or Workers code.
The workflow here checks that the project builds; it does not deploy.

## Project notes

- Dev uses the file-based router; `src/routeTree.gen.ts` is generated, so do not edit it.
- Chapters live in `src/chapters`, shared state in `src/experience`, and photo/video data in
  `src/content/memories.json` with files in `src/assets`.
