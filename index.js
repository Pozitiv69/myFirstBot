const TelegramBot = require('node-telegram-bot-api');
const path = require('node:path');

const token = '5666972940:AAGagdTZEU0MaA1Trdk3MWiQSMnEBSNJ6IY';

const bot = new TelegramBot(token, { polling: true });

const chats = {};

bot.setMyCommands([
  { command: '/start', description: 'Приветствие' },
  { command: '/info', description: 'Описание' },
  { command: '/game', description: 'Игра: Угадай число, ПРИЗ 100$' },
]);

const againOption = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: 'Играть еще раз!', callback_data: '/again' }]],
  }),
};

const gameButton = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: 'Играть!', callback_data: '/again' }]],
  }),
};

const gameOption = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: '1', callback_data: '1' },
        { text: '2', callback_data: '2' },
        { text: '3', callback_data: '3' },
      ],
      [
        { text: '4', callback_data: '4' },
        { text: '5', callback_data: '5' },
        { text: '6', callback_data: '6' },
      ],

      [
        { text: '7', callback_data: '7' },
        { text: '8', callback_data: '8' },
        { text: '9', callback_data: '9' },
      ],
      [{ text: '0', callback_data: '0' }],
    ],
  }),
};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю число от 0 до 9, а ты должен отгадать!`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай', gameOption);
};

const start = () => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
      return bot.sendMessage(
        chatId,
        `Привет я тебя знаю! Вот немного инфы про тебя /info`
      );
    }
    if (text === '/info') {
      await bot.sendMessage(
        chatId,
        `Тебя звать ${msg.from.first_name}!\nЭто твое фото? Если нет, то давай сыграем.`
      );
      return bot.sendPhoto(chatId, './file/IMG_kep.png', gameButton);
    }
    if (text === '/game') {
      return startGame(chatId);
    }
    return bot.sendMessage(chatId, `Я тебя не понимаю`);
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    if (data === chats[chatId])
      return bot.sendMessage(
        chatId,
        `Поздравляю ты отгадал цифру ${chats[chatId]}`,
        againOption
      );
    else {
      return bot.sendMessage(
        chatId,
        `Ты не отгадал, правильный ответ был ${chats[chatId]}`,
        againOption
      );
    }
  });
};

start();
