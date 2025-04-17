declare module 'vue-signature-pad' {
  import type { DefineComponent } from 'vue';
  
  type SignaturePadOptions = {
    penColor?: string;
    backgroundColor?: string;
    minWidth?: number;
    maxWidth?: number;
    velocityFilterWeight?: number;
    [key: string]: unknown;
  };

  type SignaturePadMethods = {
    isEmpty: () => boolean;
    clearSignature: () => void;
    saveSignature: () => { data: string; isEmpty: boolean };
    undoSignature: () => void;
    fromDataURL: (dataURL: string) => void;
  };

  export const VueSignaturePad: DefineComponent<{
    width?: string;
    height?: string;
    options?: SignaturePadOptions;
  }, unknown, unknown, unknown, unknown, unknown, unknown, SignaturePadMethods>;
}
