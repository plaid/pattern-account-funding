import React from 'react';

interface CheckboxProps {
  id: string;
  value: boolean;
  onChange: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Checkbox({ id, value, onChange, children, className = '' }: CheckboxProps) {
  return (
    <label htmlFor={id} className={`inline-flex items-center gap-2 cursor-pointer text-sm ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={value}
        onChange={onChange}
        className="h-4 w-4 rounded border-black-400 text-black-1000 focus:ring-blue-800"
      />
      <span>{children}</span>
    </label>
  );
}

export default Checkbox;
