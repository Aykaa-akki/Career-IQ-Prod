/**
 * UTM Parameter Tracking Utility
 * Captures, persists, and retrieves UTM parameters for attribution tracking
 */

// Supported UTM parameters
const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_adset',
  'utm_adcreative'
];

/**
 * Capture UTM parameters from URL and store in localStorage
 * Only overwrites values if present in URL
 */
export const captureUTMParams = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    UTM_PARAMS.forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        localStorage.setItem(param, value);
      }
    });
  } catch (error) {
    console.error('Error capturing UTM params:', error);
  }
};

/**
 * Get all stored UTM parameters
 * @returns {Object} Object containing all UTM parameters
 */
export const getUTMParams = () => {
  const utmData = {};
  
  try {
    UTM_PARAMS.forEach(param => {
      const value = localStorage.getItem(param);
      if (value) {
        utmData[param] = value;
      }
    });
  } catch (error) {
    console.error('Error retrieving UTM params:', error);
  }
  
  return utmData;
};

/**
 * Check if any UTM parameters exist
 * @returns {boolean}
 */
export const hasUTMParams = () => {
  return Object.keys(getUTMParams()).length > 0;
};

/**
 * Build URL with UTM parameters appended
 * @param {string} baseUrl - The base URL to append UTMs to
 * @returns {string} URL with UTM parameters
 */
export const buildURLWithUTM = (baseUrl) => {
  const utmParams = getUTMParams();
  
  if (Object.keys(utmParams).length === 0) {
    return baseUrl;
  }
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  const utmString = Object.entries(utmParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${baseUrl}${separator}${utmString}`;
};

/**
 * Clear all stored UTM parameters
 */
export const clearUTMParams = () => {
  try {
    UTM_PARAMS.forEach(param => {
      localStorage.removeItem(param);
    });
  } catch (error) {
    console.error('Error clearing UTM params:', error);
  }
};

/**
 * Push UTM data to dataLayer for GTM
 */
export const pushUTMToDataLayer = () => {
  try {
    const utmParams = getUTMParams();
    
    if (Object.keys(utmParams).length > 0 && window.dataLayer) {
      window.dataLayer.push({
        event: 'utm_captured',
        ...utmParams
      });
    }
  } catch (error) {
    console.error('Error pushing UTM to dataLayer:', error);
  }
};

export default {
  captureUTMParams,
  getUTMParams,
  hasUTMParams,
  buildURLWithUTM,
  clearUTMParams,
  pushUTMToDataLayer
};
