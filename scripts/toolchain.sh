#!/usr/bin/env bash
set -uo pipefail

mode=${1:-report}
[ "$#" -eq 0 ] || shift
selected=("$@")
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
hindsight_script="$script_dir/hindsight.mjs"
printf -v hindsight_install 'node %q install' "$hindsight_script"

TOOLS=(
  "git|version control|xcode-select --install"
  "python3|Python tooling|brew install python@3.13"
  "uv|isolated Python environments|curl -LsSf https://astral.sh/uv/install.sh | sh"
  "docker|explicit local service setup|brew install --cask docker"
  "pre-commit|repository quality hooks|uv tool install pre-commit"
  "node|JavaScript tooling and shared helpers|brew install node"
  "ripwire|focused code navigation|brew install ripwire"
  "jq|JSON inspection|brew install jq"
  "shellcheck|shell script diagnostics|brew install shellcheck"
  "tre|directory inspection|brew install tre-command"
  "hindsight|Hindsight API and native client readiness|$hindsight_install"
)

usage() {
  printf 'Usage: toolchain.sh check|report [COMPONENT ...] | install COMPONENT ...\n' >&2
  printf 'Components: git python3 uv docker pre-commit node ripwire jq shellcheck tre hindsight\n' >&2
}

case "$mode" in
  check|report) ;;
  install)
    if [ "${#selected[@]}" -eq 0 ]; then
      printf 'Select components first; installation without a selection is forbidden.\n' >&2
      usage
      exit 2
    fi
    ;;
  *) usage; exit 2 ;;
esac

for requested in ${selected[@]+"${selected[@]}"}; do
  found=0
  for row in "${TOOLS[@]}"; do
    IFS='|' read -r name _ _ <<<"$row"
    if [[ "$requested" == "$name" ]]; then found=1; break; fi
  done
  if [ "$found" -eq 0 ]; then
    printf 'Unknown component: %s\n' "$requested" >&2
    usage
    exit 2
  fi
done

is_selected() {
  [ "${#selected[@]}" -ne 0 ] || return 0
  for requested in "${selected[@]}"; do
    [[ "$requested" != "$1" ]] || return 0
  done
  return 1
}

collect_readiness() {
  missing=()
  present=()
  hindsight_error=
  for row in "${TOOLS[@]}"; do
    IFS='|' read -r name why how <<<"$row"
    is_selected "$name" || continue
    if [[ "$name" == hindsight ]]; then
      if ! command -v node >/dev/null 2>&1; then
        hindsight_error='Hindsight: Node is required to check the API and client configuration.'
      elif hindsight_error="$(node "$hindsight_script" check 2>&1)"; then
        present+=("$name")
        continue
      fi
    elif command -v "$name" >/dev/null 2>&1; then
      present+=("$name")
      continue
    fi
    missing+=("$name|$why|$how")
  done
}

print_missing() {
  for row in ${missing[@]+"${missing[@]}"}; do
    IFS='|' read -r name why how <<<"$row"
    printf '  %-12s %s\n      %s\n' "$name" "$why" "$how"
    if [[ "$name" == hindsight && -n "$hindsight_error" ]]; then
      printf '      %s\n' "$hindsight_error"
    fi
  done
}

print_report() {
  printf 'Available (%d): %s\n' "${#present[@]}" "${present[*]-}"
  if [ "${#missing[@]}" -eq 0 ]; then
    printf 'Missing: none\n'
  else
    printf 'Missing (%d):\n' "${#missing[@]}"
    print_missing
  fi
}

collect_readiness
case "$mode" in
  check)
    [ "${#missing[@]}" -eq 0 ] && exit 0
    printf 'Selected tooling is not ready (%d missing):\n' "${#missing[@]}" >&2
    print_missing >&2
    printf 'Use the toolchain skill selector; only selected components may be installed.\n' >&2
    ;;
  report) print_report ;;
  install)
    failed=0
    for row in ${missing[@]+"${missing[@]}"}; do
      IFS='|' read -r name why how <<<"$row"
      printf '\n==> %s (%s)\n' "$name" "$why"
      if [[ "$name" == hindsight ]]; then
        if ! node "$hindsight_script" install; then failed=1; fi
      elif ! eval "$how"; then
        failed=1
      fi
    done
    collect_readiness
    print_report
    [ "${#missing[@]}" -eq 0 ] || failed=1
    exit "$failed"
    ;;
esac
