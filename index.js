const TelegramBot = require('node-telegram-bot-api');
const sequelize = require('./db');
const UserModel = require('./models');
const { gameOption, gameButton, againOption } = require('./options.js');

const token = '5666972940:AAGagdTZEU0MaA1Trdk3MWiQSMnEBSNJ6IY';
const bot = new TelegramBot(token, { polling: true });
const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю число от 0 до 9, а ты должен отгадать!`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай', gameOption);
};

const startBot = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (err) {
    console.log(`Подключение к DB сломалось ${err}`);
  }

  bot.setMyCommands([
    { command: '/start', description: 'Приветствие' },
    { command: '/game', description: 'Игра: Угадай число, ПРИЗ 100$' },
    { command: '/info', description: 'Статистика побед' },
  ]);

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      if (text === '/start') {
        await UserModel.create({ chatId }); //ошибка

        await bot.sendMessage(
          chatId,
          `Привет ${msg.from.first_name}!\nДавай сыграем в игру?.`
        );
        return bot.sendSticker(
          chatId,
          'https://tlgrm.eu/_/stickers/fee/c05/feec0577-ab0f-4a65-8ccb-5aebe2feed0f/1.webp',
          gameButton
        );
      }

      if (text === '/info') {
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Имя игрока ${msg.from.first_name} ${msg.from.last_name} правильных ответов ${user.right}, неправильных ${user.wrong}`
        );
      }
      if (text === '/game') {
        return startGame(chatId);
      }
    } catch (err) {
      return bot.sendMessage(chatId, 'Произошла какая то ошибка');
    }

    return bot.sendMessage(chatId, `Я тебя не понимаю`);
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }

    const user = await UserModel.findOne({ chatId });

    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `Поздравляю ты отгадал цифру ${chats[chatId]}`,
        againOption
      );
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `Ты не отгадал, правильный ответ был ${chats[chatId]}`,
        againOption
      );
    }
    await user.save();
  });
};

startBot();
