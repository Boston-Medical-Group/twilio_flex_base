/**
 * @param {OpenAi} openai
 * @param {Array} historyDelivered
 * @param {string} apiModel
 * @param {string} accountCountry
 * @returns {string}
 * @description Convenience method to validate properties exist on an object
 * requiredKeysArray should be an array of strings or objects,
 *   { key: 'propertyName', purpose: 'describe need' }
 * error handling will fallback to less useful messages
 * if an array of strings is provided instead of the key and purpose objects
 */

exports.getGPTSummary = async (openai, historyDelivered, apiModel, accountCountry) => {
  const messages = [];

  // System messages
  messages.push({
    role: 'system',
    content:
      'Eres un asistente, encargado de generar el resumen o "summary" de una conversación entre un paciente y uno o varios agentes.',
  });
  messages.push({
    role: 'system',
    content: 'No debes incluir costos de servicios ni productos en tus resúmenes.',
  });
  messages.push({
    role: 'system',
    content:
      'No debes inventar o inferir información, solo debes incluir información relevante de la conversación si es que ha sido proporcionada.',
  });
  messages.push({
    role: 'system',
    content:
      'Debes incluir la ciudad del paciente solo en caso de que el paciente la haya proporcionado en algún momento de la conversación.',
  });

  if (accountCountry === 'bra') {
    messages.push({
      role: 'system',
      content: 'SIEMPRE debes responder en portugues de brasil.',
    });
  }

  historyDelivered.forEach((h) => {
    let author = 'assistant';
    if (h.author.startsWith('whatsapp:')) {
      author = 'user';
    }
    messages.push({
      role: author,
      content: h.body,
    });
  });

  if (accountCountry === 'bra') {
    messages.push({
      role: 'system',
      content: 'Crea un resumen de la conversación en máximo 500 caracteres ahora y responde en Portugues de Brasil.',
    });
  } else {
    messages.push({
      role: 'assistant',
      content: 'Crea un resumen de la conversación en máximo 500 caracteres ahora.',
    });
  }

  let summary = '';
  const completion = await openai.chat.completions.create({
    model: apiModel ?? 'gpt-3.5-turbo-0125',
    messages,
    temperature: 0.7,
  });

  if (completion.hasOwnProperty('choices') && completion.choices.length > 0) {
    summary = completion.choices[0].message.content;
  } else {
    console.error('COMPLETION ERROR');
    console.error(completion);
  }

  return summary;
};

exports.getGPTThreadRun = async (openai, historyDelivered, instructions, assistant) => {
  const messages = [];
  historyDelivered.forEach((h) => {
    let author = 'assistant';
    if (h.author.startsWith('whatsapp:')) {
      author = 'user';
    }

    messages.push({
      role: author,
      content: h.body,
    });
  });

  const thread = await openai.beta.threads.create({
    messages,
  });

  let options = {
    assistant_id: assistant,
  };

  if (instructions !== '') {
    options = {
      ...options,
      additional_instructions: instructions,
    };
  }

  return openai.beta.threads.runs.create(thread.id, options);
};
