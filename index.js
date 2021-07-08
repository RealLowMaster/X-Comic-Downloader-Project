const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow () {
	const win = new BrowserWindow({
		show: false,
		icon: __dirname+'/Image/favicon.ico',
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		center: true,
		title: 'X Comic Downloader',
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	win.maximize(true)
	win.setMenu(null)

	if (true) {
		globalShortcut.register('CommandOrControl+Shift+I', () => {
			win.webContents.toggleDevTools()
		})
		globalShortcut.register('CommandOrControl+R', () => {
			win.webContents.reload()
		})
	}

	win.addListener('close', e => {
		e.preventDefault()
	})

	win.loadFile('index.html')

	win.once('ready-to-show', () => {
		win.show()
	})
}

app.setAppUserModelId("X Comic Downloader")

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})