export interface Attachment {
  id: string;
  leaveRequestId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  uploadedAt: Date | string;
}
