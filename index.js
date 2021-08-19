const { app, BrowserWindow } = require('electron')

function createWindow () {
	const win = new BrowserWindow({
		icon: __dirname+'/Image/favicon.ico',
		minWidth: 800,
		minHeight: 600,
		center: true,
		title: 'X Comic Downloader v1.8.2',
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	win.maximize(true)
	win.setMenu(null)

	win.addListener('close', e => {
		e.preventDefault()
	})

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