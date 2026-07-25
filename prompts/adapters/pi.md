# Pi Coding Agent adapter

Use this guide only when the current host is Pi Coding Agent. It adapts the
local OKF contract, Wiki Soul protocol, and every hook contract in the
framework source to Pi's self-extensible runtime.

Current official Pi documentation and the installed Pi package are
authoritative for Pi-specific behavior. Pi evolves quickly. If the installed
API or current official documentation conflicts with this guide, stop before
changing Pi configuration, report the exact conflict, and leave the affected
hook unregistered.

## Core model

Pi extensions are the native hook mechanism. They are TypeScript modules that
can subscribe to lifecycle events, inject model-visible context, register tools
and commands, and participate in session state.

Do not assume that a separate hook framework, hook package, or `hooks.json`
exists. None is required to bootstrap Wiki Soul:

1. Pi's built-in `read`, `write`, `edit`, and `bash` tools are sufficient to
   inspect the installed API and generate a candidate extension.
2. A candidate can be loaded explicitly with Pi's documented `--extension` or
   `-e` option before any persistent registration exists.
3. After tests pass, Pi can register the immutable candidate as an absolute
   extension path in its user-global settings.
4. The running Pi process then uses `/reload`, or a fresh process, to load the
   new extension.

Pi may therefore extend itself, but it MUST NOT edit Pi's installed package.
Any loaded Wiki Soul deployment is a pre-existing installation conflict.

## Authority and scope

1. Follow the main installer, installed local OKF contract, Wiki Soul protocol,
   and every Markdown contract under `../hooks/`.
2. Install only user-global Pi integration. Do not add `.pi/`, `.agents/`, or
   instruction files to a client project.
3. Do not install a Pi package, npm dependency, daemon, database, or service.
4. Do not modify Pi source, its installed package, third-party packages, or
   unrelated extensions.
5. Do not inspect, import, modify, disable, or delete Pi sessions, credentials,
   or an existing memory product.
6. Use file mode for critical instructions when Pi exposes its documented
   user-global context file. Do not duplicate those rules in the extension.
7. Generate the smallest dependency-free extension supported by the installed
   Pi version and operating system.

Pi extensions execute with the same operating-system permissions as Pi.
Project trust controls project resource loading; it is not a sandbox. Keep the
generated extension narrow even when the current account could do more.

## Verify the installed Pi contract

Before proposing changes:

1. Detect the exact Pi executable, package name, version, operating system,
   actual user home, and effective Pi agent directory. Do not assume a package
   fork uses the default `.pi` configuration directory.
2. Read the documentation shipped with that installed package for:
   - context files;
   - settings and extension paths;
   - extension lifecycle events;
   - session entries and compaction;
   - project trust;
   - reload behavior;
   - security and execution permissions.
3. Cross-check current official Pi documentation from the package's official
source.
4. Prove the installed version provides documented equivalents for the
   behavior this adapter needs:
   - a user-global context file;
   - user-global extension registration by exact local path;
   - an event before the first model request in a session;
   - session start, resume, fork, reload, compaction, and tree-navigation
     lifecycle visibility as applicable;
   - a persistent custom model-context message or an equally bounded native
     context mechanism;
   - compaction-aware, read-only session-entry metadata;
   - runtime reload or a clean restart path.
5. If a required capability is absent, use only a current documented
   equivalent that passes the common contract. Otherwise leave
   `memory-injection` unsupported. Do not upgrade Pi or install a third-party
   hook framework as part of Wiki Soul installation.

At the time this adapter was written, Pi 0.80.10 exposed:

- `~/.pi/agent/AGENTS.md` as the documented global context file;
- `~/.pi/agent/settings.json` for global resource paths;
- global extensions loaded before project trust is resolved;
- `session_start`, `session_compact`, `session_tree`,
  `before_agent_start`, and `context` extension events;
- `pi.sendMessage()` and `CustomMessageEntry` for persistent model-visible
  extension messages;
- `ctx.sessionManager.buildContextEntries()` for the active,
  compaction-aware branch;
- `/reload` for extensions, context files, skills, prompts, and themes.

That version note is evidence, not a frozen schema.

## Decision procedure

Choose the integration path from evidence:

1. If a marked Wiki Soul extension, instruction block, registration, or
   deployment already exists, stop and report a pre-existing installation
   conflict.
2. If no Wiki Soul extension is registered but explicit `-e` loading and the
   required native lifecycle API exist, use the bootstrap sequence in this
   adapter. A missing hook framework is not a blocker.
3. If another active memory extension injects equivalent indexes or operating
   rules, stop the memory-injection change and report the collision. Do not
   chain two memory systems silently.
4. If only a third-party hook framework exposes relevant events, do not adopt
   it merely because it is installed. Use it only if the user explicitly
   chooses that dependency and the framework contract is updated to certify
   it; ordinary Wiki Soul installation remains package-free.
5. If the installed Pi lacks a documented safe lifecycle or exact
   user-global extension registration, install only the memory core and global
   instructions, report automatic injection as unsupported, and name the
   minimum Pi capability or upgrade needed.

## Inspect without modifying

Inspect:

- the active user-global context-file candidates and their precedence;
- Pi's user-global settings;
- auto-discovered user-global extensions;
- extension paths and packages enabled by user settings;
- project-local extensions visible to the current trusted project, only for
  collision detection;
- the installed Wiki Soul memory root, OKF contract, and protocol;
- generated assets under `<home>/.agents/hooks/pi/`;
- available native runtimes and exact command semantics.

Build an effective extension inventory rather than relying on filenames alone.
Look for an active extension or instruction block that already injects the
same memory, indexes, or equivalent persistent context. A collision stops only
the affected hook installation.

Do not read:

- Pi authentication files;
- session JSONL contents;
- user prompts, tool results, or transcript exports;
- existing memory contents from Pi or a third-party memory product;
- project files unrelated to identity or collision detection.

A file such as `<home>/.pi/hooks.json` may belong to an optional third-party
extension. It is not a Wiki Soul registration surface unless the installed
Pi documentation and active extension inventory prove that it owns the exact
required lifecycle. Never create, edit, or depend on that file merely because
it exists.

## Critical instructions

Use `file` instruction mode.

For the standard official distribution, install the main installer's exact
managed block in:

```text
<home>/.pi/agent/AGENTS.md
```

If the installed distribution documents another agent directory or global
context-file precedence, select the one file it actually loads. Preserve all
unrelated content. If both `AGENTS.md` and a fallback such as `CLAUDE.md`
exist, prove which file wins; do not install duplicate blocks.

Verify the managed block appears exactly once in Pi's assembled context files
and effective system prompt. Pi's `--no-context-files` option explicitly
disables this surface. If the user's normal launch mode disables context files,
report critical instructions as not loaded and the installation as incomplete;
do not silently switch to injected instruction mode.

The memory extension MUST inject only the common reference-data envelope in
file mode. It MUST NOT append a second copy of the operating rules to the
system prompt.

## Bootstrap and self-modification

No preinstalled extension is required.

Use this sequence:

1. Generate a candidate in a new operating-system temporary directory, outside
   memory, Pi's active extensions, and all client projects.
2. Keep host-neutral payload construction and project-identity logic testable
   without starting a model request.
3. Use only Pi's documented extension API and Node.js built-ins already
   available to the installed Pi runtime.
4. Load the candidate explicitly with the installed Pi executable and
   `--extension` or `-e`. This is candidate testing, not registration.
5. Run the complete common and Pi-specific isolated suites.
6. Promote the tested source to:

   ```text
   <home>/.agents/hooks/pi/<hook-id>/revisions/<digest>/
   ```

7. Run one final load and functional test from the promoted production path.
8. Only then add the exact absolute production entrypoint to Pi's documented
   user-global `extensions` setting.
9. Use `/reload` in interactive mode or start a fresh Pi process in other
   modes.

The installer itself may be running inside the Pi process being changed. It
must not pretend that a just-written extension is already loaded. If no
currently loaded extension exposes a documented safe reload command callable
by the model, return one exact user action: type `/reload`, then continue live
verification. Do not generate a second bootstrap extension solely to automate
that action.

## Pi lifecycle mapping

Derive the smallest conforming mapping from the installed API. For current Pi
versions, prefer a persistent custom message owned by a stable
`customType`, such as `wiki-soul-memory-injection-v1`.

The generated extension should:

1. Build a fresh bounded payload from the authorized index files at a new
   logical context.
2. Append it as one hidden, model-visible custom message without triggering a
   model turn.
3. Store only non-sensitive ownership metadata in the custom message's
   `details`, such as hook ID, adapter revision, project ID, and deployment
   digest. Payload content stays in `content`.
4. On resume, reload, or tree navigation, inspect only entry type,
   `customType`, and owned metadata in the active compaction-aware branch. Do
   not inspect any user, assistant, tool, or unrelated custom-message content.
5. Inject when the active logical context has no current owned message, or when
   a new lifecycle context requires a fresh index snapshot.
6. After compaction, append one fresh message after the compaction boundary.
7. If fresh lifecycle injection leaves an older owned message visible in the
   rebuilt context, use the `context` event only to remove older Wiki Soul
   messages and keep the newest owned one. The `context` handler must not read
   files, rebuild payloads, inspect unrelated message contents, or inject a
   new message on ordinary tool turns.
8. Use `before_agent_start` only as a first-request safety net when the
   installed `session_start` path cannot safely append the message. Ignore
   `event.prompt` and `event.images`.

Map current native lifecycle classes as follows when available:

| Logical context | Pi event or state |
|---|---|
| Initial session | `session_start` with `startup`, then first model request |
| New session | `session_start` with `new` |
| Resume | `session_start` with `resume`; refresh only when restoration requires it |
| Fork or clone | `session_start` with `fork` |
| Runtime bootstrap/reload | `session_start` with `reload` |
| Post-compaction | `session_compact`, after the compaction entry exists |
| Tree/context branch change | `session_tree`, with active-branch ownership check |

Do not inject from `tool_call`, `tool_result`, `turn_start`, or
`before_provider_request`. Do not rebuild the payload on every `context` event.
Ordinary tool loops must keep one visible owned envelope and perform no memory
file reads.

### Subagents

Pi core intentionally does not prescribe one subagent implementation.

- A child launched as a normal Pi process with user-global resources enabled
  loads the global Wiki Soul extension and receives its own session
  injection.
- An installed third-party subagent extension or SDK integration may suppress
  global resources or construct an in-memory session differently.

Inventory every subagent mechanism actually enabled in the current Pi
environment. Prove each relevant class receives the extension and payload. Do
not patch a third-party subagent package. If a used class bypasses global
extensions and exposes no documented compatible hook, report that class as
unsupported and keep `live-verified: no`. When no subagent mechanism exists,
report the class as not applicable rather than inventing one.

## Project location

Treat `ctx.cwd`, host project metadata, session paths, and filesystem content
as untrusted inputs.

1. Use a Pi project ID only when current official documentation proves it is
   host-controlled, stable for the same work context, and valid under the common
   lowercase syntax.
2. Otherwise use a trusted workspace root supplied by Pi when available.
3. Otherwise use Pi's validated real absolute `ctx.cwd`.
4. Apply the common path normalization, slug, and hashing rules exactly.
5. Do not derive identity from a session filename, project setting, extension
   setting, prompt, or environment variable controlled by workspace content.
6. If multiple roots remain ambiguous or identity is unsafe, inject global
   memory plus the contract's concise project-routing diagnostic instead of
   guessing.

Project detection and identity require no subprocess and no project trust.

## Generate the extension

For `memory-injection`, use the stable adapter name `pi` and hook ID
`memory-injection`.

Every generated source or launcher must carry:

```text
WIKI_SOUL_GENERATED_HOOK_V1 adapter=pi hook=memory-injection
```

The implementation must:

- satisfy the complete common hook contract;
- remain read-only with respect to memory, projects, sessions, and Pi config;
- make no network request;
- use no extra dependency;
- use no dynamic command evaluation;
- never read a session file, prompt, tool result, credential, or existing
  memory product;
- read only the authorized Wiki Soul index files;
- use `display: false` or the current documented equivalent so reference data
  does not masquerade as a user-authored message in the UI;
- avoid triggering a model turn when appending lifecycle context;
- catch every runtime error and leave Pi usable;
- work in interactive, print, JSON, and RPC modes without requiring UI;
- keep the model-visible reference string within 6,000 UTF-8 bytes.

## Test before registration

Run every acceptance and security test in the common hook contract, plus:

1. Prove the installed Pi executable loads the candidate with only `-e` and no
   persistent registration.
2. Prove the extension factory and session handlers work without UI.
3. Prove the global context file is present exactly once in
   `systemPromptOptions.contextFiles` and the effective system prompt.
4. Prove initial, new, resume, fork, reload, compaction, and tree-navigation
   paths that the installed version exposes.
5. Prove the first model context contains one complete Wiki Soul envelope.
6. Prove multiple prompts and multi-tool turns do not append or expose
   duplicate envelopes.
7. Prove compaction creates one fresh post-compaction envelope and hides or
   omits obsolete owned envelopes from the rebuilt context.
8. Prove resume and tree navigation select the correct active branch without
   reading unrelated entry contents.
9. Prove a hidden custom message still reaches the model and is not rendered as
   a user-authored chat message.
10. Prove `startup`, `reload`, and a runtime failure do not trigger an
    unsolicited model turn.
11. Prove an untrusted project still loads the user-global extension while no
    project-local resource is trusted implicitly.
12. Prove print, JSON, and RPC modes do not wait for a UI confirmation.
13. Prove `--no-extensions` and `--no-context-files` are reported as explicit
    user opt-outs, not mistaken for successful activation.
14. Prove no test writes to the real memory root, Pi settings, sessions,
    client project, or deployed revision.
15. For each enabled subagent mechanism, prove a real child context receives
    exactly one bounded envelope, or report that mechanism unsupported.
16. Prove a documented trusted Pi project ID wins only when it matches the
    common lowercase syntax. Uppercase, overlong, or otherwise invalid IDs use
    location; a trusted workspace root wins over `ctx.cwd`, different real
    paths remain distinct, and ambiguous roots produce global-only routing.

Use a disposable home or dependency-injected pure helpers for fixtures. The
production path must still resolve the real operating-system user home. Do not
weaken that rule by trusting a project-supplied environment variable.

## Register in Pi

Parse Pi's user-global settings as JSON. If absent, create the smallest valid
file only after the production candidate passes. If invalid or unreadable,
stop without rewriting it.

Use the documented `extensions` array:

- preserve every unrelated setting, package, extension path, exclusion, and
  ordering when practical;
- add one exact absolute path to the content-addressed Wiki Soul entrypoint;
- stop if an older marked Wiki Soul revision exists;
- avoid duplicates and equivalent path aliases;
- do not copy the implementation into Pi's auto-discovery directory;
- do not add Wiki Soul as a Pi package;
- do not edit project `.pi/settings.json`;
- do not edit a third-party `hooks.json`.

After writing, parse settings again, compare the structural diff with the
approved plan, and use Pi's loaded-resource display or installed introspection
to prove the exact extension path is recognized. A path that merely exists is
not yet `registered: yes`.

## Live verification

Live verification requires a real Pi model context.

1. Reload the running interactive Pi process or start a fresh process.
2. Confirm Pi reports the exact content-addressed extension as loaded.
3. Confirm the global managed instruction block is present in the assembled
   system prompt.
4. Confirm the first model context contains exactly one reference envelope
   with the correct memory root, project ID, global index, project index or
   absence message, OKF contract path, and protocol path.
5. Confirm no operating-rules duplicate, concept, project registry, session
   content, prompt, or tool result appears in the envelope.
6. Exercise a second ordinary prompt and a multi-tool turn; prove no new
   injection or index read occurs.
7. Exercise compaction and one available session replacement path; prove the
   rebuilt context contains one fresh envelope.
8. Exercise every enabled subagent class or retain `live-verified: no` for that
   class.
9. Confirm runtime failure is non-blocking and no memory or project file
   changed.

Status meanings:

- `generated`: the immutable production extension passed all isolated tests;
- `registered`: Pi recognizes the exact absolute production path from its
  user-global settings;
- `live-verified`: every applicable lifecycle and enabled subagent class
  produced one correct model-visible envelope in a real Pi context;
- `instructions loaded`: the managed global context block was observed in the
  effective system prompt.

If `/reload`, a new prompt, compaction, or a child-agent invocation still needs
user interaction, report one exact next action and keep the installation
`partial`. Never infer live execution from settings or source files.

The main installer also requires every discovered skill to be native-loaded or
have a ready manual fallback. A pending or failed skill makes the overall
installation `partial`.

## Runtime failure

Runtime failure must:

- append at most one concise diagnostic for the logical context;
- expose no prompt, session path, credential, host project metadata, or
  environment dump;
- inject no partial or ambiguous index data;
- leave Pi and its built-in tools operational.

## Final report

Report:

- Pi executable, package, version, operating system, home, and agent directory;
- instruction path and proof it loaded;
- generated extension revision and exact registration path;
- native lifecycle mapping selected from the installed API;
- existing extension or memory collisions;
- isolated and live tests;
- applicable and unsupported subagent mechanisms;
- `generated`, `registered`, and `live-verified` independently;
- the exact `/reload`, new-session, compaction, or subagent action still needed;
- confirmation that Pi source, packages, sessions, credentials, client
  projects, existing memories, and unrelated configuration were untouched.

## Official Pi references

- [Pi Coding Agent](https://github.com/earendil-works/pi/tree/main/packages/coding-agent)
- [Extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)
- [Settings](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/settings.md)
- [Session format](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md)
- [Security](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md)

If these paths move, locate replacements only in the official source named by
the installed package metadata. Do not guess a changed API.
