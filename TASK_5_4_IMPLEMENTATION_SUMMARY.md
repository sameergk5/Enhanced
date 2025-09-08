## Task 5.4 Completion – Client-Side Avatar Image Capture

Status: COMPLETE

### Deliverables

* Capture button (camera icon) added to `Avatar3DViewer` – invokes new `captureImage` flow
* Emits `onCapture` callback with `{ blob, url, fileName }`
* New utility `avatarCapture.ts` with wrapper: data URL conversion + download helper
* Loading state / disabled button while capturing
* Unit test for utility (`avatarCapture.test.tsx`)

### Usage Example
```tsx
<Avatar3DViewer outfit={currentOutfit} onCapture={async ({ blob, url, fileName }) => {
  // Optionally auto-download
  // buildCapturedAvatarImage({ blob, url, fileName }).download()
}} />
```

### Next Integration Steps (Task 5.5 prerequisite)
1. Add share workflow: call `navigator.share` (mobile) or fallback modal.
2. Provide toast on successful capture + preview thumbnail.
3. Optional: Add WebGL canvas snapshot (higher fidelity) when renderer available.

### Notes
* Current capture reuses rendered image asset; replace with off-screen canvas rendering if higher resolution or watermark removal required.
* No backend call needed; purely client-side.

Ready for Task 5.5 (native sharing dialog integration).
