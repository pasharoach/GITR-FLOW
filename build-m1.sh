#!/bin/bash

echo "🍎 Сборка ГИТР FLOW v3.1.0 для M chip Mac..."

# Очистка предыдущих сборок
rm -rf dist/*

# Сборка только для M chip (arm64)
npx electron-builder --mac --arm64 --config.mac.target=dmg

echo "✅ Сборка завершена!"
echo "📁 Файлы в папке dist/:"
ls -la dist/
