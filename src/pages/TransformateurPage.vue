<template>
  <q-page padding>
    <div class="q-pa-sm">
      <h5 class="text-h6 q-mt-none q-mb-md text-center">CONTRÔLES APRÈS CONSIGNATION DU POSTE</h5>
      
      <q-table
        :rows="controles"
        :columns="columns"
        row-key="prestation"
        flat
        bordered
        :pagination="{ rowsPerPage: 0 }"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { QTableColumn } from 'quasar';

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
