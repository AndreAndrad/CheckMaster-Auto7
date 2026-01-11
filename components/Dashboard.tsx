
import React from 'react';
import { Card, Badge, Button } from './UI';
import { DollarSign, ClipboardCheck, History, Plus } from 'lucide-react';
import { Submission, Template } from '../types';

interface DashboardProps {
  submissions: Submission[];
  templates: Template[];
  onStartChecklist: () => void;
  onGoToHistory: () => void;
  onGoToBuilder: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ submissions, templates, onStartChecklist, onGoToHistory, onGoToBuilder }) => {
  const totalRevenue = submissions.reduce((acc, sub) => acc + sub.totalValue, 0);
  const monthSubmissions = submissions.filter(s => new Date(s.date).getMonth() === new Date().getMonth()).length;

  return (
    <div className="flex flex-col gap-8 fade-in p-4 pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CheckMaster<span className="text-indigo-600">Auto</span></h1>
        <p className="text-slate-500 font-medium">Bom dia, Técnico!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <Badge variant="emerald">Faturamento Total</Badge>
          </div>
          <div className="text-4xl font-black mb-1">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-indigo-100 text-sm font-medium">Acumulado de {submissions.length} inspeções</p>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ClipboardCheck size={24} />
            </div>
            <Badge variant="indigo">Mês Atual</Badge>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{monthSubmissions}</div>
            <p className="text-slate-500 text-sm">Checklists realizados este mês</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onStartChecklist}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 active:scale-95 transition-all group"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold text-slate-700">Novo Checklist</span>
        </button>

        <button 
          onClick={onGoToBuilder}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 active:scale-95 transition-all group"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ClipboardCheck size={32} />
          </div>
          <span className="font-bold text-slate-700">Templates</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold text-slate-800">Atividades Recentes</h2>
          <button onClick={onGoToHistory} className="text-indigo-600 font-bold text-sm">Ver tudo</button>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">Nenhuma atividade registrada ainda.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.slice(-3).reverse().map(sub => (
              <div key={sub.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <History size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{sub.templateName}</div>
                    <div className="text-xs text-slate-400">{new Date(sub.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-emerald-500 font-extrabold">
                  +{sub.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
