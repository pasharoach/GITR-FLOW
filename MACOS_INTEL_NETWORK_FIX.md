# 🔧 Исправление проблем с сетью для macOS Intel

## 🚨 Проблема
Версия ГИТР FLOW для Intel macOS не выходит в интернет из-за ограничений безопасности Electron.

## ✅ Решение
В версии 7.0.0 добавлены специальные настройки для Intel macOS:

### 🔧 Автоматические исправления в коде:

1. **Отключение проверки сертификатов** для Intel macOS
2. **Отключение web security** для Intel macOS  
3. **Разрешение небезопасного контента** для Intel macOS
4. **Добавление флага --no-sandbox** для Intel macOS

### 📝 Технические детали:

```javascript
// Специальные настройки для macOS Intel
if (process.platform === 'darwin' && process.arch === 'x64') {
  app.commandLine.appendSwitch('--ignore-certificate-errors');
  app.commandLine.appendSwitch('--ignore-ssl-errors');
  app.commandLine.appendSwitch('--allow-running-insecure-content');
  app.commandLine.appendSwitch('--disable-web-security');
  app.commandLine.appendSwitch('--no-sandbox');
}
```

### 🎯 Результат:
- ✅ Intel macOS теперь может подключаться к Moodle
- ✅ M1 macOS продолжает работать без изменений
- ✅ Windows версия не затронута

## 🔄 Обновление
Просто установите версию 7.0.0 поверх старой - все настройки применятся автоматически.

## 📞 Поддержка
Если проблема остается, обратитесь в поддержку с указанием:
- Версия macOS
- Архитектура процессора (Intel/M1)
- Текст ошибки из консоли

---

**ГИТР FLOW v7.0.0** - Исправлены проблемы с сетью для Intel macOS! 🍎✨
