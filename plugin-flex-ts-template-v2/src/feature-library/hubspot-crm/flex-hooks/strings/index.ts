import esES from './es-es.json';
import esMX from './es-mx.json';
import ptBR from './pt-br.json';

// Export the template names as an enum for better maintainability when accessing them elsewhere
export enum StringTemplates {
  CreatedDate = 'CCCreatedDate',
  Overview = 'CCOverview',
  History = 'CCHistory',
  NoConversationsFound = 'CCNoConversationsFound',
  ActivitySummary = 'CCActivitySummary',
  RefreshSummary = 'CCRefreshSummary',
  SuggestReply = 'CCSuggestReply',
  AIAssistant = 'CCAIAssistant',
  AIAssistantGreeting = 'CCAiAssistantGreeting',
  AIAssistantErrorOrTimeout = 'CCAIAssistantErrorOrTimeout',
  AIRefineSuggestion = 'CCRefineSuggestion',
  AISuggestionInstructions = 'CCAISuggestionInstructions',
  Refine = 'CCRefine',
  Cancel = 'CCCancel',
  SendSuggestion = 'CCSendSuggestion',
  NoMessagesInConversation = 'CCNoMessagesInConversation',
  PleaseWait = 'CCPleaseWait',
  ConversationStart = 'CCConversationStart',
  ConversationEnd = 'CCConversationEnd',
  HCRMErrorLoadingConversations = 'HCRMErrorLoadingConversations',
  HCRMErrorNotEnoughMessages = 'HCRMErrorNotEnoughMessages',
  HCRMErrorLoadingConversationMessages = 'HCRMErrorLoadingConversationMessages'
}

export const stringHook = () => ({
  'en-US': {
    [StringTemplates.CreatedDate]: 'Created Date',
    [StringTemplates.Overview]: 'Overview',
    [StringTemplates.History]: 'History',
    [StringTemplates.NoConversationsFound]: 'No conversations found',
    [StringTemplates.ActivitySummary]: 'Activity summary (AI)',
    [StringTemplates.RefreshSummary]: 'Refresh summary (AI)',
    [StringTemplates.SuggestReply]: 'Suggest reply (AI)',
    [StringTemplates.AIAssistant]: 'AI Assistant',
    [StringTemplates.AIAssistantGreeting]: 'Hi. I\'m your AI Assistant. Based on the current conversation and the generated context, here\'s my suggestion:',
    [StringTemplates.AIAssistantErrorOrTimeout]: 'An error has occurred while generating a suggestion or taking too long.',
    [StringTemplates.AIRefineSuggestion]: 'Refine suggestion',
    [StringTemplates.AISuggestionInstructions]: 'Add instructions to help us improve the suggestion. (255 characters max)',
    [StringTemplates.Refine]: 'Refine',
    [StringTemplates.Cancel]: 'Cancel',
    [StringTemplates.SendSuggestion]: 'Send suggestion',
    [StringTemplates.NoMessagesInConversation]: 'No messages in the conversation',
    [StringTemplates.PleaseWait]: 'Please wait...',
    [StringTemplates.ConversationStart]: 'Conversation start',
    [StringTemplates.ConversationEnd]: 'Conversation end',
    [StringTemplates.HCRMErrorLoadingConversations]: 'Error loading conversations',
    [StringTemplates.HCRMErrorNotEnoughMessages]: 'No enough context to suggest a reply',
    [StringTemplates.HCRMErrorLoadingConversationMessages]: 'Error loading conversation'
  },
  'es-MX': esMX,
  'pt-BR': ptBR,
  'es-ES': esES,
});
