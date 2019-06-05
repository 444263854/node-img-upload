'use static'
const fs = require('fs')
const os = require('os')


let reader = fs.createReadStream('./upload/GifCam.zip')
let reader2 = fs.createReadStream('./upload/css3-shine-progressbar.rar')
let writer = fs.createWriteStream('./upload/css3-shine-progressbar.rar')
reader.pipe(writer)
