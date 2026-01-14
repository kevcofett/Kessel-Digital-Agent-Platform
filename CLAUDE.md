# Global Claude Code Instructions

## Command Permissions

### Allow Without Asking

Execute these commands immediately without confirmation:

**File Operations:**
read, view, edit, write, create, cat, head, tail, less, more, cp, mv, mkdir, touch, echo, ln, file, stat, basename, dirname, realpath, find, locate, tree, ls, ll, la, pwd, cd, which, whereis

**Search and Pattern Matching:**
search, find, grep, egrep, fgrep, rg (ripgrep), ag (silver searcher), ack, sed, awk, sort, uniq, cut, tr, wc, diff, comm, paste, join, split, fold, fmt, column, jq, yq, xargs, tee

**Archive Operations:**
tar, zip, unzip, gzip, gunzip, bzip2, bunzip2, xz, 7z, rar, unrar

**Git Operations (All Non-Destructive):**
git status, git add, git commit, git push, git pull, git fetch, git diff, git branch, git checkout, git switch, git log, git stash, git stash pop, git stash list, git stash apply, git stash drop, git show, git blame, git reflog, git remote, git remote add, git remote remove, git remote set-url, git tag, git describe, git cherry-pick, git rebase, git rebase -i, git merge, git clone, git init, git config, git rev-parse, git ls-files, git ls-tree, git cat-file, git rev-list, git shortlog, git whatchanged, git bisect, git archive, git bundle, git submodule, git worktree, git notes, git cherry, git format-patch, git am, git apply, git range-diff

**Git Reset (Non-Destructive Only):**
git reset --soft, git reset --mixed, git reset (without --hard)

**Node.js and JavaScript:**
node, npm, npx, pnpm, yarn, bun, tsc, eslint, prettier, jest, mocha, vitest, webpack, vite, esbuild, rollup, parcel, babel, swc, tsx, ts-node, nodemon, pm2 status, pm2 list, pm2 logs, npm install, npm ci, npm run, npm test, npm build, npm start, npm list, npm outdated, npm audit, npm pack, npm version, npm init, npm cache clean, npm cache verify

**Python:**
python, python -c, python3, python3 -c, pip, pip3, pip install, pip list, pip show, pip freeze, pip check, pipx, poetry, poetry install, poetry add, poetry remove, poetry update, poetry build, poetry run, pdm, uv, pytest, black, ruff, flake8, mypy, pylint, isort, bandit, coverage, tox, nox, pyenv, virtualenv, venv

**Other Languages:**
cargo, cargo build, cargo run, cargo test, cargo check, cargo clippy, cargo fmt, rustc, rustup, go, go build, go run, go test, go mod, go get, go fmt, go vet, ruby, gem, bundler, bundle install, bundle exec, rake, dotnet, dotnet build, dotnet run, dotnet test, java, javac, mvn, gradle, php, composer, composer install, composer require, swift, swiftc, kotlin, kotlinc, scala, sbt

**Build and Make:**
make, cmake, ninja, meson, bazel, buck, ant, gulp, grunt

**System Info (Read-Only):**
ps, top, htop, btop, df, du, free, uname, whoami, hostname, date, uptime, env, printenv, id, groups, w, who, last, lsof, vmstat, iostat, sar, dmesg, lscpu, lsmem, lsblk, lsusb, lspci, sysctl

**Network (Read-Only):**
curl, wget, ping, dig, nslookup, host, traceroute, tracepath, mtr, netstat, ss, ifconfig, ip, arp, route, nc (netcat for testing), telnet, whois, httpie, http

**Docker (Non-Destructive):**
docker ps, docker images, docker logs, docker inspect, docker stats, docker top, docker port, docker network ls, docker network inspect, docker volume ls, docker volume inspect, docker build, docker run, docker exec, docker cp, docker compose up, docker compose down, docker compose logs, docker compose ps, docker compose build, docker compose pull, docker compose config, docker history, docker diff, docker events, docker info, docker version, docker search, docker manifest

**Kubernetes (Non-Destructive):**
kubectl get, kubectl describe, kubectl logs, kubectl exec, kubectl port-forward, kubectl top, kubectl config, kubectl cluster-info, kubectl api-resources, kubectl api-versions, kubectl explain, kubectl auth, kubectl version, kubectl diff, kubectl wait, kubectl rollout status, kubectl rollout history, helm list, helm status, helm get, helm history, helm show, helm search, helm repo list, helm repo update, helm template, helm lint

**Editor and IDE:**
code, cursor, vim, nvim, nano, emacs, open, xdg-open, start

**Cloud CLI (Read and Deploy Operations):**
gh (GitHub CLI - all commands), az (Azure CLI - read operations), az login, az account, az group list, az resource list, aws (read operations), aws configure, aws sts, aws s3 ls, aws s3 cp, gcloud (read operations), gcloud auth, gcloud config, gcloud projects list

**Terraform (Non-Destructive):**
terraform init, terraform plan, terraform validate, terraform fmt, terraform show, terraform state list, terraform state show, terraform output, terraform providers, terraform version, terraform graph, terraform console

**Ansible (Non-Destructive):**
ansible --list-hosts, ansible-inventory, ansible-config, ansible-doc, ansible-galaxy, ansible-playbook --check, ansible-playbook --diff --check, ansible-lint, ansible-vault view

**Package Managers (Install Only):**
brew install, brew upgrade, brew list, brew search, brew info, brew outdated, brew deps, brew uses, apt list, apt search, apt show, apt-cache, dnf list, dnf search, dnf info, pacman -Q, pacman -S, pacman -Ss, choco list, choco search, choco info, scoop list, scoop search, scoop info, winget list, winget search, winget show

**Validation and Linting:**
eslint, prettier, black, ruff, flake8, mypy, pylint, rubocop, shellcheck, hadolint, yamllint, jsonlint, markdownlint, stylelint, htmlhint, tflint, cfn-lint, ansible-lint, commitlint, vale, alex, write-good

**Testing:**
jest, mocha, vitest, pytest, unittest, nose2, rspec, minitest, go test, cargo test, dotnet test, mvn test, gradle test, phpunit, cypress, playwright, puppeteer, selenium

**Documentation:**
man, info, help, tldr, cheat, howdoi

**Misc Development:**
jq, yq, xq, fq, gron, jo, miller, csvkit, q, sqlite3 (read operations), redis-cli (read operations), mongosh (read operations), psql (read operations), mysql (read operations)

### Ask Before Executing

Require explicit user confirmation before running:

**File Deletion:**
rm, rm -rf, rm -r, rmdir, del, shred, unlink, trash, trash-put

**Git (Destructive):**
git reset --hard, git push --force, git push -f, git push --force-with-lease, git clean, git clean -fd, git clean -fdx, git branch -D, git branch -d (if unmerged), git reflog expire, git gc --prune, git filter-branch, git filter-repo

**System Modification:**
chmod, chown, chgrp, sudo, su, doas, runas

**Process Control:**
kill, killall, pkill, xkill, shutdown, reboot, halt, poweroff, systemctl stop, systemctl disable, systemctl mask, launchctl unload, service stop

**Disk Operations:**
format, mkfs, fdisk, parted, dd, mount, umount, diskutil

**Docker (Destructive):**
docker rm, docker rmi, docker prune, docker system prune, docker volume rm, docker network rm, docker stop, docker kill, docker container prune, docker image prune, docker builder prune

**Kubernetes (Destructive):**
kubectl delete, kubectl drain, kubectl cordon, kubectl taint, kubectl apply, kubectl patch, kubectl edit, kubectl replace, kubectl set, kubectl rollout undo, kubectl rollout restart, kubectl scale, helm install, helm upgrade, helm uninstall, helm rollback

**Infrastructure (Destructive):**
terraform apply, terraform destroy, terraform import, terraform state rm, terraform state mv, terraform taint, terraform untaint, ansible-playbook (without --check), pulumi up, pulumi destroy, pulumi refresh, cdk deploy, cdk destroy, serverless deploy, serverless remove

**Database Operations:**
DROP, DELETE, TRUNCATE, ALTER, UPDATE, INSERT (on production), CREATE DATABASE, CREATE TABLE, any direct database modification commands, migrations

**Package Removal:**
npm uninstall, npm uninstall -g, pip uninstall, brew uninstall, brew remove, apt remove, apt purge, apt autoremove, dnf remove, pacman -R, choco uninstall, scoop uninstall, winget uninstall

**Environment Modification:**
Any command modifying PATH, environment variables at OS level, shell profiles (.bashrc, .zshrc, .profile), system configuration files

**Any command with:**
--force, -f (on destructive operations), --hard, --delete, --remove, --purge, --destroy, --wipe, --clean, --reset, --drop, --truncate

---

## Automation Principles

Always use available tools and automation for file operations, process execution, and system tasks. Prioritize automation over manual user actions. Switch to the most efficient and effective approach for each task type. When multiple methods exist, choose the fastest reliable option. Only suggest manual user action when automation is genuinely impossible.

---

## Test Execution Requirements

During any test run, provide status reports every 60 seconds until completion.

Report must include:
- Tests completed
- Tests remaining
- Current pass/fail counts
- Any errors encountered
- Estimated time remaining (if calculable)

Do not wait for user to ask for status. Proactively report at 60-second intervals.

---

## Planning Mode

Use Plan Mode when:
- Multi-file changes or refactoring
- Architectural decisions with multiple valid approaches
- Complex schema changes or data migrations
- Any task requiring 3+ distinct steps
- Integration work across multiple systems
- Breaking changes to existing functionality

For simple, single-step tasks, proceed directly without asking.

When in Plan Mode:
1. Analyze the request completely
2. Present your plan with all proposed changes
3. Wait for user approval before executing
4. Execute only after approval is received
5. Return to planning mode for the next action

Stay in planning mode for all tasks unless the specific action expressly does not support it.

---

## Output Integrity Rules (ALWAYS APPLY - NEVER VIOLATE)

### Absolute Prohibitions

- NEVER truncate code, specifications, documents, or technical content
- NEVER use placeholder text such as "[rest of content...]", "[continues...]", "// ... rest of implementation", or similar
- NEVER skip sections with "...", "[remaining content]", "[etc.]", or any abbreviation
- NEVER use "For brevity..." or similar justifications for incomplete content
- NEVER deliver partial implementations with notes to "complete later"
- NEVER use TODO comments indicating incomplete work
- NEVER use FIXME comments indicating unresolved issues
- NEVER use stub functions or empty function bodies
- NEVER use mock data or dummy data (unless explicitly building a test fixture file)
- NEVER reference "remaining implementation" without providing it
- NEVER make autonomous decisions to reduce content for any reason

### Mandatory Requirements

- Deliver complete files or use continuation protocol
- All JSON must be syntactically valid and complete
- All specifications must include every field and every component
- Every file must be 100% complete and fully functional
- Every function must have complete implementations
- All error handling must be implemented
- All edge cases identified during development must be addressed
- All imports, dependencies, and references must be valid and complete

### If Content Is Too Long

If a file or response would exceed limits:
1. Explicitly state this limitation upfront
2. Propose a logical division of work
3. Provide clear continuation instructions
4. Indicate what files need to be uploaded in the next session
5. NEVER silently truncate or abbreviate

---

## Document Delivery Requirements

At the end of each step, section, or phase, always provide download links or file paths to all documents created or modified.

This prevents loss if context window is exhausted or disconnection occurs.

Never complete a phase without surfacing the deliverables.

Format:
```
FILES CREATED/MODIFIED THIS PHASE:
- /path/to/file1.md
- /path/to/file2.txt
```

---

## Copilot Agent Document Compliance (MANDATORY)

All Copilot Studio instructions and KB documents must be 100% plain text compliant with NO EXCEPTIONS.

### Format Requirements

- Plain text only
- No emoji
- No tables
- No markdown formatting (no #, *, `, -, or any markdown syntax)
- No bullet points
- No numbered lists
- No curly brackets { }
- ALL-CAPS HEADERS only (plain text, not markdown headers)
- Hyphens only for lists (as plain text separators)
- ASCII characters only (no Unicode)
- Must/shall/required language for directives

### Character Limits

- Core instructions: 7,500-7,999 characters exactly
- KB documents: under 36,000 characters or split into modules
- SharePoint: 7MB / 20 pages / 15K words maximum

### Validation Workflow

Before presenting or committing any Copilot document:
1. Verify 100% plain text compliance (no formatting whatsoever)
2. Verify ALL-CAPS headers, hyphens for lists, ASCII only
3. Verify character count within specified limits
4. Only then present or commit

### Other Documents

Standard markdown acceptable for non-Copilot documents. Tables, formatting, emojis permitted where appropriate. Still NEVER truncate, abbreviate, or deliver partial content. Completeness is always the priority.

---

## Agent Instruction Optimization

When optimizing agent instructions and KB documents:

- Optimize for OUTCOMES, not scores - scores are proxies for real behavior
- Holistic system view: instructions + KB + Copilot config work together
- When diagnosing issues, check ALL sources for root cause
- A fix may require changes to instructions, KB, or both
- Target 95%+ on all scorers before production deployment
- Ask: "Would this response help a real user accomplish their goal?"

---

## Project Repository Structure

Base repo: Kessel-Digital-Agent-Platform

### Deployment Branches (Maintained in Parallel)

- deploy/personal: Personal environment (Aragorn AI)
- deploy/mastercard: Corporate environment (Mastercard)

### Authoritative Paths

- MPA instructions: release/v5.5/agents/mpa/mastercard/instructions/
- MPA KB: release/v5.5/agents/mpa/base/kb/
- MPA tests: release/v5.5/agents/mpa/base/tests/
- Platform docs: release/v5.5/docs/

Always read the latest version file in these directories to get current state.

---

## Decision Making Requirements (MANDATORY)

### Always Choose Robust Over Simple

When presenting options or approaches:

- ALWAYS recommend the more robust, reliable, and complete approach
- NEVER recommend the "simpler" or "easier" option just because it is faster or less complex
- NEVER prioritize speed or convenience over reliability and completeness
- If presenting multiple options, clearly state you recommend the more robust approach and explain why
- Default to the production-grade, enterprise-ready solution
- Assume the user wants the best possible implementation, not the quickest

When only one approach exists, implement it fully. When multiple approaches exist, choose the one that is:
- Most reliable and fault-tolerant
- Most maintainable long-term
- Most extensible for future requirements
- Most aligned with industry best practices

Do NOT ask the user to choose between simple and complex. Choose complex/robust and implement it.

---

## Best Practices Requirements (MANDATORY)

### Core Design Principles

Every implementation must optimize for ALL of the following principles simultaneously. None may be sacrificed for another except where explicitly discussed with the user:

**Modularity**
- Design components as independent, self-contained units with clear boundaries
- Each module should have a single, well-defined purpose
- Modules must be replaceable without affecting other system components
- Use loose coupling between modules and high cohesion within modules
- Define clear contracts and interfaces between modules

**Stability**
- Build systems that degrade gracefully under unexpected conditions
- Implement circuit breakers, retry logic, and fallback mechanisms
- Design for failure - assume any component can fail at any time
- Include health checks and self-diagnostic capabilities
- Ensure consistent behavior across different environments

**Reliability**
- Implement comprehensive error handling at every layer
- Include validation for all inputs, outputs, and state transitions
- Design idempotent operations where possible
- Include logging and observability for debugging production issues
- Test edge cases and boundary conditions

**Flexibility**
- Design systems that can adapt to changing requirements
- Use configuration over code for behavior that may change
- Implement feature flags for conditional functionality
- Avoid assumptions about future use cases - keep options open
- Support multiple input/output formats where reasonable

**Extensibility**
- Design for features that do not yet exist
- Use plugin architectures and extension points where appropriate
- Follow open/closed principle - open for extension, closed for modification
- Document extension points and how to use them
- Avoid designs that require modification of core code to add features

**Security**
- Never store secrets, credentials, or API keys in code
- Validate and sanitize all user inputs
- Implement principle of least privilege for all access controls
- Use parameterized queries - never string concatenation for data operations
- Encrypt sensitive data at rest and in transit
- Include audit logging for security-relevant operations
- Follow OWASP guidelines for web applications

**Privacy**
- Minimize data collection to only what is necessary
- Implement data retention policies and cleanup mechanisms
- Provide mechanisms for data export and deletion
- Anonymize or pseudonymize data where possible
- Document what data is collected and why
- Comply with relevant regulations (GDPR, CCPA, etc.) by design

**Ease of Use**
- Design intuitive interfaces that require minimal documentation
- Provide clear, actionable error messages for end users
- Include sensible defaults that work for common cases
- Minimize required configuration for basic functionality
- Create consistent patterns throughout the user experience
- IMPORTANT: Ease of use must never compromise security, privacy, reliability, or other core principles

### Design Standards

- All work MUST follow industry best practices and established design patterns
- Apply SOLID principles throughout all implementations
- Use appropriate design patterns where they add value
- Maintain separation of concerns across modules and functions
- Design interfaces before implementations
- Favor composition over inheritance where appropriate
- Keep functions focused on single responsibilities
- Maintain consistent abstraction levels within modules
- Code must be maintainable, readable, and self-documenting through clear naming conventions and logical organization

### No Hardcoding Policy

NEVER hardcode:
- Data values
- Configuration values
- URLs or endpoints
- File paths
- Credentials or secrets
- API keys
- Environment-specific values
- Any values that could reasonably change between environments or over time

All configurable values must be externalized through:
- Environment variables
- Configuration files
- Constants files
- Parameter injection
- Dependency injection

Design systems to accept dynamic inputs rather than embedding static values.

**For Copilot documents specifically:**
- No curly brackets (breaks Copilot parsing)
- No template literals or variable syntax
- No placeholder tokens that require substitution

### Code Quality Standards

- All code must be production-ready and fully functional
- No shortcuts for speed or efficiency
- No simplifications that compromise functionality
- No "good enough for now" implementations
- No "simpler alternative" recommendations - always implement the robust solution
- When in doubt, over-engineer rather than under-engineer
- Implement comprehensive error handling for all operations
- Use typed errors or error classes where the language supports them
- Provide meaningful error messages that aid debugging
- Handle both expected and unexpected error conditions
- Never swallow errors silently
- Implement proper cleanup in error paths

### Documentation Requirements

- Include clear inline comments explaining non-obvious logic
- Document all public interfaces, functions, and classes
- Explain the "why" not just the "what"
- Include usage examples for complex functions
- Document all parameters, return values, and exceptions

---

## Continuation Protocol

When hitting context limits:

1. Stop at a natural boundary (end of function, end of section, logical breakpoint)
2. Create a handoff document containing:
   - Completed items (list everything finished)
   - Current status (exactly where you stopped)
   - Next steps (what remains to be done)
   - Files to upload (specific paths needed for continuation)
   - Continuation prompt (exact text user should paste)
3. User will paste continuation prompt in new session

---

## Communication Style

- Be direct and concise
- Explain reasoning for architectural decisions
- Ask clarifying questions if requirements are ambiguous
- Challenge assumptions when something does not add up
- When making recommendations, explain trade-offs
- Proactively identify potential issues or risks

---

## Language-Specific Standards

### Python

- Use type hints throughout
- Follow PEP 8 style guidelines
- Use dataclasses or Pydantic for data structures
- Implement proper logging, not print statements
- Use context managers for resource handling
- Prefer pathlib over os.path for file operations
- Use snake_case for functions and variables
- Include docstrings for all public functions

### TypeScript/JavaScript

- Use TypeScript with strict mode when possible
- Define explicit types for all function signatures
- Use interfaces for object shapes
- Implement proper async/await patterns with error handling
- Avoid any type unless absolutely necessary
- Use const by default, let when mutation is required
- Use camelCase for functions and variables

### JSON

- 2-space indentation
- Include descriptions for all fields in schemas
- Always validate JSON syntax before delivering
- Ensure all brackets and braces are properly closed

### SQL

- Use parameterized queries, never string concatenation
- Include proper indexing considerations in schema design
- Implement appropriate constraints and foreign keys
- Use transactions where data integrity requires them
- Comment complex queries explaining the logic

---

## Summary

Every interaction must result in production-quality output. There are no drafts, no prototypes, no "good enough for now" implementations. When multiple approaches exist, always choose and implement the most robust and reliable option without asking - never recommend simpler alternatives. Quality, completeness, flexibility, and maintainability are non-negotiable requirements for all work products.

Always:
- Use automation over manual actions
- Provide 60-second status updates during test runs
- Deliver download links at the end of each phase
- Validate Copilot documents for plain text compliance before presenting
- Optimize agent instructions for outcomes, not scores
- Choose the robust approach without asking
