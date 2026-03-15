# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-15

### Added
- Manual redirect management (create, edit, delete, toggle active)
- Runtime Koa middleware with in-memory cache for redirect matching
- Slug auto-redirect via `beforeUpdate`/`afterUpdate` lifecycle hooks
- Redirect chain detection with max depth of 10 hops and cycle prevention
- Orphan redirect tracking on content deletion with resolve/dismiss workflow
- Chain flattening when resolving orphan redirects
- Plugin Settings page with content type configuration, URL prefix mapping, and feature toggles
- Admin UI pages: Redirect List, Orphan Redirects, Settings
- Path normalization: trailing slash stripping, consecutive slash collapsing, query string removal
- Security: protocol-relative URL rejection, external URL blocking, reserved path protection
- Comprehensive test suite (172 tests)
