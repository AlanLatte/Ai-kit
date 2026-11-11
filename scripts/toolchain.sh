#!/usr/bin/env bash
set -uo pipefail

mode=${1:-check}
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
  "hindsight|долговременная память: API и подключение клиента|$hindsight_install"
)

collect_readiness() {
  missing=()
  present=()
  hindsight_error=
  for row in "${TOOLS[@]}"; do
    IFS='|' read -r name why how <<<"$row"
    if [[ "$name" == hindsight ]]; then
      if ! command -v node >/dev/null 2>&1; then
        hindsight_error='Hindsight: требуется node для проверки API и подключения клиента.'
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
  printf 'Есть (%d): %s\n' "${#present[@]}" "${present[*]-}"
  if [ ${#missing[@]} -eq 0 ]; then
    printf 'Отсутствует: ничего\n'
  else
    printf 'Отсутствует (%d):\n' "${#missing[@]}"
    print_missing
  fi
}

collect_readiness

case "$mode" in
  check)
    [ ${#missing[@]} -eq 0 ] && exit 0
    printf 'Инструментарий неполон, отсутствует %d из %d:\n' "${#missing[@]}" "${#TOOLS[@]}" >&2
    print_missing >&2
    skill_command=/toolchain
    [[ "${AI_KIT_CLIENT:-}" == omp ]] && skill_command=/skill:toolchain
    printf 'Поставить всё разом: скил %s, либо этот скрипт с install.\n' "$skill_command" >&2
    exit 0
    ;;
  report)
    print_report
    ;;
  install)
    failed=0
    for row in ${missing[@]+"${missing[@]}"}; do
      IFS='|' read -r name why how <<<"$row"
      [[ "$name" == hindsight ]] && continue
      printf '\n==> %s (%s)\n    %s\n' "$name" "$why" "$how"
      if ! eval "$how"; then
        printf '    НЕ УСТАНОВЛЕН: %s\n' "$name" >&2
        failed=1
      fi
    done
    printf '\n==> hindsight\n    %s\n' "$hindsight_install"
    if ! node "$hindsight_script" install; then
      printf '    НЕ НАСТРОЕН: hindsight\n' >&2
      failed=1
    fi
    printf '\nПовторная проверка:\n'
    collect_readiness
    print_report
    [ ${#missing[@]} -eq 0 ] || failed=1
    exit "$failed"
    ;;
  *)
    printf 'Режимы: check, report, install\n' >&2
    exit 1
    ;;
esac
