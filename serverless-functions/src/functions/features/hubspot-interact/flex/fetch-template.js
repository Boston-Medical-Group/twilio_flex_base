const axios = require('axios');
const { iso2ToCountry } = require(Runtime.getFunctions()['common/helpers/customs-helper'].path);
const { prepareFlexFunction, executeWithRetry } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    let defaultCountry = context.COUNTRY === 'dev' ? 'DEV' : context.COUNTRY.substring(0, 2).toUpperCase();

    if (defaultCountry === 'ME') {
      defaultCountry = 'MX';
    } else if (defaultCountry === 'AL' || defaultCountry === 'ALE') {
      defaultCountry = 'DE';
    }

    const countryCode = iso2ToCountry(defaultCountry);

    const templates = await getTemplatesFromManager(countryCode, context, event.data);

    response.setBody(templates);
    return callback(null, response);

  } catch (err) {
    return handleError(err);
  }
})

const getTemplatesFromManager = async function (countryCode, context, parameters) {
  const result = await executeWithRetry(context, async () => {
    const response = await axios({
      url: `${context.FLEXMANAGER_API_URL}//messaging-templates?filter[country]=${countryCode}&filter[message_type]=whatsapp`,
      method: "GET",
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${context.FLEXMANAGER_API_KEY}`
      }
    })

    return response.data;
  });

  const templates = [];
  if (result.success && result.data.length > 0) {
    // loop object
    for (let i = 0; i < result.data.length; i++) {
      const element = result.data[i];

      const templateMessage = replaceTemplateVariables(element.attributes.message.replaceAll('\\n', '\n'), parameters)
      // convert \n to line breaks on element
      templates.push({
        name: element.attributes.template_name,
        message: templateMessage
      });
    }
  }

  return templates;
}

/**
 * Replaces template variables in a message with corresponding values from parameters.
 */
const replaceTemplateVariables = (message, parameters) => {
  const extractedParameters = extractTemplateParameters(message)
  let replacedMessage = message
  extractedParameters.forEach(parameter => {
    let paremeterValue = data_get(parameters, parameter, false)
    if (paremeterValue) {
      replacedMessage = replacedMessage.replaceAll(`{{${parameter}}}`, paremeterValue);
    }
  })
  for (const [key, value] of Object.entries(parameters)) {
    replacedMessage = replacedMessage.replaceAll(`{{${key}}}`, value);
  }
  return replacedMessage;
}

/**
 * Extracts template parameters from a given message.
 */
const extractTemplateParameters = (message) => {
  const extractedParameters = [];
  const regex = /{{(.*?)}}/g;
  let match;
  while ((match = regex.exec(message)) !== null) {
    extractedParameters.push(match[1]);
  }

  return Array.from(new Set(extractedParameters));
}

/**
 * Retrieves a value from an object using a key or a nested key path.
 *
 * @param {Object} obj - The object to retrieve the value from.
 * @param {string|array} key - The key or nested key path to retrieve the value from the object.
 * @param {any} default_value - The default value to return if the key or key path is not found in the object.
 * @return {any} The value associated with the key or key path in the object, or the default value if not found.
 */
const data_get = (obj, key, default_value) => {
  if (typeof key === 'string') {
    key = key.split('.');
  }
  for (var i = 0; i < key.length; i++) {
    if (obj === null || typeof obj !== 'object') {
      return default_value;
    }
    obj = obj[key[i]];
  }
  return obj || default_value;
}
