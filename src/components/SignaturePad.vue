<template>
  <div class="signature-container">
    <div class="signature-title">{{ title || 'Signature' }}</div>
    <!-- @ts-ignore - contourner les problèmes de typage -->
    <VueSignaturePad
      ref="signaturePad"
      :width="width"
      :height="height"
      :options="options"
      class="signature-pad q-mb-md"
    />
    <div class="row q-mt-sm">
      <q-btn
        flat
        color="negative"
        icon="delete"
        label="Effacer"
        @click="clearSignature"
        class="q-mr-sm"
      />
      <q-btn
        flat
        color="primary"
        icon="save"
        label="Enregistrer"
        @click="saveSignature"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { VueSignaturePad } from 'vue-signature-pad';

// Définir un type pour l'instance du SignaturePad
type SignaturePadInstance = {
  isEmpty: () => boolean;
  clearSignature: () => void;
  saveSignature: () => { data: string; isEmpty: boolean };
  undoSignature: () => void;
  fromDataURL: (dataURL: string) => void;
};

defineProps({
  title: {
    type: String,
    default: 'Signature'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '200px'
  }
});

const emit = defineEmits(['update:signature']);

const signaturePad = ref<SignaturePadInstance | null>(null);

const options = {
  penColor: 'rgb(0, 0, 0)',
  backgroundColor: 'rgb(255, 255, 255)',
  minWidth: 1,
  maxWidth: 2.5
};

const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clearSignature();
    emit('update:signature', null);
  }
};

const saveSignature = () => {
  if (signaturePad.value) {
    const isEmpty = signaturePad.value.isEmpty;

    if (!isEmpty()) {
      const signatureData = signaturePad.value.saveSignature();
      emit('update:signature', signatureData.data);
    } else {
      emit('update:signature', null);
    }
  }
};

// Méthode pour obtenir la signature comme une image base64
const getSignatureImage = () => {
  if (signaturePad.value) {
    const isEmpty = signaturePad.value.isEmpty;
    if (!isEmpty()) {
      return signaturePad.value.saveSignature().data;
    }
  }
  return null;
};

// Exposer certaines méthodes au parent
defineExpose({
  clearSignature,
  getSignatureImage
});
</script>

<style scoped>
.signature-container {
  width: 100%;
  margin-bottom: 20px;
}

.signature-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.signature-pad {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}
</style>
