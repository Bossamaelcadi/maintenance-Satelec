<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="flex items-center">
          <img src="/satelec-logo.svg" style="height: 30px; margin-right: 10px;" alt="Satelec Logo" />
          Maintenance Satelec
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Menu
        </q-item-label>

        <EssentialLink
          v-bind="{
            title: 'Transformateur',
            caption: 'Outil de transformation',
            icon: 'transform',
            link: { name: 'transformateur' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'POSTE HT/BT',
            caption: 'Contrôle du poste',
            icon: 'electrical_services',
            link: { name: 'poste-htbt' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'TGBT',
            caption: 'Tableau Général Basse Tension',
            icon: 'power',
            link: { name: 'tgbt' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'TD',
            caption: 'Tableau de distribution',
            icon: 'power',
            link: { name: 'td' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'Borne de recharge',
            caption: 'Contrôle de la borne',
            icon: 'power',
            link: { name: 'borne-de-recharge' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'Borne IRVE',
            caption: 'Contrôle de la borne',
            icon: 'power',
            link: { name: 'borne-irve' }
          }"
        />
        <EssentialLink
          v-bind="{
            title: 'Historique PDF',
            caption: 'Historique des rapports générés',
            icon: 'history',
            link: { name: 'historique-pdf' }
          }"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
