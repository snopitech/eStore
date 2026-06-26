/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function MobileAppWrapper({ children }) {
  const location = useLocation();

  // Track screen views for analytics (optional)
  useEffect(() => {
    // You can add Google Analytics or similar here
    console.log('Screen viewed:', location.pathname);
  }, [location]);

  // Add app-like meta tags
  useEffect(() => {
    // Prevent zoom on input focus (mobile)
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Add iOS status bar styling
    const metaStatusBar = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]');
    if (!metaStatusBar) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'apple-mobile-web-app-status-bar-style';
      newMeta.content = 'black-translucent';
      document.head.appendChild(newMeta);
    }

    // Prevent pull-to-refresh (Android)
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <div className="app-wrapper">
      {children}
    </div>
  );
}

export default MobileAppWrapper;