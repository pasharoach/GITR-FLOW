const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');

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
      preload: path.join(__dirname, 'preload.js')
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
        applicationVersion: '6.0.0',
        version: '6.0.0',
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
    
    return new Promise((resolve, reject) => {
      const request = client.get(finalUrl, (response) => {
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