// lib/github.js
import { Octokit } from '@octokit/rest';
import prisma from './prisma';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error('CRITICAL: GITHUB_TOKEN environment variable is not set. GitHub operations will fail.');
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// IMPORTANT: User MUST update these placeholders
const defaultRepoOwner = 'your-github-username'; 
const defaultRepoName = 'jose-portfolio';

if (defaultRepoOwner === 'your-github-username' || defaultRepoName === 'jose-portfolio') {
  console.warn("WARNING: Default GitHub repository owner and name are placeholders in lib/github.js. Please update them with your actual repository details.");
}

export async function commitToGitHub(message, filePath, content, checkpointId) {
  try {
    const repo = { owner: defaultRepoOwner, repo: defaultRepoName };
    let sha;
    try {
      const { data: existingFile } = await octokit.repos.getContent({ 
        ...repo, 
        path: filePath 
      });
      sha = existingFile.sha;
    } catch (error) {
      if (error.status !== 404) {
        console.error(`GitHub getContent error for ${filePath}:`, error);
        throw error; 
      }
      console.log(`File ${filePath} not found, creating new file.`);
    }

    const { data: { commit } } = await octokit.repos.createOrUpdateFileContents({
      ...repo,
      path: filePath,
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      sha,
    });

    if (prisma) {
      await prisma.checkpoint.create({
        data: {
          commitSha: commit.sha,
          description: message,
          checkpointId: Number(checkpointId) || Date.now(),
        },
      });
    } else {
      console.warn("Prisma client not available in commitToGitHub. Checkpoint not saved.");
    }
    return { success: true, commitSha: commit.sha };
  } catch (error) {
    console.error(`GitHub commit to ${filePath} failed:`, error);
    return { success: false, error: error.message || "Unknown error during commit." };
  }
}

export async function revertCommit(commitShaToRevert) {
  try {
    const repo = { owner: defaultRepoOwner, repo: defaultRepoName };
    const filesToConsiderReverting = ['app/page.js', 'app/api/python-calculator/route.js']; 
    let changesMade = 0;
    for (const filePath of filesToConsiderReverting) {
      try {
        const { data: fileAtCommit } = await octokit.repos.getContent({
          ...repo,
          path: filePath,
          ref: commitShaToRevert,
        });
        const targetContent = Buffer.from(fileAtCommit.content, 'base64').toString('utf-8');
        let currentSha;
        try {
          const { data: currentFile } = await octokit.repos.getContent({ ...repo, path: filePath });
          currentSha = currentFile.sha;
        } catch (error) {
          if (error.status === 404) {
            console.log(`File ${filePath} does not exist currently. Re-creating with content from ${commitShaToRevert}.`);
          } else {
            throw error;
          }
        }
        await octokit.repos.createOrUpdateFileContents({
          ...repo,
          path: filePath,
          message: `Rollback ${filePath} to state at ${commitShaToRevert.substring(0,7)}`,
          content: Buffer.from(targetContent, 'utf-8').toString('base64'),
          sha: currentSha, 
        });
        console.log(`Successfully rolled back ${filePath} to state at ${commitShaToRevert.substring(0,7)}`);
        changesMade++;
      } catch (error) {
        if (error.status === 404) {
          console.warn(`File ${filePath} did not exist at commit ${commitShaToRevert}. Cannot roll back its content.`);
          continue; 
        }
        console.error(`Failed to rollback ${filePath} to state at ${commitShaToRevert}:`, error);
      }
    }
    if (changesMade > 0) {
      return { success: true, message: `Rollback process attempted for ${changesMade} file(s).` };
    } else {
      return { success: false, error: "No files were successfully rolled back. Check logs for details." };
    }
  } catch (error) {
    console.error('General error during revert/rollback process:', error);
    return { success: false, error: error.message || "Unknown error during revert." };
  }
}

export async function fetchFileContent(filePath) {
  try {
    const repo = { owner: defaultRepoOwner, repo: defaultRepoName };
    const { data } = await octokit.repos.getContent({ 
      ...repo, 
      path: filePath 
    });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    if (error.status === 404) {
      console.log(`File not found: ${filePath}`);
      return null; 
    }
    console.error(`Failed to fetch file content for ${filePath}:`, error);
    return null; 
  }
}
