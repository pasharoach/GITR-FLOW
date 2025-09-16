// Тестовый скрипт для проверки GitHub релиза
const https = require('https');

console.log('🧪 Проверка GitHub релиза v7.2.0...');
console.log('');

const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/pasharoach/GITR-FLOW/releases',
    method: 'GET',
    headers: {
        'User-Agent': 'GITR-FLOW-Auto-Update-Test',
        'Accept': 'application/vnd.github.v3+json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log('📡 Ответ от GitHub:', data.substring(0, 200) + '...');
            console.log('');
            
            const releases = JSON.parse(data);
            console.log('📊 Тип данных:', typeof releases);
            console.log('📊 Найдено релизов:', Array.isArray(releases) ? releases.length : 'не массив');
            console.log('');

            const release720 = releases.find(r => r.tag_name === 'v7.2.0');
            
            if (release720) {
                console.log('✅ Релиз v7.2.0 найден!');
                console.log('📦 Версия:', release720.tag_name);
                console.log('📝 Название:', release720.name);
                console.log('📅 Дата:', new Date(release720.published_at).toLocaleString('ru-RU'));
                console.log('📋 Описание:', release720.body ? release720.body.substring(0, 100) + '...' : 'Нет описания');
                console.log('');
                console.log('📁 Файлы релиза:');
                release720.assets.forEach(asset => {
                    console.log(`   - ${asset.name} (${(asset.size / 1024 / 1024).toFixed(1)} MB)`);
                });
                console.log('');
                console.log('🎉 GitHub релиз готов! Теперь можно тестировать обновления в приложении.');
            } else {
                console.log('❌ Релиз v7.2.0 не найден');
                console.log('');
                console.log('📋 Доступные релизы:');
                releases.forEach(release => {
                    console.log(`   - ${release.tag_name} (${new Date(release.published_at).toLocaleDateString('ru-RU')})`);
                });
                console.log('');
                console.log('⚠️  Возможные причины:');
                console.log('   - Релиз еще не создан');
                console.log('   - Неправильный тег (должен быть v7.2.0)');
                console.log('   - Проблемы с публикацией');
            }
        } catch (error) {
            console.log('❌ Ошибка при парсинге ответа:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Ошибка при запросе к GitHub:', error.message);
    console.log('');
    console.log('🔧 Возможные решения:');
    console.log('   - Проверьте интернет-соединение');
    console.log('   - Убедитесь, что репозиторий pasharoach/Notebook существует');
    console.log('   - Проверьте права доступа к репозиторию');
});

req.end();
