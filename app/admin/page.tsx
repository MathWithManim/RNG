'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, formatNumber, calculateLevel } from '@/components/Shared';
import { getSession, setSession } from '@/services/auth-client';
import PasswordProtection from '@/components/PasswordProtection';
import UserEditModal from '@/components/UserEditModal';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('economy');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [targetUsername, setTargetUsername] = useState(''); // New state for target username
  const [targetUserActionUsername, setTargetUserActionUsername] = useState(''); // New state for target username in user actions
  const [targetPowerUsername, setTargetPowerUsername] = useState(''); // New state for target username in power actions
  const [targetTestUsername, setTargetTestUsername] = useState(''); // New state for target username in test actions
  const [userId, setUserId] = useState<number | null>(null); // State to store user ID (was firebaseId)

  // State for economy management
  const [multiplierAmount, setMultiplierAmount] = useState<number>(0);
  const [currencyAmount, setCurrencyAmount] = useState<number>(0);
  const [xpAmount, setXpAmount] = useState<number>(0);

  // State for database management
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[] | null>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>(null);

  // State for temporary links
  const [tempLinks, setTempLinks] = useState<any[]>([]);
  const [newTempLink, setNewTempLink] = useState<{ token: string, expiresAt: number } | null>(null);
  const [linkExpiration, setLinkExpiration] = useState<number>(30); // Default to 30 minutes

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUserId(session.id); // Use session.id (number)
    }
  }, []);

  // Helper function to make authenticated admin API requests
  const makeAdminRequest = async (action: string, data: any = {}) => {
    if (userId === null) {
      alert('Authentication required: Missing user ID. Please log in.');
      return { success: false, error: 'Missing user ID' };
    }

    // Additional validation: ensure action is a valid string
    if (!action || typeof action !== 'string') {
      alert('Invalid action parameter');
      return { success: false, error: 'Invalid action' };
    }

    // Validate data parameters to prevent injection
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check for potentially dangerous characters
        if (value.includes("'") || value.includes('"') || value.includes(';') || value.includes('--')) {
          alert(`Invalid parameter detected: ${key}`);
          return { success: false, error: 'Invalid parameter' };
        }

        // Limit string length
        if (value.length > 1000) {
          alert(`Parameter too long: ${key}`);
          return { success: false, error: 'Parameter too long' };
        }
      }
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId), // Pass numeric ID as string
        },
        body: JSON.stringify({ action, ...data }),
      });
      return await response.json();
    } catch (error) {
      console.error('Admin API request failed:', error);
      return { success: false, error: 'Network error or server unavailable' };
    }
  };

  const handleEconomyAction = async (action: string, value: number) => {
    if (!targetUsername) {
      alert('Please enter a target username.');
      return;
    }
    const data: { username: string; multiplier?: number; amount?: number } = { username: targetUsername };
    if (action === 'setIndividualMultiplier') {
      data.multiplier = value;
    } else {
      data.amount = value;
    }

    const result = await makeAdminRequest(action, data);
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleUserManagementAction = async (action: string) => {
    if (!targetUserActionUsername) {
      alert('Please enter a target username for the action.');
      return;
    }

    // Special handling for 'editUser' which opens a modal (not a direct API call here)
    if (action === 'editUser') {
      alert(`Edit functionality for ${targetUserActionUsername} would open a modal.`);
      // In a full implementation, you'd fetch user data and open the UserEditModal
      return;
    }

    const result = await makeAdminRequest(action, { username: targetUserActionUsername });
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handlePowerAction = async (action: string) => {
    if (!targetPowerUsername) {
      alert('Please enter a target username for power management.');
      return;
    }
    // For now, this is a placeholder. A real implementation would involve
    // selecting specific powers to grant/revoke.
    const result = await makeAdminRequest(action, { username: targetPowerUsername, power: 'placeholder' });
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleTestAction = async (action: string) => {
    if (!targetTestUsername) {
      alert('Please enter a target username for the test action.');
      return;
    }
    const result = await makeAdminRequest(action, { username: targetTestUsername });
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleGetTableData = async () => {
    if (!selectedTable) {
      alert('Please select a table to load.');
      return;
    }
    setTableData(null); // Clear previous data
    const result = await makeAdminRequest('getDatabaseTable', { tableName: selectedTable });
    if (result.success) {
      setTableData(result.data);
    } else {
      alert(`Error loading table data: ${result.error}`);
    }
  };

  const handleExecuteSqlQuery = async () => {
    if (!sqlQuery.trim()) {
      alert('Please enter an SQL query to execute.');
      return;
    }
    setQueryResult(null); // Clear previous result
    const result = await makeAdminRequest('executeSqlQuery', { query: sqlQuery });
    if (result.success) {
      setQueryResult(result.data);
    } else {
      alert(`Error executing query: ${result.error}`);
      setQueryResult({ error: result.error }); // Display error in result area
    }
  };

  // Temporary link functions
  const generateTempLink = async () => {
    try {
      const response = await fetch(`/api/temp-admin?expiration=${linkExpiration}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success) {
        setNewTempLink({ token: result.tempToken, expiresAt: result.expiresAt });
        // Add to the list of temp links
        setTempLinks(prev => [...prev, { token: result.tempToken, expiresAt: result.expiresAt }]);
        alert(`Temporary link generated successfully! Expires at: ${new Date(result.expiresAt).toLocaleString()}`);
      } else {
        alert(`Error generating temporary link: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating temporary link:', error);
      alert('Error generating temporary link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy link to clipboard');
    });
  };

  const revokeTempLink = async (token: string) => {
    try {
      const response = await fetch('/api/temp-admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken: token }),
      });
      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setTempLinks(prev => prev.filter(link => link.token !== token));
        if (newTempLink && newTempLink.token === token) {
          setNewTempLink(null);
        }
        alert('Temporary link revoked successfully');
      } else {
        alert(`Error revoking temporary link: ${result.error}`);
      }
    } catch (error) {
      console.error('Error revoking temporary link:', error);
      alert('Error revoking temporary link');
    }
  };

  if (!passwordVerified) {
    return <PasswordProtection onSuccess={() => setPasswordVerified(true)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage game economy, users, and database</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['economy', 'powers', 'users', 'database', 'test', 'links'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab === 'links' ? 'Temp Links' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="space-y-6">
        {activeTab === 'economy' && (
          <div className="space-y-6">
            <div className="mb-6">
              <label htmlFor="targetUsername" className="block text-sm font-medium text-gray-400 mb-2">Target Username</label>
              <input
                type="text"
                id="targetUsername"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Set Multiplier for {targetUsername || 'User'}</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Multiplier (e.g., 2 for 2x)"
                    value={isNaN(multiplierAmount) ? '' : multiplierAmount}
                    onChange={(e) => setMultiplierAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <Button className="w-full" onClick={() => handleEconomyAction('setIndividualMultiplier', multiplierAmount)}>Set User Multiplier</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Give Currency to {targetUsername || 'User'}</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={isNaN(currencyAmount) ? '' : currencyAmount}
                    onChange={(e) => setCurrencyAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <Button className="w-full" onClick={() => handleEconomyAction('giveIndividualCurrency', currencyAmount)}>Give User Currency</Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Give XP to {targetUsername || 'User'}</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={isNaN(xpAmount) ? '' : xpAmount}
                    onChange={(e) => setXpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <Button className="w-full" onClick={() => handleEconomyAction('giveIndividualXp', xpAmount)}>Give User XP</Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'powers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">User Power Management</h2>
            
            <div className="mb-6">
              <label htmlFor="targetPowerUsername" className="block text-sm font-medium text-gray-400 mb-2">Target Username for Power</label>
              <input
                type="text"
                id="targetPowerUsername"
                value={targetPowerUsername}
                onChange={(e) => setTargetPowerUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grant/Revoke Powers for {targetPowerUsername || 'User'}</h3>
              <p className="text-gray-400 mb-4">Select powers to manage.</p>
              {/* Placeholder for power selection UI */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-32 flex items-center justify-center text-gray-500">
                Power management UI (e.g., checkboxes for powers) will be implemented here.
              </div>
              <Button className="w-full mt-4" onClick={() => handlePowerAction('applyUserPower')}>Apply Powers</Button>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
            
            <div className="mb-6">
              <label htmlFor="targetUserActionUsername" className="block text-sm font-medium text-gray-400 mb-2">Target Username for Action</label>
              <input
                type="text"
                id="targetUserActionUsername"
                value={targetUserActionUsername}
                onChange={(e) => setTargetUserActionUsername(e.target.value)}
                placeholder="Enter username for action"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => handleUserManagementAction('impersonateUser')}>Impersonate {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-red-600 hover:bg-red-500" onClick={() => handleUserManagementAction('deleteUser')}>Delete {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-500" onClick={() => handleUserManagementAction('editUser')}>Edit {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-500" onClick={() => handleUserManagementAction('banUser')}>Ban {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-pink-600 hover:bg-pink-500" onClick={() => handleUserManagementAction('kickUser')}>Kick {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-green-600 hover:bg-green-500" onClick={() => handleUserManagementAction('trollUser')}>Troll {targetUserActionUsername || 'User'}</Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => handleUserManagementAction('makeAdmin')}>Make {targetUserActionUsername || 'User'} Admin</Button>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Database Management</h2>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Database Table Viewer</h3>
              <p className="text-gray-400 mb-4">Select a table to view its contents (first 100 rows).</p>
              
              <div className="mb-4">
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-400 mb-2">Select Table</label>
                <select
                  id="tableName"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Select a table --</option>
                  <option value="userdb">userdb</option>
                  {/* Add other table names here as needed */}
                </select>
                <Button className="w-full mt-4" onClick={handleGetTableData} disabled={!selectedTable}>Load Table Data</Button>
              </div>

              {tableData && tableData.length > 0 && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-auto max-h-60 mt-4">
                  <table className="min-w-full text-xs text-gray-300">
                    <thead>
                      <tr>
                        {Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="px-2 py-1 border-b border-gray-700 text-left capitalize">{key.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="even:bg-gray-800 hover:bg-gray-700">
                          {Object.values(row).map((value: any, colIndex) => (
                            <td key={colIndex} className="px-2 py-1 border-b border-gray-800">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {(!tableData || tableData.length === 0) && selectedTable && <div className="text-gray-500 text-center mt-4">No data found or table is empty.</div>}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">SQL Query Inserter</h3>
              <p className="text-gray-400 mb-4">Execute custom SQL queries. Use with caution!</p>
              <textarea
                className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
              ></textarea>
              <p className="text-gray-500 text-sm mt-2">Syntax highlighting and shortcuts will be added later.</p>
              <Button className="w-full mt-4" onClick={handleExecuteSqlQuery} disabled={!sqlQuery}>Execute SQL Query</Button>

              {queryResult && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-auto max-h-40 mt-4 text-xs">
                  <pre className="text-green-400 whitespace-pre-wrap">{JSON.stringify(queryResult, null, 2)}</pre>
                </div>
              )}
              {queryResult === null && sqlQuery && <div className="text-gray-500 text-center mt-4">No result or query failed.</div>}
            </Card>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">User Specific Test Functions</h2>
            
            <div className="mb-6">
              <label htmlFor="targetTestUsername" className="block text-sm font-medium text-gray-400 mb-2">Target Username for Test</label>
              <input
                type="text"
                id="targetTestUsername"
                value={targetTestUsername}
                onChange={(e) => setTargetTestUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Run Test Functions for {targetTestUsername || 'User'}</h3>
              <p className="text-gray-400 mb-4">Execute various test scenarios for the target user.</p>
              {/* Placeholder for specific test buttons/options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => handleTestAction('testUserEconomy')}>Test Economy</Button>
                <Button className="w-full bg-green-600 hover:bg-green-500" onClick={() => handleTestAction('testUserPowers')}>Test Powers</Button>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-500" onClick={() => handleTestAction('testUserQuests')}>Test Quests</Button>
                <Button className="w-full bg-red-600 hover:bg-red-500" onClick={() => handleTestAction('resetUserData')}>Reset User Data</Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Temporary Admin Links</h2>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generate New Temporary Link</h3>
              <p className="text-gray-400 mb-4">Create time-limited access links for other administrators.</p>

              <div className="mb-4">
                <label htmlFor="linkExpiration" className="block text-sm font-medium text-gray-400 mb-2">
                  Link Expiration (minutes)
                </label>
                <input
                  type="number"
                  id="linkExpiration"
                  value={linkExpiration}
                  onChange={(e) => setLinkExpiration(Number(e.target.value))}
                  min="1"
                  max="1440" // Maximum 24 hours
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 30 minutes, Max: 1440 minutes (24 hours)</p>
              </div>

              <Button className="w-full" onClick={generateTempLink}>
                Generate Temporary Link
              </Button>

              {newTempLink && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-gray-400">New Temporary Link:</p>
                      <p className="font-mono text-sm break-all text-purple-400">{newTempLink.token}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(newTempLink.expiresAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      className="ml-2 text-sm px-3 py-1 h-8"
                      onClick={() => copyToClipboard(newTempLink.token)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Temporary Links</h3>
              <p className="text-gray-400 mb-4">Manage currently active temporary admin links.</p>

              {tempLinks.length > 0 ? (
                <div className="space-y-3">
                  {tempLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm break-all text-purple-400">{link.token}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(link.expiresAt).toLocaleString()}
                          {link.expiresAt < Date.now() ? ' (Expired)' : ''}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          className="text-xs px-3 py-1 h-8"
                          onClick={() => copyToClipboard(link.token)}
                        >
                          Copy
                        </Button>
                        <Button
                          className="text-xs px-3 py-1 h-8"
                          variant="danger"
                          onClick={() => revokeTempLink(link.token)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active temporary links</p>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      {userEditModalOpen && editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={userEditModalOpen}
          onClose={() => {
            setUserEditModalOpen(false);
            setEditingUser(null);
          }}
          onSave={() => {
            // Handle save logic
          }}
        />
      )}
    </div>
  );
}