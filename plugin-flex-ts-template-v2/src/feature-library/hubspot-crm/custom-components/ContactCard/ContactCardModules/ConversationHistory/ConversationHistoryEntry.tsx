import { templates } from "@twilio/flex-ui";
import {
    Disclosure, DisclosureHeading, DisclosureContent, useDisclosureState,
    ChatLog, ChatMessage, ChatBubble, ChatAttachment, ChatAttachmentLink, ChatAttachmentDescription, ChatMessageMeta, ChatMessageMetaItem,
    ChatEvent, ChatBookend, ChatBookendItem
} from "@twilio-paste/core"
import { Icon, Notifications } from "@twilio/flex-ui";
import { useEffect, useState } from "react";
import SummaryContent from "../Summary/SummaryContent";
import HubspotCRMService from '../../../../utils/serverless/HubspotCRMService';
import { StringTemplates } from '../../../../flex-hooks/strings';
import { HubspotCRMNotification } from '../../../../flex-hooks/notifications/HubspotCRM';

type DisclosureState = {
    conversation: any,
}

const useDelayedDisclosureState = ({ conversation, ...initialState }: DisclosureState) => {
    const disclosure = useDisclosureState(initialState);
    const [transitioning, setTransitioning] = useState(false);
    const [conversationLog, setConversationLog] = useState([]);
    const [conversationSummary, setConversationSummary] = useState('');

    return {
        ...disclosure,
        transitioning,
        conversationLog,
        conversationSummary,
        toggle: async () => {
            setTransitioning(true);
            if (conversationLog.length !== 0) {
                disclosure.toggle();
                setTransitioning(false);
            } else {
                HubspotCRMService.getConversationLog({
                    sid: conversation.conversationSid
                })
                    .then((conversationMessages) => {
                        if (!conversationMessages.hasOwnProperty('error')) {
                            setConversationLog(conversationMessages.log);
                            if (conversationMessages.summary) {
                                setConversationSummary(conversationMessages.summary);
                            }
                            disclosure.toggle();
                            setTransitioning(false);
                        } else {
                            Notifications.showNotification(HubspotCRMNotification.HCRMErrorLoadingConversationMessages);
                        }
                    })
            }

        },
    };
};

type ChannelTitleProps = {
    icon: string
    title: string
}

const ChannelTitle = ({ icon, title }: ChannelTitleProps) => {
    return (
        <>
            <Icon icon={icon} />
            {title}
        </>
    )
}

type Props = {
    conversation: any,
}

const ConversationHistoryEntry = ({ conversation }: Props) => {
    const { transitioning, conversationLog, conversationSummary, ...disclosure } = useDelayedDisclosureState({
        conversation
    });
    const [channelIcon, setChannelIcon] = useState('Message')

    useEffect(() => {
        switch (conversation.conversationOriginalChannel) {
            case 'whatsapp':
                setChannelIcon('Whatsapp')
                break;
            case 'sms':
                setChannelIcon('Sms')
                break;
            default:
                setChannelIcon('Message')
        }
    }, [])

    return (
        <Disclosure variant="contained" state={disclosure} key={conversation.conversationSid}>
            <DisclosureHeading as="h2" variant="heading40">
                {transitioning ? templates[StringTemplates.PleaseWait]() : <ChannelTitle icon={channelIcon} title={conversation.conversationDateCreated} />}
            </DisclosureHeading>
            <DisclosureContent>

                {conversationSummary && (
                    <SummaryContent summary={{ content: conversationSummary }} withoutButtons={true} reloadAction={() => { }} suggestAction={() => { }} />
                )}

                <ChatLog>
                    {conversationLog.length === 0 && (
                        <ChatEvent>
                            <strong>{templates[StringTemplates.NoMessagesInConversation]()}</strong>
                        </ChatEvent>
                    )}

                    {conversationLog.length > 0 && (
                        <ChatEvent>
                            <strong>{templates[StringTemplates.ConversationStart]()}</strong>
                        </ChatEvent>
                    )}
                    {conversationLog.map((message: any, index) => {
                        let dateTime = message.dateCreated;
                        const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                        if (message.author.startsWith("whatsapp:") || message.author.startsWith("+") || uuidPattern.test(message.author) || message.author === 'Virtual Assistant') {
                            return (
                                <ChatMessage variant="inbound" key={message.index}>
                                    <ChatBubble >{message.body}</ChatBubble>
                                    {
                                        message.media?.map((media: any, index: any) => {
                                            if (!media) {
                                                return;
                                            }
                                            let filename = media.filename;
                                            let content_type = media.content_type;
                                            if (!filename) {
                                                filename = 'undefined';
                                            }
                                            if (!content_type) {
                                                content_type = 'undefined';
                                            }
                                            return (
                                                <ChatBubble key={index}>
                                                    <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />} >
                                                        <ChatAttachmentLink href='#'>{filename}</ChatAttachmentLink>
                                                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                    </ChatAttachment>
                                                </ChatBubble>
                                            )
                                        })
                                    }
                                    <ChatMessageMeta aria-label="customer" >
                                        <ChatMessageMetaItem>{message.author} ・ {dateTime.slice(0, 24)}</ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        } else {
                            let author = message.author;
                            if (author === conversation.conversationSid) {
                                author = "Virtual Agent";
                            }
                            return (
                                <ChatMessage variant="outbound" key={message.index}>
                                    <ChatBubble >{message.body}</ChatBubble>
                                    {
                                        message.media?.map((media: any, index: any) => {
                                            if (!media) {
                                                return;
                                            }
                                            let filename = media.filename;
                                            let content_type = media.content_type;
                                            if (!filename) {
                                                filename = 'undefined';
                                            }
                                            if (!content_type) {
                                                content_type = 'undefined';
                                            }
                                            return (
                                                <ChatBubble key={index}>
                                                    <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />}>
                                                        <ChatAttachmentLink href='#'>{filename}</ChatAttachmentLink>
                                                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                    </ChatAttachment>
                                                </ChatBubble>
                                            )
                                        })
                                    }
                                    <ChatMessageMeta aria-label="agent" >
                                        <ChatMessageMetaItem>{author} ・ {dateTime.slice(0, 24)}</ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        }
                    })}

                    {conversationLog.length > 0 && (
                        <ChatBookend>
                            <ChatBookendItem>
                                <strong>{templates[StringTemplates.ConversationEnd]()}</strong>
                            </ChatBookendItem>
                        </ChatBookend>
                    )}
                </ChatLog>
            </DisclosureContent>
        </Disclosure>
    )
}

export default ConversationHistoryEntry