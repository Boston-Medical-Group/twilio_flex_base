import ApiService from '../../../../utils/serverless/ApiService';

export interface ContactResponse {
  data: any;
}
export interface OwnerResponse {
  data: any;
}

export interface ConversationsResponse {

}

class HubspotCRMService extends ApiService {
  async getContactById(params: any): Promise<ContactResponse> {
    return this.#getContactById(params);
  }

  async loadConversations(params: any): Promise<any> {
    return this.#loadConversations(params);
  }

  async getConversationLog(params: any): Promise<any> {
    return this.#getConversationLog(params);
  }

  async createThreadAndRun(params: any): Promise<any> {
    return this.#createThreadAndRun(params);
  }

  async getRunStatus(params: any): Promise<any> {
    return this.#getRunStatus(params);
  }

  async getHubspotUserOwnerByQuery(params: any): Promise<any> {
    return this.#getHubspotUserOwnerByQuery(params.query, params.by);
  }

  #loadConversations = async (params: any): Promise<any> => {
    const {
      phone,
      currentConversation
    } = params;

    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/load-conversations`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skipSid: currentConversation,
          phone,
          Token: this.manager.user.token,
        }),
      },
    );
  };

  #getContactById = async (params: any): Promise<ContactResponse> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/get-contact-by-id`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          Token: this.manager.user.token,
        }),
      },
    );
  };

  #getConversationLog = async (params: any): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/get-conversation-log`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationSid: params.sid,
          Token: this.manager.user.token,
        }),
      },
    );
  }


  #createThreadAndRun = async (params: any): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/create-assistant-thread`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationSid: params.conversationSid,
        instruction: params.instruction,
        Token: this.manager.user.token
      }),
    }
    );
  }

  #getRunStatus = async (params: any): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/get-assistant-run-result`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: params.thread_id,
        run_id: params.run_id,
        Token: this.manager.user.token
      }),
    }
    );
  }

  /**
   * Obtiene el Owner del contacto a partir del email del contacto
   * 
   * @param query email del usuario o userId
   * @returns 
   */
  #getHubspotUserOwnerByQuery = async (query: string, by: string): Promise<any> => {
    return this.fetchJsonWithReject<OwnerResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-crm/get-hubspot-user-owner`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        by,
        query,
        Token: this.manager.user.token
      }),
    }
    );
  }
}

export default new HubspotCRMService();
