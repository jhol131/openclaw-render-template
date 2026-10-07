#!/bin/sh
set -eu

data_root="${OPENCLAW_DATA_ROOT:-/data}"
archive_dir="$data_root/.openclaw/migration-archives/2026-10-07-retired-telegram"

archive_retired_state() {
  source_path="$1"
  [ -e "$source_path" ] || return 0

  mkdir -p "$archive_dir"
  archive_path="$archive_dir/$(basename "$source_path")"
  suffix=0
  while [ -e "$archive_path" ]; do
    suffix=$((suffix + 1))
    archive_path="$archive_dir/$(basename "$source_path").$suffix"
  done

  cp -p "$source_path" "$archive_path"
  cmp -s "$source_path" "$archive_path"
  rm "$source_path"
  echo "[jba-recovery] Archived retired Telegram state: $archive_path"
}

archive_retired_state "$data_root/.openclaw/telegram/update-offset-default.json"
archive_retired_state "$data_root/.openclaw/agents/main/sessions/sessions.json.telegram-sent-messages.json"

exec alphaclaw start
