import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, ArrowRight, Loader2, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { alignContent } from '../services/gemini';

type Step = 'source' | 'srt' | 'processing' | 'result';

export default function AlignerWizard() {
  const [step, setStep] = useState<Step>('source');
  const [sourceContext, setSourceContext] = useState('');
  const [srtContent, setSrtContent] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setContent: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const processAlignment = async () => {
    setStep('processing');
    setError('');
    try {
      const output = await alignContent(sourceContext, srtContent);
      setResult(output);
      setStep('result');
    } catch (err) {
      setError('An error occurred while processing. Please try again.');
      setStep('srt');
    }
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep('source');
    setSourceContext('');
    setSrtContent('');
    setResult('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">SRT Context Aligner</h1>
        <p className="text-slate-500">Align your source text with subtitle timestamps instantly.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 w-full">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: '0%' }}
            animate={{ 
              width: step === 'source' ? '25%' : 
                     step === 'srt' ? '50%' : 
                     step === 'processing' ? '75%' : '100%' 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 'source' && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">1</div>
                  <h2 className="text-xl font-semibold text-slate-800">Cho tôi file Source Context của bạn?</h2>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  <textarea
                    className="w-full flex-1 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-mono text-sm transition-all"
                    placeholder="Paste your source context here..."
                    value={sourceContext}
                    onChange={(e) => setSourceContext(e.target.value)}
                  />
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <span>Upload .txt file</span>
                      <input type="file" accept=".txt,.md" className="hidden" onChange={(e) => handleFileUpload(e, setSourceContext)} />
                    </label>
                    
                    <button
                      disabled={!sourceContext.trim()}
                      onClick={() => setStep('srt')}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'srt' && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">2</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-800">Tiếp theo hãy cung cấp file SRT cho tôi.</h2>
                    <p className="text-sm text-slate-500 mt-1">Ok. Tôi đã nhận được Source Context.</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  <textarea
                    className="w-full flex-1 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-mono text-sm transition-all"
                    placeholder="Paste your SRT content here..."
                    value={srtContent}
                    onChange={(e) => setSrtContent(e.target.value)}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">
                        <Upload size={16} />
                        <span>Upload .srt file</span>
                        <input type="file" accept=".srt,.txt" className="hidden" onChange={(e) => handleFileUpload(e, setSrtContent)} />
                      </label>
                      <button onClick={() => setStep('source')} className="text-sm text-slate-400 hover:text-slate-600">
                        Back
                      </button>
                    </div>
                    
                    <button
                      disabled={!srtContent.trim()}
                      onClick={processAlignment}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Process Files <Check size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12"
              >
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Đang xử lý...</h3>
                <p className="text-slate-500">Đang khớp SRT với Source Context và tạo timeline.</p>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      <Check size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Hoàn thành!</h2>
                      <p className="text-sm text-slate-500">Đã tạo Source Context Timeline.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={reset}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Start Over"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative group">
                  <textarea
                    readOnly
                    value={result}
                    className="w-full h-full min-h-[300px] p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm resize-none focus:outline-none text-slate-700"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy Result'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
