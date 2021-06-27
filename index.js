const { app, BrowserWindow } = require('electron')

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