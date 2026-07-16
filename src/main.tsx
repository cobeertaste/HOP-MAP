import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and handle Google Maps API script errors gracefully
// to prevent "ApiNotActivatedMapError" and "Script error" from causing runtime application crashes.
if (typeof window !== 'undefined') {
  // Patch IntersectionObserver.prototype.observe to prevent crash when passed a non-Element target
  if (typeof (window as any).IntersectionObserver !== 'undefined') {
    const originalObserve = (window as any).IntersectionObserver.prototype.observe;
    (window as any).IntersectionObserver.prototype.observe = function (target: any) {
      if (target && target instanceof Element) {
        return originalObserve.call(this, target);
      } else {
        console.warn('Suppressed invalid IntersectionObserver.observe call on target:', target);
      }
    };
  }

  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    const srcStr = String(source || '');
    
    if (
      msgStr.includes('google.maps') || 
      msgStr.includes('gm_authFailure') || 
      msgStr.includes('ApiNotActivatedMapError') ||
      msgStr.includes('Script error.') ||
      msgStr.includes('IntersectionObserver') ||
      msgStr.includes('instance of Element') ||
      srcStr.includes('maps.googleapis.com')
    ) {
      console.warn('Ignored script or observer error:', msgStr, srcStr);
      return true; // Suppress error propagation
    }
    
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  const originalConsoleError = console.error;
  console.error = function (...args) {
    const errorStr = args.map(arg => {
      try {
        if (arg instanceof Error) {
          return arg.message + '\n' + arg.stack;
        }
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');

    if (
      errorStr.includes('ApiNotActivatedMapError') ||
      errorStr.includes('google.maps') ||
      errorStr.includes('gm_authFailure') ||
      errorStr.includes('maps.googleapis.com') ||
      errorStr.includes('Google Maps')
    ) {
      // Demote to non-error level
      console.info('Suppressed Google Maps API console error:', errorStr);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const reasonStr = String(reason || '');
    if (
      reasonStr.includes('google.maps') || 
      reasonStr.includes('gm_authFailure') || 
      reasonStr.includes('ApiNotActivatedMapError')
    ) {
      console.warn('Ignored Google Maps unhandled promise rejection:', reason);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
