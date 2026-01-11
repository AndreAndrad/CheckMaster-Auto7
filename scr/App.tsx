
import React, { useState, useEffect } from 'react';
import { Template, Submission } from './types';
import Dashboard from './components/Dashboard';
import ChecklistBuilder from './components/ChecklistBuilder';
import ChecklistRunner from './components/ChecklistRunner';
import { Button } from './components/UI';
import { History, LayoutDashboard, Settings, PlusCircle, Trash2, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'builder' | 'runner' | 'history' | 'templates'>('dashboard');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  // Load data from LocalStorage on mount
  useEffect(() => {
    const storedTemplates = localStorage.getItem('cm_templates');
    const storedSubmissions = localStorage.getItem('cm_submissions');
    if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
    if (storedSubmissions) setSubmissions(JSON.parse(storedSubmissions));
  }, []);

  // Sync data to LocalStorage
  useEffect(() => {
    localStorage.setItem('cm_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('cm_submissions', JSON.stringify(submissions));
  }, [submissions]);

  const handleSaveTemplate = (template: Template) => {
    const exists = templates.find(t => t.id === template.id);
    if (exists) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, template]);
    }
    setView('templates');
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Deseja realmente excluir este template? Todos os checklists vinculados continuarão no histórico.')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleCompleteChecklist = (submission: Submission) => {
    setSubmissions([...submissions, submission]);
    setView('dashboard');
    alert('Checklist finalizado com sucesso!');
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            submissions={submissions} 
            templates={templates}
            onStartChecklist={() => setView('runner')}
            onGoToHistory={() => setView('history')}
            onGoToBuilder={() => setView('templates')}
          />
        );
      case 'builder':
        return <ChecklistBuilder onSave={handleSaveTemplate} onCancel={() => setView('templates')} initialTemplate={activeTemplate || undefined} />;
      case 'templates':
        return (
          <div className="flex flex-col gap-6 p-4 fade-in pb-24 max-w-2xl mx-auto">
            <header className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-slate-800">Seus Templates</h1>
              <Button onClick={() => { setActiveTemplate(null); setView('builder'); }} className="!rounded-2xl">
                <PlusCircle size={20} /> Novo
              </Button>
            </header>
            
            {templates.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                Crie seu primeiro template para começar.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {templates.map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
                    <div onClick={() => { setActiveTemplate(t); setView('builder'); }} className="cursor-pointer flex-1">
                      <h3 className="font-bold text-slate-800">{t.name}</h3>
                      <p className="text-sm text-slate-400">{t.fields.length} campos • Criado em {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteTemplate(t.id)} className="p-3 text-rose-400">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'runner':
        if (!activeTemplate && templates.length > 0) {
          return (
            <div className="flex flex-col gap-6 p-4 fade-in pb-24 max-w-2xl mx-auto">
               <h1 className="text-2xl font-black text-slate-800">Selecione o Template</h1>
               <div className="flex flex-col gap-4">
                  {templates.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveTemplate(t)}
                      className="p-6 bg-white rounded-[2rem] border-2 border-slate-100 text-left hover:border-indigo-500 transition-all active:scale-95"
                    >
                      <h3 className="font-extrabold text-slate-800 text-lg">{t.name}</h3>
                      <p className="text-sm text-slate-500">{t.description}</p>
                    </button>
                  ))}
               </div>
               <Button variant="ghost" onClick={() => setView('dashboard')}>Cancelar</Button>
            </div>
          );
        }
        if (templates.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500">
                <PlusCircle size={40} />
              </div>
              <h2 className="text-2xl font-black">Nenhum template encontrado</h2>
              <p className="text-slate-500">Você precisa criar um template de checklist antes de realizar inspeções.</p>
              <Button onClick={() => setView('builder')}>Criar Agora</Button>
            </div>
          );
        }
        return activeTemplate ? (
          <ChecklistRunner 
            template={activeTemplate} 
            onComplete={handleCompleteChecklist} 
            onCancel={() => { setActiveTemplate(null); setView('dashboard'); }} 
          />
        ) : null;
      case 'history':
        return (
          <div className="flex flex-col gap-6 p-4 fade-in pb-24 max-w-2xl mx-auto">
            <header className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-slate-800">Histórico de Inspeções</h1>
              <div className="text-emerald-500 font-black">
                {submissions.reduce((a, b) => a + b.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </header>

            {submissions.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                Nenhum checklist realizado ainda.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {submissions.slice().reverse().map(sub => (
                  <div key={sub.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 flex gap-4 shadow-sm">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {sub.thumbnail ? (
                        <img src={sub.thumbnail} alt="Ref" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Calendar size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 text-sm">{sub.templateName}</h3>
                        <span className="text-emerald-500 font-black text-sm">R$ {sub.totalValue}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{new Date(sub.date).toLocaleString()}</p>
                      {/* Detailed data summary can be added here */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-6xl mx-auto">
      <main className="flex-1 pb-20">
        {renderView()}
      </main>

      {/* Persistent Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-around items-center z-40 max-w-6xl mx-auto rounded-t-[2.5rem] shadow-2xl">
        <button 
          onClick={() => { setView('dashboard'); setActiveTemplate(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase">Início</span>
        </button>
        <button 
          onClick={() => { setView('runner'); setActiveTemplate(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'runner' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <PlusCircle size={24} />
          <span className="text-[10px] font-bold uppercase">Novo</span>
        </button>
        <button 
          onClick={() => { setView('history'); setActiveTemplate(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase">Histórico</span>
        </button>
        <button 
          onClick={() => { setView('templates'); setActiveTemplate(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'templates' || view === 'builder' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
