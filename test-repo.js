// Тестовый скрипт для проверки доступности репозитория
const https = require('https');

console.log('🧪 Проверка доступности репозитория...');
console.log('');

// Проверяем разные варианты названий репозитория
const repoNames = [
    'Notebook',
    'GITR-FLOW', 
    'gitr-flow',
    'ГИТР-FLOW'
];

let currentRepo = 0;

function checkRepo(repoName) {
    console.log(`🔍 Проверяем репозиторий: pasharoach/${repoName}`);
    
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/pasharoach/${repoName}`,
        method: 'GET',
        headers: {
            'User-Agent': 'GITR-FLOW-Test',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const repo = JSON.parse(data);
                    console.log(`✅ Репозиторий найден: ${repo.full_name}`);
                    console.log(`📝 Описание: ${repo.description || 'Нет описания'}`);
                    console.log(`🔒 Приватный: ${repo.private ? 'Да' : 'Нет'}`);
                    console.log(`⭐ Звезд: ${repo.stargazers_count}`);
                    console.log('');
                    
                    // Теперь проверим релизы
                    checkReleases(repoName);
                } catch (error) {
                    console.log('❌ Ошибка при парсинге данных репозитория');
                }
            } else if (res.statusCode === 404) {
                console.log(`❌ Репозиторий не найден (404)`);
                console.log('');
                
                // Проверяем следующий репозиторий
                currentRepo++;
                if (currentRepo < repoNames.length) {
                    setTimeout(() => checkRepo(repoNames[currentRepo]), 1000);
                } else {
                    console.log('⚠️  Ни один из репозиториев не найден');
                    console.log('');
                    console.log('🔧 Возможные решения:');
                    console.log('   - Проверьте правильность названия репозитория');
                    console.log('   - Убедитесь, что репозиторий публичный');
                    console.log('   - Проверьте права доступа');
                }
            } else {
                console.log(`❌ Ошибка ${res.statusCode}: ${data}`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Ошибка при запросе: ${error.message}`);
    });

    req.end();
}

function checkReleases(repoName) {
    console.log(`🔍 Проверяем релизы для: pasharoach/${repoName}`);
    
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/pasharoach/${repoName}/releases`,
        method: 'GET',
        headers: {
            'User-Agent': 'GITR-FLOW-Test',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const releases = JSON.parse(data);
                    console.log(`📊 Найдено релизов: ${releases.length}`);
                    
                    if (releases.length > 0) {
                        console.log('📋 Последние релизы:');
                        releases.slice(0, 3).forEach(release => {
                            console.log(`   - ${release.tag_name} (${new Date(release.published_at).toLocaleDateString('ru-RU')})`);
                        });
                        
                        const release720 = releases.find(r => r.tag_name === 'v7.2.0');
                        if (release720) {
                            console.log('');
                            console.log('🎉 Релиз v7.2.0 найден! Автоматическое обновление должно работать.');
                        } else {
                            console.log('');
                            console.log('⚠️  Релиз v7.2.0 не найден. Нужно создать релиз.');
                        }
                    } else {
                        console.log('⚠️  Релизов не найдено. Нужно создать первый релиз.');
                    }
                } catch (error) {
                    console.log('❌ Ошибка при парсинге релизов');
                }
            } else {
                console.log(`❌ Ошибка при получении релизов: ${res.statusCode}`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Ошибка при запросе релизов: ${error.message}`);
    });

    req.end();
}

// Начинаем проверку
checkRepo(repoNames[currentRepo]);
