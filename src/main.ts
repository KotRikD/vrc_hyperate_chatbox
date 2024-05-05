import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { HyperateMonitor } from "./features/hyperateMonitor";
import { StartHyperateMonitorParams } from "./types";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const monitor = new HyperateMonitor();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 345,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: false
  });
  mainWindow.setMenuBarVisibility(false)

  monitor.eventEmitter.on('heartbeat-sent', () => mainWindow.webContents.send('monitor-connected', {}))
  monitor.eventEmitter.on('monitor-connected', () => mainWindow.webContents.send('monitor-connected', {}))
  monitor.eventEmitter.on('monitor-stopped', () => mainWindow.webContents.send('monitor-stopped', {}))
  monitor.eventEmitter.on('monitor-error', (error: string) => mainWindow.webContents.send('monitor-error', error))
  monitor.eventEmitter.on('heartbeat-sent', () => mainWindow.webContents.send('heartbeat-sent', {}))
  monitor.eventEmitter.on('heartrate-update', (newHeartRate: number) => mainWindow.webContents.send('heartrate-update', newHeartRate))

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  ipcMain.on("start-hyperate-monitor", (_, params: StartHyperateMonitorParams) => {
    monitor.setCode(params.code)
    monitor.setOptions(params.options, params.formattedString);
    if (monitor.isConnected) {
      monitor.stop();
    }

    setTimeout(() => {
      monitor.start()
    }, 3000)
  });

  ipcMain.on('stop-hyperate-monitor', () => {
    monitor.stop();
  })

  if (process.env.NODE_ENV === "development") {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
