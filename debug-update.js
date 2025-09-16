// Диагностический скрипт для проверки автоматического обновления
const https = require('https');

console.log('🔍 Диагностика автоматического обновления...');
console.log('');

// Проверяем доступность GitHub API
function checkGitHubAPI() {
    console.log('1️⃣ Проверка доступности GitHub API...');
    
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/pasharoach/GITR-FLOW/releases/latest',
        method: 'GET',
        headers: {
            'User-Agent': 'GITR-FLOW-Debug',
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
                    const release = JSON.parse(data);
                    console.log('✅ GitHub API доступен');
                    console.log(`📦 Последний релиз: ${release.tag_name}`);
                    console.log(`📅 Дата: ${new Date(release.published_at).toLocaleString('ru-RU')}`);
                    console.log('');
                    
                    // Проверяем файлы релиза
                    checkReleaseFiles(release);
                } catch (error) {
                    console.log('❌ Ошибка при парсинге ответа GitHub API');
                }
            } else {
                console.log(`❌ GitHub API недоступен: ${res.statusCode}`);
                console.log(`📡 Ответ: ${data}`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Ошибка подключения к GitHub API: ${error.message}`);
        console.log('');
        console.log('🔧 Возможные решения:');
        console.log('   - Проверьте интернет-соединение');
        console.log('   - Проверьте настройки файрвола');
        console.log('   - Убедитесь, что GitHub доступен');
    });

    req.end();
}

function checkReleaseFiles(release) {
    console.log('2️⃣ Проверка файлов релиза...');
    
    const requiredFiles = [
        'latest-mac.yml',
        'ГИТР FLOW-7.2.0.dmg',
        'ГИТР FLOW-7.2.0-arm64.dmg'
    ];
    
    const foundFiles = release.assets.map(asset => asset.name);
    
    requiredFiles.forEach(file => {
        if (foundFiles.includes(file)) {
            console.log(`✅ ${file} - найден`);
        } else {
            console.log(`❌ ${file} - не найден`);
        }
    });
    
    console.log('');
    
    // Проверяем latest-mac.yml
    checkLatestMacYml(release);
}

function checkLatestMacYml(release) {
    console.log('3️⃣ Проверка latest-mac.yml...');
    
    const latestMacAsset = release.assets.find(asset => asset.name === 'latest-mac.yml');
    
    if (latestMacAsset) {
        console.log('✅ latest-mac.yml найден');
        console.log(`📁 Размер: ${latestMacAsset.size} байт`);
        console.log(`🔗 URL: ${latestMacAsset.browser_download_url}`);
        
        // Скачиваем и проверяем содержимое
        downloadLatestMacYml(latestMacAsset.browser_download_url);
    } else {
        console.log('❌ latest-mac.yml не найден - это критично!');
        console.log('');
        console.log('🔧 Решение:');
        console.log('   - latest-mac.yml необходим для автоматического обновления');
        console.log('   - Убедитесь, что файл загружен в релиз');
        console.log('   - Проверьте настройки electron-builder');
    }
}

function downloadLatestMacYml(url) {
    console.log('4️⃣ Скачивание и проверка latest-mac.yml...');
    
    const https = require('https');
    const parsedUrl = new URL(url);
    
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'GET',
        headers: {
            'User-Agent': 'GITR-FLOW-Debug'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ latest-mac.yml скачан успешно');
                console.log('📄 Содержимое:');
                console.log(data);
                console.log('');
                
                // Проверяем содержимое
                try {
                    const yaml = require('js-yaml');
                    const parsed = yaml.load(data);
                    console.log('📊 Парсинг YAML:');
                    console.log(`   Версия: ${parsed.version}`);
                    console.log(`   Файлы: ${parsed.files ? parsed.files.length : 0}`);
                    console.log(`   Путь к DMG: ${parsed.path || 'не указан'}`);
                } catch (error) {
                    console.log('⚠️  Не удалось распарсить YAML (это нормально для отладки)');
                }
            } else {
                console.log(`❌ Ошибка скачивания latest-mac.yml: ${res.statusCode}`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Ошибка при скачивании latest-mac.yml: ${error.message}`);
    });

    req.end();
}

// Запускаем диагностику
checkGitHubAPI();
