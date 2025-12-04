import { useState, useEffect } from 'react';
import { Bot, Save, Zap, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import { getAllAIConfigs, upsertAIConfig, toggleAIProvider, setDefaultAIProvider } from '../../../services/adminService';

export default function AIConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({
    provider: '',
    displayName: '',
    apiKey: '',
    model: '',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: 'You are a helpful educational tutor assistant.',
    isEnabled: false,
    isDefault: false
  });

  const providers = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'], color: 'green' },
    { value: 'anthropic', label: 'Anthropic (Claude)', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-2'], color: 'orange' },
    { value: 'mistral', label: 'Mistral AI', models: ['mistral-large', 'mistral-medium', 'mistral-small'], color: 'blue' },
    { value: 'groq', label: 'Groq', models: ['llama2-70b', 'mixtral-8x7b'], color: 'purple' }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await getAllAIConfigs();
      if (response.success) {
        setConfigs(response.data);
      }
    } catch (error) {
      toast.error('Failed to load AI configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await upsertAIConfig(formData);
      toast.success('AI configuration saved successfully');
      fetchConfigs();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  const handleToggle = async (provider) => {
    try {
      await toggleAIProvider(provider);
      toast.success('Provider status updated');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to update provider status');
    }
  };

  const handleSetDefault = async (provider) => {
    try {
      await setDefaultAIProvider(provider);
      toast.success('Default provider updated');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to set default provider');
    }
  };

  const editConfig = (config) => {
    setSelectedProvider(config.provider);
    setFormData({
      provider: config.provider,
      displayName: config.displayName,
      apiKey: config.apiKey || '',
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      systemPrompt: config.systemPrompt,
      isEnabled: config.isEnabled,
      isDefault: config.isDefault
    });
  };

  const resetForm = () => {
    setSelectedProvider(null);
    setFormData({
      provider: '',
      displayName: '',
      apiKey: '',
      model: '',
      maxTokens: 2000,
      temperature: 0.7,
      systemPrompt: 'You are a helpful educational tutor assistant.',
      isEnabled: false,
      isDefault: false
    });
  };

  const selectProvider = (providerValue) => {
    const provider = providers.find(p => p.value === providerValue);
    setFormData({
      ...formData,
      provider: providerValue,
      displayName: provider.label,
      model: provider.models[0]
    });
    setSelectedProvider(providerValue);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">AI Configuration</h1>
          <p className="text-sm text-gray-600">Configure AI providers for intelligent tutor feature</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="bg-[#0B1D34] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              {selectedProvider ? 'Edit Provider' : 'Add New Provider'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">AI Provider *</label>
                <select
                  value={formData.provider}
                  onChange={(e) => selectProvider(e.target.value)}
                  required
                  disabled={selectedProvider}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] disabled:opacity-50 transition-all"
                >
                  <option value="">Select Provider</option>
                  {providers.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {formData.provider && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">API Key *</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      required
                      placeholder="Enter API key"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Model *</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                    >
                      {providers.find(p => p.value === formData.provider)?.models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={formData.maxTokens}
                        onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                        min="100"
                        max="10000"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Temperature</label>
                      <input
                        type="number"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                        min="0"
                        max="2"
                        step="0.1"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">System Prompt</label>
                    <textarea
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      rows="4"
                      placeholder="Enter system prompt for the AI..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isEnabled}
                        onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                        className="w-5 h-5 text-[#2F6FED] rounded"
                      />
                      <span className="text-sm font-medium text-white">Enable this provider</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-5 h-5 text-[#2F6FED] rounded"
                      />
                      <span className="text-sm font-medium text-white">Set as default provider</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2.5 border border-white/10 text-[#94A3B8] hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-white rounded-lg transition-colors font-medium"
                    >
                      <Save className="w-5 h-5" />
                      Save Configuration
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Existing Providers */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Configured Providers</h2>
            
            {loading ? (
              <div className="text-center py-12 text-[#94A3B8]">
                Loading configurations...
              </div>
            ) : configs.length === 0 ? (
              <div className="bg-[#0B1D34] rounded-xl border border-white/10 p-12 text-center">
                <Bot className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
                <p className="text-[#94A3B8]">No AI providers configured yet</p>
              </div>
            ) : (
              configs.map((config) => (
                <div
                  key={config._id}
                  className={`bg-[#0B1D34] rounded-xl border p-6 hover:border-white/20 transition-all ${
                    config.isDefault ? 'border-[#2F6FED] ring-2 ring-[#2F6FED]/20' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2F6FED]/10 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-[#2F6FED]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{config.displayName}</h3>
                        <p className="text-sm text-[#94A3B8]">{config.model}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {config.isDefault && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2F6FED]/10 text-[#2F6FED] border border-[#2F6FED]/30">
                          Default
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        config.isEnabled 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-[#94A3B8] border border-white/10'
                      }`}>
                        {config.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Max Tokens</p>
                      <p className="text-sm font-medium text-white">{config.maxTokens}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Temperature</p>
                      <p className="text-sm font-medium text-white">{config.temperature}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editConfig(config)}
                      className="flex-1 px-4 py-2 border border-white/10 text-[#94A3B8] hover:bg-white/5 hover:text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(config.provider)}
                      className="flex-1 px-4 py-2 border border-white/10 text-[#94A3B8] hover:bg-white/5 hover:text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {config.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                    {!config.isDefault && config.isEnabled && (
                      <button
                        onClick={() => handleSetDefault(config.provider)}
                        className="flex-1 px-4 py-2 bg-[#2F6FED]/10 text-[#2F6FED] hover:bg-[#2F6FED]/20 rounded-lg transition-colors text-sm font-medium"
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
