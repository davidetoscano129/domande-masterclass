export const normalizeConfig = (config) => {
  if (!config || !config.questions) return config;

  return {
    ...config,
    questions: config.questions.map((question) => {
      if (!question.options) return question;

      return {
        ...question,
        options: question.options.map((option, index) => {
          // Se è già un oggetto con id e text, lo mantiene
          if (typeof option === "object" && option.id && option.text) {
            return option;
          }
          // Se è una stringa, la converte in oggetto
          if (typeof option === "string") {
            return { id: index + 1, text: option };
          }
          // Altri casi
          return { id: index + 1, text: String(option) };
        }),
      };
    }),
  };
};
