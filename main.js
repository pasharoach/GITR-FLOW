const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');

// Специальные настройки для macOS Intel
if (process.platform === 'darwin' && process.arch === 'x64') {
  console.log('🍎 Обнаружен macOS Intel, применяем специальные настройки для сети...');
  
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
    console.log('❌ Ошибка загрузки:', errorCode, errorDescription, validatedURL);
    if (errorCode === -2) { // ERR_FAILED
      console.log('🔧 Попытка перезагрузки из-за сетевой ошибки...');
      setTimeout(() => {
        mainWindow.reload();
      }, 2000);
    }
  });

  // Обработка сертификатов для macOS
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    console.log('🔒 Ошибка сертификата:', error, url);
    
    // Для Intel macOS - игнорируем все ошибки сертификатов
    if (process.arch === 'x64') {
      console.log('🍎 Intel macOS: игнорируем ошибку сертификата');
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
          label: 'Шаблоны комментариев', 
          accelerator: process.platform === 'darwin' ? 'Cmd+T' : 'Ctrl+T',
          click: () => {
            mainWindow.webContents.send('open-templates-modal');
          }
        },
        { type: 'separator' },
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
  
  // Убираем меню для кастомного интерфейса на всех платформах
  Menu.setApplicationMenu(null);
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
        applicationVersion: '7.0.0',
        version: '7.0.0',
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
      console.log('🍎 Intel macOS: применяем специальные настройки для скачивания');
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
            console.log(`✅ Файл ${safeFileName} успешно скачан в ${downloadFolder}`);
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