import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Building, Settings } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

const API_BASE = 'http://13.127.171.141:5000/api';

const AdminTeamsManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamsByCategory, setTeamsByCategory] = useState({});
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Fetch categories and all teams on mount
  useEffect(() => {
    fetchCategoriesAndTeams();
  }, []);

  // Fetch teams for selectedCategory
  useEffect(() => {
    if (selectedCategory) {
      setTeams(teamsByCategory[selectedCategory] || []);
    } else {
      setTeams([]);
    }
  }, [selectedCategory, teamsByCategory]);

  // Fetch all categories and all teams for each category
  const fetchCategoriesAndTeams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/`);
      const cats = await res.json();
      setCategories(Array.isArray(cats) ? cats : []);
      // Fetch teams for all categories in parallel
      const teamsMap = {};
      await Promise.all(
        (Array.isArray(cats) ? cats : []).map(async (cat) => {
          const tRes = await fetch(`${API_BASE}/category/${cat.id}`);
          const tData = await tRes.json();
          teamsMap[cat.id] = Array.isArray(tData) ? tData : [];
        })
      );
      setTeamsByCategory(teamsMap);
      // Set teams for selectedCategory if already selected
      if (selectedCategory) {
        setTeams(teamsMap[selectedCategory] || []);
      }
    } catch (err) {
      showNotification('Failed to fetch categories or teams', 'error');
      setCategories([]);
      setTeamsByCategory({});
    } finally {
      setIsLoading(false);
    }
  };

  // Category CRUD
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (!res.ok) throw new Error();
      setNewCategoryName('');
      showNotification('Category added!', 'success');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to add category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategoryName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategoryName.trim() })
      });
      if (!res.ok) throw new Error();
      setEditingCategoryId(null);
      setEditingCategoryName('');
      showNotification('Category updated!', 'success');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to update category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete the category '${cat.name}'?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${cat.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showNotification('Category deleted!', 'success');
      if (selectedCategory === cat.id) setSelectedCategory('');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to delete category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Team CRUD
  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !selectedCategory) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim(), categoryId: selectedCategory })
      });
      if (!res.ok) throw new Error();
      setNewTeamName('');
      setIsAddingTeam(false);
      showNotification('Team added!', 'success');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to add team', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = async (categoryId, oldName, teamId) => {
    if (!editTeamName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/team/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName.trim() })
      });
      if (!res.ok) throw new Error();
      setEditingTeam(null);
      setEditTeamName('');
      showNotification('Team updated!', 'success');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to update team', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (categoryId, teamName, teamId) => {
    if (!window.confirm(`Are you sure you want to delete "${teamName}"?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/team/${teamId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showNotification('Team deleted!', 'success');
      fetchCategoriesAndTeams();
    } catch {
      showNotification('Failed to delete team', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers
  const showNotification = (message, type) => {
    if (type === 'success') {
      alert(`✅ ${message}`);
    } else if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(message);
    }
  };

  const startEdit = (categoryId, teamName, teamId) => {
    setEditingTeam({ categoryId, teamName, teamId });
    setEditTeamName(teamName);
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setEditTeamName('');
  };

  const getCurrentTeams = () => {
    return teams || [];
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : '';
  };

  const getCategoryIcon = (name) => {
    if (name.includes('CFI')) return <Users className="w-5 h-5" />;
    if (name.includes('Nirmaan')) return <Building className="w-5 h-5" />;
    if (name.includes('IIT Madras Alumni Association')) return <Users className="w-5 h-5" />;
    if (name.includes('Global Engagement')) return <Building className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />; // Default icon
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 p-6 mt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Teams & Categories Management</h1>
            <p className="text-gray-600">Manage teams and subcategories for room booking system</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex-1 flex items-center p-3 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3">{getCategoryIcon(category.name)}</span>
                        {editingCategoryId === category.id ? (
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={e => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded"
                            onKeyDown={e => { 
                              if (e.key === 'Enter') handleEditCategory(); 
                              if (e.key === 'Escape') cancelEditCategory(); 
                            }}
                          />
                        ) : (
                          <span className="font-medium flex-1 text-left">{category.name}</span>
                        )}
                        <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {teamsByCategory[category.id]?.length || 0}
                        </span>
                      </button>
                      {editingCategoryId === category.id ? (
                        <div className="flex gap-1">
                          <button onClick={handleEditCategory} className="text-green-600 px-2">✔</button>
                          <button onClick={cancelEditCategory} className="text-gray-600 px-2">✕</button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => startEditCategory(category)} className="text-blue-600 px-2">✎</button>
                          <button onClick={() => deleteCategory(category)} className="text-red-600 px-2">🗑</button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Add new category"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                      onKeyDown={e => { 
                        if (e.key === 'Enter') handleAddCategory(); 
                      }}
                    />
                    <button onClick={handleAddCategory} className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Management */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {selectedCategory ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {getSelectedCategoryName()} Teams
                      </h2>
                      <button
                        onClick={() => setIsAddingTeam(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team
                      </button>
                    </div>

                    {/* Add Team Form */}
                    {isAddingTeam && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-800 mb-3">Add New Team</h3>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Enter team name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTeam();
                              }
                            }}
                          />
                          <button
                            onClick={handleAddTeam}
                            disabled={!newTeamName.trim() || isLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingTeam(false);
                              setNewTeamName('');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Teams List */}
                    <div className="space-y-3">
                      {getCurrentTeams().length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg">No teams found in this category</p>
                          <p className="text-gray-400 text-sm mt-2">Click "Add Team" to create the first team</p>
                        </div>
                      ) : (
                        getCurrentTeams().map((team) => (
                          <div key={team.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            {editingTeam && editingTeam.categoryId === selectedCategory && editingTeam.teamId === team.id ? (
                              <div className="flex-1 flex items-center gap-3">
                                <input
                                  type="text"
                                  value={editTeamName}
                                  onChange={(e) => setEditTeamName(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditTeam(selectedCategory, team.name, team.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleEditTeam(selectedCategory, team.name, team.id)}
                                  disabled={!editTeamName.trim() || isLoading}
                                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800">{team.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEdit(selectedCategory, team.name, team.id)}
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTeam(selectedCategory, team.name, team.id)}
                                    disabled={isLoading}
                                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Select a category to manage teams</p>
                    <p className="text-gray-400 text-sm mt-2">Choose a category from the sidebar to view and manage its teams</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.values(teamsByCategory).reduce((total, arr) => total + (arr?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Category</p>
                  <p className="text-lg font-bold text-gray-800">
                    {getSelectedCategoryName() || 'None Selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTeamsManagement;