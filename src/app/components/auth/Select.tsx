import React, { createContext, useContext, useState } from "react";

/**
 * Contexto para gerenciar o estado do Select.
 */
interface SelectContextValue {
  value: string | undefined;
  onChange: (value: string) => void;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, className }) => {
  const [value, setValue] = useState<string | undefined>(undefined);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{ value, onChange: handleChange }}>
      <div className={`relative inline-block text-left ${className}`}>{children}</div>
    </SelectContext.Provider>
  );
};

/**
 * Hook para acessar o contexto do Select.
 */
const useSelectContext = (): SelectContextValue => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("useSelectContext must be used within a Select");
  }
  return context;
};

/**
 * Trigger do Select (botão que abre o dropdown).
 */
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`w-full px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring focus:border-red-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Valor atual do Select.
 */
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = "Selecione...", className }) => {
  const { value } = useSelectContext();

  return (
    <span className={`text-sm ${value ? "text-gray-800" : "text-gray-400"} ${className}`}>
      {value || placeholder}
    </span>
  );
};

/**
 * Content do Select (dropdown com itens).
 */
interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Item do Select (opção individual).
 */
interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className, ...props }) => {
  const { onChange } = useSelectContext();

  const handleClick = () => {
    onChange(value);
  };

  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-200 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
