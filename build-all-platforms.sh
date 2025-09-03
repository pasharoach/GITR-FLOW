#!/bin/bash

echo "🚀 Сборка ГИТР FLOW v7.0.0 для всех платформ"
echo "================================================"

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm и попробуйте снова."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"
echo "✅ npm $(npm -v) найден"

# Устанавливаем зависимости
echo ""
echo "📦 Установка зависимостей..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей"
    exit 1
fi

echo "✅ Зависимости установлены"

# Очищаем предыдущие сборки
echo ""
echo "🧹 Очистка предыдущих сборок..."
rm -rf dist/
rm -rf node_modules/.cache/

echo "✅ Очистка завершена"

# Сборка для всех платформ
echo ""
echo "🔨 Сборка для всех платформ..."

# Сборка для Windows
echo "🪟 Сборка для Windows..."
npm run build -- --win --x64

# Сборка для macOS Intel
echo "🍎 Сборка для macOS Intel..."
npm run build -- --mac --x64

# Сборка для macOS Apple Silicon
echo "🍎 Сборка для macOS Apple Silicon..."
npm run build -- --mac --arm64

# Сборка для Linux
echo "🐧 Сборка для Linux..."
npm run build -- --linux --x64

echo ""
echo "✅ Сборка завершена!"
echo ""
echo "📁 Файлы сборки находятся в папке 'dist':"
echo "   - Windows: ГИТР FLOW Setup 7.0.0.exe"
echo "   - macOS Intel: ГИТР FLOW-7.0.0.dmg"
echo "   - macOS Apple Silicon: ГИТР FLOW-7.0.0-arm64.dmg"
echo "   - Linux: ГИТР FLOW-7.0.0-x86_64.AppImage"
echo ""
echo "�� Готово к релизу!"
