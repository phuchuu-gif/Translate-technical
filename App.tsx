
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Upload, Image as ImageIcon, Copy, BookOpen, Settings, Loader2, ArrowRight, Zap, Crop, MousePointer2, X } from 'lucide-react';
import { analyzeImage } from './services/geminiService';
import DictionaryManager from './components/DictionaryManager';
import RegionCapture from './components/RegionCapture';
import { DEFAULT_DICTIONARY } from './constants';
import { DictionaryEntry, TranslationResult, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(DEFAULT_DICTIONARY);
  const [showDictionary, setShowDictionary] = useState(false);
  const [isSnipping, setIsSnipping] = useState(false);

  // Handle Paste Event (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              handleImageInput(base64);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [dictionary]);

  const handleImageInput = async (base64: string) => {
    setIsSnipping(false);
    setImageSrc(base64);
    setAppState(AppState.ANALYZING);
    setResults([]);

    try {
      // Clean base64 string for API (remove prefix)
      const cleanBase64 = base64.split(',')[1];
      const analysisResults = await analyzeImage(cleanBase64, dictionary);
      setResults(analysisResults);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleImageInput(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setImageSrc(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cad-accent selection:text-white">
      {/* Top Navigation */}
      <nav className="h-14 bg-cad-900 border-b border-cad-700 flex items-center justify-between px-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
          <div className="bg-cad-accent p-1.5 rounded shadow-inner">
            <Zap className="text-white w-4 h-4" fill="currentColor" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">CAD-Lingo <span className="text-cad-accent font-light uppercase text-sm tracking-widest ml-1">Bridge</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsSnipping(true)}
             className="flex items-center gap-2 bg-cad-accent hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded transition-all shadow-lg active:scale-95"
           >
             <Crop size={16} />
             <span>QUÉT VÙNG (REC)</span>
           </button>
           <div className="h-6 w-[1px] bg-cad-700 mx-2"></div>
           <button 
            onClick={() => setShowDictionary(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-cad-800 transition-all"
          >
            <BookOpen size={16} />
            <span>Từ điển ({dictionary.length})</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Image / Input */}
        <div className="flex-1 bg-cad-900 relative flex flex-col border-r border-cad-700">
          
          {appState === AppState.IDLE && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-cad-700 m-8 rounded-xl bg-cad-800/30">
              <div className="bg-cad-800 p-6 rounded-full mb-6 shadow-2xl ring-1 ring-cad-600">
                 <MousePointer2 className="w-12 h-12 text-cad-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chọn khu vực phần mềm</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Nhấn <b>Quét vùng</b> bên trên, chọn màn hình CAD, sau đó quét chuột vào Menu hoặc Lệnh bạn muốn dịch.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => setIsSnipping(true)}
                  className="bg-cad-accent hover:bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-xl shadow-cad-accent/20"
                >
                  <Crop size={20} />
                  Bắt đầu quét vùng
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="bg-cad-700 hover:bg-cad-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                    <Upload size={18} />
                    Tải ảnh lên
                  </button>
                </div>
              </div>

              <div className="mt-12 text-xs text-gray-500 flex items-center gap-4">
                <span className="bg-cad-800 px-2 py-1 rounded">Win + Shift + S</span>
                <span>Hoặc Paste trực tiếp</span>
                <span className="bg-cad-800 px-2 py-1 rounded">Ctrl + V</span>
              </div>
            </div>
          )}

          {imageSrc && (
            <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-[#0d0f12]">
              <div className="relative group">
                <img 
                  src={imageSrc} 
                  alt="Captured content" 
                  className="max-w-full max-h-full rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-cad-600"
                />
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {/* Fixed: Use imported X icon from lucide-react */}
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {appState === AppState.ANALYZING && (
            <div className="absolute inset-0 bg-cad-900/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-cad-accent animate-spin mb-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={20} className="text-cad-accent" />
                </div>
              </div>
              <p className="text-xl font-bold tracking-widest text-white">ĐANG PHÂN TÍCH...</p>
              <p className="text-sm text-cad-accent mt-2 animate-pulse">Sử dụng AI Gemini Flash</p>
            </div>
          )}
        </div>

        {/* Right Side: Results Panel */}
        <div className="w-96 bg-cad-800 flex flex-col shadow-2xl z-30 ring-1 ring-cad-700">
          <div className="p-4 border-b border-cad-700 bg-cad-900">
            <h3 className="font-bold text-cad-accent uppercase tracking-widest text-[10px] mb-1">KẾT QUẢ DỊCH THUẬT</h3>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                {results.length > 0 ? `Tìm thấy ${results.length} mục` : 'Đang đợi dữ liệu...'}
              </p>
              {results.length > 0 && (
                <button onClick={reset} className="text-[10px] text-gray-500 hover:text-white underline uppercase">Xóa hết</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {appState === AppState.IDLE && (
                <div className="flex flex-col items-center justify-center mt-20 opacity-20">
                  <ImageIcon size={48} className="mb-4 text-gray-400" />
                  <p className="text-sm text-gray-400">Chưa có dữ liệu phân tích</p>
                </div>
             )}

             {results.map((item, idx) => (
               <div key={idx} className={`p-4 rounded-lg border transition-all duration-300 ${item.isDictionaryMatch ? 'bg-cad-accent/5 border-cad-accent shadow-[0_0_15px_rgba(6,150,215,0.1)]' : 'bg-cad-700/20 border-cad-700 hover:border-cad-600'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black bg-cad-700 text-gray-400 px-1.5 py-0.5 rounded tracking-tighter">EN</span>
                    {item.isDictionaryMatch && (
                      <span className="text-[10px] font-bold text-cad-accent flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> TỪ ĐIỂN RIÊNG
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white mb-3 break-words font-mono">{item.original}</div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] flex-1 bg-cad-700"></div>
                    <ArrowRight size={14} className="text-cad-accent" />
                    <div className="h-[1px] flex-1 bg-cad-700"></div>
                  </div>

                  <div className="flex gap-2">
                    <span className="text-[10px] font-black bg-cad-accent text-white px-1.5 py-0.5 rounded tracking-tighter self-start mt-1">VI</span>
                    <div className="text-lg text-cad-accent font-bold leading-tight">{item.translated}</div>
                  </div>
               </div>
             ))}

             {appState === AppState.ERROR && (
               <div className="p-6 bg-red-900/20 border border-red-800/50 text-red-200 rounded-xl text-sm text-center">
                 <p className="font-bold mb-2">LỖI PHÂN TÍCH</p>
                 <p className="text-xs text-red-400/80">Vui lòng kiểm tra API Key hoặc kết nối mạng và thử lại.</p>
               </div>
             )}
          </div>
          
          <div className="p-4 border-t border-cad-700 bg-cad-900 text-[10px] text-gray-500 leading-relaxed italic">
            Mẹo: Quét vùng càng nhỏ và rõ nét, AI sẽ dịch chính xác các thuật ngữ chuyên ngành Cầu Đường hơn.
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDictionary && (
        <DictionaryManager 
          dictionary={dictionary} 
          setDictionary={setDictionary} 
          onClose={() => setShowDictionary(false)} 
        />
      )}

      {isSnipping && (
        <RegionCapture 
          onCapture={handleImageInput}
          onCancel={() => setIsSnipping(false)}
        />
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
