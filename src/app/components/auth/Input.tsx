import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border rounded-md text-sm focus:ring focus:outline-none ${className}`}
      {...props}
    />
  )
}
