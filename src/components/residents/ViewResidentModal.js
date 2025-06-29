import { X, User, MapPin, Phone, Mail, Calendar, Briefcase, GraduationCap, Heart, Shield, Award, Clock } from 'lucide-react';
import { formatContactNumberDisplay } from '../ui/ContactNumberInput';

// Utility function to format date in "Month Day, Year" format
const formatDateDisplay = (dateString) => {
  if (!dateString) return 'Not specified';
  
  try {
    // Handle both timestamp objects and date strings
    let date;
    if (dateString && typeof dateString === 'object' && dateString.seconds) {
      // Firebase timestamp (for createdAt/updatedAt)
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      // Regular date string in YYYY-MM-DD format
      date = new Date(dateString);
    } else {
      // JavaScript Date object
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Utility function to calculate age
const calculateAge = (birthdate) => {
  if (!birthdate) return 'N/A';
  
  try {
    let date;
    if (birthdate && typeof birthdate === 'object' && birthdate.seconds) {
      // Firebase timestamp (legacy data)
      date = new Date(birthdate.seconds * 1000);
    } else if (typeof birthdate === 'string') {
      // Date string in YYYY-MM-DD format
      date = new Date(birthdate);
    } else {
      // JavaScript Date object
      date = new Date(birthdate);
    }
    
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return 'N/A';
  }
};

// Check if resident is a senior citizen (60+ years old)
const isSeniorCitizen = (birthdate) => {
  const age = calculateAge(birthdate);
  return age !== 'N/A' && age >= 60;
};

export function ViewResidentModal({ resident, onClose }) {
  if (!resident) return null;

  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}${resident.suffix ? ' ' + resident.suffix : ''}`;
  const age = calculateAge(resident.birthdate);
  const isSenior = isSeniorCitizen(resident.birthdate);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{fullName}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-blue-100 text-sm">ID: {resident.id}</p>
                  <span className="text-blue-200">•</span>
                  <p className="text-blue-100 text-sm">{age} years old</p>
                  <span className="text-blue-200">•</span>
                  <p className="text-blue-100 text-sm">{resident.gender}</p>
                  {isSenior && (
                    <>
                      <span className="text-blue-200">•</span>
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Senior Citizen
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-4 w-4 text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.lastName}</p>
                  </div>
                </div>
                {resident.middleName && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Middle Name</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.middleName}</p>
                  </div>
                )}
                {resident.suffix && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Suffix</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.suffix}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Marital Status</label>
                  <p className="text-gray-900 font-medium text-sm">{resident.maritalStatus}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Citizenship</label>
                  <p className="text-gray-900 font-medium text-sm">{resident.citizenship}</p>
                </div>
              </div>
            </div>

            {/* Birth Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Calendar className="h-4 w-4 text-green-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Birth Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                  <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(resident.birthdate)}</p>
                  <p className="text-gray-500 text-xs">Age: {age} years old</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Place of Birth</label>
                  <p className="text-gray-900 font-medium text-sm">{resident.birthplace}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Phone className="h-4 w-4 text-purple-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900 font-medium text-sm">
                      {formatContactNumberDisplay(resident.contactNumber) || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Email Address</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.email || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Employment */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Briefcase className="h-4 w-4 text-orange-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Education & Employment</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <GraduationCap className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Educational Attainment</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.educationalAttainment || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Employment Status</label>
                    <p className="text-gray-900 font-medium text-sm">{resident.employmentStatus || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Occupation</label>
                  <p className="text-gray-900 font-medium text-sm">{resident.occupation || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Civic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Shield className="h-4 w-4 text-red-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Civic Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Voter Status</label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      resident.voterStatus === 'Registered' || resident.voterStatus === 'REGISTERED'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {resident.voterStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Record Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date Added</label>
                  <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(resident.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(resident.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Programs */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Award className="h-4 w-4 text-indigo-600 mr-2" />
              <h3 className="text-md font-semibold text-gray-900">Special Programs & Benefits</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg border-2 transition-all ${
                resident.isTUPAD 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">TUPAD</span>
                  <div className={`w-2 h-2 rounded-full ${
                    resident.isTUPAD ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resident.isTUPAD ? 'Beneficiary' : 'Not enrolled'}
                </p>
              </div>

              <div className={`p-3 rounded-lg border-2 transition-all ${
                resident.isPWD 
                  ? 'border-purple-200 bg-purple-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">PWD</span>
                  <div className={`w-2 h-2 rounded-full ${
                    resident.isPWD ? 'bg-purple-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resident.isPWD ? 'Registered' : 'Not registered'}
                </p>
              </div>

              <div className={`p-3 rounded-lg border-2 transition-all ${
                resident.is4Ps 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">4Ps</span>
                  <div className={`w-2 h-2 rounded-full ${
                    resident.is4Ps ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resident.is4Ps ? 'Beneficiary' : 'Not enrolled'}
                </p>
              </div>

              <div className={`p-3 rounded-lg border-2 transition-all ${
                resident.isSoloParent 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Solo Parent</span>
                  <div className={`w-2 h-2 rounded-full ${
                    resident.isSoloParent ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resident.isSoloParent ? 'Registered' : 'Not registered'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 