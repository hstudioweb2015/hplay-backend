# HStudio HPlay Frontend

Frontend Vue.js for the HStudio HPlay project.

## Description

HPlay is a VOD streaming platform that allows users to watch medias on demand.

## Getting Started

### Prerequisites

List all dependencies and their version needed by the project as :

* IDE used [Visual Studio Code 1.95.1](https://code.visualstudio.com/docs/setup/windows)
* mermaid extention [mermaid for vscode](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
* git version 2.43.0.windows ou ultérieure [official doc](https://git-scm.com/)

### Configuration

* Install requirements
* Install Node.js 22.10.3 or later [official doc](https://nodejs.org/en/download/)
* Install NPM 11.2.0 or later [official doc](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Development

* Install dependencies

```bash
npm install
```

* copy .env.example to .env and set the environment variables

```bash
cp .env.example .env
```

* Run the app

```bash
npm run dev
```

## Deployment

* copy .env.example to .env and set the environment variables and set the PRODUCTION variable to true

```bash
cp .env.example .env
```

* Run the app

```bash
npm start
```

## Directory structure

```bash
├───docs
├───src
│   ├───configs
│   ├───controllers
│   ├───errors
│   ├───middlewares
│   ├───models
│   ├───routes
│   └───services
└───tests
```

## Collaborate

* Workflow
    * [Gitflow](https://www.atlassian.com/fr/git/tutorials/comparing-workflows/gitflow-workflow#:~:text=Gitflow%20est%20l'un%20des,les%20hotfix%20vers%20la%20production.)
    * [How to commit](https://www.conventionalcommits.org/en/v1.0.0/)
    * [How to use your workflow](https://nvie.com/posts/a-successful-git-branching-model/)

    * Propose a new feature in [Github project](https://github.com/orgs/CPNV-ES/projects/27/views/9) as backlog
        * We only use technical stories
    * Pull requests are open to merge in the develop branch.
    * Release on the main branch we use GitFlow and not with GitHub release.
    * Issues are added to the [github issues page](https://github.com/JuilletMikael/RIA-EggFlix/issues)

  If needed to create a feature based on a feature you can do it with git flow like this.

  ````bash
  git flow feature start new-feature feature/based-feature
  ````
  And to finish it :
  ````bash
  git flow feature finish new-feature
  ````

### Commits

* [How to commit](https://www.conventionalcommits.org/en/v1.0.0/)

```bash
<type>: <subject>
```

* **build**: changes that affect the build system or external dependencies (npm, make, etc.)
* **ci**: changes related to integration or configuration files and scripts (Travis, Ansible, BrowserStack, etc.)
* **feat**: addition of a new feature
* **fix**: bug fix
* **perf**: performance improvement
* **refactor**: code change that neither fixes a bug nor adds a feature
* **style**: changes that do not affect the meaning of the code (whitespace, formatting, missing semi-colons, variable
  renaming, etc.)
* **docs**: documentation only changes
* **test**: adding or updating tests

examples :

```bash
feat: add a button in the ...
````

```bash
feat: change name into username
````

## License

ALL RIGHTS RESERVED

## Contact

* If needed you can create an issue on GitHub we will try to respond as quickly as possible.