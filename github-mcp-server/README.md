# GitHub MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with GitHub.

## Features

- `search_repositories`: Search for repositories.
- `get_repository`: Get details of a repo.
- `list_issues`: List issues in a repo.
- `get_file_contents`: Read file contents from a repo.

## Setup

1.  Clone this repository (or copy the files).
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file with your GitHub Personal Access Token:
    ```
    GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
    ```
4.  Build the project:
    ```bash
    npm run build
    ```

## Usage

You can run the server using Node:

```bash
node dist/index.js
```

This server uses the `stdio` transport. To use it with an MCP client (like Claude Desktop), add the following to your configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["d:/Expiremental/github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```
