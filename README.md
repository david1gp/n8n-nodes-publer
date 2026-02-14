# @adaptive-ds/n8n-nodes-publer

Have a Publer account?
Build powerful automations directly in n8n - no API calls to manage, no authentication headaches, just drag-and-drop workflows with n8n.

This custom n8n node wraps the Publer API, giving you native access to schedule posts, manage profiles, analyze performance, and more - all from within your n8n workflows.

Quick Links

- code - https://github.com/david1gp/n8n-nodes-publer
- bun - https://www.npmjs.com/package/@adaptive-ds/n8n-nodes-publer
- publer cocs - https://publer.com/docs
- publer postman - https://www.postman.com/aerospace-architect-98610700/publer/collection/dolndsh/publer-api

## Getting Started

### 1. Create a Publer Account

Sign up at [publer.com](https://publer.com) if you don't already have one.

### 2. Get Your API Key

- Log into your Publer account
- Go to **Settings** → **Integrations** → **API**
- Generate and copy your API key

### 3. Install the Community Node

In n8n:

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `@adaptive-ds/n8n-nodes-publer`

Or install locally:

```bash
bun install
bun run build
cd ~/.n8n
mkdir -p custom && cd custom
bun init
bun link @adaptive-ds/n8n-nodes-publer
```

### 4. Create Your First Workflow

1. Open n8n and create a new workflow
2. Search for **Publer** in the node list
3. Add your API key credentials
4. Start building!

## Run Publer n8n node locally (Development)

Before start modifying the project, we kindly recommend
to run the Publer locally.

### Install n8n

```bash
bun install n8n -g
```

### Start n8n

```bash
n8n --version
n8n start
```

Open [http://localhost:5678](http://localhost:5678) in your browser and configure it

### Build and link the project

```bash
bun install
bun run test
bun run build
bun link
```

### Add node to n8n

```bash
cd ~/.n8n
mkdir -p custom
cd custom
bun init # press Enter for all questions
bun link @adaptive-ds/n8n-nodes-publer
```

### Start n8n again

```bash
n8n start
```

## Acknowledgements

- used template [**devlikeapro/n8n-openapi-node**](https://github.com/devlikeapro/n8n-openapi-node)
