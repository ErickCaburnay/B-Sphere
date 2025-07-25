# Resident Duplicate Validation System

## Overview

The Barangay Information Management System (BIMS) includes a comprehensive duplicate validation system to prevent duplicate resident registrations based on name and birthdate combinations.

## How It Works

### 1. Identity Key Generation

The system generates two unique keys for each resident:

- **`identityKey`**: `LASTNAME_FIRSTNAME_MIDDLENAME_BIRTHDATE`
- **`fullNameKey`**: `LASTNAME_FIRSTNAME_MIDDLENAME`

### 2. Validation Rules

The system checks for duplicates using two criteria:

1. **Exact Match**: Same full name + birthdate
   - **Result**: Registration blocked
   - **Error**: "A resident with the same name and birthdate already exists"

2. **Name Match**: Same full name (regardless of birthdate)
   - **Result**: Registration blocked
   - **Error**: "A resident with the same full name already exists"

### 3. Data Normalization

All name fields are normalized before comparison:
- Converted to UPPERCASE
- Removed extra spaces
- Trimmed whitespace

## Implementation

### API Endpoints

#### Step 1 Registration (`/api/auth/signup/step1`)
- Validates duplicates before storing temporary data
- Uses utility functions for consistent validation

#### Legacy Registration (`/api/auth/signup`)
- Includes duplicate validation for backward compatibility
- Same validation logic as step-by-step process

### Utility Functions

Located in `src/lib/duplicateValidation.js`:

```javascript
// Generate identity keys
generateIdentityKeys(firstName, lastName, middleName, birthdate)

// Check for duplicates in Firestore
checkDuplicateResidents(db, firstName, lastName, middleName, birthdate, excludeId)

// Validate duplicate check results
validateDuplicateCheck(duplicateResult)

// Complete validation workflow
validateResidentDuplicates(db, firstName, lastName, middleName, birthdate, excludeId)
```

## Firestore Structure

### Resident Document Fields

```javascript
{
  // ... other fields
  identityKey: "DELA_CRUZ_JUAN_GOMEZ_1990-05-15",
  fullNameKey: "DELA_CRUZ_JUAN_GOMEZ",
  // ... other fields
}
```

### Collections

- `residents/{uniqueId}` - Main resident data with identity keys
- `temp_residents/{tempId}` - Temporary data during registration

## Firestore Indexes

Required indexes for efficient queries:

```json
{
  "indexes": [
    {
      "collectionGroup": "residents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "identityKey", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "residents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fullNameKey", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Usage Examples

### Basic Validation

```javascript
import { validateResidentDuplicates } from '@/lib/duplicateValidation';

const result = await validateResidentDuplicates(
  db,
  'Juan',
  'Dela Cruz',
  'Gomez',
  '1990-05-15'
);

if (!result.isValid) {
  console.log('Duplicate found:', result.error);
  return;
}

// Proceed with registration
console.log('Identity keys:', result.identityKey, result.fullNameKey);
```

### Update Validation (Excluding Current Resident)

```javascript
const result = await validateResidentDuplicates(
  db,
  'Juan',
  'Dela Cruz',
  'Gomez',
  '1990-05-15',
  'current-resident-id' // Exclude from check
);
```

## Error Messages

| Condition | Error Message |
|-----------|---------------|
| Exact match (name + birthdate) | "A resident with the same name and birthdate already exists" |
| Name match only | "A resident with the same full name already exists" |

## Performance Considerations

1. **Indexed Queries**: All duplicate checks use indexed fields for optimal performance
2. **Parallel Execution**: Identity and name checks run in parallel
3. **Caching**: Consider implementing Redis caching for frequently checked names
4. **Batch Operations**: For bulk operations, consider batch validation

## Testing

### Test Cases

1. **No Duplicate**: New resident with unique name and birthdate
2. **Exact Duplicate**: Same name and birthdate as existing resident
3. **Name Duplicate**: Same name but different birthdate
4. **Case Sensitivity**: Different case variations of same name
5. **Whitespace**: Names with extra spaces
6. **Update Scenario**: Updating existing resident (should exclude self)

### Test Data

```javascript
// Test resident
{
  firstName: "Juan",
  lastName: "Dela Cruz",
  middleName: "Gomez",
  birthdate: "1990-05-15"
}

// Should generate:
// identityKey: "DELA_CRUZ_JUAN_GOMEZ_1990-05-15"
// fullNameKey: "DELA_CRUZ_JUAN_GOMEZ"
```

## Migration Notes

For existing systems without identity keys:

1. **Backfill Script**: Create a script to generate identity keys for existing residents
2. **Gradual Rollout**: Implement validation in stages
3. **Monitoring**: Monitor for false positives during initial deployment

## Security Considerations

1. **Input Validation**: All inputs are sanitized and normalized
2. **SQL Injection**: Firestore queries are parameterized
3. **Rate Limiting**: Consider rate limiting for registration endpoints
4. **Audit Logging**: Log all duplicate check attempts for monitoring 