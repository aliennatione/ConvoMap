# ConvoMap: From Chat Logs to Interactive Mind Maps

[![Deploy to GitHub Pages](https://github.com/aliennatione/ConvoMap/actions/workflows/deploy.yml/badge.svg)](https://github.com/aliennatione/ConvoMap/actions/workflows/deploy.yml)

**ConvoMap** is a powerful, automated toolchain that transforms messy chat logs into clean, structured, and interactive mind maps. It was designed to make sense of long conversations, especially with AI assistants, by turning them into a navigable visual format.

> **Live Demo:** Check out the published mind maps at [**https://aliennatione.github.io/ConvoMap/**](https://aliennatione.github.io/ConvoMap/)

## Why ConvoMap?

Conversations, especially technical ones with AI, are full of valuable information: code snippets, decisions, and key insights. However, raw chat logs are noisy and hard to review. ConvoMap solves this by:

- **Filtering the Noise:** Automatically removes conversational fluff like greetings, affirmations, and other non-essential text.
- **Structuring the Content:** Intelligently corrects formatting to create a clear, hierarchical structure.
- **Visualizing the Result:** Uses [Markmap](https://markmap.js.org/) to generate beautiful, interactive HTML mind maps that you can easily explore.

## How It Works: The Pipeline

The project is orchestrated by `npm run build`, which executes a simple but powerful pipeline:

1.  **Preprocessing (`preprocess.mjs`):**
    - Reads all Markdown files from the `data/` directory.
    - Applies a series of customizable rules to clean up the content.
    - Passes the clean Markdown content in memory to the next stage.

2.  **Mind Map Generation (`build.mjs`):**
    - Takes the cleaned content.
    - Uses `markmap-cli` to convert it into a standalone HTML file.
    - Saves the resulting mind map in the `public/` directory.

3.  **Index Creation (`build.mjs`):**
    - After all maps are built, it generates a main `index.html` file in `public/`.
    - This index acts as a portal, providing links to all the generated mind maps.

## Local Development (IDX Environment)

This repository is pre-configured for a seamless experience in **IDX**, Google's development environment.

1.  **Dependencies:** The first time you open the project, `npm install` will run automatically.
2.  **Build:** To manually trigger a build, run the following command in the terminal:
    ```bash
    npm run build
    ```
3.  **Preview:** IDX provides a live web server (Caddy) configured via `.idx/dev.nix`. After a build, the preview panel will show the `index.html` in the `public/` folder, allowing you to navigate your mind maps locally.

## Automated Publishing with GitHub Pages

This repository uses **GitHub Actions** to automatically build and deploy your mind maps to a public website.

### How the Automation Works

- **Trigger:** The workflow runs every time you `push` changes to the `main` branch.
- **Build:** It sets up a Node.js environment, installs dependencies (using a cache for speed), and runs `npm run build`.
- **Deploy:** It takes the contents of the `public/` directory and deploys them to the `gh-pages` branch, which is then served as your website.

### One-Time Setup

To enable GitHub Pages, you need to configure your repository once:

1.  Go to your repository's **Settings** > **Pages**.
2.  Under **Build and deployment**, set the **Source** to **GitHub Actions**.

That's it! Your site will be live shortly after your first push.

### How to Add New Mind Maps

Your workflow is now fully automated. To add a new mind map:

1.  Place your raw chat log file (e.g., `my-chat.md`) inside the `data/` directory.
2.  Commit and push your changes:
    ```bash
    git add data/my-chat.md
    git commit -m "Add new chat log for visualization"
    git push origin main
    ```
3.  Wait a few moments for the GitHub Action to complete. Your new mind map will appear on the index page of your live site.

---
*This project was bootstrapped and refined with the help of an AI assistant, demonstrating a practical use case for ConvoMap itself.*