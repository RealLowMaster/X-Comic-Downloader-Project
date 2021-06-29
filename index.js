const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')
const dirRoot = path.join(__dirname).replace('\\app.asar', '')
var setting = { "developer_mode": false }

if (fs.existsSync(dirRoot+'/setting.cfg')) {
	let settingFile = fs.readFileSync(dirRoot+'/setting.cfg')
	setting = JSON.parse(settingFile)
}

function createWindow () {
	const win = new BrowserWindow({
		icon: __dirname+'/Image/favicon.ico',
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	win.maximize(true)
	win.setMenu(null)

	if (setting.developer_mode == true) {
		globalShortcut.register('CommandOrControl+Shift+I', () => {
			win.webContents.toggleDevTools()
		})
		globalShortcut.register('CommandOrControl+R', () => {
			win.webContents.reload()
		})
	}

	win.loadFile('index.html')
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