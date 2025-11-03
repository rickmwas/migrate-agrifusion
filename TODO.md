# Tasks to Complete

## 1. Fix Homepage Navigation
- [ ] Update createPageUrl function to convert camelCase to kebab-case (e.g., "QualityChecking" -> "/quality-checking")
- [ ] Test that homepage cards navigate correctly to their respective pages

## 2. Fix Marketplace Cards and Database Schema
- [ ] Create new Supabase migration to add seller_name, seller_phone, seller_email, location columns to market_listings table
- [ ] Update AddListing.tsx to fetch user profile and email, populate seller fields when creating listings
- [ ] Change 'city' column to 'location' in database migration and AddListing form
- [ ] Test that marketplace cards display complete seller information and link to detail pages without "not found" errors
