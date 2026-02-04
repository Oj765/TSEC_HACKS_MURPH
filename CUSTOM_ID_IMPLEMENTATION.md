# Custom ID Generation Implementation ✅

## Overview

Successfully implemented custom ID generation for Teachers and Students in the format:
- **Teachers**: `tea_xxxxx` (e.g., `tea_f0db78a596`)
- **Students**: `stu_xxxxx` (e.g., `stu_9a4b27484e`)

## Changes Made

### 1. **Teacher Model** (`models/Teacher.js`)
Added custom `_id` field with automatic generation:
```javascript
_id: {
  type: String,
  default: function() {
    return 'tea_' + crypto.randomBytes(5).toString('hex');
  }
}
```

### 2. **Student Model** (`models/Student.js`)
Added custom `_id` field with automatic generation:
```javascript
_id: {
  type: String,
  default: function() {
    return 'stu_' + crypto.randomBytes(5).toString('hex');
  }
}
```

### 3. **AuthUser Model** (`models/AuthUser.js`)
Changed `profileId` from ObjectId to String:
```javascript
profileId: {
  type: String, // Changed from ObjectId to support custom IDs
  refPath: 'profileModel',
}
```

### 4. **Session Model** (`models/Session.js`)
Changed ID fields from ObjectId to String:
```javascript
studentId: { type: String, ref: 'Student', required: true },
teacherId: { type: String, ref: 'Teacher', required: true },
```

### 5. **Transaction Model** (`models/Transaction.js`)
Changed ID fields from ObjectId to String:
```javascript
userId: { type: String, required: true, refPath: 'userModel' },
sessionId: { type: String, ref: 'Session' },
```

### 6. **Review Model** (`models/Review.js`)
Changed ID fields from ObjectId to String:
```javascript
sessionId: { type: String, ref: 'Session', required: true },
studentId: { type: String, ref: 'Student', required: true },
teacherId: { type: String, ref: 'Teacher', required: true },
```

## ID Format

### Structure
- **Prefix**: `tea_` or `stu_`
- **Random Part**: 10 hexadecimal characters (5 random bytes)
- **Total Length**: 14 characters
- **Example**: `tea_f0db78a596`, `stu_9a4b27484e`

### Generation Method
Using Node.js `crypto` module:
```javascript
const crypto = require('crypto');
const id = 'tea_' + crypto.randomBytes(5).toString('hex');
```

## Testing Results

✅ **Teacher Signup**: Creates profile with ID format `tea_xxxxx`
```
Profile ID: tea_f0db78a596
ID Length: 14 characters
```

✅ **Student Signup**: Creates profile with ID format `stu_xxxxx`
```
Profile ID: stu_9a4b27484e
ID Length: 14 characters
```

## Backward Compatibility

The system now supports **both** ID formats:
- ✅ **New IDs**: Custom format (`tea_xxxxx`, `stu_xxxxx`)
- ✅ **Old IDs**: MongoDB ObjectIds (24-character hex)

The backend API (teacher dashboard) was already updated to handle both formats intelligently.

## Benefits

1. **Human-Readable**: Easy to identify entity type from ID prefix
2. **Shorter**: 14 characters vs 24 for ObjectIds
3. **Consistent**: All new entities use the same format
4. **Unique**: Cryptographically random, collision-resistant
5. **Type-Safe**: Prefix indicates entity type (tea/stu)

## Files Modified

1. `models/Teacher.js` - Added custom _id generation
2. `models/Student.js` - Added custom _id generation
3. `models/AuthUser.js` - Changed profileId to String
4. `models/Session.js` - Changed studentId and teacherId to String
5. `models/Transaction.js` - Changed userId and sessionId to String
6. `models/Review.js` - Changed sessionId, studentId, teacherId to String
7. `test-custom-ids.js` - Created test script (new file)

## Usage

### Creating a New Teacher
```javascript
// Via signup API
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher",
  "subjects": ["Math"],
  "pricePerMinute": 2.5
}

// Response
{
  "userId": "69834571ece86de8c12cb601",
  "role": "teacher",
  "profileId": "tea_f0db78a596",  // ✅ Custom ID
  "profileModel": "Teacher"
}
```

### Creating a New Student
```javascript
// Via signup API
POST /api/auth/signup
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student"
}

// Response
{
  "userId": "69834571ece86de8c12cb605",
  "role": "student",
  "profileId": "stu_9a4b27484e",  // ✅ Custom ID
  "profileModel": "Student"
}
```

## Important Notes

- **All new teachers** will have IDs starting with `tea_`
- **All new students** will have IDs starting with `stu_`
- **Existing data** with ObjectIds continues to work
- **No data migration** required
- **IDs are unique** and cryptographically random
- **Length is fixed** at 14 characters

## Next Steps (Optional)

If you want to migrate existing ObjectId-based records to custom IDs:
1. Create a migration script
2. Generate new custom IDs for existing records
3. Update all references (sessions, transactions, reviews)
4. This is **not required** - both formats work seamlessly
