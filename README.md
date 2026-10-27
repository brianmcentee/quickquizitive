# QuickQuizitive download website

This folder is a complete static website. It includes the v0.19 extension ZIP, so the Download buttons work without an external file host. Visitors do not need a GitHub account.

## Publish free with GitHub Pages

1. Create a free GitHub account if needed.
2. Create a public repository named `quickquizitive`.
3. Upload the contents of this folder to the repository root. Keep `index.html` at the root and preserve the files together. Do not upload only a ZIP of the website.
4. Open the repository's Settings → Pages. Under Build and deployment, select Deploy from a branch, choose `main` and `/ (root)`, then Save.
5. GitHub will show the published address after deployment: `https://brianmcentee.github.io/quickquizitive/`.

The repository is the editing area; visitors see the designed website at the public Pages address. No paid domain is required.

## Update the extension download

Put the new extension ZIP in the website folder, then update version numbers and download links in `index.html`. The current download filename is `quickquizitive-v0.19.zip`.

## Preview locally

Run `python3 -m http.server 8767` from this folder and open `http://127.0.0.1:8767`.

## Scope

The page is free and has no account system, billing, or analytics. The interactive hero is a demonstration only and does not connect to assignments. The website does not install the extension automatically; the installation guide explains Chrome's manual Load unpacked flow. Published at https://brianmcentee.github.io/quickquizitive/ using GitHub Pages from main / (root). The first deployment succeeded and the public download was verified against the packaged v0.19 extension.
