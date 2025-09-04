#!/bin/bash

echo "🍎 Сборка ГИТР FLOW v7.0.0 только для Intel macOS"
echo "=================================================="

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

# Сборка только для macOS Intel
echo ""
echo "🍎 Сборка для macOS Intel (x64)..."

npm run build -- --mac --x64

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Сборка Intel macOS завершена успешно!"
    echo ""
    echo "📁 Файлы сборки находятся в папке 'dist':"
    echo "   - macOS Intel: ГИТР FLOW-7.0.0.dmg"
    echo "   - macOS Intel ZIP: ГИТР FLOW-7.0.0-mac.zip"
    echo ""
    echo "🎉 Готово к тестированию на Intel macOS!"
else
    echo "❌ Ошибка сборки для Intel macOS"
    exit 1
fi
