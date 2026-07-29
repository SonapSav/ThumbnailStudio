# Moving ThumbnailStudio to Debian 12

This project is fully cross-platform — **no code changes are needed**. The only
work is setting up a fresh Node environment on the target machine. The single
gotcha: **never copy `node_modules`** (it's ~2 GB of Windows-only binaries —
esbuild, Remotion's native compositor, a Windows Chrome — none of which run on
Linux). Reinstall it fresh on Debian instead; `package-lock.json` makes that
reproducible.

---

## 1. Copy to the USB (on Windows)

Copy the whole folder **except** `node_modules` and `out/`. From PowerShell in
`D:\ThumbnailStudio` (replace `E:` with your USB drive letter):

```powershell
robocopy . E:\ThumbnailStudio /E /XD node_modules out .git
```

`robocopy` is built into Windows. `/E` copies subfolders, `/XD` excludes the
listed directories. (Dragging the folder in Explorer also works — just delete
`node_modules` from the copy afterward so you're not hauling 2 GB around.)

Keep everything else, especially: `src/`, `public/`, `package.json`,
`package-lock.json`, `tsconfig.json`, `remotion.config.ts`, `icon-picker.html`,
`.nvmrc`.

---

## 2. Set up on Debian 12

### a) Install Node 20+ (this repo pins 22 via `.nvmrc`)

Debian 12's apt Node (18.x) works, but 20/22 LTS is recommended. Easiest is nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# reopen the shell, then inside the project folder:
nvm install    # reads .nvmrc -> installs Node 22
```

Or via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### b) Install the headless-Chrome system libraries (Debian-specific)

Remotion renders through headless Chrome, which needs these shared libraries.
Without them, `remotion still` / rendering fails with missing `.so` errors.
This is the **one Debian-only step** and it's a one-time install:

```bash
sudo apt update
sudo apt install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
  libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 \
  libpango-1.0-0 libcairo2 libcups2 libatk-bridge2.0-0
```

> Package list per Remotion's official Linux docs (Debian variant, uses
> `libasound2` — **not** the `libasound2t64` that newer Ubuntu needs):
> https://www.remotion.dev/docs/miscellaneous/linux-dependencies

### c) Install project dependencies (rebuilds node_modules for Linux)

```bash
cd ThumbnailStudio
npm install
```

This pulls the Linux-native binaries (`@remotion/compositor-linux-x64-gnu`, etc.)
in place of the Windows ones.

### d) Enable the commit hook

The co-author commit hook lives in the tracked `.githooks/` dir. `core.hooksPath`
is local config, so activate it once per machine (after a fresh clone):

```bash
git config core.hooksPath .githooks
```

### e) (Optional) Pre-fetch the render browser

```bash
npx remotion browser ensure
```

---

## 3. Verify

```bash
npm run typecheck        # should exit 0
npm run studio           # opens http://localhost:3013
npm run render:yt        # writes out/youtube.png — proves headless render works
```

If Studio's live preview works but `render:yt` errors about a missing library,
you're missing one of the step 2b packages — re-run that apt command.

---

## Notes

- **Fonts** (`@remotion/google-fonts`) download on demand and need internet on
  first render — same as on Windows.
- **Case sensitivity:** Linux filesystems are case-sensitive; Windows is not. The
  imports here are clean, but if `npm run typecheck` ever fails on Debian with a
  "cannot find module" it didn't on Windows, check the import's exact casing.
- **`public/` assets** are referenced by filename, so they travel with the copy —
  nothing to reconfigure.
