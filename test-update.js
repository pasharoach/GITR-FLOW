// Тестовый скрипт для проверки автоматического обновления
const { autoUpdater } = require('electron-updater');

console.log('🧪 Тестирование автоматического обновления...');
console.log('📦 Текущая версия: 7.0.0');
console.log('🎯 Ожидаемая новая версия: 7.2.0');
console.log('');

// Настройки для тестирования
autoUpdater.checkForUpdatesAndNotify();

// Обработчики событий
autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Проверка обновлений...');
});

autoUpdater.on('update-available', (info) => {
    console.log('✅ Обновление найдено!');
    console.log('📦 Новая версия:', info.version);
    console.log('📝 Описание:', info.releaseNotes || 'Нет описания');
    console.log('');
    console.log('🎉 Тест прошел успешно! Приложение видит обновление.');
});

autoUpdater.on('update-not-available', (info) => {
    console.log('❌ Обновления не найдены');
    console.log('📦 Текущая версия:', info.version);
    console.log('');
    console.log('⚠️  Возможные причины:');
    console.log('   - Версия 7.2.0 не опубликована на GitHub');
    console.log('   - Проблемы с доступом к GitHub');
    console.log('   - Неправильная конфигурация publish');
});

autoUpdater.on('error', (err) => {
    console.log('❌ Ошибка при проверке обновлений:', err.message);
    console.log('');
    console.log('🔧 Возможные решения:');
    console.log('   - Проверьте интернет-соединение');
    console.log('   - Убедитесь, что GitHub релиз создан');
    console.log('   - Проверьте настройки publish в package.json');
});

// Завершаем через 10 секунд
setTimeout(() => {
    console.log('');
    console.log('⏰ Тест завершен через 10 секунд');
    process.exit(0);
}, 10000);
