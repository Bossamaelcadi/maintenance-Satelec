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
          <q-input outlined v-model="formData.nomPoste" label="Nom du poste" />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            outlined 
            v-model="formData.nombreCellules" 
            label="Nombre de cellules" 
            type="number"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="formData.typeCellule" label="Type de cellule" />
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

      <!-- État général du poste -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">État général du poste :</div>
        <q-table
          :rows="etatGeneralControles"
          :columns="columns"
          row-key="prestation"
          flat
          bordered
          class="q-mb-md"
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
      </div>

      <!-- Présence des dispositifs de sécurité -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">Présence des dispositifs de sécurité :</div>
        <q-table
          :rows="securiteControles"
          :columns="columns"
          row-key="prestation"
          flat
          bordered
          class="q-mb-md"
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
      </div>

      <!-- Cellules -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">Cellules :</div>
        <q-table
          :rows="cellulesControles"
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
      </div>
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
import { generatePosteHTBTPDF } from 'src/services/pdfGenerator';

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

const formData = ref({
  client: '',
  site: '',
  nomPoste: '',
  nombreCellules: 0,
  typeCellule: '',
  photo: null,
  remarques: ''
});

const etatGeneralControles = ref([
  { prestation: 'Verrouillage (État des serrures, …)', status: 0 },
  { prestation: 'Nettoyage', status: 0 },
  { prestation: 'Ventilation (Nettoyage des grilles)', status: 0 },
  { prestation: 'Éclairage (normal et sécurité)', status: 0 }
]);

const securiteControles = ref([
  { prestation: 'Extincteurs', status: 0 },
  { prestation: 'Perche à corps, gant, tabouret, vérificateur de tension, bloc secours portatif', status: 0 }
]);

const cellulesControles = ref([
  { prestation: 'Présence tension (une tension par phase)', status: 0 },
  { prestation: 'Mécanisme de commande interrupteur', status: 0 },
  { prestation: 'Mécanisme de commande sectionneur de terre', status: 0 },
  { prestation: 'Dépoussiérage', status: 0 },
  { prestation: 'Serrage des connexions', status: 0 },
  { prestation: 'Graissage des couteaux', status: 0 }
]);

const generatePDF = async () => {
  const pdfDoc = await generatePosteHTBTPDF({
    ...formData.value,
    controles: [...etatGeneralControles.value, ...securiteControles.value, ...cellulesControles.value].map(c => ({ ...c, type: 'toggle' }))
  });
  await new Promise<void>((resolve) => {
    const filename = `rapport-maintenance-poste-htbt_${date.formatDate(new Date(), 'YYYY-MM-DD_HH-mm')}.pdf`;
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

  :deep(.q-table td) {
    max-width: none;
  }
}
</style>
