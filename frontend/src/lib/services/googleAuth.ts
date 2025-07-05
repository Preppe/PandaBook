interface GoogleAuthResponse {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
  };
}

class GoogleAuthService {
  private clientId: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!this.clientId) {
      console.warn('Google Client ID not found in environment variables');
    }
  }

  async signInWithPopup(): Promise<GoogleAuthResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Google login is only available in browser environment');
    }

    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    try {
      return new Promise((resolve, reject) => {
        this.loadGoogleAPI()
          .then(() => {
            this.initializeGoogleSignIn(resolve, reject);
          })
          .catch(reject);
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if (typeof window.google !== 'undefined') {
        resolve();
        return;
      }

      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  private initializeGoogleSignIn(
    resolve: (value: GoogleAuthResponse) => void,
    reject: (reason: any) => void
  ): void {
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
        try {
          const payload = this.parseJwt(response.credential);
          
          const googleResponse: GoogleAuthResponse = {
            idToken: response.credential,
            user: {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              given_name: payload.given_name,
              family_name: payload.family_name,
              picture: payload.picture,
            },
          };

          resolve(googleResponse);
        } catch (error) {
          reject(error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Try to show the One Tap prompt first
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // If One Tap is not displayed, we'll need to use a button click
        reject(new Error('Google One Tap not available. Please use the login button.'));
      }
    });
  }

  // Method to render a Google Sign-In button
  renderSignInButton(element: HTMLElement, options?: any): void {
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google API not loaded');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      ...options,
    };

    window.google.accounts.id.renderButton(element, defaultOptions);
  }

  // Method to trigger sign-in programmatically 
  async triggerSignIn(): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google) {
        reject(new Error('Google API not loaded'));
        return;
      }

      // Create a temporary container for the button
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.visibility = 'hidden';
      document.body.appendChild(tempContainer);

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          try {
            const payload = this.parseJwt(response.credential);
            
            const googleResponse: GoogleAuthResponse = {
              idToken: response.credential,
              user: {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                given_name: payload.given_name,
                family_name: payload.family_name,
                picture: payload.picture,
              },
            };

            // Clean up
            document.body.removeChild(tempContainer);
            resolve(googleResponse);
          } catch (error) {
            document.body.removeChild(tempContainer);
            reject(error);
          }
        },
      });

      // Render a hidden button and click it
      window.google.accounts.id.renderButton(tempContainer, {
        theme: 'outline',
        size: 'large',
      });

      // Click the button programmatically
      setTimeout(() => {
        const button = tempContainer.querySelector('div[role="button"]');
        if (button) {
          (button as HTMLElement).click();
        } else {
          document.body.removeChild(tempContainer);
          reject(new Error('Failed to create Google sign-in button'));
        }
      }, 100);
    });
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  async signOut(): Promise<void> {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

// Global type declaration for Google API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default new GoogleAuthService();
