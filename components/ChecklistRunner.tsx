
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge } from './UI';
import { Camera, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Scan, Trash2 } from 'lucide-react';
import { Template, Submission, Field, FieldType, AIResult } from '../types';
import { analyzeVehicleImage } from '../services/geminiService';

interface ChecklistRunnerProps {
  template: Template;
  onComplete: (submission: Submission) => void;
  onCancel: () => void;
}

const ChecklistRunner: React.FC<ChecklistRunnerProps> = ({ template, onComplete, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Calculate total value whenever formData changes
    let total = 0;
    template.fields.forEach(field => {
      const value = formData[field.id];
      if (!value) return;

      if (field.type === FieldType.CHECKBOX && value === true) {
        total += field.price || 0;
      } else if (field.type === FieldType.PRICE_MANUAL) {
        total += Number(value) || 0;
      } else if (field.type === FieldType.SINGLE_SELECT) {
        const opt = field.options?.find(o => o.id === value);
        if (opt) total += opt.price || 0;
      } else if (field.type === FieldType.MULTI_SELECT && Array.isArray(value)) {
        value.forEach(optId => {
          const opt = field.options?.find(o => o.id === optId);
          if (opt) total += opt.price || 0;
        });
      }
    });
    setTotalValue(total);
  }, [formData, template]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Auto-detect the "thumbnail" for the submission
        if (!formData.thumbnail) {
           handleFieldChange('thumbnail', base64);
        }

        const aiResult = await analyzeVehicleImage(base64);
        if (aiResult) {
          applyAIResult(aiResult);
        }
      };
    } catch (error) {
      console.error("Scanning failed", error);
      alert("Falha no processamento de imagem. Verifique sua conexão e tente novamente.");
    } finally {
      setIsScanning(false);
    }
  };

  const applyAIResult = (result: AIResult) => {
    const newFormData = { ...formData };
    
    template.fields.forEach(field => {
      if (field.type === FieldType.PLATE_IA && result.placa) {
        newFormData[field.id] = result.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
      }
      if (field.type === FieldType.VEHICLE_INFO) {
        newFormData[field.id] = `${result.marca} ${result.modelo}`.trim();
      }
      if (field.type === FieldType.IMEI_IA && result.imei && result.imei.length > 0) {
        newFormData[field.id] = result.imei[0];
      }
    });

    setFormData(newFormData);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    const newErrors: string[] = [];
    template.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors.push(`${field.label} é obrigatório`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    const submission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      templateId: template.id,
      templateName: template.name,
      data: formData,
      totalValue,
      date: Date.now(),
      thumbnail: formData.thumbnail
    };

    // Simulate save
    setTimeout(() => {
      onComplete(submission);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 fade-in max-w-2xl mx-auto pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onCancel} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 leading-tight">{template.name}</h1>
          <p className="text-slate-500 text-sm font-medium">Executando checklist</p>
        </div>
      </header>

      {errors.length > 0 && (
        <Card className="bg-rose-50 border-rose-100 border-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-rose-500 mt-0.5" size={20} />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-rose-600">Ops! Verifique os campos:</span>
              <ul className="list-disc list-inside text-rose-500 text-sm">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {template.fields.map(field => (
          <Card key={field.id} className="relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-slate-600 flex justify-between">
                {field.label}
                {field.required && <span className="text-rose-500">*</span>}
              </label>

              {field.type === FieldType.TEXT && (
                <input 
                  className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder="Digite aqui..."
                />
              )}

              {field.type === FieldType.NUMBER && (
                <input 
                  type="number"
                  className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder="0.00"
                />
              )}

              {field.type === FieldType.DATE && (
                <input 
                  type="date"
                  className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}

              {field.type === FieldType.CHECKBOX && (
                <button 
                  onClick={() => handleFieldChange(field.id, !formData[field.id])}
                  className={`flex items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                    formData[field.id] 
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                    formData[field.id] ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                  }`}>
                    {formData[field.id] && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className="font-bold">Marcar como OK</span>
                  {field.price && field.price > 0 && <span className="ml-auto text-emerald-500">+ R$ {field.price}</span>}
                </button>
              )}

              {field.type === FieldType.PLATE_IA && (
                <div className="flex flex-col gap-3">
                  <div className="mercosul-plate mx-auto shadow-xl">
                    <div className="mercosul-header">
                      <span>BRASIL</span>
                      <div className="w-4 h-3 bg-white/20 rounded-sm"></div>
                    </div>
                    <div className="mercosul-content">
                      {formData[field.id] || '_______'}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={triggerCamera} className="w-full">
                    <Scan size={20} /> Escanear Placa
                  </Button>
                </div>
              )}

              {field.type === FieldType.IMEI_IA && (
                <div className="flex flex-col gap-2">
                   <input 
                    className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full font-mono text-lg tracking-widest"
                    value={formData[field.id] || ''}
                    readOnly
                    placeholder="Escanear IMEI..."
                  />
                  <Button variant="secondary" onClick={triggerCamera} className="w-full">
                    <Camera size={20} /> Escanear Código
                  </Button>
                </div>
              )}

              {field.type === FieldType.VEHICLE_INFO && (
                <div className="flex flex-col gap-2">
                   <input 
                    className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full font-bold"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="Marca e Modelo"
                  />
                  <Button variant="secondary" onClick={triggerCamera} className="w-full">
                    <Scan size={20} /> Identificar Veículo
                  </Button>
                </div>
              )}

              {field.type === FieldType.SINGLE_SELECT && (
                <div className="flex flex-col gap-2">
                  {field.options?.map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => handleFieldChange(field.id, opt.id)}
                      className={`flex justify-between items-center p-4 rounded-3xl border-2 transition-all ${
                        formData[field.id] === opt.id 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      {opt.price && opt.price > 0 && <span className="text-emerald-500">+ R$ {opt.price}</span>}
                    </button>
                  ))}
                </div>
              )}

              {field.type === FieldType.MULTI_SELECT && (
                <div className="flex flex-col gap-2">
                  {field.options?.map(opt => {
                    const selected = Array.isArray(formData[field.id]) && formData[field.id].includes(opt.id);
                    return (
                      <button 
                        key={opt.id}
                        onClick={() => {
                          const current = Array.isArray(formData[field.id]) ? [...formData[field.id]] : [];
                          if (selected) {
                            handleFieldChange(field.id, current.filter(id => id !== opt.id));
                          } else {
                            handleFieldChange(field.id, [...current, opt.id]);
                          }
                        }}
                        className={`flex justify-between items-center p-4 rounded-3xl border-2 transition-all ${
                          selected 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                            {selected && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className="font-bold">{opt.label}</span>
                        </div>
                        {opt.price && opt.price > 0 && <span className="text-emerald-500">+ R$ {opt.price}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {field.type === FieldType.IMAGE && (
                <div className="flex flex-col gap-3">
                  {formData[field.id] ? (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-inner bg-black">
                      <img src={formData[field.id]} alt="Captured" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleFieldChange(field.id, null)}
                        className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={triggerCamera}
                      className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <Camera size={48} />
                      <span className="font-bold text-sm">Toque para capturar imagem</span>
                    </div>
                  )}
                </div>
              )}

              {field.type === FieldType.PRICE_MANUAL && (
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl font-bold">R$</div>
                  <input 
                    type="number"
                    className="bg-slate-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 outline-none w-full font-bold text-emerald-600"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
      />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex items-center justify-between gap-4 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase">Valor Total</span>
          <span className="text-2xl font-black text-emerald-500">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <Button 
          disabled={isScanning || isSubmitting} 
          onClick={handleSubmit} 
          className="flex-1 !py-5"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          {isSubmitting ? 'Finalizando...' : 'Concluir Checklist'}
        </Button>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white p-12 text-center gap-6">
          <div className="relative">
             <div className="w-24 h-24 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Scan size={32} className="text-indigo-400 animate-pulse" />
             </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black">Processando com IA</h2>
            <p className="text-slate-400 font-medium">Extraindo placa, marca, modelo e IMEI do veículo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistRunner;
