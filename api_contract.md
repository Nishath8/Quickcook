# API Contract

**Base URL**: `http://localhost:5000`

## Endpoints

### 1. POST `/cooks`
**Request:**
```json
{
  "name": "string",
  "location": "string",
  "cuisine": "string",
  "price_range": "string",
  "contact": "string"
}
```

**Response:**
```json
{
  "message": "Cook added successfully"
}
```

### 2. GET `/cooks`
**Query params:**
- `location` (optional)
- `cuisine` (optional)

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "location": "string",
    "cuisine": "string",
    "price_range": "string",
    "contact": "string"
  }
]
```

### 3. GET `/admin/cooks`
**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "status": "pending | approved",
    ...
  }
]
```

### 4. PATCH `/admin/cooks/:id`
**Request:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "message": "Status updated"
}
```
