import ApiService from '../../../utils/serverless/ApiService';

export interface ContactResponse {
  properties: any;
}

class HubspotCrmService extends ApiService {
  async getContactById(params: any): Promise<ContactResponse> {
    return this.#getContactById(params);
  }

  #getContactById = async (params: any): Promise<ContactResponse> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/flex/get-contact-by-id`,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          Token: this.manager.user.token,
        }),
      },
    );
  };
}

export default new HubspotCrmService();
