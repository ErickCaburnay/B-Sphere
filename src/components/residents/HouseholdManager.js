"use client";

import { useState } from 'react';
import { Users, UserPlus, UserMinus, Home, Link2, Unlink, Eye, X, Edit, Trash2, Plus, Filter, Search, BarChart2 } from 'lucide-react';

export function HouseholdManager({ residents, onUpdateHousehold }) {
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHouseholdDetails, setShowHouseholdDetails] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [showCreateHouseholdModal, setShowCreateHouseholdModal] = useState(false);
  const [showHouseholdFilters, setShowHouseholdFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Group residents by household
  const households = residents.reduce((acc, resident) => {
    const householdId = resident.householdId || 'unassigned';
    if (!acc[householdId]) {
      acc[householdId] = {
        id: householdId,
        address: resident.address,
        members: []
      };
    }
    acc[householdId].members.push(resident);
    return acc;
  }, {});

  const filterHouseholds = (household) => {
    if (!appliedFilters) return true;

    const { householdSize, programParticipation, hasVoter, hasSenior, hasPwd, has4Ps, hasTupad, hasSoloParent } = appliedFilters;
    const members = household.members;

    // Household Size filter
    if (householdSize.min && members.length < parseInt(householdSize.min)) return false;
    if (householdSize.max && members.length > parseInt(householdSize.max)) return false;

    // Program Participation filter
    if (programParticipation.length > 0) {
      const hasProgramMember = programParticipation.some(program => {
        if (program === '4Ps') return members.some(m => m.is4Ps);
        if (program === 'TUPAD') return members.some(m => m.isTupad);
        if (program === 'Senior Citizen') return members.some(m => m.isSeniorCitizen);
        if (program === 'PWD') return members.some(m => m.isPwd);
        if (program === 'Solo Parent') return members.some(m => m.isSoloParent);
        return false;
      });
      if (!hasProgramMember) return false;
    }

    // Specific Member Characteristics filter
    if (hasVoter && !members.some(m => m.isVoter)) return false;
    if (hasSenior && !members.some(m => m.isSeniorCitizen)) return false;
    if (hasPwd && !members.some(m => m.isPwd)) return false;
    if (has4Ps && !members.some(m => m.is4Ps)) return false;
    if (hasTupad && !members.some(m => m.isTupad)) return false;
    if (hasSoloParent && !members.some(m => m.isSoloParent)) return false;

    return true;
  };

  const allHouseholdsArray = Object.values(households);

  const filteredHouseholds = allHouseholdsArray.filter(household => {
    const matchesSearch = household.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          household.members.some(member => {
                            const fullName = `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`;
                            return fullName.toLowerCase().includes(searchTerm.toLowerCase());
                          });

    return matchesSearch && filterHouseholds(household);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage);
  const paginatedHouseholds = filteredHouseholds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Household Statistics
  const totalHouseholds = allHouseholdsArray.length;
  const averageMembers = totalHouseholds > 0 ? 
    (allHouseholdsArray.reduce((sum, h) => sum + h.members.length, 0) / totalHouseholds).toFixed(1) : 0;
  const householdsWithVoters = allHouseholdsArray.filter(h => h.members.some(m => m.isVoter)).length;
  const householdsWithSeniors = allHouseholdsArray.filter(h => h.members.some(m => m.isSeniorCitizen)).length;

  const handleCreateHousehold = async (newHouseholdData) => {
    try {
      await onUpdateHousehold({
        type: 'create',
        ...newHouseholdData
      });
      setShowCreateHouseholdModal(false);
    } catch (error) {
      console.error('Failed to create household:', error);
    }
  };

  const handleUpdateHousehold = async (updatedHouseholdData) => {
    try {
      await onUpdateHousehold({
        type: 'update',
        householdId: updatedHouseholdData.id,
        updatedData: updatedHouseholdData
      });
      setEditingHousehold(null);
      setShowHouseholdDetails(false);
    } catch (error) {
      console.error('Failed to update household:', error);
    }
  };

  const handleDeleteHousehold = async (householdId) => {
    if (window.confirm('Are you sure you want to delete this household? This will unassign all its members.')) {
      try {
        await onUpdateHousehold({
          type: 'delete',
          householdId
        });
        setSelectedHousehold(null);
        setShowHouseholdDetails(false);
      } catch (error) {
        console.error('Failed to delete household:', error);
      }
    }
  };

  const handleAddMember = async (member) => {
    if (!selectedHousehold) return;

    try {
      await onUpdateHousehold({
        type: 'add_member',
        householdId: selectedHousehold.id,
        memberId: member.id // Pass memberId instead of whole member object if backend expects ID
      });
      setSelectedHousehold(prev => ({
        ...prev,
        members: [...prev.members, { ...member, householdId: selectedHousehold.id }]
      }));
      setIsAddingMember(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!selectedHousehold) return;

    try {
      await onUpdateHousehold({
        type: 'remove_member',
        householdId: selectedHousehold.id,
        memberId: member.id // Pass memberId instead of whole member object if backend expects ID
      });
      setSelectedHousehold(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== member.id)
      }));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleSetHeadOfHousehold = async (memberId) => {
    if (!selectedHousehold) return;

    try {
      await onUpdateHousehold({
        type: 'set_head',
        householdId: selectedHousehold.id,
        memberId
      });
      setSelectedHousehold(prev => ({
        ...prev,
        members: prev.members.map(m => ({
          ...m,
          isHeadOfHousehold: m.id === memberId
        }))
      }));
    } catch (error) {
      console.error('Failed to set head of household:', error);
    }
  };

  const filteredResidents = residents.filter(resident => {
    const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) && !resident.householdId;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search households by address or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setShowHouseholdFilters(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setShowCreateHouseholdModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <Plus size={16} />
            Create New Household
          </button>
        </div>
      </div>

      {/* Household Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Households</p>
            <p className="text-2xl font-semibold text-gray-900">{totalHouseholds}</p>
          </div>
          <Home size={32} className="text-blue-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Average Members</p>
            <p className="text-2xl font-semibold text-gray-900">{averageMembers}</p>
          </div>
          <Users size={32} className="text-green-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Households with Voters</p>
            <p className="text-2xl font-semibold text-gray-900">{householdsWithVoters}</p>
          </div>
          <BarChart2 size={32} className="text-yellow-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Households with Seniors</p>
            <p className="text-2xl font-semibold text-gray-900">{householdsWithSeniors}</p>
          </div>
          <Users size={32} className="text-purple-500" />
        </div>
      </div>

      {/* Household List Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 p-6">Households</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Household ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Head
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Contact #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHouseholds.length > 0 ? (
                paginatedHouseholds.map(household => (
                  <tr key={household.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {household.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {household.members.find(m => m.isHeadOfHousehold)?.firstName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {household.members.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {household.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {household.members.find(m => m.isHeadOfHousehold)?.contactNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedHousehold(household);
                            setShowHouseholdDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingHousehold(household);
                            setShowCreateHouseholdModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                          title="Edit Household"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHousehold(household.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Household"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No households found. Adjust your filters or create a new household.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {filteredHouseholds.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to 
              {Math.min(currentPage * itemsPerPage, filteredHouseholds.length)} of {filteredHouseholds.length} entries
            </span>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Household Details Modal */}
      {showHouseholdDetails && selectedHousehold && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Household Details: {selectedHousehold.address}</h3>
              <button
                onClick={() => setShowHouseholdDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-700"><span className="font-medium">Household ID:</span> {selectedHousehold.id}</p>
              <p className="text-gray-700"><span className="font-medium">Address:</span> {selectedHousehold.address}</p>
              <p className="text-gray-700"><span className="font-medium">Total Members:</span> {selectedHousehold.members.length}</p>
            </div>

            <h4 className="text-lg font-medium text-gray-900 mb-3">Members</h4>
            <div className="space-y-3">
              {selectedHousehold.members.length > 0 ? ( selectedHousehold.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {`${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.isHeadOfHousehold ? 'Head of Household' : 'Member'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!member.isHeadOfHousehold && (
                      <button
                        onClick={() => handleSetHeadOfHousehold(member.id)}
                        className="p-1 text-purple-600 hover:text-purple-800" title="Set as Head of Household"
                      >
                        <Users size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="p-1 text-red-600 hover:text-red-800" title="Remove from Household"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </div>
              )) ) : (
                <p className="text-gray-500 text-sm">No members in this household yet.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingMember(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <UserPlus size={16} />
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal (reused from previous implementation) */}
      {isAddingMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Household Member</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search unassigned residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredResidents.length > 0 ? (filteredResidents
                .map(resident => (
                  <div
                    key={resident.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <span className="text-sm text-gray-700">
                      {`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`}
                    </span>
                    <button
                      onClick={() => handleAddMember(resident)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Link2 size={16} />
                    </button>
                  </div>
                )) ) : (
                  <p className="text-gray-500 text-sm">No unassigned residents found matching your search.</p>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsAddingMember(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Household Modal */}
      {showCreateHouseholdModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingHousehold ? 'Edit Household' : 'Create New Household'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {editingHousehold ? 'Update household information' : 'Add a new household to the barangay'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                  onClick={() => {
                    setShowCreateHouseholdModal(false);
                    setEditingHousehold(null);
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newAddress = formData.get('address');
                const headOfHouseholdId = formData.get('headOfHousehold');
                const headOfHousehold = residents.find(r => r.id === parseInt(headOfHouseholdId));

                if (editingHousehold) {
                  await handleUpdateHousehold({
                    id: editingHousehold.id,
                    address: newAddress,
                    headOfHousehold
                  });
                } else {
                  await handleCreateHousehold({
                    address: newAddress,
                    headOfHousehold
                  });
                }
              }} className="space-y-8">
                
                {/* Household Information Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="bg-green-100 rounded-full p-2">
                      <Home className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Household Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 text-left">
                        <span>Household Address</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        defaultValue={editingHousehold?.address || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="Enter complete household address"
                        required
                      />
                    </div>

                    {!editingHousehold && (
                      <div className="space-y-2">
                        <label htmlFor="headOfHousehold" className="block text-sm font-medium text-gray-700 text-left">
                          <span>Head of Household</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          id="headOfHousehold"
                          name="headOfHousehold"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          required
                        >
                          <option value="">Select a resident to be the head</option>
                          {residents.filter(r => !r.householdId || r.householdId === editingHousehold?.id).map(resident => (
                            <option key={resident.id} value={resident.id}>
                              {`${resident.firstName} ${resident.lastName}`}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Only residents without existing household assignments are shown
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateHouseholdModal(false);
                    setEditingHousehold(null);
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {editingHousehold ? 'Save Changes' : 'Create Household'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Household Advanced Filters Modal */}
      {showHouseholdFilters && (
        <HouseholdAdvancedFilters
          onFilterChange={(filters) => {
            setAppliedFilters(filters);
            setShowHouseholdFilters(false);
          }}
          onClose={() => setShowHouseholdFilters(false)}
        />
      )}
    </div>
  );
} 