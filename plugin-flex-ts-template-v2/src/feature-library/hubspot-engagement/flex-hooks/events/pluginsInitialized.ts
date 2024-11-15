import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import { registerLogHubspotCallEngagement } from '../custom-actions/logHubspotCallEngagement';
import { registerLogHubspotChatEngagement } from '../custom-actions/logHubspotChatEngagement';
import { registerLogHubspotSummaryNote } from '../custom-actions/logHubspotSummaryNote';

export const eventName = FlexEvent.pluginsInitialized;
export const eventHook = async function registerHubspotEngagementOnInit(_flex: typeof Flex) {
  registerLogHubspotCallEngagement();
  registerLogHubspotChatEngagement();
  registerLogHubspotSummaryNote();
};
