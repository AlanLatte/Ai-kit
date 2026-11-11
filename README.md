# Ai-Kit

Личный набор общих инструментов для OMP. Содержит только переносимые инструменты и общие процедуры: без описаний проектов, их правил, инфраструктуры и данных.

## Состав

- Ponytail 4.12.0: один native runtime; полный текст читается через skill только для кода, режим сохраняется. Пять вспомогательных skills доступны явными командами, но скрыты из стартового каталога через native `hide`.
- `toolchain`: общая диагностика машины и явная установка требуемых инструментов.
- Hindsight helper: read-only readiness и явная настройка локального сервиса без замены существующего runtime.
- `backlog`: один общий skill, настройки каждого трекера остаются в его собственной политике.
- Необязательная маршрутизация существующих банков памяти по локальной конфигурации: [docs/memory.md](docs/memory.md). Без конфигурации router ничего не меняет.

Проверки инструментов запускаются по задаче через skill, а не безусловно на каждом старте. Модели, ключи, endpoint, настройки UI и проектные привязки остаются локальными. Установка пакета не устанавливает системные программы, не запускает Docker и не включает память.

## Совместимость и установка

Требования: Node.js 22+ для helpers, OMP 18.18.6 проверен. Нативная установка без launcher, shell wrapper, `npm link` и генерации проектных инструкций.

Локальный marketplace из корня checkout:

```sh
omp plugin marketplace add /absolute/path/to/Ai-Kit
omp plugin install ai-kit@alanlatte
```

Установка из публичного репозитория:

```sh
omp plugin marketplace add https://github.com/AlanLatte/Ai-kit.git
omp plugin install ai-kit@alanlatte
```

Обновление опубликованной версии:

```sh
omp plugin marketplace update alanlatte
omp plugin upgrade ai-kit@alanlatte
```

После обновления перезапустить OMP: уже загруженные модули старой сессии не заменяются. Не устанавливать Ai-Kit одновременно с другим активным Ponytail runtime. Проектные плагины, их установка и политики не входят в этот пакет.

## Hindsight и инструменты

```sh
AI_KIT_CLIENT=omp bash scripts/toolchain.sh report
AI_KIT_CLIENT=omp node scripts/hindsight.mjs report
```

`check` и `report` не меняют настройки и сервисы. `install` разрешен только по поручению на установку; диагностика сама по себе не разрешает его запуск.

```sh
AI_KIT_CLIENT=omp node scripts/hindsight.mjs install
```

Существующие Compose/env, контейнеры и volume сохраняются. Локальный пример сервиса закреплен digest и слушает только loopback. Credentials вводятся приватно; чужая provider auth не копируется. Выбранный remote endpoint и другой memory backend не заменяются автоматически. В OMP используется встроенный Hindsight backend, не дополнительный MCP-сервер.

Общий inventory не включает Git-host/deploy зависимости конкретных продуктов. Их проверяют проектные пакеты.

## Проверка

```sh
npm test
shellcheck scripts/toolchain.sh
```

30 Node-проверок helpers используют одноразовые каталоги, fake CLI и loopback HTTP; Docker и внешние сервисы не нужны. Проверены read-only диагностика, сохранение другого backend и настроек, credentials/redirect границы, повторная установка и отсутствие пересоздания существующего runtime.

Нативная установка проверена на OMP 18.18.6: общий Backlog skill и одна команда `/ponytail`. Режимы Ponytail и маршрутизация памяти дополнительно проверены отдельными поведенческими проверками; границы live-проверки памяти описаны в `docs/memory.md`.

## Происхождение и лицензии

Собственный код и адаптированные общие helpers: `UNLICENSED`, без неявного предоставления лицензии. Публичность репозитория не меняет этого статуса.

Ponytail: MIT, Dietrich Gebert. Версия 4.12.0, upstream `https://github.com/DietrichGebert/ponytail.git`, commit `e15862bb04d04285233a164460ced063941d9ef5`. Сохранены `vendor/ponytail/LICENSE` и `UPSTREAM`. Поставляется необходимый runtime/skills subset без benchmarks. Локальные изменения: native extension принимает builder инструкций вторым необязательным аргументом; Ai-Kit передает короткий указатель вместо полного текста. Metadata основного skill сокращена, вспомогательные skills помечены `hide: true`. Команды, режимы и persistence upstream сохранены.

В репозитории и его истории не должны храниться описания проектов, проектные задачи и планы миграций, внутренние инструкции, локальные настройки, ключи, парольные фразы или содержимое памяти. Примеры должны оставаться нейтральными.
