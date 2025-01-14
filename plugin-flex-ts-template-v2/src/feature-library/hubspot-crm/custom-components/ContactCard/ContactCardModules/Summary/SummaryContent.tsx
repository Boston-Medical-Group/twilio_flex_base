import { Box, Stack, Heading, Text, ButtonGroup, Button } from "@twilio-paste/core"
//import { RefreshIcon } from "@twilio-paste/icons/esm/RefreshIcon"
import { NewIcon } from "@twilio-paste/icons/esm/NewIcon"
import { useState, useEffect } from "react"
import { templates } from "@twilio/flex-ui";
import { StringTemplates } from '../../../../flex-hooks/strings';

type Props = {
    withoutButtons: boolean
    conversationSid?: string
    summary: any
    reloadAction: Function
    suggestAction: Function
    loading?: boolean
}

const SummaryContent = ({ withoutButtons, conversationSid, summary, reloadAction, suggestAction, loading }: Props) => {
    const [withButtons, setWithButtons] = useState<boolean>(false)

    useEffect(() => {
        // withoutButtons === true -> Sin botones
        // withoutBUttons === false -> Con botones
        setWithButtons(withoutButtons === false)
    }, [])

    return (
        <Box padding="space40" width="100%">
            <Stack spacing="space60" orientation="vertical">
                <Heading as="h4" variant="heading40">{templates[StringTemplates.ActivitySummary]}</Heading>
                <Text as="p">{summary.content}</Text>

                <Box>
                    <ButtonGroup>
                        <Button variant="primary" size="small" onClick={async () => reloadAction(conversationSid, true)} disabled={loading}>

                            {templates[StringTemplates.RefreshSummary]}
                        </Button>

                        <Button variant="primary" size="small" onClick={async () => suggestAction()} disabled={loading || !withButtons}>
                            <NewIcon decorative={false} title={templates[StringTemplates.SuggestReply]} />
                            {templates[StringTemplates.SuggestReply]}</Button>
                    </ButtonGroup>
                </Box>
            </Stack>
        </Box>
    )
}

export default SummaryContent