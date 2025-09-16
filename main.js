const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Специальные настройки для macOS Intel
if (process.platform === 'darwin' && process.arch === 'x64') {
  // Отключаем проверку сертификатов для Intel macOS
  app.commandLine.appendSwitch('--ignore-certificate-errors');
  app.commandLine.appendSwitch('--ignore-ssl-errors');
  app.commandLine.appendSwitch('--allow-running-insecure-content');
  app.commandLine.appendSwitch('--disable-web-security');
  app.commandLine.appendSwitch('--no-sandbox');
  
  // Дополнительные настройки для решения проблем с сетью
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
  app.commandLine.appendSwitch('--enable-gpu-rasterization');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  app.commandLine.appendSwitch('--disable-ipc-flooding-protection');
  
  // Настройки для обхода блокировок сети
  app.commandLine.appendSwitch('--disable-extensions');
  app.commandLine.appendSwitch('--disable-plugins');
  app.commandLine.appendSwitch('--disable-default-apps');
  app.commandLine.appendSwitch('--disable-sync');
  
  // Принудительное использование HTTP/1.1
  app.commandLine.appendSwitch('--disable-http2');
  app.commandLine.appendSwitch('--disable-quic');
}

let mainWindow;

// Настройки для автоматического обновления
autoUpdater.checkForUpdatesAndNotify();

// Настройки для macOS Intel (игнорируем ошибки сертификатов)
if (process.platform === 'darwin' && process.arch === 'x64') {
  autoUpdater.requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  };
}

function createWindow() {
  // Разные настройки для разных платформ
  const isWindows = process.platform === 'win32';
  
  const windowConfig = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: process.arch !== 'x64', // Отключаем для Intel macOS
      allowRunningInsecureContent: process.arch === 'x64', // Разрешаем для Intel macOS
      experimentalFeatures: process.arch === 'x64', // Включаем экспериментальные функции для Intel
      enableRemoteModule: process.arch === 'x64' // Разрешаем удаленный модуль для Intel
    },
    show: false
  };

  // Для Windows - кастомное окно без рамки (как на macOS)
  if (isWindows) {
    windowConfig.frame = false;
    windowConfig.titleBarStyle = 'hidden';
  } else {
    // Для macOS - кастомное окно без рамки
    windowConfig.frame = false;
    windowConfig.titleBarStyle = 'hidden';
    windowConfig.vibrancy = 'under-window';
    windowConfig.visualEffectState = 'active';
  }

  mainWindow = new BrowserWindow(windowConfig);

  // Загружаем приложение
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Обработка сетевых ошибок для macOS Intel
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -2) { // ERR_FAILED
      setTimeout(() => {
        mainWindow.reload();
      }, 2000);
    }
  });

  // Обработка сертификатов для macOS
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    // Для Intel macOS - игнорируем все ошибки сертификатов
    if (process.arch === 'x64') {
      event.preventDefault();
      callback(true);
    } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Настройка автоматического обновления после создания окна
  setupAutoUpdater();
}

// Настройка автоматического обновления
function setupAutoUpdater() {
  // Проверяем обновления при запуске (с задержкой 3 секунды)
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000);

  // События автоматического обновления
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Проверка обновлений...');
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'checking', message: 'Проверка обновлений...' });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('📦 Доступно обновление:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { 
        status: 'available', 
        message: `Доступна новая версия ${info.version}`,
        version: info.version,
        releaseNotes: info.releaseNotes
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('✅ Обновления не найдены. Текущая версия:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { 
        status: 'not-available', 
        message: 'У вас установлена последняя версия',
        version: info.version
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('❌ Ошибка при проверке обновлений:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { 
        status: 'error', 
        message: `Ошибка проверки обновлений: ${err.message}`
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Скорость загрузки: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Загружено ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log('📥 Загрузка обновления:', log_message);
    
    if (mainWindow) {
      mainWindow.webContents.send('update-progress', {
        percent: Math.round(progressObj.percent),
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Обновление загружено:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { 
        status: 'downloaded', 
        message: `Обновление ${info.version} загружено. Перезапустите приложение для установки.`,
        version: info.version
      });
    }
  });
}

// Создаем меню приложения
function createMenu() {
  const template = [
    {
      label: 'ГИТР FLOW',
      submenu: [
        {
          label: 'О приложении',
          role: 'about'
        },
        {
          label: 'Проверить обновления',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-update-modal');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Выход',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },

    {
      label: 'Правка',
      submenu: [
        { label: 'Отменить', accelerator: process.platform === 'darwin' ? 'Cmd+Z' : 'Ctrl+Z', role: 'undo' },
        { label: 'Повторить', accelerator: process.platform === 'darwin' ? 'Shift+Cmd+Z' : 'Ctrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Вырезать', accelerator: process.platform === 'darwin' ? 'Cmd+X' : 'Ctrl+X', role: 'cut' },
        { label: 'Копировать', accelerator: process.platform === 'darwin' ? 'Cmd+C' : 'Ctrl+C', role: 'copy' },
        { label: 'Вставить', accelerator: process.platform === 'darwin' ? 'Cmd+V' : 'Ctrl+V', role: 'paste' },
        { label: 'Выделить все', accelerator: process.platform === 'darwin' ? 'Cmd+A' : 'Ctrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'Оценивание',
      submenu: [
        { 
          label: 'Горячие клавиши', 
          click: () => {
            mainWindow.webContents.send('open-hotkeys-modal');
          }
        }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { label: 'Перезагрузить', accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R', role: 'reload' },
        { type: 'separator' },
        { label: 'Увеличить', accelerator: process.platform === 'darwin' ? 'Cmd+Plus' : 'Ctrl+Plus', role: 'zoomIn' },
        { label: 'Уменьшить', accelerator: process.platform === 'darwin' ? 'Cmd+-' : 'Ctrl+-', role: 'zoomOut' },
        { label: 'Сбросить масштаб', accelerator: process.platform === 'darwin' ? 'Cmd+0' : 'Ctrl+0', role: 'resetZoom' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  
  // Включаем меню для доступа к проверке обновлений
  Menu.setApplicationMenu(menu);
}

// Регистрируем глобальную горячую клавишу для DevTools
app.whenReady().then(() => {
  // Для macOS
  if (process.platform === 'darwin') {
    globalShortcut.register('Cmd+Option+I', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools();
      }
    });
  }
  
  // Универсальная клавиша F12
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });
});

// IPC обработчики управления окном
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});

app.whenReady().then(() => {
  // Настройка информации "О программе"
      app.setAboutPanelOptions({
        applicationName: 'ГИТР FLOW',
        applicationVersion: '8.0.0',
        version: '8.0.0',
        copyright: '12:21 Studio @ 2025\ndigital@gitr.ru'
    });
  
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC обработчики для автоматического обновления
ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// IPC обработчик для выбора папки скачивания
ipcMain.handle('select-download-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Выберите папку для скачивания файлов'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, folderPath: result.filePaths[0] };
    } else {
      return { success: false, folderPath: null };
    }
  } catch (error) {
    console.error('Ошибка при выборе папки:', error);
    return { success: false, error: error.message };
  }
});

// IPC обработчик для выполнения HTTP запросов (специально для Intel macOS)
ipcMain.handle('make-http-request', async (event, url, options = {}) => {
  try {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    // Специальные настройки для Intel macOS
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      }
    };
    
    // Для Intel macOS отключаем проверку сертификатов
    if (process.arch === 'x64' && isHttps) {
      requestOptions.rejectUnauthorized = false;
    }
    
    return new Promise((resolve, reject) => {
      const request = client.request(requestOptions, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          // Возвращаем только сериализуемые данные (без функций), иначе IPC бросает "An object could not be cloned"
          let parsedJson = null;
          try {
            parsedJson = JSON.parse(data);
          } catch (_) {
            parsedJson = null;
          }
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            statusText: response.statusMessage,
            body: data,
            json: parsedJson
          });
        });
      });
      
      request.on('error', (error) => {
        console.error('❌ Ошибка HTTP запроса:', error);
        reject(new Error(`Ошибка сети: ${error.message}`));
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Таймаут запроса'));
      });
      
      request.end();
    });
    
  } catch (error) {
    console.error('Ошибка при выполнении HTTP запроса:', error);
    return { success: false, error: error.message };
  }
});

// IPC обработчик для скачивания файла в указанную папку
ipcMain.handle('download-file-to-folder', async (event, fileUrl, fileName, studentName, downloadFolder, moodleToken) => {
  try {
    const https = require('https');
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    
    // Создаем безопасное имя файла
    const safeFileName = `${studentName}_${fileName}`.replace(/[<>:"/\\|?*]/g, '_');
    const filePath = path.join(downloadFolder, safeFileName);
    
    // Добавляем токен к URL если он есть
    let finalUrl = fileUrl;
    if (moodleToken && !fileUrl.includes('token=')) {
      const separator = fileUrl.includes('?') ? '&' : '?';
      finalUrl = `${fileUrl}${separator}token=${moodleToken}`;
    }
    
    // Определяем протокол
    const isHttps = finalUrl.startsWith('https://');
    const client = isHttps ? https : http;
    
    // Специальные настройки для Intel macOS
    const requestOptions = {};
    if (process.arch === 'x64') {
      requestOptions.rejectUnauthorized = false; // Игнорируем ошибки сертификатов
      requestOptions.agent = false; // Отключаем агент
    }
    
    return new Promise((resolve, reject) => {
      const request = client.get(finalUrl, requestOptions, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(filePath);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            resolve({ success: true, filePath: filePath });
          });
          
          fileStream.on('error', (error) => {
            console.error(`❌ Ошибка записи файла ${safeFileName}:`, error);
            reject({ success: false, error: error.message });
          });
        } else {
          reject({ success: false, error: `HTTP ${response.statusCode}` });
        }
      });
      
      request.on('error', (error) => {
        console.error(`❌ Ошибка скачивания файла ${safeFileName}:`, error);
        reject({ success: false, error: error.message });
      });
      
      // Таймаут 30 секунд
      request.setTimeout(30000, () => {
        request.destroy();
        reject({ success: false, error: 'Таймаут скачивания' });
      });
    });
    
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
    return { success: false, error: error.message };
  }
});

// Очищаем глобальные горячие клавиши при закрытии
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
}); 