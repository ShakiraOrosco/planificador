import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  Save
} from 'lucide-react';
import type { GoogleDriveConfig } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface GoogleDriveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const GoogleDriveConfigModal: React.FC<GoogleDriveConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  if (!isOpen) return null;

  const currentConfig = googleDriveService.getConfig();
  const [clientId, setClientId] = useState(currentConfig?.clientId || '');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');

  const [isAuthenticated, setIsAuthenticated] = useState(googleDriveService.isAuthenticated());
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !apiKey.trim()) {
      setStatusMessage({ text: 'Por favor ingresa tanto el Client ID como la API Key.', type: 'error' });
      return;
    }

    const config: GoogleDriveConfig = {
      clientId: clientId.trim(),
      apiKey: apiKey.trim(),
      appId: appId.trim() || undefined,
    };

    googleDriveService.saveConfig(config);
    setStatusMessage({ text: 'Configuración guardada correctamente.', type: 'success' });
    onConfigUpdated();
  };

  const handleSignIn = async () => {
    try {
      setStatusMessage({ text: 'Iniciando sesión con Google...', type: 'info' });
      await googleDriveService.signIn();
      setIsAuthenticated(true);
      setStatusMessage({ text: '¡Conectado exitosamente con Google Drive!', type: 'success' });
      onConfigUpdated();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err.message || 'Error al iniciar sesión con Google.', type: 'error' });
    }
  };

  const handleSignOut = () => {
    googleDriveService.signOut();
    setIsAuthenticated(false);
    setStatusMessage({ text: 'Sesión de Google cerrada.', type: 'info' });
    onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-850 border border-slate-700/90 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Integración Oficial Google Drive
              </h2>
              <p className="text-xs text-slate-400">
                Conecta Google Picker y Google Drive API v3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-slate-900 border-slate-700">
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : googleDriveService.isConfigured() ? (
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isAuthenticated
                    ? 'Conectado a Google Drive'
                    : googleDriveService.isConfigured()
                    ? 'Credenciales listas (Requiere iniciar sesión)'
                    : 'Sin credenciales configuradas'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAuthenticated
                    ? 'Puedes seleccionar y subir archivos de Drive desde las tareas'
                    : 'Ingresa tu Client ID y API Key de Google Cloud'}
                </p>
              </div>
            </div>

            {/* Quick Action button */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            ) : googleDriveService.isConfigured() ? (
              <button
                type="button"
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar</span>
              </button>
            ) : null}
          </div>

          {/* Feedback message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Google OAuth 2.0 Client ID *
              </label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ej: 123456789-abcdefg.apps.googleusercontent.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Google API Key (con Google Drive & Picker habilitados) *
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ej: AIzaSy..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Project / App ID (Opcional)
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Número de proyecto o App ID de Google Cloud"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Cómo obtener estas credenciales?</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Credenciales</span>
              </button>
            </div>
          </form>

          {/* Guide Collapsible */}
          {showGuide && (
            <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-200">
              <h4 className="font-bold text-white flex items-center justify-between">
                <span>Pasos en Google Cloud Console</span>
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                >
                  Abrir Console <ExternalLink className="w-3 h-3" />
                </a>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>Crea o selecciona un proyecto en Google Cloud Console.</li>
                <li>Ve a <strong>APIs & Services &gt; Library</strong> y habilita:
                  <ul className="list-disc list-inside ml-4 mt-1 text-slate-400">
                    <li><code className="text-indigo-300">Google Drive API</code></li>
                    <li><code className="text-indigo-300">Google Picker API</code></li>
                  </ul>
                </li>
                <li>En <strong>Credentials &gt; Create Credentials</strong>:
                  <ul className="list-disc list-inside ml-4 mt-1 text-slate-400">
                    <li>Crea una <strong>API Key</strong> y pégala arriba.</li>
                    <li>Crea un <strong>OAuth Client ID</strong> tipo <em>Web application</em>. Añade como origen autorizado JavaScript: <code className="text-indigo-300">http://localhost:5173</code></li>
                  </ul>
                </li>
                <li>Pega las credenciales y pulsa <strong>Guardar Credenciales</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
