const { MSICreator } = require('electron-wix-msi')
const path = require('path')

const APP_DIR = path.resolve(__dirname, './release-builds/x-comic-downloader-win32-x64')
const OUT_DIR = path.resolve(__dirname, './windows_installer')

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    description: 'A Software for Downloading Adult or Hentai Comic and Manga.',
    exe: 'x-comic-downloader',
    name: 'X Comic Downloader',
    manufacturer: 'X Comic Downloader Inc',
    version: '1.0.0',
	appIconPath: './Image/favicon.ico',
    ui: {
        chooseDirectory: true
    }
})

msiCreator.create().then(() => {
    msiCreator.compile();
})
