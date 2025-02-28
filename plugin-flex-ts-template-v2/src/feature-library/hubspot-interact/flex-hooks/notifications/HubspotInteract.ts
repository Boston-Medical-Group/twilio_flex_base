import * as Flex from '@twilio/flex-ui';

import { StringTemplates } from '../strings';

// Export the notification IDs an enum for better maintainability when accessing them elsewhere
export enum HubspotInteractNotification {
  AlreadyActiveConversationWithAnotherAgent = 'AlreadyActiveConversationWithAnotherAgent',
  AlreadyActiveConversationWithAgent = 'AlreadyActiveConversationWithAgent',
  AlreadyActiveConversationWithoutAgent = 'AlreadyActiveConversationWithoutAgent',
  ContactNotFoundOnHubpost = 'ContactNotFoundOnHubpost',
  WhatsappTemplateSendMessage = 'WhatsappTemplateSendMessage'
}

// Return an array of Flex.Notification
export const notificationHook = (flex: typeof Flex, manager: Flex.Manager) => [
  {
    id: HubspotInteractNotification.AlreadyActiveConversationWithAnotherAgent,
    content: StringTemplates.HINotificationAlreadyActiveConversationWithAnotherAgent,
    type: Flex.NotificationType.error
  },
  {
    id: HubspotInteractNotification.AlreadyActiveConversationWithAgent,
    content: StringTemplates.HINotificationAlreadyActiveConversationWithAgent,
    type: Flex.NotificationType.error
  },
  {
    id: HubspotInteractNotification.AlreadyActiveConversationWithoutAgent,
    content: StringTemplates.HINotificationAlreadyActiveConversationWithoutAgent,
    type: Flex.NotificationType.error
  },
  {
    id: HubspotInteractNotification.ContactNotFoundOnHubpost,
    content: 'Error',
    type: Flex.NotificationType.error
  },
  {
    id: HubspotInteractNotification.WhatsappTemplateSendMessage,
    content: 'Error',
    type: Flex.NotificationType.error
  }
];