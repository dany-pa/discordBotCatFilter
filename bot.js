// TODO:
/**
	Обработать ошибку, когда вылезает
	D:\work\blockchain\discordBot\node_modules\discord.js\src\rest\RequestHandler.js:201
        throw new HTTPError(error.message, error.constructor.name, error.status, request);
              ^

HTTPError [AbortError]: The user aborted a request.
    at RequestHandler.execute (D:\work\blockchain\discordBot\node_modules\discord.js\src\rest\RequestHandler.js:201:15)

	TODO: Написать тесты
	TODO: Завезти typescript

*/

const { Client, Intents } = require('discord.js');
const config = require('./config.json');
const nrc = require('node-run-cmd');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');
const intervalToDuration = require('date-fns/intervalToDuration')


const IMG_FOLDER_PATH = './img';
const SOURCES_FOLDER_PATH = `${IMG_FOLDER_PATH}/sources`;
const RESULTS_FOLDER_PATH = `${IMG_FOLDER_PATH}/results`;

let filesCount = 0;
let usersInProgress = []; 

function removeUserFromProgress(userId){
	//TODO: Функция не чистая, что делать?
	usersInProgress = [...usersInProgress.filter(el => el.userId != userId)]
}

function progressExpiredTime(time){
	let t1 = new Date(time.getTime());
    const newTime = t1.setSeconds( time.getSeconds() + config.expiredInSeconds)
    return new Date(newTime)
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES"] });

client.once('ready', () => {
	console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
	// Реагировать только на сообщения пользователей с картинкой в конкретно канале
	if ( message.author.id == config.clientId ) return;
	if ( message.channelId != config.channelId ) return;
	if ( message.attachments.size == 0 ) return;
	
	// Всего сервером может обрабатываться не более config.maxProcessingCount фоток одновременно.
	if (usersInProgress.length >= config.maxProcessingCount){
		message.channel.send({
			content: `Слишком много фоток обрабатывается. Подожди минутку и попробуй еще раз.`,
			reply: { 
				messageReference: message.id 
			}
		});
		return
	}

	// Один пользователь может обрабатывать только одну фотку за раз.
	const userId = message.author.id;
	const progress = usersInProgress.find(el => el.userId == userId)
	if (progress){
		const expiredDT = progressExpiredTime(progress.dt)
		const now = new Date();
		
		if (expiredDT > now){
			const {minutes, seconds} = intervalToDuration({
				start: now,
				end: expiredDT
			});

			message.channel.send({
				content: `Подожди, твоя прошлая фотка еще обрабатывается. Попробуй через ${minutes} мин. ${seconds} сек.`,
				reply: { 
					messageReference: message.id 
				}
			});
			return
		} else {
			removeUserFromProgress(useuserId)
			usersInProgress.push({
				userId: userId,
				dt: new Date()
			})
		}
	} else {
		usersInProgress.push({
			userId: userId,
			dt: new Date()
		})
	}
	
	// 8) Что будет если придет файл jpg, а я пытаюсь сохранить его в png?
	// 10) Какое поставить ограничение на размер файла?
	// 12) Добавить возможность админу как-то посмотреть инфу, сколько сейчас обрабатывается фоток

	// Обрабатываем только одну фотку, даже еси прикреплено несколько
	const img = message.attachments.at(0);

	if (message.attachments.size > 1){
		message.channel.send({
			content: `Ты отправил больше одной фотки. Будет обработана только первая. Остальные отправляй отдельными сообщениями.`,
			reply: { 
				messageReference: message.id 
			}
		});
	}
	
	message.channel.send({
		content: 'Фотку получил, начинаю обрабатывать.',
		reply: { 
			messageReference: message.id 
		}
	});

	try {
		const outputFilePath = await workWithImage(img.url, userId)
		
		message.channel.send({
			content: 'Мяу, держи фоточку',
			files: [outputFilePath],
			reply: { 
				messageReference: message.id 
			}
		});
	} catch {
		message.channel.send({
			content: `Что-то пошло не так, попробуйте еще раз или загрузите другую фотку.`,
			reply: { 
				messageReference: message.id 
			}
		});
	}

	// try {
	// 	await fs.rmSync(`${SOURCES_FOLDER_PATH}/${userId}`, { recursive: true });
	// } catch(err){
	// 	console.log(err)
	// }

	removeUserFromProgress(userId)
});

async function workWithImage(imageUrl, userId){
	const folderPath = `${SOURCES_FOLDER_PATH}/${userId}`;
	const sourceFilePath = `${folderPath}/source_${filesCount}.png`;
	const withoutBgFilePath = `${folderPath}/without_bg_${filesCount}.png`;
	const outputFilePath = `${RESULTS_FOLDER_PATH}/result_${userId}_${filesCount}.png`;

	await fs.promises.mkdir(`${folderPath}`, { recursive: true })
	await fs.promises.mkdir(`${RESULTS_FOLDER_PATH}`, { recursive: true })

	const file = fs.createWriteStream(sourceFilePath);
	filesCount += 1;

	return new Promise((resolve, reject) => {
		https.get(imageUrl, async function(response) {
			response.pipe(file);

			try {
				await nrc.run(`rembg -o ${withoutBgFilePath} ${sourceFilePath}`);
				
				const withoutBgBuffer = await sharp(withoutBgFilePath)
				.resize({
					width: config.maxImgWidth,
					height: config.maxImgHeight,
					fit: 'contain'
				})
				.toBuffer()

				await sharp('bg.png')
				.composite([{ input: withoutBgBuffer, gravity: 'southeast' }])
				.toFile(outputFilePath)

				resolve(outputFilePath)
			}
			catch (err) {
				console.log(err)
				reject()
			}
		})
		.on('error', (err) => {
			console.log(err)
			reject()
		});
	})
}

client.login(config.token);
// const url = 
// 'https://cdn.discordapp.com/attachments/931599100988772392/931633709906534400/EBE7CD17-1E12-4EFE-BF9F-312408B6264D.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931634415552069662/file.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931632059028488322/kartinki-ryzhih-kotov-1.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931631141977473074/1.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931630362747084830/IMG_1305.jpg'
// 'https://cdn.discordapp.com/attachments/931599100988772392/931624784129826906/3A126E92-F4A9-4462-B95A-5DA9F4969C94.jpg'
// workWithImage(url, 999, 1142)