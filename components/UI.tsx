
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' }> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-slate-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
  };

  return (
    <button 
      className={`px-6 py-3 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = "", ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-sm font-semibold text-slate-600 px-1">{label}</label>}
    <input 
      className={`bg-slate-100 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'indigo' | 'emerald' | 'rose' }> = ({ children, variant = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[variant]}`}>
      {children}
    </span>
  );
};
