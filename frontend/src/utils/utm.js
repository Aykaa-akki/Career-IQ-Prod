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

// Landing Page Version key
const LP_VERSION_KEY = 'lp_version';

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
    
    // Capture LP version if present in URL
    const lpVersion = urlParams.get('lp') || urlParams.get('lp_version');
    if (lpVersion) {
      localStorage.setItem(LP_VERSION_KEY, lpVersion);
    }
  } catch (error) {
    console.error('Error capturing UTM params:', error);
  }
};

/**
 * Set the landing page version (called from landing page component)
 * @param {string} version - The LP version identifier (e.g., 'CQLPV-1', 'CQLPV-2')
 */
export const setLPVersion = (version) => {
  try {
    if (version) {
      localStorage.setItem(LP_VERSION_KEY, version);
    }
  } catch (error) {
    console.error('Error setting LP version:', error);
  }
};

/**
 * Get the current landing page version
 * @returns {string} LP version or default 'CQLPV-1'
 */
export const getLPVersion = () => {
  try {
    return localStorage.getItem(LP_VERSION_KEY) || 'CQLPV-1';
  } catch (error) {
    console.error('Error getting LP version:', error);
    return 'CQLPV-1';
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
    
    // Include LP version in UTM data
    utmData.lp_version = getLPVersion();
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
    localStorage.removeItem(LP_VERSION_KEY);
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
  pushUTMToDataLayer,
  setLPVersion,
  getLPVersion
};
