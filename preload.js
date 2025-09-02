const { contextBridge, ipcRenderer } = require('electron');

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
    ipcRenderer.invoke('download-file-to-folder', fileUrl, fileName, studentName, downloadFolder, moodleToken)
}); 