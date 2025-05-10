var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { twMerge } from 'tailwind-merge';
export var Input = React.forwardRef(function (_a, ref) {
    var className = _a.className, label = _a.label, error = _a.error, helperText = _a.helperText, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, _b = _a.isFullWidth, isFullWidth = _b === void 0 ? true : _b, props = __rest(_a, ["className", "label", "error", "helperText", "leftIcon", "rightIcon", "isFullWidth"]);
    var inputClasses = twMerge('flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900', error && 'border-red-500 focus:ring-red-500', leftIcon && 'pl-10', rightIcon && 'pr-10', isFullWidth && 'w-full', className);
    return (<div className={isFullWidth ? 'w-full' : ''}>
        {label && (<label htmlFor={props.id} className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </label>)}
        <div className="relative">
          {leftIcon && (<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>)}
          <input ref={ref} className={inputClasses} {...props}/>
          {rightIcon && (<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>)}
        </div>
        {error && (<p className="mt-1 text-sm text-red-500">{error}</p>)}
        {helperText && !error && (<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>)}
      </div>);
});
Input.displayName = 'Input';
