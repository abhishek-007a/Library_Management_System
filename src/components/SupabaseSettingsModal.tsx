import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, UploadCloud, ExternalLink, ShieldCheck } from 'lucide-react';
import { getSavedConfig, saveConfig, clearConfig, testSupabaseConnection, SUPABASE_SCHEMA_SQL } from '../lib/supabase';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesFound?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getSavedConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
      if (res.success) {
        soundService.playSuccess();
      } else {
        soundService.playError();
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveConfig(url, anonKey);
    soundService.playSuccess();
    onConfigChanged();
    onClose();
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from Supabase and use local demo storage?')) {
      clearConfig();
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      onConfigChanged();
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSyncToSupabase = async () => {
    if (!url || !anonKey) {
      alert('Please save your Supabase URL and Anon Key first.');
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);
    try {
      saveConfig(url, anonKey);
      const res = await storageService.syncLocalToSupabase();
      soundService.playSuccess();
      setSyncResult(`Successfully synced ${res.booksInserted} books into your Supabase database!`);
      onConfigChanged();
    } catch (err: unknown) {
      soundService.playError();
      setSyncResult(err instanceof Error ? `Sync failed: ${err.message}` : 'Failed to sync data to Supabase');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Supabase Database Settings</h2>
              <p className="text-xs text-slate-400">Connect your Supabase project for persistent cloud storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Setup Instructions */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
            <p className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How to connect your Supabase database:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-emerald-800 text-[11px] leading-relaxed pl-1">
              <li>Log in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-900">supabase.com</a> and open your project.</li>
              <li>Go to <strong>Project Settings &rarr; API</strong> and copy your <strong>Project URL</strong> and <strong>anon (public) key</strong>.</li>
              <li>Go to <strong>SQL Editor</strong> in Supabase, click <strong>"New Query"</strong>, paste our schema SQL below, and click <strong>"Run"</strong>.</li>
            </ol>
          </div>

          {/* Credentials Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supabase Project URL *
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supabase Anon (Public) Key *
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Test Connection Button & Result */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !url.trim() || !anonKey.trim()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-lg transition flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>

              {url && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition"
                >
                  Disconnect
                </button>
              )}
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">
                  <p className="font-bold">{testResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* SQL Schema Section */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Supabase Database Schema SQL
                </h4>
                <p className="text-[11px] text-slate-500">
                  Creates books, borrowers, loans tables, RLS policies, and sample data
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Schema</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative max-h-36 overflow-y-auto bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>
          </div>

          {/* Sync Local Books to Cloud */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Seed & Sync Local Books to Supabase</p>
              <p className="text-[11px] text-slate-500">Pushes your current inventory of books into Supabase</p>
            </div>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncing || !url.trim()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Syncing...' : 'Sync to Supabase'}</span>
            </button>
          </div>

          {syncResult && (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              {syncResult}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
