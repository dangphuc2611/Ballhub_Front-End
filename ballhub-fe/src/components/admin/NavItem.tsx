import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-emerald-50 text-emerald-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);