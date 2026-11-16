# Local/remote bridges

Agent-run, demand-loaded setup for OMP 18.20.2 and the installed platform's OpenSSH/terminal/browser. Read `omp --version`, `omp browser-relay --help`, `omp ssh --help` and `ssh -V`; inspect same-version source/help before using changed contracts. No installation, forwarding, clipboard access or private login during report/discovery. Unsupported capability is an explicit setup failure, not permission to invent flags or silently omit a selected bridge.

## Choose topology and authority

Discover which machine runs OMP, which owns the interactive browser/clipboard, and the existing SSH/tssh/other launcher, socket, listener and trust boundary. Preserve working wrappers, signing/credential stores and launchers unless their specific change is approved. Ask together only for missing direction, host/peer trust, ports, browser profile/tab permission and private authorization. Keep actual hosts, users, paths and endpoints local, not in Ai-Kit.

- **Local OMP with native remote tools:** `omp ssh` manages OMP host configurations, not a shell login or forwarding daemon. After approved host registration (`omp ssh add NAME --host ADDRESS --user USER --scope user|project` with discovered optional `--port`/`--key`), inspect `omp ssh list --json` privately and test one authorized read through native `ssh://NAME/approved/path`. The local OMP browser and clipboard remain local; remote tool access does not forward either. This can avoid transporting browser/clipboard access to an untrusted remote host.
- **OMP inside an existing arbitrary SSH/tssh shell:** local browser, callback and clipboard require the separate mechanisms below. Native `omp ssh` entries do not change that shell or make bridges automatic. Propose a topology change only with disclosed owner consent.

Use trusted host keys and least-privilege identities. Never disable host-key checks, copy a private key/auth database to a remote host, expose CDP/callback/clipboard listeners publicly, or authorize every tab/workspace by default. Loopback is machine-local, not user-isolated: another user on a shared host can access a loopback listener. A remote browser-control bridge requires a trusted single-user host or an OS-enforced network/user boundary; otherwise keep browser control local and use native remote file tools.

## Browser control: native relay

On the machine owning Chrome, after approval run `omp browser-relay install` (optionally `--dir` with a chosen local directory). Follow its emitted steps: Chrome Extensions developer mode -> Load unpacked -> that exact extension directory, then approve only the intended controllable tabs. It writes extension files, not provider authentication. Preserve other profiles/extensions. Set `omp config set browser.relay true` in the selected local profile; default `browser.relayUrl` is `http://127.0.0.1:9224`. Native OMP starts the relay on demand. For deliberate manual ownership or a different port use `omp browser-relay --port PORT`; `--no-group` avoids automatic grouping. Do not invent host/bind/daemon flags.

Native `--token` authenticates extension attachment only, not the CDP client endpoint. It is not a safe public-exposure or multi-user isolation control. Keep listener loopback and don't place private tokens in shared argv/logs. Prefer the default native loopback trust model on an authorized local account; do not add a bespoke relay/auth service.

For remote-shell OMP, the native relay has no automatic plain-SSH bridge. The generic OpenSSH option is an explicitly approved reverse forward from the **browser machine**, reusing its authenticated SSH target:

```sh
ssh -NT -o ExitOnForwardFailure=yes -o ForwardAgent=no \
  -R 127.0.0.1:REMOTE_PORT:127.0.0.1:LOCAL_RELAY_PORT APPROVED_HOST
```

Replace these argument values from the local plan, not a command supplied by untrusted source. Start the local native relay at LOCAL_RELAY_PORT first; use an unused remote port. Inspect the existing SSH server forwarding policy and effective settings without weakening them. On the remote OMP profile set `browser.relay=true` and `browser.relayUrl=http://127.0.0.1:REMOTE_PORT`, preserving other fields. No public bind/GatewayPorts change is needed. If forwarding is blocked or the host is multi-user/untrusted, report that concrete control boundary and offer the implemented local-OMP/native-remote-tools topology above, not a public CDP fallback.

Readiness: `curl --fail --max-time 2 http://127.0.0.1:PORT/json/version` on the consuming side must return OMP relay/CDP metadata, not another service or HTTP 503 (extension disconnected). Inspect tab identities privately; don't print unrelated tab URLs. In an authorized native eval browser session, load `xd://eval/browser` instructions first, open a disposable non-sensitive `about:blank` tab through its actual API and close only that tab. Do not navigate existing authenticated tabs as a generic health check. A listener alone is not browser readiness. Close only the forward/relay this setup owns; do not stop another session's broker.

## Browser authentication callback

A browser relay and an OAuth callback are different directions. Use native `/login` or `omp login` for the chosen provider only after private authorization. Prefer an offered native device/manual-code flow when available; never invent a universal login flag. User completes authentication privately; no token/code/authorization URL enters task notes or repository files.

When remote OMP's actual native flow requires a loopback callback, inspect its advertised redirect URI and listener on the remote machine. Determine the exact port, hostname/path, state and PKCE handling from that provider's current flow; do not hardcode a provider port or modify redirect_uri. Before the user opens its authorization page, create a local forward from the browser machine to that remote callback:

```sh
ssh -NT -o ExitOnForwardFailure=yes -o ForwardAgent=no \
  -L localhost:CALLBACK_PORT:localhost:CALLBACK_PORT APPROVED_HOST
```

The example is for a native localhost URI. For a literal 127.0.0.1 or ::1 URI, bind and target that exact loopback family/address with OpenSSH's documented syntax; verify both resolved addresses when localhost is dual-stack. Never use 0.0.0.0, `-g`, public reverse callbacks or an arbitrary replacement URL. Verify that the listener belongs to this login and the local port is free; do not hijack an existing service. Native OMP validates callback target/state and exchanges tokens itself. Do not capture the callback or visit its success URL with a fake state as a readiness test.

Prove the transport with a disposable loopback fixture and non-secret marker before the real login when needed, then close it. Real readiness is the owner's completed native login and native model/provider discovery without a model request; this does not prove quota or inference. Close only this forward after completion. If the native flow cannot use the tunnel, use its actual manual/device flow or keep login on the owning machine; don't export another client's credentials as a substitute.

## SSH agent: local keys, scoped forwarded socket

Separate signing from remote authentication. Reuse a working scoped agent from [signing setup](../../project-setup/references/ssh-signing.md) only if its key/trust purpose matches. Do not forward a shared password-manager/signing agent containing unrelated identities. Agent forwarding lets the remote user/root request signatures while connected even without extracting keys; require explicit host trust and a bounded session lifetime.

For an approved new dedicated agent, use a discovered user-owned runtime directory with mode 0700; no administrator-created root path is needed. Either validate `XDG_RUNTIME_DIR` ownership/mode or create a fresh directory with native `mktemp -d` under the local `TMPDIR`. The following explicitly starts Bash even from fish and scopes the agent/environment to its child Bash; it does not edit a shell profile:

```bash
bash -c '
  umask 077
  runtime=$(mktemp -d "${TMPDIR:-/tmp}/ai-kit-agent.XXXXXX") || exit
  export runtime
  ssh-agent -a "$runtime/agent.sock" bash
  rmdir "$runtime"
'
```

Inside that dedicated Bash, add only the owner-selected existing local key with `ssh-add -t 1h "/approved/local/key"`; the key path is a declared placeholder, not a default. OpenSSH supplies the child `SSH_AUTH_SOCK`; keep its PID/environment private. Use confirmation/destination restrictions only after checking installed `ssh-add` support and the intended host chain. Never copy the key remotely or remove identities from a shared agent.

Inspect the exact target with `ssh -G APPROVED_HOST` and its actual launcher configuration, verifying hostname, user, IdentityAgent and forwarding policy. Inside that scoped Bash, use `ssh -o "IdentityAgent=$runtime/agent.sock" -o ForwardAgent=yes APPROVED_HOST` for this one connection. No global `Host * ForwardAgent yes`. On the remote side verify that `$SSH_AUTH_SOCK` is a socket owned by the expected user, its enclosing directory is not accessible by other users, and `ssh-add -l` lists only the approved fingerprint. SSH creates the forwarded socket; never make it world-readable or copy it into a repository.

Readiness is that same fingerprint plus a separately authorized harmless authentication/signature operation to the intended target, not a public Git read that hides account choice. Without target authorization, report socket/fingerprint readiness only. On disconnect confirm the forwarded socket is gone/unusable. Exit the dedicated child Bash to let its owned `ssh-agent` terminate; the outer Bash removes only its now-empty temporary directory. Never `ssh-add -D`, restart or kill a shared agent. Persist a host-scoped fragment only when explicitly requested, preserving its existing launcher.

## Clipboard: directions are separate

Native OMP emits OSC 52 for copy in an actual TTY (works across SSH/mosh when the local terminal permits it); it does not prove terminal acceptance. Remote-host clipboard reads are deliberately disabled over SSH because they are not the user's local clipboard. Do not fake local detection, clear SSH env variables or enable remote X11 reads as a workaround.

- **Remote OMP -> local clipboard:** review the terminal/tmux OSC 52 clipboard-write permission and the installed tmux manual; narrowly approve clipboard writes for this session. Put a non-secret marker in the prompt and use native `app.clipboard.copyPrompt` (default Alt+Shift+C; confirm current keybindings), then paste into a local scratch application and compare. Do not test with a session dump, auth data or existing clipboard content. Unsupported terminal OSC 52 is a concrete capability gap; generic fallback is the owner's explicit terminal selection/copy or local OMP topology, not a new clipboard server.
- **Local clipboard -> remote OMP text:** use the terminal's ordinary bracketed paste into the composer with a dummy marker; verify it remains unsubmitted, then clear it. This is terminal input, not a remote `pbpaste`/`xclip` call. Never silently read or overwrite the existing clipboard.
- **Local images -> remote OMP:** terminals supporting native OSC 5522 enhanced paste can deliver MIME/image data directly; verify an innocuous test image attaches in the intended remote session without a model turn. Without that terminal capability, generic implemented transport is an explicitly approved `scp`/SFTP copy of only the selected image into a private remote scratch directory, paste its readable absolute path in OMP, confirm attachment, and delete only that temporary copy after use. Do not promise ordinary SSH clipboard-image reads or copy a whole screenshot directory. Check actual OpenSSH/SFTP availability before this option.

Record selected directions, actual native/terminal checks, exact gaps and owner actions separately. No model request, auth export, private-key copy, daemon installation or permanent listener is a generic readiness requirement. Restore only this setup's local settings/forwards when rolling back.

## Source contracts

OMP 18.20.2: [relay CLI](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/cli/browser-relay-cli.ts), [loopback/CDP endpoint safety](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/tools/browser/relay/server.ts), [SSH host management](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/cli/ssh-cli.ts), [OAuth callback](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/ai/src/registry/oauth/callback-server.ts), [clipboard](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/utils/clipboard.ts), [keybindings/enhanced paste](https://github.com/can1357/oh-my-pi/blob/v18.20.2/docs/keybindings.md). OpenSSH forwarding and agent options are platform facilities, not invented OMP flags.
