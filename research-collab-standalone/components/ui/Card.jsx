import React from 'react';
import { twMerge } from 'tailwind-merge';
export var Card = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.hover, hover = _b === void 0 ? false : _b;
    return (<div className={twMerge('rounded-lg bg-white p-6 shadow-card transition-shadow dark:bg-slate-800', hover && 'hover:shadow-card-hover', className)}>
      {children}
    </div>);
};
export var CardHeader = function (_a) {
    var children = _a.children, className = _a.className;
    return (<div className={twMerge('mb-4', className)}>
      {children}
    </div>);
};
export var CardTitle = function (_a) {
    var children = _a.children, className = _a.className;
    return (<h3 className={twMerge('text-xl font-bold tracking-tight', className)}>
      {children}
    </h3>);
};
export var CardDescription = function (_a) {
    var children = _a.children, className = _a.className;
    return (<p className={twMerge('text-sm text-gray-500 dark:text-gray-400', className)}>
      {children}
    </p>);
};
export var CardContent = function (_a) {
    var children = _a.children, className = _a.className;
    return (<div className={twMerge('', className)}>
      {children}
    </div>);
};
export var CardFooter = function (_a) {
    var children = _a.children, className = _a.className;
    return (<div className={twMerge('mt-4 flex items-center', className)}>
      {children}
    </div>);
};
