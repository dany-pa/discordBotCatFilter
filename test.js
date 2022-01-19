// const sharp = require('sharp');
// const aws = require('aws-sdk');
// const S3_BUCKET = process.env.S3_BUCKET;
// const fs = require('fs');
// const axios = require('axios');
// const nrc = require('node-run-cmd');
// const { exec } = require("child_process");

// exec("curl -s https://catfilterdiscord.s3.eu-west-2.amazonaws.com/source_3.png | rembg > output2.png", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });



// async function run(){
//     try {
//         const result = await nrc.run(`curl -s https://catfilterdiscord.s3.eu-west-2.amazonaws.com/source_3.png | rembg > output2.png`)
//         console.log(result);
//     } catch(err) {
//         console.error(err)
//     }
// }

// run()

// const s3 = new aws.S3({
//     region: 'eu-west-2',
//     accessKeyId: 'AKIAV3G3ADYQ2UYOGJM6',
//     secretAccessKey: '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',
// });

// axios.get('https://catfilterdiscord.s3.eu-west-2.amazonaws.com/bg.png',  { responseType: 'arraybuffer' })
// .then(response => {
//     sharp(response.data).toFile('./')
// })



// const fileStream = fs.createReadStream('./sources/source_2.png')

// const withoutBgBuffer = sharp('./sources/source_3.png')
// .toBuffer()
// .then(data => {
//     const uploadParams = {
//         Bucket: 'catfilterdiscord',
//         Body: data,
//         Key: 'source_3.png',

//         ACL: 'public-read',
//     }
//     s3.putObject(uploadParams).promise()
// })

// const uploadParams = {
//     Bucket: 'catfilterdiscord',
//     Body: fileStream,
//     Key: 'source_3.png',
//     ACL: 'public-read',
// }
// s3.putObject(uploadParams).promise()


// s3.uploadFile(uploadParams).promise()


console.log('123')