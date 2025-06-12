// residents/page.js
"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Search, Upload } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

const residents = [
  {
    id: "SAPDI-000001",
    fullName: "Juan Dela Cruz",
    age: 30,
    civilStatus: "Single",
    gender: "Male",
    voterStatus: "Registered",
  },
  {
    id: "SAPDI-000002",
    fullName: "Maria Santos",
    age: 45,
    civilStatus: "Married",
    gender: "Female",
    voterStatus: "Not Registered",
  },
  {
    id: "SAPDI-000003",
    fullName: "Pedro Gomez",
    age: 62,
    civilStatus: "Widowed",
    gender: "Male",
    voterStatus: "Registered",
  },
];

const ResidentRecordsPage = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("");

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  const handleSearch = () => {
    // This function will now be integrated into the main filtering logic
    console.log('Triggering search/filter update.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // Will re-evaluate filteredResidents
    }
  };

  // Filter residents based on search text and filter dropdown
  const filteredResidents = residents.filter(resident => {
    // Apply search text filter first
    const matchesSearch = 
      resident.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.id.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    // Apply filter dropdown logic
    switch (filter) {
      case "senior":
        return resident.age >= 60;
      case "voters":
        return resident.voterStatus === "Registered";
      case "non-voters":
        return resident.voterStatus !== "Registered";
      case "minors":
        return resident.age < 18;
      // For the following filters, you will need to add corresponding data fields to your `residents` array.
      // For example, add an `isHeadOfHousehold: boolean` or `educationLevel: string` field.
      case "head-household":
        // return resident.isHeadOfHousehold; // Example: requires 'isHeadOfHousehold' field
        return true; // Placeholder: currently shows all if this filter is selected
      case "no-education":
        // return resident.educationLevel === "None"; // Example: requires 'educationLevel' field
        return true; // Placeholder
      case "elementary":
        // return resident.educationLevel === "Elementary"; // Example
        return true; // Placeholder
      case "high-school":
        // return resident.educationLevel === "High School"; // Example
        return true; // Placeholder
      case "college":
        // return resident.educationLevel === "College"; // Example
        return true; // Placeholder
      default:
        return true; // No filter applied
    }
  });

  const filterOptions = [
    { label: "Filter By", value: "" },
    { label: "Senior Citizens", value: "senior" },
    { label: "Voters", value: "voters" },
    { label: "Non-Voters", value: "non-voters" },
    { label: "Minors", value: "minors" },
    { label: "Head of Household", value: "head-household" },
    { label: "No Formal Education", value: "no-education" },
    { label: "Elementary", value: "elementary" },
    { label: "High School", value: "high-school" },
    { label: "College", value: "college" },
  ];

  return (
    <div className="w-full font-sans text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Resident Records</h2>
      <div className="h-1 bg-red-500 w-full mb-6"></div>

      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Add Button */}
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={18} /> Add Resident
        </button>

        {/* Search Box with Icons */}
        <div className="relative">
          <button 
            onClick={handleSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search resident..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border pl-10 pr-10 py-2 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          {searchText && (
            <button
              onClick={() => {
                setSearchText("");
                handleSearch();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Choose File */}
        <label className="bg-gray-100 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-200">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          Choose File
        </label>

        {/* File Preview */}
        {selectedFile && (
          <span className="text-sm text-gray-700 truncate max-w-[200px]">
            {selectedFile.name}
          </span>
        )}

        {/* Batch Upload */}
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Upload size={18} /> Batch Upload
        </button>

        {/* Filter Dropdown (Custom) */}
        <CustomSelect
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          placeholder="Filter By"
        />
      </div>

      {/* Resident Table */}
      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Unique ID</th>
              <th className="p-4 text-left font-semibold">Full Name</th>
              <th className="p-4 text-left font-semibold">Age</th>
              <th className="p-4 text-left font-semibold">Civil Status</th>
              <th className="p-4 text-left font-semibold">Gender</th>
              <th className="p-4 text-left font-semibold">Voter Status</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.map((resident) => (
              <tr
                key={resident.id}
                className="hover:bg-green-50 transition-colors border-t border-gray-100"
              >
                <td className="p-4">{resident.id}</td>
                <td className="p-4">{resident.fullName}</td>
                <td className="p-4">{resident.age}</td>
                <td className="p-4">{resident.civilStatus}</td>
                <td className="p-4">{resident.gender}</td>
                <td className="p-4">{resident.voterStatus}</td>
                <td className="p-4 relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                    onClick={() => toggleMenu(resident.id)}
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* Action Menu */}
                  {activeMenu === resident.id && (
                    <div className="absolute right-4 top-12 bg-white shadow-md rounded-md border w-36 z-10">
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setActiveMenu(null);
                          alert(`Update ${resident.fullName}`);
                        }}
                      >
                        <Pencil size={16} /> Update
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setActiveMenu(null);
                          alert(`Delete ${resident.fullName}`);
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentRecordsPage;
