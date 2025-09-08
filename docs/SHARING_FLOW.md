# Sharing Flow (Tasks 5.4 & 5.5)

Implemented components and utilities:

1. Avatar / Look Capture
   - `src/utils/avatarCapture.ts` provides `captureElementAsImage`, `downloadBlob`, and `captureAndDownload`.
   - Uses `html2canvas` if present; falls back to finding a nested `<canvas>`.

2. Native Sharing
   - `src/utils/share.ts` exposes `shareLook` using the Web Share API.
   - Gracefully throws if unsupported so UI can fallback to manual download.

3. Permissions & Privacy
   - Back-end: `/api/permissions` GET/PUT with Prisma model `WardrobePermission`.
   - Front-end: `usePermissions` hook + `PermissionsForm` component.

4. Profile Editing
   - `ProfileSettingsForm` integrated into `Settings` page.

Next Enhancements:

- Add UI button on avatar/try-on screen to capture & share directly.
- Implement fallback modal if `navigator.share` unsupported (desktop browsers).
- Add audit logging for permission changes.
