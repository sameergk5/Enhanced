# Wardrobe AI Database Schema Documentation
==================================================

## 📊 Database Overview

- **Total Models**: 12
- **Total Enums**: 0
- **Core Models**: 3
- **Feature Categories**: 4

## 👤 Core User Models

### User
```sql
  id            String   @id @default(uuid())
  email         String   @unique
  firebaseUid   String?  @unique
  username      String   @unique
  displayName   String
  avatar        String?
  bio           String?
  isPrivate     Boolean  @default(false)
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  ... (+12 more fields)
```

### UserProfile
```sql
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName     String?
  lastName      String?
  dateOfBirth   DateTime?
  gender        String?
  location      String?
  website       String?
  phone         String?
  ... (+11 more fields)
```

### StyleProfile
```sql
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  preferredStyles String[] // casual, formal, boho, minimalist, etc.
  preferredColors String[] // hex codes or color names
  brandPrefs      String[] // preferred brands
  priceRange      Json     // {min: number, max: number}
  styleVector     Float[]  // AI-generated style embedding
  colorPalette    String[] // AI-suggested color palette
  occupation      String?
  ... (+4 more fields)
```

## 🎯 Feature Models by Category

### Avatar System
- **Avatar3D**: 18 fields

### Wardrobe Management
- **Garment**: 25 fields
- **Outfit**: 17 fields
- **OutfitItem**: 6 fields

### Social Features
- **Post**: 13 fields
- **Like**: 6 fields
- **Comment**: 8 fields
- **Follow**: 6 fields

### Other
- **WishlistItem**: 12 fields
