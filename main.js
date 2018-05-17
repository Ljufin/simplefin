const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;


// data structures for user data
class Transaction {
  constructor(id, type, note, amount) {
    this.id = id;
    this.type = type;
    this.note = note;
    this.amount = amount;
  }

  logInfo() {
    console.log(this.id+' '+this.type+' '+this.note+' '+this.amount);
  }

  // used in the list of transactions in transactionsWindow
  convertToString() {
    return "#" + this.id + " || " + this.type + " || " + this.note + " || $" + this.amount;
  }

  // converts given transactions back to the format found in original file
  fileString() {
    return this.id + " " + this.type + " " + this.note + " " + this.amount;
  }

}

class Budget {
  constructor(name, spent, limit) {
    this.name = name;
    this.spent = spent;
    this.limit = limit;
  }
}

global.transactions = [];
global.balance = 2781.53;
global.monthlyBud = 100.00;
let budgets = [];
let totalBudPoints = 0;
let monBudPoints = 0;

// set env
//process.env.NODE_ENV = 'production'


// startup


// load transaction file for reading
// welcome to back to the hell that is system programming
// ironically, the fix was just reducing to one line of code
var data = fs.readFileSync('transactions.txt', 'utf8');

// parse text and add to transactions
let lines = data.split("\n");
lines.pop(); // remove the extra newline char
for (l in lines) {
  attrs = lines[l].split(" ");
  t = new Transaction(attrs[0], attrs[1], attrs[2], attrs[3]);
  transactions.push(t);
}



let mainWindow; // main screen
let addWindow;

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

  app.on('before-quit', function(){
    // shutdown procedure

    // save transactions to a file
    // convert back to string format
    var filetext = "";
    for (i in transactions) {
      filetext += transactions[i].fileString();
      filetext += "\n";
    }

    fs.writeFile('transactions.txt', filetext, 'utf8', function(err) {
      if(err) {
        return console.log(err);
    }});
  });

  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu);
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

  // process data from addWindow form
  let t = new Transaction(transactions.length, item[0], item[1], item[2]);
  transactions.push(t);
  // decrease the total balance and the monthly budget left
  balance -= Number(t.amount);
  monthlyBud -= Number(t.amount);
  // change to string format and then send
  mainWindow.webContents.send('item:add', t.convertToString())
   //addWindow.close() //doesn't work because addWindow is now created in transactionsWindow.html
})


ipcMain.on('load:page', (event, arg) => {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, arg),
    protocol: 'file:',
    slashes: true
  }));
});

// create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu:[
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
