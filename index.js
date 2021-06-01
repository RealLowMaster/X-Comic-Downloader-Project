const { app, BrowserWindow } = require('electron')
const fs = require('fs')
require('v8-compile-cache');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.maximize(true)

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
	fs.rmdir('./tmp', (err) => {
		console.log(err)
	})
  if (process.platform !== 'darwin') {
    app.quit()
  }
})