import { getFeatureFlags } from '../../utils/configuration';
import HubspotInteractConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.hubspot_interact as HubspotInteractConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
