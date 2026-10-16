import { google } from 'googleapis';
import { Readable } from 'stream';

async function getGDriveAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

  // 1. Try OAuth2 Refresh Token (Best for Personal Gmail Accounts - 15GB quota)
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  } 
  // 2. Try Service Account (Best for Workspace Shared Drives)
  else if (clientEmail && privateKey) {
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });
    await jwtClient.authorize();
    return jwtClient;
  } else {
    throw new Error('ยังไม่ได้ตั้งค่า Google Drive Credentials ใน .env');
  }
}

export async function uploadToGoogleDrive({ buffer, fileName, mimeType }) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const auth = await getGDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: mimeType || 'application/pdf',
    body: stream,
  };

  const fileRes = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    fields: 'id, name, webViewLink, webContentLink',
  });

  const fileId = fileRes.data.id;

  try {
    await drive.permissions.create({
      fileId: fileId,
      supportsAllDrives: true,
      supportsTeamDrives: true,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (permErr) {
    console.warn('Could not set public permission on Google Drive file:', permErr.message);
  }

  const webViewLink = fileRes.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  console.log(`[Google Drive API] File Uploaded Successfully! ID: ${fileId}`);

  return {
    fileId,
    fileName: fileRes.data.name,
    webViewLink,
    webContentLink: fileRes.data.webContentLink,
  };
}

export async function deleteFromGoogleDrive(fileId) {
  if (!fileId) return;
  try {
    const auth = await getGDriveAuth();
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });
    console.log(`[Google Drive API] File deleted from Google Drive! ID: ${fileId}`);
  } catch (err) {
    console.warn(`[Google Drive API] Could not delete file from Google Drive (${fileId}):`, err.message);
  }
}
