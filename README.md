# Ai-Kit

Глобальный пакет общих знаний, навыков и инструментов для OMP. Устанавливается на пользователя и доступен в его OMP-сессиях. Содержит процедуры настройки рабочего окружения, работы с кодом, текстом, задачами и памятью.

## Быстрый запуск и основные команды

Если Ai-Kit уже установлен, откройте OMP из рабочей папки командой `omp`, затем в его чате введите `/skill:toolchain`.

| Где вводить | Команда | Назначение |
|---|---|---|
| Терминал | `omp` | Запустить OMP |
| Чат OMP | `/skill:toolchain` | Запустить установку и настройку окружения |
| Чат OMP | `/skill:project-setup` | Создать или подключить проект, настроить Git и .envrc |
| Чат OMP | `/skill:backlog` | Работать с задачами выбранного проекта |
| Чат OMP | `/skill:no-ai-slop` | Отредактировать черновик или назвать найденные речевые шаблоны без переписывания |
| Чат OMP | `/skill:security-review` | Проверить конкретную границу безопасности или выполнить явно запрошенный полный аудит |
| Чат OMP | `/skill:code-navigation` | Найти source entry point, callers или impact конкретного изменения |

Команды `/skill:...` вводятся внутри OMP, не в shell. Клонировать Ai-Kit или заходить в его каталог для запуска мастера не нужно.

Мастер спросит расположение проектов и предложит «Реши все за меня». В той же форме можно свободно указать языки для LSP; по умолчанию `go, python`. Агент сам установит серверы и необходимые зависимости. Для ручного выбора снимите ненужные галочки; пустое поле языков или снятый пункт LSP отключают установку серверов. Если нужна только диагностика, напишите в чате: «Проверь окружение через toolchain, ничего не устанавливай и не меняй».

Workspace здесь - существующий корень группы независимых репозиториев, tracker и общих настроек клиента/окружения. Ai-Kit задает [единый `.config` layout](skills/project-setup/references/workspace-layout.md): команды в `.config/bin`, payload в `.config/libexec`, профиль Git в `.config/git/config`, нужные unit templates в `.config/systemd`. Корневые `.envrc`, mise config/lock, `.omp` и tracker сохраняют native discovery. Глобальный `~/.config`, secrets и runtime state остаются отдельными; `XDG_CONFIG_HOME` на workspace не переключается. Нового слоя каталогов или общего Git-репозитория нет.

Для целевой настройки передайте `/skill:toolchain` этот корень и полный inventory из проектного пакета. Ai-Kit владеет установкой внешнего mise и активацией через direnv; проектный kit - списком инструментов и совместимостью; workspace - `mise.toml`, поддерживаемым `mise.lock` и `.envrc`. Агент готовит весь набор, сохраняя существующие pins, auth и wrappers. Repository lockfiles, `.venv`, Bundler и native runners имеют приоритет. Report и запуск плагина ничего не устанавливают.

После setup достаточно перейти в workspace и запустить обычный `omp`: проверенная `.envrc` подключает выбранные версии, direnv восстанавливает окружение при выходе. Пользователю не требуется вручную запускать mise. Не включается второй loader через `mise activate`; `mise exec` остается fallback для автоматизации без direnv. Не удаляйте mise из действующего окружения без проверки его зависимостей и явной замены. Подробности и ограничения upstream: [общая процедура](skills/toolchain/references/workspace.md).

Если пакет еще не установлен, выполните команды из раздела [«Совместимость и установка»](#совместимость-и-установка). После установки или обновления откройте новую сессию OMP.

## Состав

- Ponytail 4.12.0: один native runtime; полный текст читается только для кода. Ownership проверок, существующие test frameworks, global/project comment policy и полный порученный scope важнее upstream примеров. Пять вспомогательных skills скрыты из каталога, но доступны явно; help/gain - first-party OMP wrappers без изменения pinned vendor.
- `no-ai-slop`: demand-loaded редактор для явной правки текста и содержательных документов. Обычные технические ответы, короткие статусы и commit subjects не запускают загрузку; per-turn prompt injection и перехвата ответа нет.
- `toolchain`: короткий router целевой workspace-установки, отдельной read-only проверки либо machine setup; native OMP-роли и локальные/удаленные bridges читаются только для выбранной настройки. Проверка инструментов не загружает инструкции установки.
- Hindsight helper: read-only readiness и явная настройка локального сервиса без замены существующего runtime.
- `backlog`: [создание tracker и настройка workflow](skills/backlog/references/setup.md), [формат задач и правила labels](skills/backlog/references/creation.md), [сопровождение статусов](skills/backlog/references/execution.md) и приёмка по evidence. Исполнитель обновляет запись при старте, прогрессе, блокировке, передаче и завершении, не только по напоминанию; код, review, dev и релиз не смешиваются с Done. Проектная политика задаёт конкретные статусы, язык и ограничения.
  Личный Backlog не публикуется через ссылки: его ID и локальные пути запрещены в коммитах, ветках, MR/PR, тегах, release notes и других общих артефактах, в том числе в приватных remote-репозиториях. Связь односторонняя: задача ссылается на MR/коммит, но не наоборот.
  После пользовательского ревью рабочего MR/PR запрос поставки или сообщение о мерже продолжает путь на dev без повторного ревью и обязательного Draft. Агент готовит релизные MR/PR, проверяет main-образы, готовит ops-пины и проверяет поведение после фактического выката; мержи и ручные deploy остаются владельцу, production не разрешается.
- `project-setup`: создание workspace/репозитория, `ghq`, GCM и раздельные Git-профили; существующий ключ подписи в `.ssh`, локальные скрипты в `.config`, отдельный OpenSSH-agent и Keychain без зависимости от Bitwarden при коммитах. Подробности читаются только при вызове навыка; реальные настройки и ключи не входят в пакет.
- Необязательная маршрутизация существующих банков памяти по локальной конфигурации: [docs/memory.md](docs/memory.md). Без конфигурации router ничего не меняет.
- `security-review`: единый общий source-first engine с коротким mode router, отдельным safety/evidence core и demand-loaded companions. Project wrappers сохраняют inventory, доступы и delivery. Запрос отчета не расширяет scope; полный security request запускает полный workflow. Quick/scoped pass не требует четырех recon-агентов или фиксированного critic floor; независимая проверка подтвержденных findings обязательна. [Процедура](skills/security-review/SKILL.md).
- `code-navigation`: общий demand-loaded skill для точечного поиска исходников, callers и impact. Известные файлы читаются напрямую, Ripwire запускается на конкретном repo/subsystem; глобальный набор Ripwire skills не требуется. [Процедура](skills/code-navigation/SKILL.md).

Проверки инструментов запускаются по задаче через skill, а не безусловно на каждом старте. Модели, ключи, endpoint, настройки UI и проектные привязки остаются локальными. Установка пакета не устанавливает системные программы, не запускает Docker и не включает память.

## Совместимость и установка

Требования: Node.js 22+ для helpers, OMP 18.20.2 для текущих model/shape/bridge API. Старые проверки 18.18.6/18.18.8 ниже - исторические, не сертификация новых API. Setup проверяет установленный help/schema, явно сообщает несовместимость и не обновляет клиент без разрешения. Нативная установка без launcher, shell wrapper, `npm link` и генерации проектных инструкций.

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

После обновления перезапустить OMP: уже загруженные модули старой сессии не заменяются. Не устанавливать Ai-Kit одновременно с другим активным Ponytail runtime.

### Автоматическая проверка обновлений

Ai-Kit использует встроенную проверку marketplace в OMP, без отдельного фонового updater. В `/settings` параметр `marketplace.autoUpdate` (Marketplace Auto-Update) должен быть `notify`: при запуске OMP проверяет версии установленных marketplace-плагинов и сообщает о доступных обновлениях. Это общая настройка OMP, не только Ai-Kit. Режим `notify` не устанавливает обновления; `auto` устанавливает их автоматически, `off` отключает проверку.

Каталоги marketplace автоматически обновляются, если с прошлого обновления прошло не менее 24 часов. Для немедленной проверки Ai-Kit и установки используйте две команды выше; после установки перезапустите OMP. Проверка сравнивает объявленные версии: новые коммиты без повышения версии уведомления не вызывают.

При выбранной настройке OMP мастер применяет [native-пресет статус-бара](skills/toolchain/references/statusline.json): слева состояние, модель/thinking, рабочая папка, Git/PR и стоимость; справа процент контекста и имя сессии. Используются прозрачный фон и native-разделители, без расширения или shell-обертки. Совпадающая конфигурация переиспользуется; отличающийся пользовательский бар сохраняется до явного согласования замены. Пресет проверен на OMP 18.19.0; установка плагина сама по себе настройки не меняет.

Настройка OMP также включает native-показ tokens/sec через `omp config set composer.tokenRate true` в выбранном профиле, сохраняя статус-бар и форму ввода. Проверяется effective readback; видимый счетчик требует генерации. Диагностика и настройка только workspace inventory глобальный UI не меняют.

Настройка OMP включает [interaction/update policy](skills/toolchain/references/omp-mcp.md#native-interaction-and-update-policy): включенный `ask`, уведомления, автоотправку текущих ответов формы через пять минут (`ask.timeout=300`) и `marketplace.autoUpdate=notify`, без автоматической установки обновлений. Явные пользовательские значения, включая ожидание без таймаута, сохраняются до согласования замены. Таймаут не разрешает новую установку или доступ; unanswered `cfg://` approval отклоняет запись. Plugin install/upgrade и read-only report эту политику не применяют.

Строка квоты в поле ввода поставляется отдельно в `omp/input-panel.ts`: процент расхода активного аккаунта Codex, `Reset`, дни недели с выделенным текущим днем и короткий индикатор. Настройка OMP выбирает форму `composer.shape=ai-kit.input-panel`; установка плагина только регистрирует ее. Обертка редактора и polling действуют только при выбранной форме, включая live-переключение; чужой редактор и его placeholder сохраняются. Credentials не переносятся, используется native usage API. Во время генерации и при нехватке места подсказка скрывается; без данных появляется `Usage unavailable`. Существующая пользовательская форма не заменяется без согласования.

## Hindsight и инструменты

Агент устанавливает недостающее, настраивает интеграции и проверяет готовность. MCP подключается вместе с Backlog/Whiteboard, текущий профиль и совместимый режим выбираются автоматически, без дополнительных анкет. Отмена или пустой ручной выбор ничего не меняют. Дополнительные вопросы нужны только для доступа, отсутствующей личности/ключа, конфликтов или разрешений ОС. Существующие настройки, данные и ключи сохраняются; новые проектные трекеры не создаются при одной настройке компьютера.

`tuicr` для ревью кода в терминале включен в рекомендуемую установку и доступен отдельным пунктом ручного выбора. На macOS используется `brew install tuicr`, на других ОС - [официальные способы установки](https://github.com/agavra/tuicr#install). Уже установленный инструмент переиспользуется.

`direnv` включен в рекомендуемую установку вместе с hook для текущей shell. При создании или подключении конкретного проекта `project-setup` добавляет отсутствующий `.envrc`: загрузку приватного `.env` и активацию существующей `.venv`. Существующий файл сохраняется; исполняемый код проверяется перед `direnv allow`, без доверия всему каталогу проектов. Настройка компьютера не переписывает репозитории. Подробности: [direnv](skills/toolchain/references/direnv.md).

LSP настраивается нативно в OMP, без дополнительного MCP. Для Go по умолчанию устанавливается `gopls`, для Python - `basedpyright`; рабочие серверы и runtime переиспользуются. Список языков не ограничен этими двумя: агент подбирает и устанавливает поддерживаемый сервер по официальной инструкции. OMP можно запускать из активированного корня workspace для работы со всеми репозиториями. Настройка отдельно проверяет обнаружение серверов по маркерам каталога запуска и анализ дочерних проектов с их импортами и окружениями. Готовность требует hover, перехода к определению и разрешения импортов из этой корневой сессии, а не только наличия binary. Подробности: [LSP](skills/toolchain/references/lsp.md).

Для диагностики через helpers из корня checkout Ai-Kit:

```sh
AI_KIT_CLIENT=omp bash scripts/toolchain.sh report
AI_KIT_CLIENT=omp node scripts/hindsight.mjs report
```

`check` и `report` не меняют настройки и сервисы. `install` разрешен только по поручению на установку и требует явных ID; неизвестный или пустой список отклоняется до действий. Например, после выбора:

```sh
AI_KIT_CLIENT=omp bash scripts/toolchain.sh install jq shellcheck
```

Существующие Compose/env, контейнеры и volume сохраняются. Локальный пример сервиса закреплен digest и слушает только loopback. Credentials вводятся приватно; чужая provider auth не копируется. Выбранный remote endpoint и другой memory backend не заменяются автоматически. В OMP используется встроенный Hindsight backend, не дополнительный MCP-сервер.

Bearer-аутентификация удаленного Hindsight требует HTTPS. Loopback HTTP остается доступен для локального сервиса и SSH-туннеля. Исключение для защищенного транспорта задается только после проверки его шифрования и peer identity через `HINDSIGHT_PROTECTED_HTTP_ORIGIN=http://approved-host:port`: это один точный origin, не wildcard и не отключение TLS-проверок. Значение хранится локально; redirect отклоняется и при исключении. Проверка helper не меняет native transport policy OMP: для общего endpoint предпочтителен HTTPS или loopback-туннель.

Новая локальная установка ограничивает native CPU-пулы двумя потоками, запускает один local rerank одновременно, включает bucket batching и задает интервал автообновления сводок 30 минут. Явные интервалы банка/сводки имеют приоритет; существующие установки не мигрируются. Подробности и восстановление после сбоев: [docs/memory.md](docs/memory.md#local-cpu-inference-and-refresh-recovery).

Общий inventory не включает Git-host/deploy зависимости конкретных продуктов. Их проверяют проектные пакеты.

### Модели и ограниченная передача задач

Выбранная настройка OMP включает [полную native-процедуру](skills/toolchain/references/models.md): catalog metadata плюс enabled/available session set через RPC `get_available_models`, сохранение существующих roles и обычного `default`, локальные `@plan` для сильного планирования/research/task artifacts, `@task`/`@smol` для доказанно способного исполнителя и `@slow` для сильного reviewer. Шаблоны native agents устанавливаются локально; конкретные model IDs/provider defaults не распространяются. Unknown price остается unknown; более дешевый capable executor выбирается только по данным. Auth fallback к parent и разрешенные fallback chains не дают hard cost cap. Setup не делает inference/paid benchmark и не включает always-judge, eager/always, autoParallel или automatic prewalk.

Передача содержит owning Backlog task/root, AC, план, артефакт, границы и владельца проверки. Backlog - единственный индекс требований, плана, прогресса и evidence; его docs - продуктовые/task artifacts. Hindsight хранит разрешенные durable knowledge/preferences/lessons без копии task lifecycle, Ripwire - текущий код. Явно назначенное review нельзя молча отменить; tiny-change fast path требует согласованного решения.

### Локальные и удаленные bridges

[Общая процедура](skills/toolchain/references/bridges.md) настраивает native browser relay, точный loopback OAuth callback-туннель, scoped SSH-agent socket и направления clipboard через платформенные OpenSSH/terminal возможности. `omp ssh` управляет native host configurations, а не превращает произвольный SSH/tssh launcher в готовый bridge. Рабочие wrappers остаются; приватные ключи не копируются, host trust, доступ к tabs и clipboard directions согласуются. OSC 52 copy, обычный paste и OSC 5522 image paste имеют разные ограничения; без image-paste capability используется явно разрешенная передача выбранного файла в private scratch, не фиктивный remote clipboard.

### Работа с текстом

Для отдельного редактирования вызовите `/skill:no-ai-slop` с черновиком: результат содержит полный исправленный текст и короткий **What changed**. Для проверки без переписывания явно попросите detect/audit: skill называет наблюдаемые шаблоны, цитирует строки и предлагает короткие исправления, без оценки вероятности AI-авторства.

Для подготовки или существенной переработки документации, описаний PR/MR, release notes, развёрнутых ревью, планов и отчётов используется короткий встроенный режим скилла. Обычные технические ответы, вопросы настройки, подтверждения, короткие статусы, ссылки, заголовки и однострочные коммиты сами по себе его не требуют. Уже прочитанные правила применяются без повторной загрузки или отдельного прохода при смене стадии workflow. Режим не добавляет **What changed**, чеклист или разделы к заданному формату.

Сохраняются факты, риски, оговорки, идентификаторы, код и команды, точные логи/доказательства, продуктовые термины, язык, формат и legal notices; чужой текст меняется только в порученных границах. Нет postprocessor, детектора, regex-классификатора запросов, дополнительного model/network call или обязательного второго агента. Редактура не разрешает отправку комментария, commit, push, merge или публикацию.

Обязательная инъекция `no-ai-slop` на каждом ходе удалена. Выбор задают description скилла и условные указания в workflow, а не поиск ключевых слов в сообщении. Единственный публичный skill находится в `skills/no-ai-slop/SKILL.md`; vendor-каталог не входит в объявленные skill roots. Полные upstream-правила и self-check читаются для standalone edit/detect, а не автоматически при подготовке любого артефакта. Pinned vendor-файлы сохранены без изменений.

## Проверка

```sh
npm test
node --test skills/security-review/vendor/*.test.cjs
shellcheck scripts/toolchain.sh
```

Node-проверки helpers используют одноразовые каталоги, fake CLI и loopback HTTP; Docker и внешние сервисы не нужны. Проверены read-only диагностика, выборочная установка и границы отказов, сохранение другого backend и настроек, credentials/redirect границы, повторная установка и отсутствие пересоздания существующего runtime.

Нативные проверки: установка на OMP 18.18.6; на OMP 18.18.8 - отдельный профиль и проектный слой Hindsight без изменения остальных профилей, stdio и HTTP MCP с env-ссылкой на токен. Backlog.md 1.55.3 возвращает workflow выбранного одноразового трекера; Whiteboard 0.5.2 из Desktop bundle запускает изолированный headless backend и отвечает на backend-backed MCP capabilities без системного Node. Установки системных пакетов через Homebrew/npm в этих проверках не выполнялись. Режимы Ponytail и маршрутизация памяти проверены отдельно; границы live-проверки памяти описаны в `docs/memory.md`.

Проверки 0.5.0 на native OMP 18.20.2 выполнялись в disposable HOME/profile с dummy credentials и loopback-only fixture provider, без inference. Проверены native role writes/readback, enabledModels-filtered RPC discovery, локальные agent definitions, effective first-party help/gain paths, marketplace install и TUI selected input shape с видимым `Usage unavailable` и восстановлением placeholder. Это не проверка live Codex usage, tokens/sec во время генерации, качества моделей или фактической цены аккаунта. Для bridges проверены source/help contracts, native host registration/list и запись relay extension; реальные browser tabs, callback login, remote agent и clipboard требуют разрешенного окружения и отдельно описанной readiness.

## Происхождение и лицензии

Собственный код и адаптированные общие helpers: `UNLICENSED`, без неявного предоставления лицензии. Публичность репозитория не меняет этого статуса.

Ponytail: MIT, Dietrich Gebert. Версия 4.12.0, upstream `https://github.com/DietrichGebert/ponytail.git`, commit `e15862bb04d04285233a164460ced063941d9ef5`. Сохранены `vendor/ponytail/LICENSE` и `UPSTREAM`. Поставляется необходимый runtime/skills subset без benchmarks. Локальные изменения: native extension принимает builder инструкций вторым необязательным аргументом; Ai-Kit передает короткий указатель вместо полного текста. Metadata основного skill сокращена, вспомогательные skills помечены `hide: true`. Команды, режимы и persistence upstream сохранены.

No AI slop: MIT, Peter Yang, upstream `https://github.com/petergyang/no-ai-slop`, commit `000650b156983f5159695b441477f4e63b25dc85`. `vendor/no-ai-slop/SKILL.md`, `eval.md` и `LICENSE` сохранены без изменений; source paths и Git blob IDs закреплены в `vendor/no-ai-slop/UPSTREAM`. Scripts, agents и plugin runtime upstream не поставляются. Локальный MIT-wrapper в `skills/no-ai-slop/SKILL.md` сохраняет standalone edit/detect и задаёт условный короткий режим для содержательных инженерных текстов.

Security review: MIT, Cloudflare; upstream `https://github.com/cloudflare/security-audit-skill`, commit `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`. Сохранены `skills/security-review/vendor/LICENSE`, `UPSTREAM`, schema и оба validators с тестами. Общий engine перенесен из прежней vendored/adapted копии; Ai-Kit адаптирует routing, progressive disclosure и пропорциональное делегирование, сохраняя sandbox, source evidence, независимую проверку findings и честные coverage limits.
