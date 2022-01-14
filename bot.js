// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const config = require('./config.json');
const { PythonShell } = require('python-shell');
const nrc = require('node-run-cmd');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');
let filesCount = 0;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES"] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', async (message) => {
	// 1) Реагировать только на сообщения пользователей
	if (message.author.id == config.clientId) return;
	if ( message.attachments.size == 0) return;
	
	// 2) Что делать если кто-то будет спамить? Поставить таймаут на отправку сообщений от одного пользователя.
	// 3) Ограничить количество обрабатываемых фоток в один момент от всех пользователей?
	// 4) Бот должен отправлять картинку в ответ пользовтелю, а не просто сообщением без адресата.
	// 5) Отсылать польозвателю какой-то текст вместе с картинкой
	// 6) Отправлять какой-то текст пользователю при ошибке
	// 7) Удалять файлы после отправки их пользователю
	// 8) Что будет если придет файл jpg, а я пытаюсь сохранить его в png?
	// 9) Добавить логирование процесса
	// 10) Какое поставить ограничение на размер файла?
	const img = message.attachments.at(0);
	workWithImage(img.url, img.width, img.height).then((outputFileName) => {
		message.channel.send({files: [outputFileName]});
	});
});

function workWithImage(imageUrl, imgWidth, imgHeight){
	filesCount += 1;
	const maxWidth = 1024;
	const maxHeight = 768;
	const sourceFileName = `source_${filesCount}.png`;
	const withoutBgFileName = `without_bg_${filesCount}.png`;
	const outputFileName = `result_${filesCount}.png`;
	const file = fs.createWriteStream(sourceFileName);
	
	return new Promise((resolve, reject) => {

		https.get(imageUrl, function(response) {
			response.pipe(file);
			nrc.run(`rembg -o ${withoutBgFileName} ${sourceFileName}`)
			.then(
				function (exitCodes){
					let resizeWidth = imgWidth;
					let resizeHeight = imgHeight;
					
					if (imgWidth > maxWidth){
						resizeWidth = maxWidth;
					}
	
					if (imgHeight > maxHeight){
						resizeHeight = maxHeight;
					}
	
					const withoutBgImg = sharp(withoutBgFileName).resize({
						width: maxWidth,
						height: maxHeight,
						fit: 'contain'
					}).toBuffer().then((data) => {
						sharp('bg.png')
						.composite([{ input: data, gravity: 'southeast' }])
						.toFile(outputFileName)
						.then(() => {
							resolve(outputFileName)
						})	
					});
					// const bg = sharp('bg.png');
					
					// bg
					// .composite([{ input: withoutBgImg, gravity: 'southeast' }])
					
				},
				function (err){
					console.log('------------')
					console.log('rembg')
					console.log(err)
					console.log('------------')
				}
			)
		});
	})
}

// Login to Discord with your client's token
client.login(config.token);
// const url = 
// 'https://cdn.discordapp.com/attachments/931599100988772392/931633709906534400/EBE7CD17-1E12-4EFE-BF9F-312408B6264D.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931634415552069662/file.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931632059028488322/kartinki-ryzhih-kotov-1.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931631141977473074/1.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931630362747084830/IMG_1305.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931624784129826906/3A126E92-F4A9-4462-B95A-5DA9F4969C94.jpg'
// workWithImage(url, 999, 1142)