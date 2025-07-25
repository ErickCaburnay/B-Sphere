/**
 * Utility functions for resident duplicate validation
 */

/**
 * Generate identity keys for duplicate checking
 * @param {string} firstName - First name
 * @param {string} lastName - Last name  
 * @param {string} middleName - Middle name (optional)
 * @param {string} birthdate - Birth date
 * @returns {Object} Object containing identityKey and fullNameKey
 */
export function generateIdentityKeys(firstName, lastName, middleName = '', birthdate) {
  // Normalize and clean the input values
  const normalizedFirstName = firstName.trim().toUpperCase().replace(/\s+/g, '');
  const normalizedMiddleName = middleName ? middleName.trim().toUpperCase().replace(/\s+/g, '') : '';
  const normalizedLastName = lastName.trim().toUpperCase().replace(/\s+/g, '');
  const normalizedBirthdate = birthdate.trim();

  // Create identity keys
  const identityKey = `${normalizedLastName}_${normalizedFirstName}_${normalizedMiddleName}_${normalizedBirthdate}`;
  const fullNameKey = `${normalizedLastName}_${normalizedFirstName}_${normalizedMiddleName}`;

  return {
    identityKey,
    fullNameKey,
    normalizedFirstName,
    normalizedMiddleName,
    normalizedLastName,
    normalizedBirthdate
  };
}

/**
 * Check for duplicate residents in Firestore
 * @param {Object} db - Firestore database instance
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} middleName - Middle name (optional)
 * @param {string} birthdate - Birth date
 * @param {string} excludeId - Resident ID to exclude from check (for updates)
 * @returns {Object} Object containing duplicate check results
 */
export async function checkDuplicateResidents(db, firstName, lastName, middleName = '', birthdate, excludeId = null) {
  const { identityKey, fullNameKey } = generateIdentityKeys(firstName, lastName, middleName, birthdate);

  // Build queries
  let identityQuery = db.collection('residents').where('identityKey', '==', identityKey);
  let fullNameQuery = db.collection('residents').where('fullNameKey', '==', fullNameKey);

  // Exclude current resident if updating
  if (excludeId) {
    identityQuery = identityQuery.where('uniqueId', '!=', excludeId);
    fullNameQuery = fullNameQuery.where('uniqueId', '!=', excludeId);
  }

  // Execute queries
  const [identitySnapshot, fullNameSnapshot] = await Promise.all([
    identityQuery.get(),
    fullNameQuery.get()
  ]);

  return {
    hasExactMatch: !identitySnapshot.empty,
    hasNameMatch: !fullNameSnapshot.empty,
    identityKey,
    fullNameKey,
    exactMatchCount: identitySnapshot.size,
    nameMatchCount: fullNameSnapshot.size
  };
}

/**
 * Validate if registration should be allowed based on duplicate check
 * @param {Object} duplicateResult - Result from checkDuplicateResidents
 * @returns {Object} Object containing validation result and error message
 */
export function validateDuplicateCheck(duplicateResult) {
  if (duplicateResult.hasExactMatch) {
    return {
      isValid: false,
      error: 'A resident with the same name and birthdate already exists'
    };
  }

  if (duplicateResult.hasNameMatch) {
    return {
      isValid: false,
      error: 'A resident with the same full name already exists'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Complete duplicate validation workflow
 * @param {Object} db - Firestore database instance
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} middleName - Middle name (optional)
 * @param {string} birthdate - Birth date
 * @param {string} excludeId - Resident ID to exclude from check (for updates)
 * @returns {Object} Object containing validation result and identity keys
 */
export async function validateResidentDuplicates(db, firstName, lastName, middleName = '', birthdate, excludeId = null) {
  const duplicateResult = await checkDuplicateResidents(db, firstName, lastName, middleName, birthdate, excludeId);
  const validation = validateDuplicateCheck(duplicateResult);
  
  const { identityKey, fullNameKey } = generateIdentityKeys(firstName, lastName, middleName, birthdate);

  return {
    ...validation,
    identityKey,
    fullNameKey,
    duplicateResult
  };
} 