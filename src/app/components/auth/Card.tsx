import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`p-16 border-b ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 border-t ${className}`} {...props}>
      {children}
    </div>
  )
}
