// Тест автоматического обновления
const { autoUpdater } = require('electron-updater');

console.log('🧪 Тестирование автоматического обновления...');
console.log('');

// Настройки для отладки
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'debug';

// Проверяем обновления
autoUpdater.checkForUpdatesAndNotify();

// Обработчики событий
autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Проверка обновлений...');
});

autoUpdater.on('update-available', (info) => {
    console.log('✅ Обновление найдено!');
    console.log('📦 Версия:', info.version);
    console.log('📝 Описание:', info.releaseNotes || 'Нет описания');
    console.log('');
    console.log('🎉 Автоматическое обновление работает!');
});

autoUpdater.on('update-not-available', (info) => {
    console.log('❌ Обновления не найдены');
    console.log('📦 Текущая версия:', info.version);
    console.log('');
    console.log('⚠️  Возможные причины:');
    console.log('   - Версия 7.2.0 не найдена');
    console.log('   - Проблемы с доступом к GitHub');
    console.log('   - Неправильная конфигурация');
});

autoUpdater.on('error', (err) => {
    console.log('❌ Ошибка при проверке обновлений:', err.message);
    console.log('');
    console.log('🔧 Возможные решения:');
    console.log('   - Проверьте интернет-соединение');
    console.log('   - Убедитесь, что GitHub релиз создан');
    console.log('   - Проверьте настройки publish в package.json');
});

// Завершаем через 15 секунд
setTimeout(() => {
    console.log('');
    console.log('⏰ Тест завершен через 15 секунд');
    process.exit(0);
}, 15000);
