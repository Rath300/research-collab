import React from 'react';
import { twMerge } from 'tailwind-merge';
export function Tab(_a) {
    var label = _a.label, active = _a.active, onClick = _a.onClick, count = _a.count, className = _a.className;
    return (<button type="button" onClick={onClick} className={twMerge('py-4 px-1 relative font-medium text-sm focus-visible:outline-none', active
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300', className)}>
      <div className="flex items-center">
        <span>{label}</span>
        {count !== undefined && (<span className={"ml-2 rounded-full px-2 py-0.5 text-xs font-medium ".concat(active
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
            {count}
          </span>)}
      </div>
      
      {/* Active indicator line */}
      {active && (<span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600 dark:bg-primary-400"/>)}
    </button>);
}
