
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from './UI';
import { Plus, Trash2, ArrowLeft, GripVertical, Settings2, Smartphone, Save } from 'lucide-react';
import { Template, Field, FieldType, Option } from '../types';

interface ChecklistBuilderProps {
  onSave: (template: Template) => void;
  onCancel: () => void;
  initialTemplate?: Template;
}

const FIELD_LABELS: Record<FieldType, string> = {
  [FieldType.TEXT]: 'Texto Simples',
  [FieldType.NUMBER]: 'Número',
  [FieldType.DATE]: 'Data',
  [FieldType.CHECKBOX]: 'Caixa de Seleção',
  [FieldType.PLATE_IA]: 'Placa (Scanner IA)',
  [FieldType.IMEI_IA]: 'IMEI (Scanner IA)',
  [FieldType.SINGLE_SELECT]: 'Seleção Única (+ Preço)',
  [FieldType.MULTI_SELECT]: 'Seleção Múltipla (+ Preços)',
  [FieldType.VEHICLE_INFO]: 'Marca / Modelo (IA)',
  [FieldType.IMAGE]: 'Captura de Imagem',
  [FieldType.PRICE_MANUAL]: 'Preço Manual'
};

const ChecklistBuilder: React.FC<ChecklistBuilderProps> = ({ onSave, onCancel, initialTemplate }) => {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [fields, setFields] = useState<Field[]>(initialTemplate?.fields || []);

  const addField = (type: FieldType) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: FIELD_LABELS[type],
      required: false,
      options: (type === FieldType.SINGLE_SELECT || type === FieldType.MULTI_SELECT) ? [] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const addOption = (fieldId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const options = [...(f.options || []), { id: Math.random().toString(36).substr(2, 9), label: 'Nova Opção', price: 0 }];
        return { ...f, options };
      }
      return f;
    }));
  };

  const updateOption = (fieldId: string, optionId: string, updates: Partial<Option>) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const options = f.options?.map(o => o.id === optionId ? { ...o, ...updates } : o);
        return { ...f, options };
      }
      return f;
    }));
  };

  const removeOption = (fieldId: string, optionId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const options = f.options?.filter(o => o.id !== optionId);
        return { ...f, options };
      }
      return f;
    }));
  };

  const handleSave = () => {
    if (!name) return alert('Por favor, dê um nome ao seu template.');
    onSave({
      id: initialTemplate?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      fields,
      createdAt: Date.now()
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 fade-in min-h-screen">
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-90 transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-extrabold text-slate-800">Construtor de Checklist</h1>
          </div>
          <Button onClick={handleSave} className="!bg-emerald-600 !px-8">
            <Save size={20} />
            Salvar
          </Button>
        </header>

        <Card>
          <div className="flex flex-col gap-4">
            <Input 
              label="Nome do Template" 
              placeholder="Ex: Instalação de Rastreador" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input 
              label="Descrição Curta" 
              placeholder="Ex: Checklist padrão para veículos leves" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-700 px-1">Estrutura do Formulário</h2>
          
          {fields.map((field, index) => (
            <Card key={field.id} className="relative group overflow-hidden border-l-4 border-l-indigo-500">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="indigo">{FIELD_LABELS[field.type]}</Badge>
                    <button onClick={() => removeField(field.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <Input 
                    placeholder="Rótulo do Campo (ex: Placa do Veículo)" 
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.required} 
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-slate-500">Obrigatório</span>
                    </label>

                    {(field.type === FieldType.CHECKBOX || field.type === FieldType.PRICE_MANUAL) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">Valor Base (R$):</span>
                        <input 
                          type="number" 
                          value={field.price || 0}
                          onChange={(e) => updateField(field.id, { price: Number(e.target.value) })}
                          className="bg-slate-100 border-none rounded-xl px-3 py-1 w-24 text-sm font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {(field.type === FieldType.SINGLE_SELECT || field.type === FieldType.MULTI_SELECT) && (
                    <div className="mt-2 flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-bold text-slate-600">Opções</span>
                        <button onClick={() => addOption(field.id)} className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                          <Plus size={14} /> Adicionar Opção
                        </button>
                      </div>
                      {field.options?.map(option => (
                        <div key={option.id} className="flex gap-2">
                          <input 
                            placeholder="Texto" 
                            className="flex-1 bg-white border-none rounded-xl px-3 py-2 text-sm shadow-sm"
                            value={option.label}
                            onChange={(e) => updateOption(field.id, option.id, { label: e.target.value })}
                          />
                          <input 
                            type="number" 
                            placeholder="R$" 
                            className="w-24 bg-white border-none rounded-xl px-3 py-2 text-sm shadow-sm font-bold text-emerald-600"
                            value={option.price}
                            onChange={(e) => updateOption(field.id, option.id, { price: Number(e.target.value) })}
                          />
                          <button onClick={() => removeOption(field.id, option.id)} className="p-2 text-rose-400">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Card className="flex flex-col gap-4 border-dashed border-2 border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Adicionar Novo Campo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(FIELD_LABELS).map(([type, label]) => (
                <button 
                  key={type}
                  onClick={() => addField(type as FieldType)}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex flex-col items-center gap-2 text-center"
                >
                  <Plus size={16} />
                  {label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-700 px-1 flex items-center gap-2">
          <Smartphone size={20} />
          Visualização em Tempo Real
        </h2>
        <div className="sticky top-4 bg-slate-900 rounded-[3rem] p-4 border-[8px] border-slate-800 shadow-2xl h-[700px] overflow-hidden">
          <div className="w-1/3 h-6 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-10"></div>
          <div className="bg-white h-full rounded-[2rem] overflow-y-auto overflow-x-hidden p-6 scroll-smooth">
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Preview Mobile</span>
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{name || 'Seu Checklist'}</h3>
                <p className="text-slate-400 text-xs">{description || 'Descrição do formulário aparecerá aqui...'}</p>
              </header>

              <div className="flex flex-col gap-6">
                {fields.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Settings2 size={32} />
                    </div>
                    <p className="text-slate-400 text-sm italic">Adicione campos para ver a prévia aqui.</p>
                  </div>
                ) : (
                  fields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                        {field.label}
                        {field.required && <span className="text-rose-500 font-black text-[10px]">* OBRIGATÓRIO</span>}
                      </label>
                      
                      {field.type === FieldType.TEXT && <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>}
                      {field.type === FieldType.NUMBER && <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>}
                      {field.type === FieldType.DATE && <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>}
                      {field.type === FieldType.CHECKBOX && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <div className="w-5 h-5 rounded-md border-2 border-slate-200"></div>
                           <span className="text-sm font-medium text-slate-600">Marcar opção</span>
                        </div>
                      )}
                      {(field.type === FieldType.PLATE_IA || field.type === FieldType.IMEI_IA || field.type === FieldType.VEHICLE_INFO) && (
                        <div className="p-4 border-2 border-dashed border-indigo-100 rounded-[2rem] bg-indigo-50/30 flex flex-col items-center gap-2">
                          <Smartphone className="text-indigo-400" size={24} />
                          <span className="text-[10px] font-black text-indigo-400 uppercase">Scanner de IA Ativo</span>
                        </div>
                      )}
                      {(field.type === FieldType.SINGLE_SELECT || field.type === FieldType.MULTI_SELECT) && (
                        <div className="flex flex-col gap-2">
                          {field.options?.slice(0, 3).map(opt => (
                            <div key={opt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 flex justify-between">
                              {opt.label}
                              <span className="text-emerald-500">+ R$ {opt.price}</span>
                            </div>
                          ))}
                          {(field.options?.length || 0) > 3 && <div className="text-center text-[10px] text-slate-400 italic">Mais {field.options!.length - 3} opções...</div>}
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {fields.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="text-xl font-black text-emerald-500">R$ 0,00</span>
                    </div>
                    <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-3xl shadow-lg opacity-80 cursor-default">
                      Finalizar Checklist
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistBuilder;
