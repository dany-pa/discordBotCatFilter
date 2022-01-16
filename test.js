const sharp = require('sharp');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const fs = require('fs');

const s3 = new aws.S3({
    region: 'eu-west-2',
    accessKeyId: 'AKIAV3G3ADYQ2UYOGJM6',
    secretAccessKey: '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',
});

const fileStream = fs.createReadStream('./sources/source_2.png')

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

const uploadParams = {
    Bucket: 'catfilterdiscord',
    Body: fileStream,
    Key: 'source_3.png',
    ACL: 'public-read',
}
s3.putObject(uploadParams).promise()


// s3.uploadFile(uploadParams).promise()
