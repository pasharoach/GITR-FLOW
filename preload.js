const { contextBridge, ipcRenderer } = require('electron');
// Expose needed Node libs for renderer (safe via contextIsolation)
let mammothLib = null;
try {
  mammothLib = require('mammoth');
} catch (e) {
  // keep null if not available; renderer will handle
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Заметки
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
  
  // Настройки
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Управление окном
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // События
  onNewNote: (callback) => ipcRenderer.on('new-note', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onSetFolder: (callback) => ipcRenderer.on('set-folder', callback),
  onExportNotes: (callback) => ipcRenderer.on('export-notes', callback),
  
  // Удаление слушателей
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Шаблоны комментариев
  onOpenTemplatesModal: (callback) => ipcRenderer.on('open-templates-modal', callback),
  
  // Горячие клавиши
  onOpenHotkeysModal: (callback) => ipcRenderer.on('open-hotkeys-modal', callback),
  
  // Выбор папки для скачивания
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),
  
  // Скачивание файла в указанную папку
  downloadFileToFolder: (fileUrl, fileName, studentName, downloadFolder, moodleToken) => 
    ipcRenderer.invoke('download-file-to-folder', fileUrl, fileName, studentName, downloadFolder, moodleToken),
  
  // HTTP запросы (специально для Intel macOS)
  makeHttpRequest: (url, options) => ipcRenderer.invoke('make-http-request', url, options),
  
  // Автоматическое обновление
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // События обновления
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, data) => callback(data)),
  
  // События меню
  onOpenUpdateModal: (callback) => ipcRenderer.on('open-update-modal', callback)
}); 

// Expose libraries to renderer safely
contextBridge.exposeInMainWorld('libs', {
  mammoth: mammothLib
});