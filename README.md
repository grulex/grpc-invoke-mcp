# gRPC Invoke MCP

`grpc-invoke-mcp` is an MCP server for calling gRPC methods from AI agents like Claude Code, Codex, Cursor, and other MCP-compatible tools.

It gives agents a simple way to inspect gRPC APIs and invoke unary RPCs using either server reflection or local `.proto` files. This is useful when you want an agent to explore services, understand request and response schemas, make real gRPC calls, and test gRPC integrations during agent-driven development without writing one-off scripts.

## Features

- Call gRPC methods from MCP-compatible agents
- Describe gRPC services, methods, and message types
- Use server reflection or local `.proto` files
- Connect over TLS or plaintext HTTP/2
- Send custom metadata headers
- Pass JSON request bodies for unary RPCs
- Works with Claude Code, Codex, Cursor, and other MCP clients

## Installation

Run the server with `npx`:

```bash
npx -y @grulex/grpc-invoke-mcp@latest
```

The package downloads a platform-specific `grpc-invoke-mcp` binary during installation.

## Agent Setup

### Claude Code

Project config file: `.mcp.json`

```json
{
  "mcpServers": {
    "grpc-invoke": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@grulex/grpc-invoke-mcp@latest"]
    }
  }
}
```

Optional CLI setup:

```bash
claude mcp add --transport stdio grpc-invoke -- npx -y @grulex/grpc-invoke-mcp@latest
```

### Codex

User config file: `~/.codex/config.toml`

```toml
[mcp_servers.grpc-invoke]
command = "npx"
args = ["-y", "@grulex/grpc-invoke-mcp@latest"]
```

Optional CLI setup:

```bash
codex mcp add grpc-invoke -- npx -y @grulex/grpc-invoke-mcp@latest
```

### Cursor

Project config file: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "grpc-invoke": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@grulex/grpc-invoke-mcp@latest"]
    }
  }
}
```

You can also install it globally in `~/.cursor/mcp.json`.

## Available Tools

### `grpc_describe`

Use this tool to inspect services, methods, and message types.

Common use cases:

- list services exposed by a gRPC server
- inspect a method signature before calling it
- explore message schemas through reflection
- describe APIs from local `.proto` files

### `grpc_call`

Use this tool to invoke unary gRPC methods with a JSON request body.

Common use cases:

- call internal microservices from your agent
- test request and response payloads
- send auth headers or other gRPC metadata
- connect to local, staging, or production-safe endpoints

## Example Prompts

- "Describe the services exposed by `localhost:50051` using reflection."
- "Show the request schema for `helloworld.Greeter/SayHello`."
- "Call `helloworld.Greeter/SayHello` on `localhost:50051` with `{ \"name\": \"World\" }`."
- "Invoke `package.Service/Method` using `proto_files` and `import_paths` instead of reflection."

## How It Works

This package exposes an MCP server over stdio. Your agent starts it locally and discovers tools such as:

- `grpc_describe` for schema inspection
- `grpc_call` for unary RPC invocation

Under the hood, the npm package launches a native `grpc-invoke-mcp` binary bundled at install time. The binary supports:

- gRPC server reflection
- local `.proto` definitions
- plaintext or TLS connections
- request metadata headers

## Supported Platforms

The installer currently targets:

- macOS Apple Silicon
- macOS Intel
- Linux x64
- Linux ARM64
- Windows x64
- Windows ARM64

## Troubleshooting

### `npx` cannot start the server

Make sure `Node.js` and `npx` are installed and available in your `PATH`.

### The binary download fails

The npm package downloads a release artifact during installation, so your machine needs network access to GitHub Releases.

### Reflection does not work

If the target server does not expose gRPC reflection, use local `.proto` files and `import_paths` instead.

### TLS or connection errors

Check the target host, port, TLS settings, and whether the server expects plaintext or TLS.

### The agent does not use the MCP server

Confirm the config file is in the right location for your client, restart the client if needed, and verify the server appears in the MCP list or tools panel.

## Why Use grpc-invoke-mcp

If you work with gRPC services, this MCP server lets AI agents inspect and call those services directly. Instead of translating API details by hand, you can let Claude Code, Codex, Cursor, or other MCP-compatible agents explore the contract and execute safe, targeted requests for debugging, integration work, API discovery, and gRPC testing in agent-driven development workflows.

## License

MIT
