'use client';

import React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = '', children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  className = '', 
  children, 
  activeTab,
  setActiveTab 
}) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  className = '', 
  children, 
  activeTab,
  setActiveTab 
}) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  className = '', 
  children, 
  activeTab 
}) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};