'use client';
import React, { useEffect, useState } from 'react';
import * as api from '@/lib/api';
export default function TestPage() {
    var _a;
    var _b = useState([]), apiKeys = _b[0], setApiKeys = _b[1];
    var _c = useState(''), error = _c[0], setError = _c[1];
    useEffect(function () {
        try {
            // Get all keys from the api module
            var keys = Object.keys(api);
            setApiKeys(keys);
            // Log the structure to the console as well
            console.log('API Module Structure:', api);
        }
        catch (err) {
            setError(err.message || 'Unknown error checking API structure');
            console.error('Error checking API:', err);
        }
    }, []);
    return (<div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800 p-8">
        <h1 className="text-2xl font-bold mb-6">API Module Test</h1>
        
        {error ? (<div className="p-4 bg-red-100 text-red-700 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>) : null}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">API Module Keys:</h2>
          {apiKeys.length > 0 ? (<ul className="list-disc pl-6 space-y-1">
              {apiKeys.map(function (key) { return (<li key={key}>
                  {key} - {typeof api[key]}
                </li>); })}
            </ul>) : (<p className="text-gray-500">No keys found in API module</p>)}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Environment:</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Node.js Version:</strong> {process.version || 'Unknown'}
            </li>
            <li>
              <strong>Next.js:</strong> {(typeof window !== 'undefined' && ((_a = window.__NEXT_DATA__) === null || _a === void 0 ? void 0 : _a.buildId)) ? 'Running' : 'Unknown'}
            </li>
            <li>
              <strong>Browser:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'}
            </li>
          </ul>
        </div>
      </div>
    </div>);
}
