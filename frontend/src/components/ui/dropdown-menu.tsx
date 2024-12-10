import React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DropdownMenu({ children, className = "" }: DropdownMenuProps) {
  return <div className={`relative inline-block text-left ${className}`}>{children}</div>;
}

export function DropdownMenuTrigger({ children, className = "" }: DropdownMenuTriggerProps) {
  return (
    <button className={`inline-flex justify-center items-center ${className}`}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, className = "" }: DropdownMenuContentProps) {
  return (
    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${className}`}>
      <div className="py-1" role="menu" aria-orientation="vertical">
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({ children, className = "", onClick }: DropdownMenuItemProps) {
  return (
    <button
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </button>
  );
}