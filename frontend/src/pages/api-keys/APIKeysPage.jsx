import { useState, useEffect, useRef } from 'react';
import { apiKeysService } from '../../services/apiKeys.service';

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scopes: ['read:*'],
    expiresInDays: null
  });
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const scopeRef = useRef(null);

  const scopeOptions = [
    { value: 'read:*', label: 'Read All', description: 'Read access to all resources' },
    { value: 'write:*', label: 'Write All', description: 'Write access to all resources' },
    { value: 'read:leads', label: 'Read Leads', description: 'Read leads data only' },
    { value: 'write:leads', label: 'Write Leads', description: 'Create/update leads' },
    { value: 'read:customers', label: 'Read Customers', description: 'Read customer data' },
    { value: 'write:customers', label: 'Write Customers', description: 'Create/update customers' },
    { value: 'read:jobs', label: 'Read Jobs', description: 'Read jobs data' },
    { value: 'write:jobs', label: 'Write Jobs', description: 'Create/update jobs' },
  ];

  const expirationOptions = [
    { value: null, label: 'Never' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 365, label: '1 year' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (scopeRef.current && !scopeRef.current.contains(event.target)) {
        setIsScopeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, statsData] = await Promise.all([
        apiKeysService.getAllKeys(),
        apiKeysService.getStatistics()
      ]);
      setApiKeys(Array.isArray(keysData) ? keysData : []);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setApiKeys([]);
      setStatistics({ total_keys: 0, active_keys: 0, inactive_keys: 0, recently_used: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiKeysService.createKey(
        formData.name,
        formData.scopes,
        formData.expiresInDays
      );
      
      setNewApiKey(response.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setFormData({ name: '', scopes: ['read:*'], expiresInDays: null });
      loadData();
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    }
  };

  const handleRevoke = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? It will stop working immediately.')) return;
    try {
      await apiKeysService.revokeKey(keyId);
      loadData();
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const handleDelete = async (keyId) => {
    if (!confirm('Are you sure you want to permanently delete this API key?')) return;
    try {
      await apiKeysService.deleteKey(keyId);
      loadData();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  const toggleScope = (scope) => {
    setFormData(prev => {
      const scopes = prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope];
      return { ...prev, scopes: scopes.length > 0 ? scopes : ['read:*'] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up w-full overflow-hidden">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🔑 API Keys</h1>
        <p className="text-sm sm:text-base text-gray-400">Manage API keys for external integrations and automations</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="text-blue-400 text-xs sm:text-sm font-medium mb-1">Total Keys</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{statistics.total_keys}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="text-green-400 text-xs sm:text-sm font-medium mb-1">Active</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{statistics.active_keys}</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-lg rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all">
            <div className="text-red-400 text-xs sm:text-sm font-medium mb-1">Revoked</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{statistics.inactive_keys}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="text-purple-400 text-xs sm:text-sm font-medium mb-1">Recently Used</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{statistics.recently_used}</div>
          </div>
        </div>
      )}

      {/* Create API Key Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:scale-105"
        >
          + Create New Key
        </button>
      </div>

      {/* API Keys List - Desktop Table View */}
      <div className="hidden lg:block bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Scopes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Last Used</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                    No API keys yet. Create your first API key to get started!
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-blue-400 font-mono text-sm">{key.key_prefix}••••••••</code>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-white font-medium truncate">{key.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 min-w-[100px]">
                        {key.scopes.slice(0, 2).map((scope, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs whitespace-nowrap">
                            {scope}
                          </span>
                        ))}
                        {key.scopes.length > 2 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs whitespace-nowrap">
                            +{key.scopes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {key.last_used_at ? (
                        <span className="text-gray-300 text-sm">
                          {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {key.is_active ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30 whitespace-nowrap">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {key.is_active && (
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm whitespace-nowrap"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Keys List - Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {apiKeys.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 p-8 text-center text-gray-400">
            No API keys yet. Create your first API key to get started!
          </div>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
              {/* Header with Name and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">{key.name}</h3>
                  <code className="text-blue-400 font-mono text-xs">{key.key_prefix}••••••••</code>
                </div>
                <div className="ml-2">
                  {key.is_active ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30 whitespace-nowrap">
                      Revoked
                    </span>
                  )}
                </div>
              </div>

              {/* Scopes */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Scopes</div>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((scope, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Used */}
              <div className="mb-3 text-sm">
                <span className="text-gray-400">Last Used: </span>
                {key.last_used_at ? (
                  <span className="text-gray-300">
                    {new Date(key.last_used_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-gray-500">Never</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-700/50">
                {key.is_active && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="flex-1 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm font-medium"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => handleDelete(key.id)}
                  className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Create API Key</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="e.g., Production API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Permissions (Scopes)
                </label>
                <div className="space-y-2">
                  {scopeOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.scopes.includes(option.value)}
                        onChange={() => toggleScope(option.value)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration
                </label>
                <select
                  value={formData.expiresInDays || ''}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
                >
                  {expirationOptions.map((option) => (
                    <option key={option.value || 'never'} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                <div className="flex gap-2">
                  <span className="text-yellow-400 text-sm">⚠️</span>
                  <div className="text-xs sm:text-sm text-yellow-300">
                    <strong>Important:</strong> The API key will only be shown once. Make sure to copy and store it securely.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Create API Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show New API Key Modal */}
      {showKeyModal && newApiKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white">✅ API Key Created!</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4">
                <div className="flex gap-2 mb-4">
                  <span className="text-green-400 text-sm">✓</span>
                  <div className="text-xs sm:text-sm text-green-300">
                    Your API key has been created successfully. <strong>Copy it now - you won't see it again!</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newApiKey.api_key}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white font-mono text-xs sm:text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(newApiKey.api_key)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all whitespace-nowrap"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4 space-y-2">
                <div className="text-xs sm:text-sm text-gray-400">Key Name: <span className="text-white break-all">{newApiKey.name}</span></div>
                <div className="text-xs sm:text-sm text-gray-400">Scopes: <span className="text-white break-all">{newApiKey.scopes.join(', ')}</span></div>
                {newApiKey.expires_at && (
                  <div className="text-xs sm:text-sm text-gray-400">Expires: <span className="text-white">{new Date(newApiKey.expires_at).toLocaleDateString()}</span></div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewApiKey(null);
                }}
                className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                I've Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
