// Déclarer le module vue-signature-pad
declare module 'vue-signature-pad' {
  import type { Component } from 'vue';

  interface SignaturePadOptions {
    penColor?: string;
    backgroundColor?: string;
    minWidth?: number;
    maxWidth?: number;
    velocityFilterWeight?: number;
    [key: string]: unknown;
  }

  interface SignaturePadResult {
    data: string;
    isEmpty: boolean;
  }

  interface VueSignaturePadMethods {
    isEmpty(): boolean;
    clearSignature(): void;
    saveSignature(): SignaturePadResult;
    undoSignature(): void;
    fromDataURL(dataURL: string): void;
  }

  interface VueSignaturePadProps {
    width?: string;
    height?: string; 
    options?: SignaturePadOptions;
  }

  // Déclaration du composant
  export const VueSignaturePad: Component<VueSignaturePadProps>;
}
