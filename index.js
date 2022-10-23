const TelegramBot = require('node-telegram-bot-api');
const path = require('node:path');
const { gameOption, gameButton, againOption } = require('./options.js');
const token = '5666972940:AAGagdTZEU0MaA1Trdk3MWiQSMnEBSNJ6IY';

const bot = new TelegramBot(token, { polling: true });

const chats = {};

bot.setMyCommands([
  { command: '/start', description: 'Приветствие' },
  { command: '/info', description: 'Описание' },
  { command: '/game', description: 'Игра: Угадай число, ПРИЗ 100$' },
]);

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю число от 0 до 9, а ты должен отгадать!`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай', gameOption);
};

const startBot = () => {
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
      bot.sendMessage(
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

    if (data == chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Поздравляю ты отгадал цифру ${chats[chatId]}`,
        againOption
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Ты не отгадал, правильный ответ был ${chats[chatId]}`,
        againOption
      );
    }
  });
};

startBot();
