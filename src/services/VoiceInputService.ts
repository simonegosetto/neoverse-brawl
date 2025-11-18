export class VoiceInputService {
  private recognition: any;
  private isListening: boolean = false;
  private transcript: string = '';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'it-IT';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  async startListening(duration: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech Recognition not available'));
        return;
      }

      this.transcript = '';
      
      const timeout = setTimeout(() => {
        this.stopListening();
        resolve(this.transcript || 'guerriero silenzioso');
      }, duration);

      this.recognition.onresult = (event: any) => {
        this.transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', this.transcript);
      };

      this.recognition.onerror = (event: any) => {
        clearTimeout(timeout);
        console.error('Speech recognition error:', event.error);
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        clearTimeout(timeout);
        this.isListening = false;
        resolve(this.transcript || 'guerriero silenzioso');
      };

      try {
        this.recognition.start();
        this.isListening = true;
        console.log('Voice recording started...');
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  getLastTranscript(): string {
    return this.transcript;
  }
}
