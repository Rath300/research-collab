// Analytics utility for tracking user events
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackSignUp = (method: string = 'email') => {
  trackEvent('sign_up', {
    method,
    timestamp: new Date().toISOString(),
  });
};

export const trackLogin = (method: string = 'email') => {
  trackEvent('login', {
    method,
    timestamp: new Date().toISOString(),
  });
};

export const trackMatch = (matchType: 'swipe' | 'request') => {
  trackEvent('match_created', {
    match_type: matchType,
    timestamp: new Date().toISOString(),
  });
};

export const trackProjectCreated = (projectType: string) => {
  trackEvent('project_created', {
    project_type: projectType,
    timestamp: new Date().toISOString(),
  });
};

export const trackJoinRequest = (requestType: 'sent' | 'accepted' | 'declined') => {
  trackEvent('join_request', {
    request_type: requestType,
    timestamp: new Date().toISOString(),
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    timestamp: new Date().toISOString(),
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    timestamp: new Date().toISOString(),
  });
};

// User engagement metrics
export const trackUserEngagement = (action: string, details?: Record<string, any>) => {
  trackEvent('user_engagement', {
    action,
    ...details,
    timestamp: new Date().toISOString(),
  });
}; 