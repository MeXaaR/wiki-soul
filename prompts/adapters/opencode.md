# OpenCode adapter

Use this guide only when the current host is OpenCode. It adapts the local OKF
contract, Wiki Soul protocol, and every hook contract in the framework source
to OpenCode's user-global rules and plugin runtime.

Current official OpenCode documentation, the installed OpenCode version, and
the installed plugin type contract are authoritative for OpenCode-specific
behavior. The required model-context hook is currently experimental. If the
installed API or current official documentation conflicts with this guide,
stop before changing OpenCode configuration, report the exact conflict, and
leave the affected hook unregistered.

## Authority and scope

1. Follow the main installer, installed local OKF contract, Wiki Soul protocol,
   and every Markdown contract under `../hooks/`.
2. Install only user-global OpenCode integration. Do not create `AGENTS.md`,
   `opencode.json`, `.opencode/`, plugins, or other files in a client project.
3. Do not install an npm package, Bun package, MCP server, daemon, database, or
   service.
4. Do not modify the OpenCode executable, installed package, application
   bundle, source tree, session database, authentication store, or unrelated
   plugins.
5. Do not inspect, import, modify, disable, or delete OpenCode sessions,
   credentials, shares, or an existing memory product.
6. Use file mode for critical instructions. Never inject a duplicate operating
   rules section from the memory plugin.
7. Generate the smallest dependency-free JavaScript plugin supported by the
   installed OpenCode version and operating system.

OpenCode plugins execute in-process with the user's operating-system
permissions. OpenCode tool permissions do not sandbox plugin code. The
installer's displayed source review and consolidated confirmation are the
trust boundary when the host exposes no separate plugin-approval UI.

## Verify the installed OpenCode contract

Before proposing changes:

1. Detect the exact OpenCode executable, version, selected surface, operating
   system, actual user home, and effective global config, data, cache, and
   state paths. Prefer `opencode debug paths` or the installed equivalent over
   guessing XDG or Windows paths.
2. Read current official OpenCode documentation for:
   - global and project rules;
   - config locations, merge order, and managed settings;
   - local plugins and plugin load order;
   - custom instruction files;
   - agents and subagents;
   - resume, compaction, and `--pure` behavior;
   - debug config and startup logging.
3. Inspect the plugin type definitions shipped with, cached by, or matching
   the installed version. Do not infer a hook signature from a different
   release.
4. Prove the installed version provides documented or source-backed
   equivalents for:
   - a safely editable user-global instruction surface;
   - an exact user-global local-plugin registration;
   - `experimental.chat.system.transform` with a mutable
     `output.system: string[]`;
   - a session identifier in that hook when the installed version documents
     one;
   - a project `directory` or equivalent current-workspace root at plugin
     initialization;
   - child-session model requests using the same plugin pipeline;
   - a restart or clean new-process path;
   - resolved-config and plugin-load diagnostics.
5. If any required capability is absent, use only a current documented
   equivalent that passes the common contract. Otherwise leave
   `memory-injection` unsupported. Do not install a third-party memory plugin
   or upgrade OpenCode silently.

At the time this adapter was written, OpenCode 1.18.4 exposed:

- `~/.config/opencode/AGENTS.md` as the normal global rules file;
- the `instructions` array for additional global instruction files;
- `~/.config/opencode/opencode.json` or `.jsonc` as global config;
- JavaScript and TypeScript plugins under global and project plugin
  directories;
- local path and `file://` plugin specifiers resolved relative to the config
  file that declares them;
- `experimental.chat.system.transform` with
  `{ sessionID, model }` input and `{ system: string[] }` output;
- no stable `agent`, `small`, or request-purpose discriminator in that
  system-transform input;
- `directory` and project metadata at plugin initialization;
- `opencode debug paths`, `opencode debug config`, startup logs, `--pure`,
  resume, fork, and subagent sessions.

Those versions also maintained a matching `@opencode-ai/plugin` development
dependency in OpenCode config directories as host-owned runtime behavior.
Wiki Soul MUST NOT create a `package.json`, request that package, add another
dependency, or represent OpenCode's own maintenance as a Wiki Soul package
requirement.

OpenCode 1.15.7 exposed the same required system-transform and local-path
plugin seams during the adapter review. These version notes are evidence, not
a frozen compatibility promise.

## Inspect without modifying

Inspect:

- every global config file reported by OpenCode, including active JSON and
  JSONC alternatives;
- `OPENCODE_CONFIG`, `OPENCODE_CONFIG_DIR`, inline config, remote defaults, and
  managed config only as required to understand effective precedence;
- the resolved config and plugin origins when current diagnostics expose them;
- the native global `AGENTS.md` and OpenCode's documented global fallback rule
  files;
- global custom instruction entries;
- global, custom-directory, project, and managed plugin inventories for
  collision detection;
- `<home>/.agents/hooks/opencode/`;
- the installed Wiki Soul memory root, OKF contract, and protocol;
- normal launch flags or wrappers that disable external plugins or rules.

Modify only the selected user-global instruction file, one adapter-owned
instruction file when required, the selected user-global OpenCode config, and
marked generated files under `<home>/.agents/hooks/opencode/`.

Do not read:

- OpenCode authentication data;
- session databases, exports, prompts, messages, shares, or tool output;
- provider credentials or substituted secret files;
- project files unrelated to identity or collision detection;
- an existing memory product's contents.

Build an effective plugin inventory rather than trusting filenames. If another
active plugin adds persistent memory, project indexes, or an equivalent system
prompt block, stop only `memory-injection` and report the collision. Never
edit a project, custom, remote, or managed source to remove that collision.

## Critical instructions

Use `file` instruction mode. Select one safe surface:

1. If OpenCode's native user-global `AGENTS.md` exists, install the main
   installer's exact managed block there.
2. If neither the native file nor a documented fallback global rules file
   exists, create the native user-global `AGENTS.md` with the managed block.
3. If the native file is absent but OpenCode currently loads an existing
   fallback such as `<home>/.claude/CLAUDE.md`, do not create a native file
   that would shadow and discard those fallback rules. Instead:
   - create one adapter-owned global instruction file under the resolved
     OpenCode config root;
   - place the exact managed block in that file;
   - add its exact absolute path to the global `instructions` array;
   - prove OpenCode combines it with the existing fallback.
4. If a prior Wiki Soul instruction block, custom-instruction entry, plugin
   registration, or deployment exists, stop and report a pre-existing
   installation conflict.

Never edit, move, or remove a Claude fallback file merely to configure
OpenCode. Never leave the managed block in both the native rules file and an
OpenCode custom-instruction file.

Preserve all content outside the markers. Parse the config structurally before
editing `instructions`. If the selected JSON or JSONC file is invalid,
unreadable, managed-only, or ambiguous, stop without rewriting it.

Prove the critical block appears exactly once in OpenCode's assembled model
instructions. OpenCode launch modes or flags that disable rules must be
reported as explicit opt-outs. Do not switch to injected instruction mode.

## Plugin registration strategy

The production implementation belongs only under:

```text
<home>/.agents/hooks/opencode/<hook-id>/revisions/<digest>/
```

Prefer one exact absolute `file://` specifier in the selected global config's
`plugin` array. Use it only after the installed version proves that local path
plugins are resolved and loaded from that field. A file URL avoids ambiguous
spaces, Unicode, drive letters, and shell quoting.

Do not copy the production implementation into a client `.opencode/plugins/`
directory. Do not publish or install an npm plugin. Do not import
`@opencode-ai/plugin` at runtime merely for types.

If the installed version cannot register an exact local path from global
config but does document global plugin auto-discovery, a thin marked global
loader MAY reference the exact immutable revision only after its complete
source, ownership, and load behavior is included in the approved plan and test
suite. If no exact user-global registration can be proven, leave the hook
unsupported.

OpenCode loads plugins at process or server startup. A file or config entry is
not active in an already-running process until the installed surface proves a
reload or starts a clean process.

## OpenCode lifecycle mapping

OpenCode does not currently expose a stable model-context mutation event named
`sessionStart`. Its observable `session.created` event cannot by itself add
model-visible context.

Use `experimental.chat.system.transform` when the installed version proves its
current contract. OpenCode reconstructs the system prompt for each model
request, so the generated plugin MUST:

1. Build one fresh bounded Wiki Soul reference envelope for that request.
2. Mutate the existing array in place with `output.system.push(payload)`.
   Replacing `output.system` with another array is not sufficient when the host
   retains the original array reference.
3. Add exactly one Wiki Soul payload per model request.
4. Never append the payload to conversation messages, session storage, or
   plugin state.
5. Never add it from tool, permission, shell, file, or generic event hooks.
6. Reapply it on the first model request after new session, resume, fork,
   compaction, or context reconstruction.
7. Let each child session receive its own system-transform invocation.

This is the system-reconstruction behavior allowed by the common contract: the
callback may run for every model request because the host discards and rebuilds
the system prompt. It does not accumulate repeated messages inside one logical
conversation.

Current OpenCode versions may also invoke the same transform for auxiliary
requests such as conversation-title generation. The hook input may not expose
a stable request-purpose or agent discriminator. Do not filter by prompt text,
system-prompt contents, model name, request ordering, or timing.

During installation, prove whether auxiliary requests receive the payload. An
auxiliary invocation is acceptable only when it:

- stays inside the same validated project and session boundary;
- receives the same bounded, read-only reference envelope;
- stores no payload in session history or title metadata;
- uses no different provider or data boundary forbidden by user policy;
- does not prevent every required agent context from receiving its payload.

Report such invocations as a host limitation and measured overhead. If the
installed host routes them through a prohibited provider, persists the
envelope, or requires an unsafe discriminator to avoid them, leave the hook
unsupported.

Do not use `experimental.session.compacting` as a substitute. That hook changes
the summarization prompt before compaction; it does not prove that the rebuilt
post-compaction agent context received the memory envelope. If the normal
system transform does not run for the first post-compaction model request,
report the lifecycle as unsupported.

The plugin may be initialized once per OpenCode project instance while serving
multiple parent and child sessions. Keep payload construction stateless across
sessions. Do not rely on a process-global "already injected" marker.

## Project location and identity

Treat `directory`, project metadata, session IDs, model metadata, config paths,
and all filesystem content as untrusted data.

1. Use an OpenCode project ID only when current official documentation proves
   it is host-controlled, stable for the same work context, and valid under the
   common lowercase syntax.
2. Otherwise use the validated real absolute initialization `directory` when
   current documentation identifies it as the current workspace root.
3. Otherwise use a validated real absolute current working directory.
4. Apply the common path normalization, slug, and hashing rules exactly.
5. Do not derive identity from a session title, prompt, agent name, model,
   workspace-controlled config value, or environment variable supplied by
   workspace content.
6. If multiple roots remain ambiguous or identity is unsafe, inject global
   memory plus the common concise project-routing diagnostic instead of
   guessing.

Project detection and identity require no subprocess. Never pass
workspace-controlled text through a shell command string. Do not expose
sensitive host project metadata in output, logs, state, or diagnostics.

## Generate the plugin

For `memory-injection`, use adapter name `opencode` and hook ID
`memory-injection`.

Every generated source or launcher must carry:

```text
WIKI_SOUL_GENERATED_HOOK_V1 adapter=opencode hook=memory-injection
```

Generate plain JavaScript unless the installed OpenCode runtime proves that a
different inspectable text format is safer. Use only runtime built-ins already
provided by OpenCode. No `package.json`, package install, lockfile, transpiler,
or external module is allowed.

The implementation must:

- satisfy the complete common hook contract;
- export one plugin function in the form required by the installed version;
- avoid using the plugin `client`, shell helper, network, custom tools, auth,
  or event bus when they are unnecessary;
- read only the authorized Wiki Soul index files;
- remain read-only with respect to memory, projects, sessions, and OpenCode
  config;
- use no dynamic import path derived from project or memory content;
- use no dynamic command evaluation;
- catch every initialization and hook-callback error;
- never throw from `experimental.chat.system.transform`;
- append either one complete valid envelope or one concise diagnostic, never a
  partial payload;
- keep the complete model-visible string within 6,000 UTF-8 bytes;
- work with supported providers that accept one or multiple system messages;
- preserve OpenCode's existing system entries and other plugin output;
- avoid console output containing paths, host project metadata, payloads, or
  secrets.

An in-process plugin has no exit status to make fail-open. Its fail-open
equivalent is a callback that resolves successfully after adding either safe
context or a bounded diagnostic.

## Test before registration

Run every acceptance and security test in the common hook contract, plus:

1. Prove the installed OpenCode runtime imports the candidate from an exact
   temporary local path without persistent registration.
2. Capture a clean OpenCode startup baseline and prove the candidate causes no
   dependency or package change beyond OpenCode's own matching plugin-API
   maintenance. Any additional Wiki Soul-caused package, lockfile, or
   dependency delta fails the test.
3. Prove the plugin mutates the supplied `system` array in place and preserves
   every prior entry.
4. Prove each simulated model request receives exactly one envelope, including
   repeated requests for the same session ID.
5. Prove no envelope is written into messages, session data, tool output, or
   process-global state.
6. Prove separate parent and child session IDs cannot leak project or failure
   state between contexts.
7. Prove a trusted stable OpenCode project ID wins only when it matches the
   common lowercase syntax; uppercase, overlong, and otherwise invalid IDs must
   use a validated real workspace `directory` or current working directory in
   that order.
8. Prove a callback error, malformed hook input, missing optional session ID,
   unsupported model metadata, filesystem denial, and invalid project-location
   metadata all resolve without rejecting the model request.
9. Prove one complete diagnostic is appended after failure and no partial
   envelope survives.
10. Prove 5,999 and 6,000 UTF-8 bytes are accepted and 6,001 bytes degrades
    without truncation.
11. Prove other system-transform plugins remain ordered and their entries are
    preserved. Detect an equivalent memory injector as a collision rather than
    accepting duplicate envelopes.
12. Exercise every observable auxiliary request class, including conversation
    title generation. Prove the allowed boundary above or leave the hook
    unsupported; never add a prompt-content or timing heuristic.
13. Prove both OpenAI single-instruction assembly and ordinary system-message
    assembly retain the complete payload when those paths exist in the
    installed version.
14. Prove no test reads authentication, sessions, prompts, messages, shares,
    project contents, or a third-party memory store.
15. Prove no test writes to the real memory root, OpenCode config, session
    state, client project, or deployed revision.
16. Promote the complete candidate only after the suite passes, then import and
    invoke it once from the immutable production path.

Use a disposable config root or the installed version's documented inline
config mechanism for load tests. Never activate the production plugin before
the candidate passes.

## Register in OpenCode

Parse the selected user-global OpenCode JSON or JSONC file structurally. If no
config exists, create the smallest canonical global config only after the
production candidate passes. If multiple global alternatives are active,
choose the current documented canonical file and report the other active
sources. Any prior Wiki Soul entry in any source is a pre-existing installation
conflict.

For the `plugin` array:

- preserve every unrelated key, comment when practical, plugin, option, and
  ordering;
- add one exact absolute `file://` specifier for the immutable entrypoint;
- stop if an older marked Wiki Soul revision exists;
- avoid duplicate paths, equivalent path aliases, and a simultaneous
  auto-discovered copy;
- never replace the full array;
- never edit project, custom, inline, remote, or managed config;
- never weaken managed settings or plugin policy.

After writing:

1. Parse the config again.
2. Compare the structural change with the approved plan.
3. Run `opencode debug config` or the installed equivalent and prove the exact
   local plugin origin resolves.
4. Start a clean OpenCode process or server with plugin startup logging.
5. Prove the exact immutable file loads with no plugin error, no Simple
   Soul-requested package, and no unexpected dependency delta from the clean
   OpenCode baseline.

The hook reaches `registered: yes` only after OpenCode recognizes and loads the
exact production path. A parsable config or existing file alone is
insufficient.

OpenCode `--pure` disables external plugins. Any normal wrapper or selected
surface that uses `--pure` keeps `memory-injection` inactive and the overall
installation `partial`.

## Live verification

Live verification requires real OpenCode model contexts on the selected
surface.

1. Start a clean session in a disposable project and prove the model receives
   one envelope with the correct memory root, project ID, global index, project
   index or absence message, OKF contract path, and protocol path.
2. Prove the managed instruction block is present exactly once in the
   assembled instructions and the envelope contains no duplicate operating
   rules.
3. Continue or resume the session and prove the next reconstructed system
   prompt contains one fresh envelope without a conversation-history copy.
4. Exercise manual or automatic compaction and prove the first
   post-compaction model request receives one envelope.
5. Invoke a real enabled subagent or child session and prove its first model
   request receives the same routed context with its own session identity.
6. Exercise at least one multi-tool turn and prove no tool hook or stored
   message adds another envelope.
7. Exercise an observable auxiliary request such as title generation and
   confirm its provider boundary, non-persistence, and measured overhead.
8. Prove a runtime failure leaves the model request usable and exposes only one
   safe diagnostic.
9. Confirm no memory, project, session, auth, or unrelated config file changed.

Use startup logs to prove plugin loading and a real model response or other
current host-supported context inspection to prove model visibility. Logs
alone do not prove the model received the payload.

Certify CLI/TUI, headless `run`, desktop, web, IDE, or attached-server
surfaces separately when they use different processes, config roots, servers,
or plugin loading. Evidence from one surface does not automatically certify
another.

Status meanings:

- `generated`: the immutable production plugin passed every isolated test;
- `registered`: OpenCode resolved and loaded the exact production file from
  the selected user-global source;
- `live-verified`: every applicable new, resume, compaction, and enabled child
  context received one correct envelope in real model requests;
- `instructions loaded`: the selected file-mode block was observed exactly
  once in the effective model instructions.

If a real compaction or enabled subagent cannot be exercised, keep
`live-verified: no` and the overall installation `partial`.

The main installer also requires every discovered skill to be native-loaded or
have a ready manual fallback. A pending or failed skill makes the overall
installation `partial`.

## Runtime failure

Runtime failure must:

- resolve every plugin callback successfully;
- append at most one concise diagnostic to that model request;
- expose no prompt, message, session data, credential, host project metadata,
  provider option, or environment dump;
- inject no partial or ambiguous index data;
- leave OpenCode and all normal tools operational.

## Final report

Report:

- OpenCode executable, version, surface, operating system, home, and resolved
  global paths;
- instruction surface selected and proof the block loaded exactly once;
- generated plugin revision and exact `file://` registration;
- installed system-transform signature and reconstruction mapping;
- observed auxiliary request classes, provider boundary, and overhead;
- config precedence, managed policy, `--pure`, restart, or collision limits;
- isolated and live tests;
- applicable and unsupported child-session surfaces;
- `generated`, `registered`, and `live-verified` independently;
- one exact restart, new-session, compaction, or subagent action still needed;
- confirmation that OpenCode source, packages, sessions, auth, client projects,
  existing memories, and unrelated configuration were untouched.

Never call the plugin active before every required model-context class is
live-verified.

## Official OpenCode references

- [Rules](https://opencode.ai/docs/rules/)
- [Configuration](https://opencode.ai/docs/config/)
- [Plugins](https://opencode.ai/docs/plugins/)
- [Agents and subagents](https://opencode.ai/docs/agents/)
- [CLI](https://opencode.ai/docs/cli/)
- [Plugin hook types](https://github.com/anomalyco/opencode/blob/dev/packages/plugin/src/index.ts)
- [System-transform invocation](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/llm/request.ts)
- [Local plugin resolution](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/config/plugin.ts)

If these URLs, hook names, output semantics, or config paths move, locate
replacements only in current official OpenCode documentation and the installed
official source or type package. Never guess a changed experimental API.
