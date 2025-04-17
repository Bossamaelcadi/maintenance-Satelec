<template>
  <q-page padding>
    <div class="q-pa-sm">
      <!-- New input fields section -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.client" label="Client" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.site" label="Site" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.nomTD" label="Nom du TD" />
        </div>
        <div class="col-12">
          <q-file outlined v-model="formData.photos" label="Photos (max 2)" accept="image/*" multiple counter max-files="2">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <div class="row q-mt-sm" v-if="formData.photos && formData.photos.length > 0">
            <div class="col-6 col-sm-4 q-pa-xs" v-for="(photo, index) in formData.photos" :key="index">
              <q-img :src="getPhotoPreviewUrl(photo)" style="height: 100px; width: 100%" fit="cover" class="rounded-borders">
                <div class="absolute-top-right">
                  <q-btn round flat dense icon="close" color="white" class="bg-grey-8" @click="removePhoto(index)" />
                </div>
              </q-img>
            </div>
          </div>
        </div>
      </div>

      <h5 class="text-h6 q-mt-none q-mb-md text-center">CONTRÔLES APRÈS CONSIGNATION DU POSTE</h5>

      <q-table
        :rows="controles"
        :columns="columns"
        row-key="prestation"
        flat
        bordered
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="prestation" :props="props" class="prestation-cell">
              {{ props.row.prestation }}
            </q-td>
            <q-td key="status" :props="props" class="text-center status-cell">
              <q-toggle
                v-model="props.row.status"
                checked-icon="check_circle"
                unchecked-icon="cancel"
                color="green"
                :false-value="0"
                :true-value="1"
                :label="$q.screen.gt.xs ? (props.row.status === 1 ? 'Conforme' : 'Non conforme') : ''"
                :label-color="props.row.status === 1 ? 'green' : 'red'"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>

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
import type { QTableColumn } from 'quasar';
import { generateTDPDF } from 'src/services/pdfGenerator';
import SignaturePad from 'src/components/SignaturePad.vue';

const columns: QTableColumn[] = [
  {
    name: 'prestation',
    required: true,
    label: 'Prestations réalisées',
    align: 'left' as const,
    field: 'prestation',
    sortable: true
  },
  {
    name: 'status',
    required: true,
    label: 'Statut',
    align: 'center' as const,
    field: 'status',
    sortable: true
  }
];

const controles = ref([
  { prestation: 'Contrôle visuel de l\'état du TD', status: 0 },
  { prestation: 'Contrôle étiquetage / repérage', status: 0 },
  { prestation: 'Contrôle visuel de l\'état des câbles HT/BT sur les divers départs', status: 0 },
  { prestation: 'Contrôle visuel des MALT (1 connectique par point)', status: 0 },
  { prestation: 'Contrôle de la présence des schémas électriques', status: 0 },
  { prestation: 'Nettoyage et dépollution de l\'ensemble des constituants', status: 0 },
  { prestation: 'Resserrage des têtes BT', status: 0 },
  { prestation: 'Nettoyage et dépollution du local', status: 0 },
  { prestation: 'Contrôle de l\'éclairage', status: 0 },
  { prestation: 'Contrôle de l\'éclairage de sécurité', status: 0 },
  { prestation: 'Contrôle des obturateurs et des plastrons', status: 0 },
  { prestation: 'Contrôle de la fermeture de chaque cellule BT', status: 0 },
  { prestation: 'Pose de l\'étiquette de passage pour maintenance', status: 0 }
]);

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
  
  const pdfDoc = await generateTDPDF({
    ...formData.value,
    controles: controles.value.map(c => ({ ...c, type: 'toggle' }))
  });
  await new Promise<void>((resolve) => {
    const filename = `rapport-maintenance-td_${date.formatDate(new Date(), 'YYYY-MM-DD_HH-mm')}.pdf`;
    pdfDoc.download(filename);
    resolve();
  });
};

const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null);

const formData = ref({
  client: '',
  site: '',
  nomTD: '',
  photos: [],
  remarques: '',
  signature: ''
});

const getPhotoPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

const removePhoto = (index: number): void => {
  formData.value.photos.splice(index, 1);
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
  }
}
</style>
