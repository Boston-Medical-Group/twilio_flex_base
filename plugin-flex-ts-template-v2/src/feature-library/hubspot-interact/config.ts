import { getFeatureFlags } from '../../utils/configuration';
import HubspotInteractConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  hubspot_calendar_url_field = ''
} = (getFeatureFlags()?.features?.hubspot_interact as HubspotInteractConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const hubspotCalendarUrlField = () => {
  return hubspot_calendar_url_field;
};