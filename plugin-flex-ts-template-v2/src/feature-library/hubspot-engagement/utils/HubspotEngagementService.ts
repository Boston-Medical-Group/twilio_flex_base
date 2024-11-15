import ApiService from '../../../utils/serverless/ApiService';

export interface CallEngagementResponse {
  data: any;
}

export interface ChatEngagementResponse {
  data: any;
}

export interface SummaryNoteResponse {
  data: any;
}

class HubspotEngagementService extends ApiService {
  async postCallEngagement(params: any): Promise<CallEngagementResponse> {
    return this.#postCallEngagement(params);
  }

  async postChatEngagement(params: any): Promise<ChatEngagementResponse> {
    return this.#postChatEngagement(params);
  }

  async postSummaryNote(params: any): Promise<SummaryNoteResponse> {
    return this.#postSummaryNote(params);
  }

  #postCallEngagement = async (params: any): Promise<CallEngagementResponse> => {
    return this.fetchJsonWithReject<CallEngagementResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-engagement/flex/post-call-engagement`,
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

  #postChatEngagement = async (params: any): Promise<ChatEngagementResponse> => {
    return this.fetchJsonWithReject<ChatEngagementResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-engagement/flex/post-chat-engagement`,
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

  #postSummaryNote = async (params: any): Promise<SummaryNoteResponse> => {
    return this.fetchJsonWithReject<SummaryNoteResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-engagement/flex/post-summary-note`,
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
}

export default new HubspotEngagementService();
