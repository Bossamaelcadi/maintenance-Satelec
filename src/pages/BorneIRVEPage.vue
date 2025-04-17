<template>
  <q-page padding>
    <div class="q-pa-sm">
      <!-- Client et Site section -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.client" label="Client" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.site" label="Site" />
        </div>
      </div>

      <!-- Interrupteur du TD Borne IRVE section -->
      <div class="q-mt-md">
        <h5 class="text-h6 q-mt-md q-mb-sm">Interrupteur du TD Borne IRVE</h5>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <q-input 
              outlined 
              v-model="formData.interrupteurIntensiteVolts" 
              label="Intensité (Volts)" 
              type="number"
              step="0.01" 
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined v-model="formData.interrupteurLk3" label="lk3" />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined v-model="formData.interrupteurLk1" label="lk1" />
          </div>
          <div class="col-12">
            <q-file outlined v-model="formData.interrupteurPhotos" label="Photos (max 2)" accept="image/*" multiple counter max-files="2">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div class="row q-mt-sm" v-if="formData.interrupteurPhotos && formData.interrupteurPhotos.length > 0">
              <div class="col-6 col-sm-4 q-pa-xs" v-for="(photo, index) in formData.interrupteurPhotos" :key="index">
                <q-img :src="getPhotoPreviewUrl(photo)" style="height: 100px; width: 100%" fit="cover" class="rounded-borders">
                  <div class="absolute-top-right">
                    <q-btn round flat dense icon="close" color="white" class="bg-grey-8" @click="removeInterrupteurPhoto(index)" />
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cable section -->
      <div class="q-mt-md">
        <h5 class="text-h6 q-mt-md q-mb-sm">Cable</h5>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <q-input outlined v-model="formData.cableLongueur" label="Longueur" />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined v-model="formData.cableSection" label="Section" />
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined v-model="formData.cableType" label="Type" />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined v-model="formData.cableModePose" label="Mode de pose" />
          </div>
          <div class="col-12 col-md-6">
            <q-input outlined v-model="formData.cableNbCircuitAdjacent" label="Nb circuit adjacent" />
          </div>
          <div class="col-12">
            <q-file outlined v-model="formData.cablePhotos" label="Photos (max 2)" accept="image/*" multiple counter max-files="2">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div class="row q-mt-sm" v-if="formData.cablePhotos && formData.cablePhotos.length > 0">
              <div class="col-6 col-sm-4 q-pa-xs" v-for="(photo, index) in formData.cablePhotos" :key="index">
                <q-img :src="getPhotoPreviewUrl(photo)" style="height: 100px; width: 100%" fit="cover" class="rounded-borders">
                  <div class="absolute-top-right">
                    <q-btn round flat dense icon="close" color="white" class="bg-grey-8" @click="removeCablePhoto(index)" />
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Borne section -->
      <div class="q-mt-md">
        <h5 class="text-h6 q-mt-md q-mb-sm">Borne</h5>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <q-input 
              outlined 
              v-model="formData.bornePuissance" 
              label="Puissance" 
              type="number"
              step="0.01" 
            />
          </div>
          <div class="col-12">
            <q-file outlined v-model="formData.bornePhotos" label="Photos (max 2)" accept="image/*" multiple counter max-files="2">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div class="row q-mt-sm" v-if="formData.bornePhotos && formData.bornePhotos.length > 0">
              <div class="col-6 col-sm-4 q-pa-xs" v-for="(photo, index) in formData.bornePhotos" :key="index">
                <q-img :src="getPhotoPreviewUrl(photo)" style="height: 100px; width: 100%" fit="cover" class="rounded-borders">
                  <div class="absolute-top-right">
                    <q-btn round flat dense icon="close" color="white" class="bg-grey-8" @click="removeBornePhoto(index)" />
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contrôles et remarques -->
      <div class="q-mt-md">
        <q-input
          outlined
          v-model="formData.remarques"
          label="Remarques"
          type="textarea"
          rows="4"
        />
      </div>
      
      <!-- Pad de signature -->
      <div class="q-mt-xl">
        <SignaturePad
          ref="signaturePadRef"
          title="Signature du technicien"
          @update:signature="updateSignature"
        />
      </div>

      <div class="q-mt-md flex justify-center">
        <q-btn
          color="primary"
          icon="picture_as_pdf"
          label="Générer le PDF"
          class="q-px-md"
          @click="generatePDF"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { date } from 'quasar';
import { generateBorneIRVEPDF } from 'src/services/pdfGenerator';
import SignaturePad from 'src/components/SignaturePad.vue';

interface FormData {
  client: string;
  site: string;
  
  // Interrupteur section
  interrupteurIntensiteVolts: number | null;
  interrupteurLk3: string;
  interrupteurLk1: string;
  interrupteurPhotos: File[];
  
  // Cable section
  cableLongueur: string;
  cableSection: string;
  cableType: string;
  cableModePose: string;
  cableNbCircuitAdjacent: string;
  cablePhotos: File[];
  
  // Borne section
  bornePuissance: number | null;
  bornePhotos: File[];
  
  remarques: string;
  signature?: string; // Pour stocker la signature en base64
  
  // Contrôles (requis par l'interface MaintenanceData)
  controles: Array<{
    prestation: string;
    status?: number;
    textValue?: string;
    type: 'toggle' | 'text';
  }>;
}

const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null);

const formData = ref<FormData>({
  client: '',
  site: '',
  
  // Interrupteur section
  interrupteurIntensiteVolts: null,
  interrupteurLk3: '',
  interrupteurLk1: '',
  interrupteurPhotos: [],
  
  // Cable section
  cableLongueur: '',
  cableSection: '',
  cableType: '',
  cableModePose: '',
  cableNbCircuitAdjacent: '',
  cablePhotos: [],
  
  // Borne section
  bornePuissance: null,
  bornePhotos: [],
  
  remarques: '',
  signature: '',
  
  // Contrôles vides (requis par l'interface)
  controles: [
    { prestation: 'Vérification de la borne IRVE', status: 0, type: 'toggle' },
    { prestation: 'Remarques sur l\'installation', textValue: '', type: 'text' }
  ]
});

const getPhotoPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

const removeInterrupteurPhoto = (index: number): void => {
  formData.value.interrupteurPhotos.splice(index, 1);
};

const removeCablePhoto = (index: number): void => {
  formData.value.cablePhotos.splice(index, 1);
};

const removeBornePhoto = (index: number): void => {
  formData.value.bornePhotos.splice(index, 1);
};

// Mettre à jour la signature dans le formulaire
const updateSignature = (signatureData: string | null) => {
  formData.value.signature = signatureData || '';
};

const generatePDF = async () => {
  // Mettre à jour la signature si elle existe dans le pad mais pas dans le formulaire
  if (signaturePadRef.value && !formData.value.signature) {
    const signatureImage = signaturePadRef.value.getSignatureImage();
    if (signatureImage) {
      formData.value.signature = signatureImage;
    }
  }
  
  // Extraire toutes les valeurs non-null du formulaire
  const {
    interrupteurIntensiteVolts,
    bornePuissance,
    ...restData
  } = formData.value;
  
  // Ne créer un objet qu'avec les propriétés définies (non-null)
  const dataToSend = {
    ...restData,
    // Ajouter ces propriétés seulement si elles ne sont pas null
    ...(interrupteurIntensiteVolts !== null ? { interrupteurIntensiteVolts } : {}),
    ...(bornePuissance !== null ? { bornePuissance } : {})
  };
  
  const pdfDoc = await generateBorneIRVEPDF(dataToSend);
  await new Promise<void>((resolve) => {
    const filename = `rapport-maintenance-borne-irve_${date.formatDate(new Date(), 'YYYY-MM-DD_HH-mm')}.pdf`;
    pdfDoc.download(filename);
    resolve();
  });
};
</script>

<style scoped>
.q-table__container {
  background-color: white;
}

.q-table {
  background-color: white;
}

@media (max-width: 599px) {
  .prestation-cell {
    font-size: 0.8rem;
    padding: 4px 8px !important;
    white-space: normal !important;
    line-height: 1.2;
    min-height: 48px;
  }

  .status-cell {
    padding: 4px !important;
    width: 60px;
  }

  :deep(.q-table thead tr) {
    height: 40px;
  }

  :deep(.q-table tbody td) {
    height: auto;
  }

  :deep(.q-table__container) {
    max-width: 100vw;
  }

  :deep(.q-table) {
    max-width: 100%;
  }
}
</style>
