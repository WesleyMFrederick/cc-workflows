# Monorepo tool distribution patterns for Node‑based CLI tools (2025)

## Context and goals

A **monorepo** stores many packages and tools in a single repository. Your situation involves a monorepo managed with NPM workspaces that contains multiple Node.js CLI tools and shared libraries. The goal is to make individual tools available to other projects (internal and external) while maintaining ease of development and proper versioning. The following patterns summarise ways to distribute CLI tools from a monorepo, how they work, their advantages and drawbacks, tooling requirements and examples. For each pattern, pick the one (or combination) that best fits your audience and infrastructure.

## 1 Workspace‑level consumption (no external distribution)

### Technical implementation

- **Workspaces & `workspace:` protocol** – Yarn and npm workspaces allow defining multiple packages in a single repo. Packages can depend on each other using the `workspace:` version protocol so they resolve to the local package rather than a published version[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=To%20declare%20a%20workspace%2C%20all,folder%20will%20become%20workspaces). In the root `package.json`, add a `workspaces` array pointing to the packages (e.g., `"packages/*"`). When a package declares a dependency like `"@my‑org/tool-a": "workspace:^"`, Yarn links the local package and, when published, replaces the `workspace:` range with the actual version[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=%7B%20%22dependencies%22%3A%20%7B%20%22%40my,).
    

### Pros and cons

|Pros|Cons|
|---|---|
|**Fast internal linking** – packages resolve instantly via symlinks; local changes propagate without publishing.|Only works inside the monorepo; not accessible to outside consumers.|
|**Simpler development** – developers can run and debug tools without dealing with versioning or registry overhead.|The monorepo can become large and may slow down CI if many packages are installed together.|

### Best use cases

- Internal tools or shared libraries consumed only by applications within the same monorepo.
    
- Early development phases where versioning/publishing overhead is undesirable.
    

### Tooling and version management

- **Yarn 4** or **npm 9** workspaces; set `link-workspace-packages` to enable linking.
    
- Use the `workspace:` version range to ensure published packages pick up the correct semver[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=%7B%20%22dependencies%22%3A%20%7B%20%22%40my,).
    

### Real‑world examples

- **Yarn itself** is composed of dozens of packages and uses its own workspaces; packages can be deployed independently[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=info).
    
- **Babel**, **Jest** and **React** use monorepos and Yarn workspaces to share code. The Yarn docs cite Babel and Jest as examples where a core package is surrounded by various add‑ons and workspaces simplify cross‑references[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=When%20should%20I%20use%20workspaces%3F).
    

## 2 Local symlink linking – `npm link`/`yarn link`/`pnpm link`

### Technical implementation

Package managers provide commands to symlink a package globally and link it into dependent projects. The **manage‑linked‑packages** guide explains that `npm link` and `yarn link` create global symlinks and local symlinks to the package[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=The%20,back%20to%20global%20Project%20A). To link a package:

`# In the package directory cd /projects/tool-a npm link           # or yarn link, pnpm link  # In another project cd /projects/consumer npm link "tool-a"  # symlink the global package into node_modules`

Later you can remove the link using `npm unlink tool-a` from the consumer and then `npm unlink` from the tool’s directory[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=You%20can%20then%20reverse%2Fremove%20these,links%20manually).

### Pros and cons

|Pros|Cons|
|---|---|
|**Fast for local development** – changes to the tool are instantly available in another project without publishing.|**Manual maintenance** – you must manually link and unlink packages; no automatic version management[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=However%2C%20there%20is%20no%20out,might%20suit%20your%20requirements%20perfectly).|
|**Language‑agnostic** – works for any JavaScript package manager.|Global symlinks can accumulate, leading to “link hell” and confusion across multiple projects[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=However%2C%20there%20is%20no%20out,might%20suit%20your%20requirements%20perfectly).|

### Best use cases

- Quickly testing a CLI tool in another project during development.
    
- Not intended for production distribution; should be replaced with proper releases for external users.
    

### Tooling and version management

- Provided by `npm`, `yarn` and `pnpm` out of the box. Tools like **manage‑linked‑packages** help locate and reset global links[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=However%2C%20there%20is%20no%20out,might%20suit%20your%20requirements%20perfectly).
    
- No version bumping or publishing; you link the package at the file‑system level.
    

### Real‑world examples

- Internal teams often use `npm link` to test packages before publishing; the manage‑linked‑packages article demonstrates linking multiple local packages in a mono‑repo[dominicfallows.uk](https://dominicfallows.uk/blog/manage-linked-packages-npm-yarn#:~:text=The%20,back%20to%20global%20Project%20A).
    

## 3 Git‑based installation (monorepo packages via Git)

### Technical implementation

Instead of publishing to npm, you can install a package directly from a Git repository or a specific branch/commit. Both npm and pnpm support this:

- **Install entire repo** – `npm install git+https://github.com/user/repo#commit` or `pnpm add kevva/is-positive#master` will clone the repository and install the package at that commit[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npm-install/#:~:text=,url)[pnpm.io](https://pnpm.io/cli/add#:~:text=,branch).
    
- **Install subdirectory of a monorepo** – pnpm allows specifying a subdirectory: `pnpm add RexSkz/test-git-subfolder-fetch#path:/packages/simple-react-app`[pnpm.io](https://pnpm.io/cli/add#:~:text=,of%20a%20Git%20repository). Tools like **GitPkg** make this easy: `npm install https://gitpkg.now.sh/<user>/<repo>/<package-path>?<commit>` [zfir.medium.com](https://zfir.medium.com/installing-a-dependency-from-a-monorepo-easily-6b810c0189f8#:~:text=Encountering%20a%20monorepo%20that%20has,as%20dependencies%20in%20other%20projects).
    
- **Semver syntax** – both npm and pnpm let you pin a tag or semver range (e.g., `#semver:^2.0.0`[pnpm.io](https://pnpm.io/cli/add#:~:text=,repository%20using%20semver)).
    

### Pros and cons

|Pros|Cons|
|---|---|
|**No publishing overhead** – consumers can install directly from a specific commit or branch to test unreleased features[emmer.dev](https://emmer.dev/blog/installing-npm-packages-from-github/#:~:text=,of%20the%20box).|**Not production‑friendly** – Git dependencies may be unstable; no guarantee of semver compatibility; installations rely on Git availability and network access.|
|**Fine‑grained control** – pin exactly which commit is used; useful for pre‑release testing[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npm-install/#:~:text=,url).|**No subdirectory support in npm** – npm cannot install a subdirectory of a monorepo natively; you must use a proxy like GitPkg[emmer.dev](https://emmer.dev/blog/installing-npm-packages-from-github/#:~:text=If%20the%20npm%20package%27s%20,GitPkg%20%20that%20can%20help).|

### Best use cases

- Testing a tool before it’s published (e.g., using a feature branch in CI).
    
- Internal projects that do not wish to maintain a private registry but still need to pin to specific commits.
    

### Tooling requirements

- Git installed on the consumer machine.
    
- Optionally **GitPkg** (or pnpm’s `path:` parameter) for subdirectory support.
    

### Version management

- Version is tied to the commit hash or tag; you must manage updates manually.
    

### Real‑world examples

- Many open‑source projects instruct users to install a package from GitHub for testing before a new release (e.g., `npm install isaacs/rimraf#v3`[emmer.dev](https://emmer.dev/blog/installing-npm-packages-from-github/#:~:text=Installing%20a%20specific%20branch%20%28e,from%20a%20pull%20request)).
    
- **GitPkg** documentation shows how to install an unpublished package from a monorepo subdirectory[zfir.medium.com](https://zfir.medium.com/installing-a-dependency-from-a-monorepo-easily-6b810c0189f8#:~:text=Encountering%20a%20monorepo%20that%20has,as%20dependencies%20in%20other%20projects).
    

## 4 Git submodules or subtrees

### Technical implementation

A **git submodule** embeds another Git repository inside your main repository. The Aviator guide notes that submodules let you include one or more external repositories, update them independently and keep your main repository’s commit history clean[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=Benefits%20of%20Git%20Submodules). To add a submodule:

`git submodule add https://github.com/user/tool-a.git packages/tool-a cd packages/tool-a # work on tool-a independently`

Subtrees are similar but copy the remote repository into your repo’s history and allow pushing changes back. They are rarely used in JS monorepos.

### Pros and cons

|Pros|Cons|
|---|---|
|**Separate histories and permissions** – the main repo stays clean; access to submodules can be restricted[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=,can%20push%20changes%20to%20submodules).|More complex workflow; developers must clone submodules, update them and commit submodule references[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=One%20of%20the%20main%20drawbacks,latest%20version%20of%20your%20dependencies).|
|**Works across languages** – submodules are agnostic to technology; good when packages are written in different languages[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=,agnostic%20to%20the%20language%20used).|Increases repository size and complexity; tools need additional scripts for cloning/updating[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=Most%20of%20these%20drawbacks%20can,these%20drawbacks%20before%20using%20submodules).|

### Best use cases

- When packages are maintained in separate repositories but need to be consumed in another repository.
    
- Multi‑language projects where monorepo tooling (Lerna, Yarn) doesn’t support certain languages.
    

### Tooling and version management

- Git with submodule commands; optionally scripts to update submodules.
    
- Each submodule can use its own versioning scheme; the main repo tracks the commit hash.
    

### Real‑world examples

- Large organisations such as Facebook and Twitter use git submodules for certain shared modules[aviator.co](https://www.aviator.co/blog/managing-repositories-with-git-submodules/#:~:text=repository%2C%20making%20it%20easy%20to,of%20and%20update%20those%20dependencies).
    
- Teams maintain multiple monorepos and share modules via submodules to avoid duplication.
    

## 5 Private package registries

### Technical implementation

If your tools should be consumed by other internal projects but not published publicly, a private registry centralises packages. Options include:

1. **Verdaccio** – a lightweight, self‑hosted npm proxy. The DEV article notes that Verdaccio is open‑source, can be installed with `npm install -g verdaccio` and started in minutes; developers set `npm set registry http://localhost:4873` to point their npm client at the registry[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,%E2%80%94%20The%20Lightweight%20Rebel%20%E2%98%A0%EF%B8%8F). Verdaccio plays nicely with npm/yarn/pnpm and supports plugins for authentication and storage[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,%E2%80%94%20The%20Lightweight%20Rebel%20%E2%98%A0%EF%B8%8F).
    
2. **Artifactory** – enterprise‑grade registry for multiple package types (npm, Docker, Maven). Pros include robust caching, role‑based permissions and multi‑repo support; cons include cost and complexity[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,Artifactory%20%E2%80%94%20The%20Enterprise%20Overlord).
    
3. **GitHub Packages** – built into GitHub; integrates with GitHub Actions; free for public packages but has storage limits[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,Packages%20%E2%80%94%20The%20GitHub%20Native). Publishing is done via `npm publish --registry https://npm.pkg.github.com/@OWNER`.
    

To publish to a private registry, set your `.npmrc` to use the registry and run `npm publish --registry http://your-registry.com` [dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=1,Publish%20Your%20Crown%20Jewels).

### Pros and cons

|Pros|Cons|
|---|---|
|**Controlled access** – restrict who can install and publish packages.|Requires infrastructure; Verdaccio scales only to small teams[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,%E2%80%94%20The%20Lightweight%20Rebel%20%E2%98%A0%EF%B8%8F), while Artifactory is costly[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,Artifactory%20%E2%80%94%20The%20Enterprise%20Overlord).|
|**Versioning & caching** – centralises package versions, speeds up installs due to caching[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,Artifactory%20%E2%80%94%20The%20Enterprise%20Overlord).|Additional setup and maintenance; managing credentials and permissions is necessary[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=1,Publish%20Your%20Crown%20Jewels).|

### Best use cases

- Internal libraries used across multiple repositories or microservices.
    
- Organisations requiring compliance or long‑term caching of dependencies.
    

### Tooling and version management

- Verdaccio or Artifactory servers; configure `.npmrc` with registry URL and authentication.
    
- Use standard semver; packages are versioned independently or in lockstep depending on your release strategy.
    

### Real‑world examples

- A fintech startup described in the article moved from git submodules to Verdaccio; they deployed Verdaccio on a $10/month VM, migrated shared code to packages such as `@fintech/utils`, and slashed installation times by 70 %[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=Real,Scaled).
    

## 6 Public npm distribution (publishing packages)

### Technical implementation

Publishing each CLI tool to the npm registry (or another public registry such as JSR) is the standard way to reach external consumers. The process involves bundling your CLI and running `npm publish`. To manage multiple packages, monorepo tooling assists with versioning and publishing:

- **Lerna** – provides `lerna version` to bump versions and create git tags, and `lerna publish` to publish changed packages to npm[lerna.js.org](https://lerna.js.org/docs/features/version-and-publish#:~:text=Lerna%20comes%20with%20a%20,changes%20and%20tag%20them%20accordingly). Lerna supports **fixed/locked mode** (single version across all packages) or **independent mode** (each package versions independently)[lerna.js.org](https://lerna.js.org/docs/features/version-and-publish#:~:text=Versioning%20strategies).
    
- **Nx Release** – integrated into Nx. Running `pnpm nx release` bumps versions, generates changelogs and publishes packages to npm; it can be run with `--dry-run` or `--first-release`[nx.dev](https://nx.dev/blog/versioning-and-releasing-packages-in-a-monorepo#:~:text=Running%20Nx%20Release). Nx highlights emphasise that Nx Release is extensible and can be used for languages other than JS[nx.dev](https://nx.dev/blog/nx-highlights-2024#:~:text=Nx%20Release).
    
- **Changesets with pnpm/yarn** – `changeset` CLI helps create change files, bump versions and publish. The pnpm monorepo guide shows running `pnpm version-packages`, building packages, and `pnpm changeset publish` to publish to custom registries[jsdev.space](https://jsdev.space/complete-monorepo-guide/#:~:text=,TypeScript%20types%20for%20better%20inference). It also supports pre‑release flows (e.g., `pnpm changeset pre enter beta`, `pnpm changeset pre exit`)[jsdev.space](https://jsdev.space/complete-monorepo-guide/#:~:text=%23%20Enter%20pre,changeset%20pre%20enter%20beta).
    
- **Turborepo** – recommends using internal packages (not published) for local libraries and bundling external libraries. It suggests the **Changesets** CLI for versioning and publishing; commands include `changeset`, `changeset version` and `changeset publish`[turborepo.com](https://turborepo.com/docs/guides/publishing-libraries#:~:text=Versioning%20and%20publishing).
    
- **Rush** – uses a two‑stage approach: developers create change files with `rush change`, then administrators run `rush publish` to increase versions, update change logs and publish to npm. Rush supports lockstep or individual version policies defined in a JSON file[rushjs.io](https://rushjs.io/pages/maintainer/publishing/#:~:text=,usage%20cases%20are%20listed%20here). It provides dry‑run and pack modes and can update dependencies automatically[rushjs.io](https://rushjs.io/pages/maintainer/publishing/#:~:text=3).
    

To publish a CLI tool to npm, ensure the `bin` field in `package.json` points to the compiled CLI file. For TypeScript projects, bundle with a tool like `tsup` or `esbuild` and point `bin` to the compiled output.

### Pros and cons

|Pros|Cons|
|---|---|
|**Standard distribution** – consumers can install tools via `npm install -g your-tool` or run with `npx your-tool`.|Publishing to the public registry exposes your package to everyone; you must maintain semver and handle security.|
|**Semantic versioning & updates** – packages can be versioned independently or together; tools like Changesets and Lerna generate changelogs.|Requires building the CLI (e.g., bundling), handling cross‑platform executables and potential CJS/ESM issues.|
|**Integrates with CI** – widely supported by GitHub Actions, GitLab CI, etc.|Public registry terms; names must be unique and there may be publishing restrictions.|

### Best use cases

- When the CLI tool is intended for public or third‑party users.
    
- When you need versioned releases, changelogs and ability to install globally.
    

### Tooling requirements

- Choose a monorepo release tool (Lerna, Nx Release, Changesets, Rush). Each provides commands for versioning and publishing.
    
- Node bundler like tsup/rollup if the CLI must be compiled to a single file.
    

### Version management

- Decide between **fixed** (lockstep) versioning and **independent** versioning. Lerna and Rush provide configuration options[lerna.js.org](https://lerna.js.org/docs/features/version-and-publish#:~:text=Versioning%20strategies)[rushjs.io](https://rushjs.io/pages/maintainer/publishing/#:~:text=,usage%20cases%20are%20listed%20here).
    
- Use semantic versioning; automated tools generate changelogs from commit messages.
    

### Real‑world examples

- **Nx** uses its own release tool to publish the @nx/* packages to npm[nx.dev](https://nx.dev/blog/versioning-and-releasing-packages-in-a-monorepo#:~:text=Running%20Nx%20Release).
    
- **Turborepo** publishes its bundler packages (`@turbo/shared-utils`, etc.) via Changesets[turborepo.com](https://turborepo.com/docs/guides/publishing-libraries#:~:text=Versioning%20and%20publishing).
    
- **React** and **Babel** publish each package to npm, using Yarn workspaces and custom release scripts. The Yarn docs mention Babel as an example of a core package with add‑ons where workspaces help manage cross‑references[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=When%20should%20I%20use%20workspaces%3F).
    

## 7 Pre‑built executables (self‑contained binaries)

### Technical implementation

Sometimes you need to ship a CLI tool without requiring Node.js. Tools like **Vercel pkg** or Node.js’s **Single Executable Application (SEA)** support compile‑to‑binary workflows. Node’s SEA feature allows injecting a bundled script into the Node binary; the docs describe creating a JavaScript file, generating a blob via `node --experimental-sea-config`, copying the node binary and injecting the blob using `npx postject`, producing a single executable that runs your script[nodejs.org](https://nodejs.org/api/single-executable-applications.html#:~:text=Node,operates%20as%20it%20normally%20does). `pkg` and `nexe` simplify this process by bundling your app and Node runtime into a binary for each platform.

### Pros and cons

|Pros|Cons|
|---|---|
|**No Node.js required** – end users run a single binary; easier installation on servers or CI agents.|Bundling the runtime increases file size; cross‑platform builds are needed and may require code signing on macOS/Windows[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull).|
|**Security & portability** – the binary cannot be tampered with easily; good for closed‑source or compliance requirements.|Additional build complexity; may not support dynamic code loading or native modules.|

### Best use cases

- When targeting environments without Node installed (CI, servers, Windows clients).
    
- Tools that must be executed from Docker containers or packaged as part of other languages.
    

### Tooling and version management

- Use `pkg`, `nexe` or Node’s SEA; configure the `bin` entry in `package.json` and include your compiled files.
    
- Manage versions via tags and release assets on GitHub. Provide binaries for each OS/architecture as GitHub Releases.
    

### Real‑world examples

- Many cross‑platform CLI tools (e.g., **Vercel’s `vc` CLI**, **Prisma**) release self‑contained binaries so users can download and run without Node.
    
- Node 20+ now offers experimental SEA support, which is being adopted by some projects.
    

## 8 OS‑specific package managers (Homebrew, MacPorts, Scoop, Chocolatey)

### Technical implementation

OS package managers allow users to install CLI tools with system‑specific commands (e.g., `brew install tool-a`). **Homebrew** is the most common for macOS. Justin Searls’s guide outlines creating a **tap** (a custom Homebrew formula repository):

1. Tag a release in your GitHub repository containing pre‑built binaries.
    
2. Create a **tap** repository (e.g., `homebrew-tool`), add a formula referencing the tarball (URL and SHA) and commit it[justin.searls.co](https://justin.searls.co/posts/how-to-distribute-your-own-scripts-via-homebrew/#:~:text=First%20thing%20to%20know%20is,CLI%20in%20the%20core%20repository).
    
3. Users run `brew tap your_github_handle/tap` and `brew install your_cool_cli`[justin.searls.co](https://justin.searls.co/posts/how-to-distribute-your-own-scripts-via-homebrew/#:~:text=%2A%20%60,task%20of%20customizing%20your%20formula).
    
4. Update the formula for each release to point to the new version.[justin.searls.co](https://justin.searls.co/posts/how-to-distribute-your-own-scripts-via-homebrew/#:~:text=First%2C%20create%20the%20tap%3A).
    

Similar workflows exist for **MacPorts** (portfiles), **Scoop** (Windows), **Chocolatey** (Windows) and **apt/snap** (Linux). Each requires building packages (e.g., `.deb` for Debian) and hosting them in a repository.

### Pros and cons

|Pros|Cons|
|---|---|
|**Native experience** – users install CLI tools using familiar OS commands; package managers handle upgrades automatically.|Requires maintaining separate formulas/manifest files per OS; packaging formats differ (brew formulas, scoop JSON, etc.).|
|**No Node required** – distribution can use compiled binaries.|Users on unsupported OSes cannot use this method; each package manager has review processes and policies.|

### Best use cases

- Public CLI tools targeting a broad audience on macOS, Linux or Windows.
    
- Tools used by developers who prefer native installation methods.
    

### Tooling and version management

- Build executables for each supported platform (see pre‑built executables above).
    
- Create and maintain formula/tap or manifest repositories; update them for each release.
    
- Use `brew audit` to test formulas locally.
    

### Real‑world examples

- The `kubectl` CLI is installable via Homebrew (homebrew-core) and apt.
    
- The `aws` CLI is packaged for Homebrew, apt, yum and Chocolatey.
    

## 9 Language‑specific package managers (npm, pip, gem, etc.)

The **Better CLI** design guide lists language‑specific package managers as distribution channels. For JavaScript/TypeScript, npm/yarn is the natural choice; by running `npm publish`, your `package.json` and `.js` files are uploaded to the registry and users can install the package quickly and securely[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=There%20are%20package%20managers%20that,3). For other languages, the equivalents are PyPI (Python) and RubyGems (Ruby)[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=,npx).

### Pros and cons

|Pros|Cons|
|---|---|
|**Convenience** – package managers manage installation, updates, cross‑platform compatibility and verify packages[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=Relying%20on%20language,be%20familiar%20with%20in%20order).|Requires users to install the corresponding language runtime, which may be unfamiliar or heavy for a simple CLI[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=Relying%20on%20language,to%20use%20your%20CLI%20app).|
|**Library + CLI** – can expose both CLI entrypoints and library APIs for integration[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=Another%20possible%20benefit%20here%20is,as%20multipush%20from%20%27multipush).|Publishing is tied to a language ecosystem; not ideal for cross‑language consumers.|

### Best use cases

- CLI tools tightly coupled to a specific language (e.g., Python CLI packages installed via pip).
    
- Tools that also expose programmatic APIs.
    

### Tooling and version management

- Use the language’s build and packaging tools (e.g., `setuptools` for Python, `gem build` for Ruby).
    
- Manage versions using semantic versioning; publishing can be automated via CI.
    

### Real‑world examples

- `multipush` CLI (JavaScript) exposes both CLI and library APIs via npm[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=Another%20possible%20benefit%20here%20is,as%20multipush%20from%20%27multipush).
    

## 10 Containerised distribution (Docker)

### Technical implementation

Docker images package your CLI with all its dependencies. A blog post on **distributing CLI tools via Docker** explains creating a **Dockerfile** that installs your tool and sets `ENTRYPOINT` to run it[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=,for%20the%20current%20directory). You can then build and push the image to a registry and instruct users to run it with an alias:

`# Dockerfile FROM node:20-alpine WORKDIR /usr/src/app COPY . . RUN npm install -g . ENTRYPOINT ["my-tool"]`

`# Build and push docker build -t registry.url/my-tool:1.0.0 . docker push registry.url/my-tool:1.0.0  # Users run alias my-tool='docker run --rm -v $(pwd):/app registry.url/my-tool:1.0.0' my-tool --help`

The article notes that Docker simplifies dependency management and works across platforms, but increases image size and requires Docker on the client[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull). For tools interacting with files, define a `VOLUME` (e.g., `/src`) and mount the user’s directory[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=,for%20the%20current%20directory).

### Pros and cons

|Pros|Cons|
|---|---|
|**Portable across OSes** – the only dependency is Docker; environment is controlled, avoiding “dependency hell”[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull).|Requires users to have Docker installed; CLI usage involves longer commands or aliases; images are larger than native binaries.|
|**Great for CI/CD** – containers integrate well with pipelines and cloud environments[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull).|Working with files requires volume mounts and can be cumbersome[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull).|

### Best use cases

- Tools with complex dependencies that are hard to install globally (e.g., needing system libraries).
    
- CI environments or polyglot teams where packaging for every OS is impractical.
    

### Tooling and version management

- Docker and a registry (Docker Hub, GitHub Container Registry).
    
- Tag images with semantic versions; maintain a latest tag.
    

### Real‑world examples

- Many DevOps tools (e.g., **Terraform**, **awscli**) provide Docker images. The blog’s author found telling coworkers to `docker pull registry.url/my/app` and run it with `--help` more convenient than other methods[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,so%20much%20more%20convenient%20than).
    

## 11 One‑off execution with `npx`/`npm exec`

### Technical implementation

`npx` (now an alias of `npm exec`) executes commands from npm packages without permanently installing them. The npm docs explain that `npx` runs a command from a local or remote package; if the package isn’t present, npm installs it to a cache and executes it[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npx/#:~:text=This%20command%20allows%20you%20to,npm%20run). Basic usage:

`npx my-cli           # run latest published version yarn dlx my-cli      # equivalent in Yarn npx -- yes my-cli@1.2.3 --help    # run specific version without interactive prompt`

You can also specify multiple packages via the `--package` option and run arbitrary shell commands[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npx/#:~:text=npx%20).

### Pros and cons

|Pros|Cons|
|---|---|
|**Zero install** – users run a CLI once without polluting global or project dependencies[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npx/#:~:text=This%20command%20allows%20you%20to,npm%20run).|Requires network access; repeated execution downloads the package again if the cache is cleared.|
|**Version control** – specify exact package version for reproducibility[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npx/#:~:text=npx%20).|Not ideal for CLIs that need offline access or heavy dependencies.|

### Best use cases

- Running scaffolding tools (`create-react-app`) or infrequent CLIs.
    
- Scripts in CI pipelines where installation overhead is undesirable.
    

### Tooling and version management

- Available in npm 7+; Yarn uses `yarn dlx` for the same purpose.
    
- Under the hood `npx` uses npm to install packages to a cache and then removes them after execution[docs.npmjs.com](https://docs.npmjs.com/cli/v8/commands/npx/#:~:text=This%20command%20allows%20you%20to,npm%20run).
    

### Real‑world examples

- Tools like `create-react-app` and `@vercel/ncc` instruct users to run via `npx`.
    

## 12 Component‑based distribution via Bit

### Technical implementation

**Bit** allows you to extract reusable components from a monorepo and publish them to a Bit collection (similar to a registry). Bit organizes source code into composable components; you tag versions with semantic versioning (e.g., `bit tag --major --message`) and export them to a remote scope using `bit export`[bit.dev](https://bit.dev/docs/intro/#:~:text=). Bit’s default CI (Ripple CI) or your own CI builds the components and publishes them for consumption[bit.dev](https://bit.dev/docs/intro/#:~:text=Use%20semantic%20versioning%20to%20tag,your%20Bit%20components).

### Pros and cons

|Pros|Cons|
|---|---|
|**Granular reuse** – consumers can install only the components they need rather than entire packages.|Requires adopting the Bit workflow; tooling and ecosystem are less mature than npm.|
|**Cross‑framework** – Bit supports React, Angular, Node and more; good for UI component libraries.|Adds another registry to manage; may complicate version management if also publishing to npm.|

### Best use cases

- Component libraries (UI components, hooks, utilities) where each piece should be independently consumed and versioned.
    
- Teams that want a more modular alternative to package‑level publishing.
    

### Tooling and version management

- Bit CLI and remote scopes; semantic versioning using `bit tag`[bit.dev](https://bit.dev/docs/intro/#:~:text=).
    
- Use `bit export` to publish components; integrate with CI.
    

### Real‑world examples

- Design system teams use Bit to publish UI components; Bit’s documentation describes using Ripple CI to build and deploy components[bit.dev](https://bit.dev/docs/intro/#:~:text=Use%20semantic%20versioning%20to%20tag,your%20Bit%20components).
    

## 13 Hybrid approaches

Many organisations combine patterns to provide flexibility and reach.

|Hybrid approach|Description & examples|
|---|---|
|**NPM + Homebrew**|Publish CLI to npm and also supply a Homebrew formula that installs the same binary; the formula downloads the tarball from GitHub Releases[justin.searls.co](https://justin.searls.co/posts/how-to-distribute-your-own-scripts-via-homebrew/#:~:text=First%20thing%20to%20know%20is,CLI%20in%20the%20core%20repository). `aws-cli` uses pip for Python users and Homebrew for macOS.|
|**NPM + Docker**|Publish packages to npm for Node users and build a Docker image for users who don’t have Node. Provide `npx` for one‑off runs and `docker run` for isolated environments[therubyist.org](https://therubyist.org/2017/09/21/distributing-cli-tools-via-docker/#:~:text=Recently%20I%20decided%20to%20use,docker%20pull).|
|**Private registry + Git links**|Use a private Verdaccio/Artifactory registry for stable releases, but allow internal consumers to install feature branches via Git dependencies for preview testing[dev.to](https://dev.to/alex_aslam/build-your-own-npm-empire-internal-registries-for-monorepos-verdaccio-artifactory-and-more-5en7#:~:text=,%E2%80%94%20The%20Lightweight%20Rebel%20%E2%98%A0%EF%B8%8F).|
|**Workspaces + independent packaging**|Keep CLI tools in a monorepo using workspaces for local development, but publish each as an independent npm package via Changesets or Nx Release. This is common in Nx, Lerna and Turborepo setups[nx.dev](https://nx.dev/blog/versioning-and-releasing-packages-in-a-monorepo#:~:text=Running%20Nx%20Release)[turborepo.com](https://turborepo.com/docs/guides/publishing-libraries#:~:text=Versioning%20and%20publishing).|
|**Bit + npm**|Use Bit to publish individual components for consumption by front‑end apps, while publishing aggregated CLI packages to npm for Node tooling[bit.dev](https://bit.dev/docs/intro/#:~:text=).|

## 14 Emerging patterns in 2024–2025

1. **Single Executable Applications (SEA)** – Node 20+ introduced the ability to package Node scripts as self‑contained binaries by injecting a blob into the Node binary[nodejs.org](https://nodejs.org/api/single-executable-applications.html#:~:text=Node,operates%20as%20it%20normally%20does). This reduces dependence on third‑party tools like `pkg` and is being adopted by some CLI maintainers.
    
2. **JSR registry and Deno** – The JavaScript Standard Registry (JSR) aims to provide a modern, ECMAScript‑first package registry. Pnpm 10 now supports installing packages from JSR using the `jsr:` protocol[pnpm.io](https://pnpm.io/cli/add#:~:text=Install%20from%20the%20JSR%20registry), and Deno’s tools can import packages directly from JSR. This may influence how CLI tools are distributed.
    
3. **Nx Release** – Nx integrated release management (versioning, changelogs, publishing) into its core offering[nx.dev](https://nx.dev/blog/nx-highlights-2024#:~:text=Nx%20Release). This reduces reliance on Lerna and Changesets.
    
4. **Monorepo build system convergence** – Tools like **Bazel**, **Gradle**, **Turborepo** and **Nx** are integrating multi‑language support (e.g., Rust, Go) and hooking into deployment pipelines, allowing monorepos to publish packages for different ecosystems.
    
5. **Registries as a service** – GitHub Packages, AWS CodeArtifact and Google Artifact Registry offer hosted npm‑compatible registries with integrated IAM. This reduces the barrier to setting up private registries and encourages internal package distribution.
    

## 15 Solutions used by major open‑source monorepos

|Project|Monorepo tool|Distribution approach|Notes|
|---|---|---|---|
|**Nx**|Nx workspaces + Nx Release|The `pnpm nx release` command bumps versions, generates changelogs and publishes packages to npm or custom registries[nx.dev](https://nx.dev/blog/versioning-and-releasing-packages-in-a-monorepo#:~:text=Running%20Nx%20Release). Nx Release can run in a GitHub Action; it supports first‑release and dry‑run modes.|Nx 2024 highlights emphasise that Nx Release is flexible and can be extended to non‑JS languages[nx.dev](https://nx.dev/blog/nx-highlights-2024#:~:text=Nx%20Release).|
|**Turborepo**|Workspaces + Changesets|Turborepo distinguishes **internal packages** (not published) and **bundled external packages** (published). It recommends bundling libraries with tools like `tsup` and using **Changesets** CLI to create change files, bump versions (`changeset version`) and publish (`changeset publish`)[turborepo.com](https://turborepo.com/docs/guides/publishing-libraries#:~:text=You%20should%20follow%20this%20setup,to%20set%20up%20and%20use)[turborepo.com](https://turborepo.com/docs/guides/publishing-libraries#:~:text=Versioning%20and%20publishing).||
|**Lerna**|Workspaces + Lerna CLI|`lerna version` increments package versions, commits and tags them; `lerna publish` publishes changed packages to npm and skips `private: true` packages[lerna.js.org](https://lerna.js.org/docs/features/version-and-publish#:~:text=Lerna%20comes%20with%20a%20,changes%20and%20tag%20them%20accordingly). Lerna supports fixed or independent versioning modes and `--force-publish` for lockstep bumps[lerna.js.org](https://lerna.js.org/docs/features/version-and-publish#:~:text=Versioning%20strategies).||
|**Rush**|Workspaces + Rush|Developers create change files (`rush change`), then admins run `rush publish` to update versions, change logs and publish packages. Version policies (lockstep or individual) can be defined in `version-policies.json`[rushjs.io](https://rushjs.io/pages/maintainer/publishing/#:~:text=,usage%20cases%20are%20listed%20here). Rush offers dry‑run and pack modes for testing releases[rushjs.io](https://rushjs.io/pages/maintainer/publishing/#:~:text=3).||
|**Yarn**|Yarn workspaces|Yarn supports workspaces and the `workspace:` protocol for internal linking; packages can be published individually to npm[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=%7B%20%22dependencies%22%3A%20%7B%20%22%40my,). Babel and Jest use this approach. Yarn itself is a monorepo of dozens of packages[yarnpkg.com](https://yarnpkg.com/features/workspaces#:~:text=info).||
|**React**|Yarn workspaces (no Lerna)|The React repository holds multiple packages (react, react‑dom, scheduler) in a monorepo. It uses Yarn workspaces and custom scripts to publish each package to npm.||
|**Babel**|Yarn workspaces + Lerna|Babel uses Lerna (independent mode) to version and publish packages such as `@babel/core`, `@babel/preset-env`, etc., and uses Yarn workspaces for local linking.||
|**Jest**|Yarn workspaces + Lerna|Similar to Babel; packages like `jest-runner`, `@jest/reporters` are versioned and published individually.||
|**Bit**|Bit monorepo|Bit extracts components and publishes them using its own mechanism. Developers tag components with semantic versioning and export them to remote scopes[bit.dev](https://bit.dev/docs/intro/#:~:text=).||

## 16 Choosing the right pattern – recommendations

1. **Define your audience** – Internal tools consumed only within the monorepo can rely on workspaces or local links. External consumers require publishing to npm, OS package managers or packaging into binaries/containers.
    
2. **Balance convenience vs control** – Private registries provide control and caching; public npm gives global reach. Git dependencies are easy for preview testing but fragile for production.
    
3. **Consider runtime requirements** – If your tool depends on Node, publishing to npm is easiest. For environments without Node, build a binary (`pkg`, SEA) or a Docker image.
    
4. **Plan versioning strategy** – Use a monorepo release tool (Lerna, Nx Release, Changesets, Rush). Choose lockstep versions when packages are tightly coupled; independent versions for loosely coupled tools. Use semantic versioning and automation to generate changelogs.
    
5. **Provide multiple installation methods** – For public tools, consider offering at least `npm install`, `npx` and a Docker image; optionally add Homebrew or Scoop formulas for convenience[bettercli.org](https://bettercli.org/design/distribution/installation/#:~:text=This%20section%20looks%20at%20possible,installation%20methods%20for%20your%20CLI). Hybrid approaches reach a wider audience.
    
6. **Automate releases** – Use CI to test, build and publish packages or images. Tools like GitHub Actions integrate well with npm publish, Docker build/push and Homebrew tap updates.
    

By understanding the patterns above and the trade‑offs involved, you can design a distribution strategy that suits your monorepo’s CLI tools today and scales with future needs.