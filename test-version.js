// Тестовый скрипт для проверки версии
const packageJson = require('./package.json');
console.log('Версия в package.json:', packageJson.version);

const { app } = require('electron');
console.log('Версия приложения:', app.getVersion());
