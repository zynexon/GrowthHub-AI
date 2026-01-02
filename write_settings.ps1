# Script to write the complete SettingsPage.jsx
$content = @'
// CONTINUATION OF SETTINGSPAGE - THIS WILL BE APPENDED
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your organization and account preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-xl border-b border-purple-500/20 animate-slide-in">
        <div className="flex space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg backdrop-blur-sm animate-fade-in">
          ✓ {saveSuccess}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-b-xl border border-purple-500/20 p-8 animate-fade-in">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
          {/* Tabs content will go here - TO DO: Add remaining tabs */}
          <div className="text-white text-center py-8">Settings tabs coming soon...</div>
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default SettingsPage;
'@

Add-Content -Path "c:\growthhub-ai\frontend\src\pages\settings\SettingsPage.jsx" -Value $content -Encoding UTF8
Write-Host "Settings page written successfully!"
