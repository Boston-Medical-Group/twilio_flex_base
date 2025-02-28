import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import HubspotInteractService from '../../utils/serverless/HubspotInteractService';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.StartOutboundCall;
export const actionHook = function customCallSidsHook(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, _abortFunction) => {
    if (!payload.callerId) {
      const callerId = await HubspotInteractService.fetchCallerId({
        queueSid: payload.queueSid ?? null,
        destination: payload.destination ?? null
      });

      if (callerId && callerId.callerId) {
        // Actualizar el destino de la llamada saliente con el número de teléfono dinámico
        payload.callerId = callerId.callerId;
      }
    }
  });
};