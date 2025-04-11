<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Historique des PDF générés</h1>
    <q-table
      :rows="pdfHistory"
      :columns="columns"
      row-key="date"
      class="my-sticky-header-table"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="primary"
            icon="download"
            @click="regeneratePDF(props.row)"
          >
            <q-tooltip>Régénérer le PDF</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            @click="deletePDFHistory(props.row)"
          >
            <q-tooltip>Supprimer de l'historique</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { date } from 'quasar';
import { generatePDF } from 'src/services/pdfGenerator';

import type { MaintenanceData } from 'src/services/pdfGenerator';

interface PDFHistoryItem {
  date: string;
  type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'borne-recharge';
  formData: MaintenanceData;
}

const pdfHistory = ref<PDFHistoryItem[]>([]);

const columns = [
  {
    name: 'date',
    required: true,
    label: 'Date',
    align: 'left' as const,
    field: (row: PDFHistoryItem) => date.formatDate(row.date, 'DD/MM/YYYY HH:mm'),
    sortable: true
  },
  {
    name: 'type',
    required: true,
    label: 'Type de document',
    align: 'left' as const,
    field: 'type',
    sortable: true
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'center' as const,
    field: 'actions'
  }
];

onMounted(() => {
  loadHistory();
});

function loadHistory() {
  const history = localStorage.getItem('pdfHistory');
  if (history) {
    pdfHistory.value = JSON.parse(history);
  }
}

async function regeneratePDF(item: PDFHistoryItem) {
  const pdf = await generatePDF(item.formData, item.type);
  const filename = `${item.type}_${date.formatDate(item.date, 'YYYY-MM-DD_HH-mm')}.pdf`;
  pdf.download(filename);
}

function deletePDFHistory(item: PDFHistoryItem) {
  const index = pdfHistory.value.findIndex(
    (i) => i.date === item.date && i.type === item.type
  );
  if (index > -1) {
    pdfHistory.value.splice(index, 1);
    localStorage.setItem('pdfHistory', JSON.stringify(pdfHistory.value));
  }
}
</script>

<style lang="scss">
.my-sticky-header-table {
  /* height or max-height is important */
  height: 400px;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: white;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:first-child th {
    top: 0;
  }
}
</style>
