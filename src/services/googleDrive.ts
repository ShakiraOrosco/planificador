import type { Attachment, GoogleDriveConfig } from '../types';

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

const STORAGE_KEY_CONFIG = 'kanban_gdrive_config';
const STORAGE_KEY_TOKEN = 'kanban_gdrive_token';

class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;
  private tokenClient: any = null;
  private accessToken: string | null = null;

  constructor() {
    this.loadSavedConfig();
    this.loadSavedToken();
  }

  public loadSavedConfig(): GoogleDriveConfig | null {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      try {
        this.config = JSON.parse(raw);
      } catch {
        this.config = null;
      }
    }
    return this.config;
  }

  public saveConfig(config: GoogleDriveConfig): void {
    this.config = config;
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    this.initClients();
  }

  private loadSavedToken(): void {
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.accessToken = parsed.token;
        } else {
          localStorage.removeItem(STORAGE_KEY_TOKEN);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
  }

  private saveToken(token: string, expiresInSeconds: number): void {
    this.accessToken = token;
    const expiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
    localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify({ token, expiresAt }));
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isConfigured(): boolean {
    return !!(this.config?.clientId && this.config?.apiKey);
  }

  public getConfig(): GoogleDriveConfig | null {
    return this.config;
  }

  public async initClients(): Promise<boolean> {
    if (!this.config?.clientId || !this.config?.apiKey) {
      return false;
    }

    try {
      await this.waitForScripts();

      // Initialize GAPI
      await new Promise<void>((resolve, reject) => {
        if (!window.gapi) {
          return reject(new Error('Google API (gapi) no cargado'));
        }
        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config!.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      // Initialize GIS Token Client
      if (window.google?.accounts?.oauth2) {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
          callback: (response: any) => {
            if (response.error) {
              console.error('Error de autenticación Google:', response);
              return;
            }
            if (response.access_token) {
              this.saveToken(response.access_token, response.expires_in || 3600);
            }
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error al inicializar clientes de Google:', error);
      return false;
    }
  }

  private waitForScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.gapi && window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 60) {
          clearInterval(interval);
          reject(new Error('Tiempo de espera agotado cargando scripts de Google'));
        }
      }, 100);
    });
  }

  public async signIn(): Promise<string> {
    if (!this.tokenClient) {
      const initialized = await this.initClients();
      if (!initialized || !this.tokenClient) {
        throw new Error('Configuración de Google Drive incompleta. Por favor añade Client ID y API Key.');
      }
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          return reject(new Error(response.error_description || response.error));
        }
        if (response.access_token) {
          this.saveToken(response.access_token, response.expires_in || 3600);
          resolve(response.access_token);
        }
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  public signOut(): void {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {
        // Revoked
      });
    }
    this.accessToken = null;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  /**
   * Abre Google Picker para seleccionar archivos de Google Drive
   */
  public async openFilePicker(): Promise<Attachment[]> {
    if (!this.config?.apiKey) {
      throw new Error('API Key de Google no configurada');
    }

    if (!this.accessToken) {
      await this.signIn();
    }

    return new Promise((resolve, reject) => {
      if (!window.google?.picker) {
        return reject(new Error('Librería Google Picker no disponible'));
      }

      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false);

      const appId = this.config?.appId || (this.config?.clientId ? this.config.clientId.split('-')[0] : '');

      const pickerBuilder = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(appId)
        .setOAuthToken(this.accessToken!)
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setDeveloperKey(this.config?.apiKey || '')
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const docs = data.docs || [];
            const attachments: Attachment[] = docs.map((doc: any) => ({
              id: 'gdrive_' + doc.id,
              name: doc.name,
              type: 'google_drive',
              url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
              mimeType: doc.mimeType,
              iconUrl: doc.iconUrl,
              size: doc.sizeBytes ? parseInt(doc.sizeBytes, 10) : undefined,
              driveFileId: doc.id,
              uploadedAt: new Date().toISOString(),
            }));
            resolve(attachments);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve([]);
          }
        });

      const picker = pickerBuilder.build();
      picker.setVisible(true);
    });
  }

  /**
   * Sube un archivo directamente a Google Drive usando la API REST v3 multipart
   */
  public async uploadFileToDrive(file: File): Promise<Attachment> {
    if (!this.accessToken) {
      await this.signIn();
    }

    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileData = await file.arrayBuffer();

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const mediaHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\nContent-Transfer-Encoding: binary\r\n\r\n`;

    const bodyParts = [
      new TextEncoder().encode(metadataPart),
      new TextEncoder().encode(mediaHeader),
      new Uint8Array(fileData),
      new TextEncoder().encode(closeDelimiter),
    ];

    const bodyBlob = new Blob(bodyParts, { type: `multipart/related; boundary=${boundary}` });

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,iconLink,size', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: bodyBlob,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error al subir a Google Drive: ${response.statusText}`);
    }

    const resData = await response.json();

    return {
      id: 'gdrive_' + resData.id,
      name: resData.name,
      type: 'google_drive',
      url: resData.webViewLink || `https://drive.google.com/file/d/${resData.id}/view`,
      mimeType: resData.mimeType,
      iconUrl: resData.iconLink,
      size: resData.size ? parseInt(resData.size, 10) : file.size,
      driveFileId: resData.id,
      uploadedAt: new Date().toISOString(),
    };
  }
}

export const googleDriveService = new GoogleDriveService();
