import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "octokit";
import * as dotenv from "dotenv";

dotenv.config();

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_PERSONAL_ACCESS_TOKEN) {
  console.error("GITHUB_PERSONAL_ACCESS_TOKEN is not set");
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_PERSONAL_ACCESS_TOKEN,
});

const server = new Server(
  {
    name: "github-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query (e.g., 'topic:mcp')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_repository",
        description: "Get details about a specific repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: {
              type: "string",
              description: "The owner of the repository",
            },
            repo: {
              type: "string",
              description: "The name of the repository",
            },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "list_issues",
        description: "List issues in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: {
              type: "string",
              description: "The owner of the repository",
            },
            repo: {
              type: "string",
              description: "The name of the repository",
            },
            state: {
              type: "string",
              enum: ["open", "closed", "all"],
              default: "open",
            },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "get_file_contents",
        description: "Get the contents of a file in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: {
              type: "string",
              description: "The owner of the repository",
            },
            repo: {
              type: "string",
              description: "The name of the repository",
            },
            path: {
              type: "string",
              description: "The path to the file",
            },
            ref: {
              type: "string",
              description: "The git reference (branch, tag, or commit SHA)",
            },
          },
          required: ["owner", "repo", "path"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_repositories") {
      const { query } = args as { query: string };
      const response = await octokit.rest.search.repos({ q: query });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data.items, null, 2),
          },
        ],
      };
    }

    if (name === "get_repository") {
      const { owner, repo } = args as { owner: string; repo: string };
      const response = await octokit.rest.repos.get({ owner, repo });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }

    if (name === "list_issues") {
      const { owner, repo, state } = args as {
        owner: string;
        repo: string;
        state?: "open" | "closed" | "all";
      };
      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    }

    if (name === "get_file_contents") {
      const { owner, repo, path, ref } = args as {
        owner: string;
        repo: string;
        path: string;
        ref?: string;
      };
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (Array.isArray(response.data)) {
        return {
          content: [
            {
              type: "text",
              text: "Path is a directory, not a file.",
            },
          ],
          isError: true,
        };
      }

      if ("content" in response.data) {
        const content = Buffer.from(response.data.content, "base64").toString(
          "utf-8"
        );
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "Could not retrieve file content.",
          },
        ],
        isError: true,
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: error.message || "An unknown error occurred",
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
