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
          <q-input outlined v-model="formData.nomTransformateur" label="Nom du transformateur" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.puissance" label="Puissance" />
        </div>
        <div class="col-12">
          <q-file outlined v-model="formData.photo" label="Photo" accept="image/*">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
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
import { generateTransformateurPDF } from 'src/services/pdfGenerator';

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
    label: 'Conformité',
    align: 'center' as const,
    field: 'status',
    sortable: true
  }
];

const controles = ref([
  { prestation: 'DGPT2 : Fct 1er seuil', status: 0 },
  { prestation: 'DGPT2 : Fct 2ème seuil', status: 0 },
  { prestation: 'Contrôle visuel de l\'état des câbles HT/BT', status: 0 },
  { prestation: 'Contrôle visuel des enroulements', status: 0 },
  { prestation: 'Contrôle de la serrure interverrouillage', status: 0 },
  { prestation: 'Nettoyage et dépollution de l\'ensemble des constituants', status: 0 },
  { prestation: 'Contrôle manque d\'huile', status: 0 },
  { prestation: 'Resserrage des têtes HT', status: 0 },
  { prestation: 'Contrôle des têtes BT', status: 0 },
  { prestation: 'Resserrage des têtes BT', status: 0 },
  { prestation: 'Contrôle renvoi température', status: 0 },
  { prestation: 'Déclenchement BT sur défaut température', status: 0 },
  { prestation: 'Vérification absence de fuite', status: 0 }
]);

const generatePDF = async () => {
  const pdfDoc = await generateTransformateurPDF({
    ...formData.value,
    controles: controles.value.map(c => ({ ...c, type: 'toggle' }))
  });
  await new Promise<void>((resolve) => {
    const filename = `rapport-maintenance-transformateur_${date.formatDate(new Date(), 'YYYY-MM-DD_HH-mm')}.pdf`;
    pdfDoc.download(filename);
    resolve();
  });
};

const formData = ref({
  client: '',
  site: '',
  nomTransformateur: '',
  puissance: '',
  photo: null,
  remarques: ''
});
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

  :deep(.q-table td) {
    max-width: none;
  }
}
</style>
