# Existing SSH signing key without a password manager

This recipe uses native macOS OpenSSH, a dedicated agent and Keychain. It does not replace transport authentication or GCM. Other operating systems need an explicitly chosen native secure-store/agent procedure; do not install this LaunchAgent there. Non-exportable hardware keys cannot be converted into this file-based setup without changing identity: stop rather than replacing them.

## Preserve identity and import privately

1. Resolve the effective workspace Git profile and its existing `user.signingKey`, `gpg.format` and `gpg.ssh.program` with origins. Record only the public fingerprint. The current key may be public text or a file; resolve it correctly, including Git's `key::` public-text form. Do not read private key material with assistant tools. If signing is not SSH or no approved key exists, obtain the owner's decision instead of generating one or silently converting another signing scheme.
2. Reuse an existing matching encrypted key under `~/.ssh/signing/` if present. Otherwise the user exports only that key from their password manager into a private local file, outside chat, logs, environment variables and repositories. Compare `ssh-keygen -lf` fingerprints of the existing public identity, export and any destination. A mismatch stops import before activation; never overwrite a different destination key. Decline symlinked source/destination key files, signing directories and configuration targets.
3. Create the signing directory with mode700. Stage a new import inside a private temporary directory there, using `umask 077` and mode600. Work on the staged copy, not the only export. In the user's own terminal run native `ssh-keygen -p -f <staged-key>` to require a nonempty passphrase. Never ask for the passphrase in chat or pass it in arguments/environment. Validate that the key can be unlocked, retains the expected fingerprint, and cannot be opened with an empty passphrase; a parse failure alone does not prove encryption.
4. Install the validated encrypted key as `~/.ssh/signing/<profile>` with mode600 and the matching public key as `<profile>.pub`. Do not create a second private-key copy in `.config`. Do not overwrite a valid existing matching key simply to repeat setup. Keep new configuration inactive until the signature proof succeeds. Remove only the import staging directory on failure; preserve preexisting files and the original export.

## Reuse or create one dedicated agent

The signing socket is `~/.ssh/signing/agent.sock`, independent of the default `SSH_AUTH_SOCK`. Inspect an existing managed agent before creating another service. Against this socket, `/usr/bin/ssh-add -l` returns0 for loaded keys,1 for an empty usable agent,2 for an unavailable agent. Both0 and1 are healthy; do not confuse an empty agent with a failed one. Keep the directory private and do not delete an unknown socket, restart a shared agent or change a working service's label.

If no managed agent exists, create a user LaunchAgent. A neutral template follows. Replace the absolute home path and confirm the service label is unused; launchd does not expand `~` or `$HOME` inside the plist. Keep the plist mode600 and parent directories user-owned. `Umask`63 is octal077. The service has no key-expiration timer.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>dev.ai-kit.git-signing</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/ssh-agent</string>
    <string>-D</string>
    <string>-a</string>
    <string>/absolute/home/.ssh/signing/agent.sock</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>Umask</key>
  <integer>63</integer>
</dict>
</plist>
```

Use `plutil -lint <plist>` before `launchctl bootstrap gui/<uid> <plist>`. Check readiness against the dedicated socket with a bounded wait. For an existing service, diagnose its socket and launchctl status rather than replacing it. Never set a global shell `SSH_AUTH_SOCK` for this feature.

## Put only the launcher and include in workspace .config

Create a local `<workspace>/.config/git-sign.sh` from this template, substituting the approved key profile. It must be executable and user-owned. Do not execute it with literal unresolved template values. The public identity configured in Git remains unchanged.

```bash
#!/bin/bash
set -euo pipefail

if [[ "${1-}:${2-}" == '-Y:sign' ]]; then
  export SSH_AUTH_SOCK="$HOME/.ssh/signing/agent.sock"
  if ! /usr/bin/ssh-add -T "$HOME/.ssh/signing/profile.pub" >/dev/null 2>&1; then
    /usr/bin/ssh-add --apple-use-keychain "$HOME/.ssh/signing/profile" </dev/null
  fi
fi

exec /usr/bin/ssh-keygen "$@"
```

The wrapper changes the socket only for its own signing process. It forwards verification unchanged. A missing agent or locked/unavailable Keychain must fail visibly; it must not fall back to the password-manager agent, remove encryption, disable signing or select a different key.

For the initial Keychain import, use the user's own terminal with the dedicated socket and native `/usr/bin/ssh-add --apple-use-keychain <key>`. The user enters the passphrase through OpenSSH/OS interaction; the command loads the key and stores its passphrase in Keychain. Validate `/usr/bin/ssh-add -T <public-key>` there. Do not use a different SSH distribution's incompatible Keychain options or inspect Keychain secrets. If Keychain is locked, the user unlocks it through macOS.

Create a private `signing.gitconfig` in the workspace `.config`, setting only `gpg.ssh.program` to the absolute launcher path. After successful proof, add an idempotent include from the workspace `.gitconfig` to that file. Preserve the author identity, the same `user.signingKey`, `gpg.format=ssh`, existing required commit/tag signing and hooks. Do not activate a half-tested include, clear global helpers or reconfigure other profiles.

## Prove behavior, then activate

1. Produce a throwaway message, sign it with the launcher using `-Y sign -n git -f <matching-public-key> <message>`, and cryptographically verify it using `ssh-keygen -Y verify -n git -I "$test_principal" -f "$allowed_signers" -s "$message.sig" < "$message"` with those paths/principal set to the test files. Verification reads the original message bytes from stdin, not from the signature file. An allowed-signers entry is the test principal plus the original public key. Keep the allowed-signers file temporary; do not rewrite the user's global trust policy.
2. Set the parent process's password-manager socket to an unavailable temporary path for this check only. The launcher must still sign with the same fingerprint. Do not actually stop the user's password manager or change the normal SSH/GCM environment.
3. Repeat against a fresh empty dedicated test agent and then a restarted test agent. Instantiate a temporary copy of the launcher with the test socket while keeping the same existing encrypted key path: Keychain is keyed to that path. Do not empty/restart the user's shared signing agent. Both signatures must verify without a password-manager socket; no passphrase is captured by the assistant.
4. Test Git itself with a disposable checkout and profile pointing to the launcher: create one signed commit, inspect its signature and verify it with the temporary allowed-signers file. Do not commit a probe into an application or change repository trust/signing settings as a shortcut.
5. Only now activate the local include and inspect effective config from a real target checkout and neighboring workspace. A terminal import or file signature alone is not proof that Git selected the intended profile. Report the exact public fingerprint and verification, and which files were changed, without secrets.

After success the user can remove the original unencrypted export; do not delete it automatically or claim secure erasure from APFS snapshots/backups. The encrypted local key and private configuration stay outside repositories. Record a private backup/rollback path for modified includes and launch settings. Restore only affected files if activation fails; never delete existing keys, Keychain entries or other agent identities.
