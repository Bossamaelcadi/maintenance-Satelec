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

        <q-toolbar-title>
          Transformateur
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
