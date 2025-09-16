# Настройка автоматического обновления

## Что было добавлено

1. **electron-updater** - библиотека для автоматического обновления
2. **Конфигурация electron-builder** - настройки для публикации на GitHub
3. **UI для обновлений** - модальное окно с прогрессом загрузки
4. **Автоматическая проверка** - при запуске приложения

## Настройка GitHub Releases

### 1. Создание GitHub Token

1. Перейдите в GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Нажмите "Generate new token (classic)"
3. Выберите scope: `repo` (полный доступ к репозиторию)
4. Скопируйте созданный токен

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
GH_TOKEN=your_github_token_here
```

### 3. Команды для сборки и публикации

#### Для macOS (Intel + ARM):
```bash
npm run build -- --publish=always
```

#### Для Windows:
```bash
npm run build -- --win --publish=always
```

#### Для всех платформ:
```bash
npm run build -- --mac --win --publish=always
```

### 4. Автоматическая публикация через GitHub Actions (рекомендуется)

Создайте файл `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build and publish
      env:
        GH_TOKEN: ${{ secrets.GH_TOKEN }}
      run: npm run build -- --publish=always
```

### 5. Создание релиза

1. Обновите версию в `package.json`:
```json
{
  "version": "7.2.0"
}
```

2. Создайте тег и пуш:
```bash
git add .
git commit -m "Release v7.2.0"
git tag v7.2.0
git push origin main --tags
```

3. GitHub Actions автоматически соберет и опубликует релиз

## Как работает автоматическое обновление

1. **При запуске** - приложение автоматически проверяет обновления через 3 секунды
2. **Уведомление** - если найдено обновление, показывается модальное окно
3. **Загрузка** - пользователь может скачать обновление с прогресс-баром
4. **Установка** - после загрузки приложение перезапускается с новой версией

## Доступ к обновлениям

Пользователи могут:
- Открыть модальное окно через меню "Обновления"
- Проверить обновления вручную
- Скачать и установить обновления

## Особенности для macOS Intel

Добавлены специальные настройки для обхода проблем с сертификатами на Intel macOS:
- Отключение проверки SSL сертификатов
- Специальные заголовки User-Agent
- Игнорирование ошибок сертификатов

## Тестирование

1. Соберите приложение: `npm run build`
2. Запустите собранное приложение
3. Проверьте работу обновлений через меню "Обновления"

## Устранение проблем

### Ошибка "No update available"
- Убедитесь, что версия в `package.json` больше текущей
- Проверьте, что релиз создан на GitHub
- Убедитесь, что `publish` конфигурация правильная

### Ошибки сети на macOS Intel
- Настройки уже добавлены в код
- Приложение автоматически обходит проблемы с сертификатами

### Проблемы с подписью (macOS)
- Для разработки: отключите Gatekeeper
- Для продакшена: настройте код-подпись в electron-builder
