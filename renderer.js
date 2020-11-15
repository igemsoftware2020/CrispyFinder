// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let shell = require('electron').shell
document.addEventListener('click', function (event) {
  if (event.target.tagName === 'a' && event.target.href.startsWith('http')) {
    event.preventDefault()
    shell.openExternal(event.target.href)
  }
})