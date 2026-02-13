# @adaptive-ds/n8n-nodes-publer

Quick links
- Publer Docs - https://publer.com/docs
- Publer Postman - https://www.postman.com/aerospace-architect-98610700/publer/collection/dolndsh/publer-api

# Run Publer n8n node locally
Before start modifying the project, we kindly recommend
to run the Publer locally.

## NodeJS

## Install n8n 
```bash
npm install n8n -g
```

## Start n8n
```bash
n8n --version
n8n start
```
Open [http://localhost:5678](http://localhost:5678) in your browser and configure it

## Build and link the project
```bash
npm install
npm run test
npm run build
npm link
```

## Add node to n8n
```bash
cd ~/.n8n
mkdir -p custom
cd custom
npm init # press Enter for all questions
npm link @adaptive-ds/n8n-nodes-publer
```

## Start n8n again
```bash
n8n start
```

## Add Publer Node to new workflow
Find `Publer` in the node list and add it to your workflow

## Test Project Locally

```bash
npm install
npm run test
npm run build
npm link
```

Add node to n8n:
```bash
cd ~/.n8n
mkdir -p custom
cd custom
npm init # press Enter for all questions
npm link @adaptive-ds/n8n-nodes-publer
```

Start n8n:
```bash
n8n start
```

## Publish project
1. Add your `NPM_TOKEN` in GitHub Actions
2. Push change
3. Create a new GitHub Release, `1.0.0` in your project
4. Install your node in n8n: `@{yourgithubname}/n8n-nodes-{yournode}`

## Acknowledgements

- used template [**devlikeapro/n8n-openapi-node**](https://github.com/devlikeapro/n8n-openapi-node)
