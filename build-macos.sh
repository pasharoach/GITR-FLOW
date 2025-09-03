#!/bin/bash

echo "🔨 Сборка ГИТР FLOW v7.0.0 для macOS..."

# Очистка предыдущих сборок
rm -rf dist/*

# Сборка только для macOS
npx electron-builder --mac --config.mac.target=dmg

echo "✅ Сборка завершена!"
echo "📁 Файлы в папке dist/:"
ls -la dist/
