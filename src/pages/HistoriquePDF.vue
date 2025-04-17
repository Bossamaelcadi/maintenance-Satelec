<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Historique des PDF générés</h1>
    <q-table
      :rows="pdfHistory"
      :columns="columns"
      row-key="date"
      class="pdf-history-table"
      :pagination="pagination"
      dense
      :grid="$q.screen.lt.md"
    >
      <!-- Actions column for regular table view -->
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
      
      <!-- Custom grid item template for mobile view -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered class="pdf-history-card">
            <q-card-section>
              <div class="text-subtitle2">{{ formatDocumentType(props.row.type) }}</div>
              <div class="text-caption">{{ date.formatDate(props.row.date, 'DD/MM/YYYY HH:mm') }}</div>
            </q-card-section>
            
            <q-separator />
            
            <q-card-actions>
              <q-btn
                flat
                color="primary"
                icon="download"
                @click="regeneratePDF(props.row)"
                label="Télécharger"
              />
              <q-space />
              <q-btn
                flat
                color="negative"
                icon="delete"
                @click="deletePDFHistory(props.row)"
                label="Supprimer"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { date, useQuasar } from 'quasar';
import { generatePDF } from 'src/services/pdfGenerator';

import type { MaintenanceData } from 'src/services/pdfGenerator';

interface PDFHistoryItem {
  date: string;
  type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'borne-recharge' | 'borne-irve';
  formData: MaintenanceData;
}

const pdfHistory = ref<PDFHistoryItem[]>([]);
const $q = useQuasar();

// Pagination to show all entries by default
const pagination = ref({
  rowsPerPage: 0 // 0 means show all rows
});

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
    field: (row: PDFHistoryItem) => formatDocumentType(row.type),
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

// Helper function to format document types for better readability
function formatDocumentType(type: string): string {
  const typeMap: Record<string, string> = {
    'transformateur': 'Transformateur',
    'poste-htbt': 'Poste HT/BT',
    'tgbt': 'TGBT',
    'borne-recharge': 'Borne de recharge',
    'borne-irve': 'Borne IRVE'
  };
  
  return typeMap[type] || type;
}

onMounted(() => {
  loadHistory();
});

function loadHistory() {
  const history = localStorage.getItem('pdfHistory');
  if (history) {
    try {
      // Load history and ensure no duplicates
      const parsedHistory = JSON.parse(history);
      const uniqueHistory = removeDuplicates(parsedHistory);
      
      // If duplicates were removed, update localStorage
      if (uniqueHistory.length !== parsedHistory.length) {
        localStorage.setItem('pdfHistory', JSON.stringify(uniqueHistory));
      }
      
      pdfHistory.value = uniqueHistory;
    } catch (error) {
      console.error('Error parsing PDF history:', error);
      pdfHistory.value = [];
    }
  }
}

// Function to remove duplicate entries based on date and type
function removeDuplicates(history: PDFHistoryItem[]): PDFHistoryItem[] {
  const uniqueEntries = new Map();
  
  history.forEach(item => {
    const key = `${item.date}-${item.type}`;
    if (!uniqueEntries.has(key)) {
      uniqueEntries.set(key, item);
    }
  });
  
  return Array.from(uniqueEntries.values());
}

async function regeneratePDF(item: PDFHistoryItem) {
  try {
    const pdf = await generatePDF(item.formData, item.type);
    await new Promise<void>((resolve) => {
      const filename = `${item.type}_${date.formatDate(item.date, 'YYYY-MM-DD_HH-mm')}.pdf`;
      pdf.download(filename);
      resolve();
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
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
.pdf-history-table {
  /* Responsive table styles */
  width: 100%;
  overflow-x: auto;
  
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
  
  /* Grid mode styles for mobile */
  &.q-table--grid {
    .q-table__grid-item {
      margin-bottom: 0.5rem;
      padding: 0;
    }
  }
}

/* Make sure mobile view doesn't overflow */
@media (max-width: 599px) {
  .q-page {
    padding: 12px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem;
  }
}

.pdf-history-card {
  width: 100%;
}

.q-card-actions {
  justify-content: space-between;
}
</style>
