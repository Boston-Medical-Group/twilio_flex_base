const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const client = context.getTwilioClient();

    // Obtiene plantillas del Template Builder
    //@ts-ignore
    const templates = await client.content.v1.contentAndApprovals.list({
      limit: 100,
      pageSize: 100
    })

    // Filter templates to get only those with property approvalRequests.status = 'approved'
    const approvedTemplates = templates.filter((template) => {
      if (event.prefix && event.prefix !== '') {
        return template.approvalRequests?.status === 'approved' && template.friendlyName.startsWith(event.prefix)
      }

      return template.approvalRequests?.status === 'approved'
    })

    response.setBody(approvedTemplates);

    return callback(null, response);
  } catch (err) {
    return handleError(err);
  }
})