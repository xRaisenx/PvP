# Jose's AI-Powered Portfolio

A personal Next.js 15 website with AI-powered tools for coding, project management, and freelancing, developed with ❤️ by Jose. The AI chatbot (Gemini 2.0 Flash, with simulated responses for some dynamic actions) dynamically adds, updates, or removes features, generates tools (e.g., Python calculator), and commits changes to GitHub, triggering Vercel redeployments with checkpoints for rollbacks.

## Features
- **Portfolio Homepage**: Showcases skills, projects (e.g., Planet Beauty chatbot), and generates Upwork/Fiverr proposals.
- **Code Snippets Library**: Stores reusable code snippets with Prisma. Searchable and exportable to CSV.
- **Google Ads Optimizer**: Analyzes campaigns with (simulated) Gemini AI, configurable for clients. Output includes suggestions and a downloadable CSV report.
- **AI Chatbot Assistant**: Assists with coding, manages website updates (dynamic file changes for some features), and commits to GitHub. Uses `sanitize-html` for input cleaning.
- **Code Generator/Debugger**: Generates and debugs code (via AI), saves to library.
- **Project Manager**: Tracks tasks with a Kanban board and AI suggestions (Kanban board UI to be implemented).
- **CSV Maker/PDF Reporting**: Generic tools for exporting outputs as CSV/PDF (specific implementations for snippets, ads optimizer; PDF for proposals).
- **SEO Auditing**: Analyzes websites for SEO improvements (UI and specific AI logic to be implemented).
- **Email Responder**: Automates email responses with Mailchimp integration (Mailchimp API integration to be implemented).
- **Fiverr Gig Generator**: Creates ready-to-post gig descriptions using (simulated) AI.
- **To-Do List**: Manages tasks with AI optimizations.
- **Calendar Scheduler**: Syncs events with Google Calendar (OAuth 2.0 flow needs full implementation for production).
- **Client Manager**: Tracks client details with AI insights.
- **Analytics Dashboard**: Visualizes tool usage with Chart.js (displays sample data). Accessible via the Tools section in `app/page.js`.

## Prerequisites
- Node.js 18+
- Vercel account (free tier)
- Gemini 2.0 Flash API key (or your preferred AI model API key for actual integration)
- Google Calendar API credentials (OAuth 2.0 for production, including Client ID, Client Secret, and configured Redirect URI)
- GitHub personal access token (with `repo` scope)
- Mailchimp API key (optional, if implemented)

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-github-username/jose-portfolio.git # Replace with your actual repository URL
   cd jose-portfolio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   (This installs dependencies from `package.json`, including `csv-writer` and `sanitize-html`.)

3. **Configure Prisma**:
   - Ensure `prisma/schema.prisma` is up-to-date.
   - Run Prisma push to sync your schema with the database and generate Prisma Client:
     ```bash
     npx prisma db push
     ```

4. **Set Environment Variables**:
   - Copy `.env.local.example` to `.env.local`:
     ```bash
     cp .env.local.example .env.local
     ```
   - Fill in the required values in `.env.local` (see `.env.local.example` for details on `GEMINI_API_KEY`, Google credentials, `GITHUB_TOKEN`, etc.).
   - **Crucially, update the placeholder GitHub username and repository name** in `lib/github.js`:
     ```javascript
     const defaultRepoOwner = 'your-actual-github-username'; 
     const defaultRepoName = 'your-actual-repo-name';
     ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```
   - Access the application at `http://localhost:3000`.

6. **Deploy to Vercel**:
   - Push your code to your GitHub repository.
   - Import your GitHub repository into Vercel.
   - Configure all the environment variables (from your `.env.local`) in the Vercel project settings.
   - Vercel should automatically detect it's a Next.js project and deploy it.

7. **GitHub Integration Details**:
   - Chatbot (`app/api/chat/route.js`) uses Octokit (via `lib/github.js`) for commits.
   - `GITHUB_TOKEN` needs `repo` scope.
   - Checkpoints are stored in Prisma.
   - `lib/github.js` now has more robust error handling and revert logic (file content rollback for specified files).

8. **Google Calendar Integration Details**:
   - `app/api/calendar/route.js` includes placeholders for a full OAuth 2.0 flow using `googleapis`. For production, this flow must be completed by setting up credentials in Google Cloud Console and handling the token exchange.

## Chatbot Commands
(Primary logic in `app/api/chat/route.js`)
- **Add Snippet**: `add snippet Title|Description|Code|Language`
- **Generate/Add Tool**: `generate tool python calculator`
  - *Functionality*: Creates a Python calculator snippet, its API route (`app/api/python-calculator/route.js`), updates `app/page.js` UI, and commits. Other dynamic tool additions are simulated via AI planning.
- **Update Bio**: `update bio New bio text for the website`
- **Update Tool (Example)**: `update ads-optimizer Add new analysis parameter` (prepends comment to route file)
- **Remove Tool (Example)**: `remove tool Python Calculator` (removes from UI in `app/page.js`)
- **Revert Commit**: `revert <commitSha>` (rolls back content of specified files like `app/page.js`, `app/api/python-calculator/route.js` to their state at that commit)
- **General Queries**: Passed to (simulated) AI for response.

## Troubleshooting
- **Build Errors**: Ensure `npm install` was run. Clear Next.js cache (`rm -rf .next`).
- **API Issues**: Verify `.env.local` keys. Check server console for errors. Test API endpoints.
- **GitHub Errors**: Confirm `GITHUB_TOKEN` (scope) and `lib/github.js` repo details.
- **Chatbot Failures**: Debug `/api/chat`. Check Prisma connection. Note current AI simulation limits for dynamic code generation.
- **Prisma Issues**: Run `npx prisma db push` after schema changes.
- **CSV Export**: Snippet CSV export is client-side from `app/page.js`. Ads Optimizer CSV is server-side (path like `/tmp/ads-report-[timestamp].csv` returned in JSON, file may be ephemeral).

## Implementation Notes
- **Next.js App Router**: Project structure.
- **Chatbot Capabilities**: Uses `sanitize-html`. Simulates AI planning for dynamic changes (e.g., Python calculator tool with its API route). True dynamic generation for any tool requires full AI integration.
- **GitHub Integration**: Commits via Octokit, checkpoints in Prisma. `revertCommit` rolls back file content for a predefined set of files.
- **Security**: Basic sanitization. API keys via `.env.local`.
- **Analytics Dashboard**: `components/AnalyticsDashboard.js` added (shows sample data). Linked from `app/page.js` via `ToolCard.js` navigation to `/tools/analytics-dashboard` (page for this route needs to be created if not just a modal).
- **Prism.js CSS**: `prism-tomorrow.css` imported in `components/CodeSnippet.js`.
```
