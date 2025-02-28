import { CountryManager } from '@twilio/flex-ui';
import ApiService from '../../../../utils/serverless/ApiService';

export interface ContactResponse {
  properties: any;
}
export interface OwnerResponse {
  data: any;
}

export interface ConversationsResponse {

}

class HubspotInteractService extends ApiService {
  async fetchCallerId(params: any): Promise<any> {
    return this.#fetchCallerId(params.queueSid, params.destination);
  }

  #fetchCallerId = async (queueSid: string, destination: string): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-caller-id`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueSid,
          toNumber: destination ?? null,
          Token: this.manager.user.token,
        }),
      },
    );
  }

  async loadHubspotData(params: any): Promise<any> {
    return this.#loadHubspotData(params);
  }

  #loadHubspotData = async (data: any): Promise<any> => {
    let bodytoSend = {};
    if (data.contact_id) {
      bodytoSend = {
        contact_id: data.contact_id,
        Token: this.manager.user.token
      }
    } else if (data.deal_id) {
      bodytoSend = {
        deal_id: data.deal_id,
        Token: this.manager.user.token
      }
    } else {
      return;
    }

    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-hubspot-contact`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodytoSend)
      }
    );
  }

  async getDataByContactId(params: any): Promise<any> {
    return this.#getDataByContactId(params.contact_id);
  }

  #getDataByContactId = async (contact_id: string): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-hubspot-contact`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id,
          Token: this.manager.user.token
        })
      }
    );
  }

  async getDataByDealId(params: any): Promise<any> {
    return this.#getDataByDealId(params.deal_id);
  }

  #getDataByDealId = async (deal_id: string): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-hubspot-contact`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id,
          Token: this.manager.user.token
        })
      }
    );
  }

  async getTemplates(params: any): Promise<any> {
    return this.#getTemplates(params);
  }

  #getTemplates = async (data: any): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-template`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          Token: this.manager.user.token
        })
      }
    );
  }

  async getTemplate(params: any): Promise<any> {
    return this.#getTemplate(params);
  }

  #getTemplate = async (data: any): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-template`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          Token: this.manager.user.token
        })
      }
    );
  }

  async getContents(params: any): Promise<any> {
    return this.#getContents(params.prefix);
  }

  #getContents = async (prefix: string) => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/fetch-content`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix,
          Token: this.manager.user.token
        })
      }
    );
  }

  async sendOutboundMessage(params: any): Promise<any> {
    return this.#sendOutboundMessage(params);
  }

  #sendOutboundMessage = async (params: any): Promise<any> => {
    const {
      To,
      customerName,
      Body,
      WorkerFriendlyName,
      KnownAgentRoutingFlag,
      OpenChatFlag,
      hubspot_contact_id,
      hubspot_deal_id
    } = params

    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/send-outbound-message`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          To,
          Body,
          customerName,
          WorkerFriendlyName,
          KnownAgentRoutingFlag,
          OpenChatFlag,
          hubspot_contact_id,
          hubspot_deal_id,
          Token: this.manager.user.token
        })
      }
    );
  }

  async startOutboundConversation(params: any): Promise<any> {
    return this.#startOutboundConversation(params);
  }

  #startOutboundConversation = async (params: any): Promise<any> => {
    const {
      To,
      customerName,
      WorkerFriendlyName,
      KnownAgentRoutingFlag,
      OpenChatFlag,
      hubspotContact,
      hubspot_contact_id,
      hubspot_deal_id
    } = params

    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/send-outbound-conversation`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          To,
          customerName,
          WorkerFriendlyName,
          KnownAgentRoutingFlag,
          OpenChatFlag,
          hubspotContact,
          hubspot_contact_id,
          hubspot_deal_id,
          Token: this.manager.user.token
        })
      }
    );
  }

  async getMessageErrors(params: any): Promise<any> {
    return this.#getMessageErrors(params.conversationSid);
  }

  #getMessageErrors = async (conversationSid: string): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/get-message-errors`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationSid,
          Token: this.manager.user.token
        })
      }
    );
  }

  async sendMessage(params: any): Promise<any> {
    return this.#sendMessage(params.contentSid, params.contentVariables, params.conversationSid, params.identity);
  }

  #sendMessage = async (contentSid: string, contentVariables: { [key: string]: string }, conversationSid: string, identity: string): Promise<any> => {
    return this.fetchJsonWithReject<ContactResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-interact/flex/send-message`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSid,
          contentVariables,
          conversationSid,
          identity,
          Token: this.manager.user.token
        })
      }
    );
  }
}

export default new HubspotInteractService();
