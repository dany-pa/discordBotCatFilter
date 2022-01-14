const sharp = require('sharp');
sharp('bg.png')
.composite([{ input: 'without_bg_1.png', gravity: 'southeast' }])
.toFile('output.jpg')