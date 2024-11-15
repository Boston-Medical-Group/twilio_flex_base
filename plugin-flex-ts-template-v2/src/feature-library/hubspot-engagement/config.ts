import { getFeatureFlags } from '../../utils/configuration';
import HubspotEngagementConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.hubspot_engagement as HubspotEngagementConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
