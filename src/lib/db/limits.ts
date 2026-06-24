// Centralized query/page-size limits. Keep all "magic numbers" for bounded
// queries and pagination here so list views and DB loaders stay in sync.

// Listing page sizes (numbered pagination)
export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;

// Dashboard section limits (single-page previews, no pagination)
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

// Favorites page: cap each section (items / collections) so the unpaginated
// list view can't pull unbounded rows.
export const FAVORITES_PER_SECTION = 100;

// Account deletion pages through a user's file items in bounded batches so the
// R2 cleanup query stays capped without orphaning files for heavy uploaders.
export const ACCOUNT_DELETE_FILE_BATCH = 200;
