export const i18n = {
  ru: {
    status: "в сети · голос включён",
    placeholder: "Введи сообщение… (или нажми 🎤 и говори)",
    send: "Отправить",
    hint: "Сначала выбери язык записи микрофона, потом нажми и говори.",
    thinking: "Хермес думает…",
    errNet: "❌ Ошибка соединения: ",
    errMic: "❌ Браузер не поддерживает запись. Попробуйте Chrome или Edge.",
    welcome: "Привет! Я Хермес. Давай общаться! 😊",
    upOk: "📎 Файл получен: ",
    upErr: "❌ Не удалось загрузить: ",
    recError: "❌ Ошибка микрофона: ",
    notHeard: "🤔 Не расслышал — попробуй ещё раз.",
  },
  en: {
    status: "online · voice enabled",
    placeholder: "Type a message… (or click 🎤 and talk)",
    send: "Send",
    hint: "First choose the mic language, then click and talk.",
    thinking: "Hermes is thinking…",
    errNet: "❌ Connection error: ",
    errMic: "❌ Your browser doesn't support recording. Try Chrome or Edge.",
    welcome: "Hey! I'm Hermes. Let's chat! 😊",
    upOk: "📎 File received: ",
    upErr: "❌ Upload failed: ",
    recError: "❌ Mic error: ",
    notHeard: "🤔 Didn't catch that — try again.",
  },
} as const;

export type I18nKey = keyof typeof i18n.ru;
