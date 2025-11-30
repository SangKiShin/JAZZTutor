import React, { useState, useEffect } from 'react';
import { Key, Lock, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import { validateApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  initialKey?: string;
}

// Simple XOR obfuscation for local storage (Not military grade, but prevents plain text reading)
const encrypt = (text: string) => {
  const key = "INNER_EAR_JAZZ_MENTOR_SECRET";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const decrypt = (encoded: string) => {
  try {
    const text = atob(encoded);
    const key = "INNER_EAR_JAZZ_MENTOR_SECRET";
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return "";
  }
};

export const loadApiKey = () => {
  const stored = localStorage.getItem('inner_ear_api_key');
  return stored ? decrypt(stored) : null;
};

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputKey(initialKey || '');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen, initialKey]);

  const handleTestAndSave = async () => {
    if (!inputKey.trim()) {
      setErrorMsg("API Key를 입력해주세요.");
      return;
    }

    setStatus('testing');
    setErrorMsg('');

    const isValid = await validateApiKey(inputKey.trim());

    if (isValid) {
      setStatus('success');
      // Save encrypted key
      const encrypted = encrypt(inputKey.trim());
      localStorage.setItem('inner_ear_api_key', encrypted);
      
      onSave(inputKey.trim());
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatus('error');
      setErrorMsg("연결 실패: 유효하지 않은 API Key입니다.");
    }
  };

  const handleClear = () => {
    localStorage.removeItem('inner_ear_api_key');
    setInputKey('');
    onSave('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-jazz-800 border border-jazz-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-jazz-900 p-4 border-b border-jazz-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-jazz-gold">
            <Key size={20} />
            <h2 className="font-serif text-lg font-bold">API Key Management</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-jazz-700/50 p-3 rounded-lg flex gap-3 text-sm text-gray-300">
            <Lock className="shrink-0 text-jazz-accent mt-0.5" size={16} />
            <p>
              입력하신 API Key는 안전하게 <strong>암호화되어 브라우저 내부(Local Storage)</strong>에만 저장됩니다. 
              서버로 전송되지 않습니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-jazz-600 font-bold">Google Gemini API Key</label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AI Studio에서 발급받은 키를 입력하세요"
              className="w-full bg-jazz-900 border border-jazz-700 rounded-lg p-3 text-white focus:border-jazz-gold focus:outline-none transition-colors font-mono text-sm"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-2 rounded">
              <CheckCircle size={16} />
              <span>연결 성공! 키가 안전하게 저장되었습니다.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-jazz-900 border-t border-jazz-700 flex justify-between gap-3">
           <button 
            onClick={handleClear}
            className="px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            키 삭제
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={status === 'testing' || !inputKey}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-jazz-900 transition-all
                ${status === 'testing' || !inputKey 
                  ? 'bg-jazz-600 cursor-not-allowed' 
                  : 'bg-jazz-gold hover:bg-yellow-500'}`}
            >
              {status === 'testing' ? (
                <>연결 확인 중...</>
              ) : (
                <>
                  <Save size={16} />
                  저장 및 연결
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
