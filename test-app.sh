#!/bin/bash

# Скрипт для тестирования приложения с автоматическим обновлением

echo "🚀 Запуск тестирования приложения ГИТР FLOW..."

# Устанавливаем PATH для использования локального Node.js
export PATH="/Users/pasharoach/Documents/GitHub/Notebook/node-v20.10.0-darwin-arm64/bin:$PATH"

# Проверяем версию Node.js
echo "📦 Версия Node.js: $(node --version)"
echo "📦 Версия npm: $(npm --version)"

# Проверяем, что electron-updater установлен
if [ -d "node_modules/electron-updater" ]; then
    echo "✅ electron-updater установлен"
else
    echo "❌ electron-updater не найден"
    exit 1
fi

# Проверяем package.json
echo "📋 Проверка package.json..."
if grep -q "electron-updater" package.json; then
    echo "✅ electron-updater добавлен в dependencies"
else
    echo "❌ electron-updater не найден в package.json"
    exit 1
fi

# Проверяем main.js
echo "📋 Проверка main.js..."
if grep -q "autoUpdater" main.js; then
    echo "✅ autoUpdater импортирован в main.js"
else
    echo "❌ autoUpdater не найден в main.js"
    exit 1
fi

# Проверяем preload.js
echo "📋 Проверка preload.js..."
if grep -q "checkForUpdates" preload.js; then
    echo "✅ API обновлений добавлен в preload.js"
else
    echo "❌ API обновлений не найден в preload.js"
    exit 1
fi

# Проверяем HTML
echo "📋 Проверка index.html..."
if grep -q "update-modal" renderer/index.html; then
    echo "✅ Модальное окно обновлений добавлено"
else
    echo "❌ Модальное окно обновлений не найдено"
    exit 1
fi

echo ""
echo "🎉 Все проверки пройдены успешно!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Создайте GitHub токен с правами 'repo'"
echo "2. Добавьте токен в переменные окружения: export GH_TOKEN=your_token"
echo "3. Соберите приложение: npm run build"
echo "4. Создайте релиз на GitHub"
echo "5. Протестируйте автоматическое обновление"
echo ""
echo "📖 Подробные инструкции в файле AUTO_UPDATE_SETUP.md"
