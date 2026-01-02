# Frontend Source Map Extractor

This project provides a small Node.js utility that automatically locates, downloads, and extracts a public JavaScript source map (`app.js.map`) from the KoGaMa static CDN. The extracted files are reconstructed into a single, self-contained directory for inspection and analysis.

The tool is intended for educational, research, and transparency purposes only.

---

## What this tool does

- Requests the public XML index at `https://static.kogstatic.com/`
- Locates the most recently modified `app.js.map` file
- Downloads the source map automatically
- Reconstructs all embedded frontend source files
- Stores everything inside one fixed directory (`MapExtracted`)
- Preserves original source paths while safely containing `../` paths
- Generates a `sources.json` file listing all recovered source entries

The result is a local snapshot of the client-side source code as it was shipped to browsers.

---

## What this tool does NOT do

- It does not bypass authentication or access controls
- It does not exploit vulnerabilities
- It does not retrieve backend code, databases, or secrets
- It does not modify or interfere with any live service

All retrieved data is already publicly accessible to any browser that loads the website with source maps enabled.

---

## Legal and ethical notice

This tool operates exclusively on publicly accessible resources. However:

- The author assumes no responsibility for how this software is used
- You are solely responsible for ensuring compliance with local laws, terms of service, and applicable regulations
- The extracted source code remains the intellectual property of its original owners
- Redistribution, commercial use, or misuse of recovered materials may violate applicable agreements or laws

Use this tool responsibly, ethically, and for legitimate purposes only.

---

## Responsible use guidance

Public source maps are commonly exposed unintentionally during deployment. While accessing them is not inherently unlawful, inspecting or sharing internal, unreleased, or sensitive implementation details without permission may be inappropriate.

If you discover:
- unreleased features
- internal tooling
- administrative interfaces
- security-relevant logic

consider reporting the finding responsibly to the website owners rather than publicizing it.

---

## Context on unreleased frontend code

From a web development perspective:

The presence of unreleased or evolving frontend code in a public build does not imply an attempt to hide functionality or mislead users. Development builds frequently change, and features visible today may be altered, restricted, or removed entirely before release.

Publishing incomplete or provisional details often creates expectations that cannot be guaranteed. For that reason, development teams typically avoid discussing features until they are stable and finalized.

Accessing such code may be interesting from a technical standpoint, but it should not be treated as a definitive representation of future functionality.

---

## Intended audience

This project is suitable for:
- frontend developers
- security researchers
- build pipeline auditors
- students learning how source maps work
- anyone interested in modern web build tooling

It is not intended for exploitation, redistribution, or misuse.

---

## Disclaimer

This software is provided "as is", without warranty of any kind. The author disclaims all liability for damages or consequences resulting from the use or misuse of this tool.

By using this project, you acknowledge that you understand and accept these terms.
