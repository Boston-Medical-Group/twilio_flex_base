import * as Flex from "@twilio/flex-ui";
import React, { useCallback, useEffect, useState } from 'react';
import { SkeletonLoader } from '@twilio-paste/core/skeleton-loader';
import SummaryContent from './Summary/SummaryContent';
import GPTReplyModal from './Summary/GPTReplyModal'

type Props = {
    manager: Flex.Manager
    task: Flex.ITask
}

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 */
const Summary = ({ manager, task } : Props) => {
    
    const [accountCountry, setAccountCountry] = useState(manager.serviceConfiguration.attributes.account_country);

    //const [conversationSid, setConversationSid] = useState();
    //const [channelSid] = useState(task.attributes?.taskChannelSid)
    const [summary, setSummary] = useState<any>({});
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showButtons, setShowButtons] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    useEffect(() => {
        setLoaded(false)
        let csid = task?.attributes?.conversationSid ?? false
        console.log('CSID', csid)
        if (csid) {
            reloadSummary(csid, false).finally(() => {

                const workerAttr: Flex.WorkerAttributes & { ia_enabled: string } | Record<string, any> | undefined = manager?.workerClient?.attributes
                const roles = manager?.store?.getState()?.flex?.session?.ssoTokenPayload?.roles ?? []
                const skills = workerAttr?.routing?.skills ?? []

                if (workerAttr !== undefined && workerAttr.ia_enabled === 'true') {
                    console.log('Loading IA Features as workers is IA_ENABLED');
                }
                setShowButtons(roles.indexOf('admin') >= 0 || skills?.indexOf('IA_Assistant') >= 0 || (workerAttr !== undefined && workerAttr.ia_enabled === 'true'))
                setLoaded(true)
            })
        }
    }, [task])

    const suggestReply = async () => {
        handleModalOpen();
    }

    const reloadSummary = useCallback(async (conversationSid, force) => {
        setLoading(true)

        const request = await fetch(`${process.env.FLEX_APP_TWILIO_SERVERLESS_DOMAIN}/crm/getConversationSummary`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationSid,
                country: accountCountry,
                force,
                Token: manager.store.getState().flex.session.ssoTokenPayload.token
            })
        });

        setSummary(await request.json())
        setLoading(false)
    }, [])

    if (!loaded) {
        return (
            <>
                <SkeletonLoader height="150px" />
            </>
        )
    }

    if (!summary.hasOwnProperty('content')) {
        return <></>
    }

    return (
        <>
            <GPTReplyModal manager={manager} isOpen={isModalOpen} handleClose={handleModalClose}
                conversationSid={task.attributes.conversationSid} messagesCount={summary.messagesCount} />
            <SummaryContent conversationSid={task.attributes.conversationSid} reloadAction={reloadSummary} suggestAction={suggestReply} summary={summary} loading={loading} withoutButtons={!showButtons} />
        </>
    );
};

export default Summary