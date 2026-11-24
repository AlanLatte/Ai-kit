#!/usr/bin/env bash
set -uo pipefail

mode=${1:-report}
[ "$#" -eq 0 ] || shift
selected=("$@")
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
hindsight_script="$script_dir/hindsight.mjs"

TOOLS=(
  "git|version control"
  "python3|Python tooling"
  "uv|isolated Python environments"
  "direnv|per-project environment loading"
  "docker|explicit local service setup"
  "pre-commit|repository quality hooks"
  "node|JavaScript tooling and shared helpers"
  "ripwire|focused code navigation"
  "tuicr|terminal code review"
  "jq|JSON inspection"
  "shellcheck|shell script diagnostics"
  "tre|directory inspection"
  "hindsight|Hindsight API and native client readiness"
  "tmux|optional terminal multiplexer"
)

usage() {
  printf 'Usage: toolchain.sh check|report [COMPONENT ...]\n' >&2
  printf 'Components: git python3 uv direnv docker pre-commit node ripwire tuicr jq shellcheck tre hindsight tmux\n' >&2
}

case "$mode" in
  check|report) ;;
  install) printf 'Use the toolchain skill for host-native installation.\n' >&2; exit 2 ;;
  *) usage; exit 2 ;;
esac

for requested in ${selected[@]+"${selected[@]}"}; do
  found=0
  for row in "${TOOLS[@]}"; do
    IFS='|' read -r name _ <<<"$row"
    if [[ "$requested" == "$name" ]]; then found=1; break; fi
  done
  if [ "$found" -eq 0 ]; then
    printf 'Unknown component: %s\n' "$requested" >&2
    usage
    exit 2
  fi
done

is_selected() {
  if [ "${#selected[@]}" -eq 0 ]; then
    [[ "$1" != tmux ]]
    return
  fi
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
    IFS='|' read -r name _ <<<"$row"
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
    missing+=("$row")
  done
}

print_missing() {
  for row in ${missing[@]+"${missing[@]}"}; do
    IFS='|' read -r name why <<<"$row"
    printf '  %-12s %s\n' "$name" "$why"
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
    exit 1
    ;;
  report) print_report ;;
esac
