const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set env
//process.env.NODE_ENV = 'production'

let mainWindow // main screen
let addWindow


// startup
// listen for app to be ready
app.on('ready', function(){
  // create new window
  mainWindow = new BrowserWindow({});
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit()
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu)
});

// handle switching to rick-roll screen
function eastereggScreen(){
  // load the new html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'eastereggWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
}

// Handle create add window
function createAddWindow(){
  // create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });
  // load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage collection handler
  addWindow.on('close', function(){
    addWindow = null
  })
}

// catch item:addWindow
ipcMain.on('item:add', function(e, item){
  //console.log(item)
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

// create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu:[
      {
        label: 'Add Item',
        // shortcuts
        accelerator: process.platform == 'darwin' ? 'Command+T' :
        'Ctrl+T',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear')
        }
      },

      {
        label: 'Quit',
        // shortcuts
        accelerator: process.platform == 'darwin' ? 'Command+Q' :
        'Ctrl+Q',
        click(){
          app.quit()
        }
      }
    ]
  }
];

// if mac, add empt object to Menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({})
}

// Add dev tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle Devtools',
        // shortcuts
        accelerator: process.platform == 'darwin' ? 'Command+I' :
        'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools()
        }
      },
      {
        label: 'Motivation',
        click(){
          eastereggScreen()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
