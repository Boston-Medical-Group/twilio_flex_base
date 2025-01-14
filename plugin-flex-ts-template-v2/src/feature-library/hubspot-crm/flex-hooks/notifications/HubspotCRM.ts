import * as Flex from '@twilio/flex-ui';

import { StringTemplates } from '../strings';

// Export the notification IDs an enum for better maintainability when accessing them elsewhere
export enum HubspotCRMNotification {
  HCRMErrorLoadingConversations = 'HCRMErrorLoadingConversations',
  HCRMErrorNotEnoughMessages = 'HCRMErrorNotEnoughMessages',
  HCRMErrorLoadingConversationMessages = 'HCRMErrorLoadingConversationMessages'
}

// Return an array of Flex.Notification
export const notificationHook = (flex: typeof Flex, manager: Flex.Manager) => [
  {
    id: HubspotCRMNotification.HCRMErrorLoadingConversations,
    type: Flex.NotificationType.error,
    content: StringTemplates.HCRMErrorLoadingConversations,
  },
  {
    id: HubspotCRMNotification.HCRMErrorNotEnoughMessages,
    type: Flex.NotificationType.error,
    content: StringTemplates.HCRMErrorNotEnoughMessages,
  },
  {
    id: HubspotCRMNotification.HCRMErrorLoadingConversationMessages,
    type: Flex.NotificationType.error,
    content: StringTemplates.HCRMErrorLoadingConversationMessages,
  },
];