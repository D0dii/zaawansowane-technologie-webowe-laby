<!-- src/App.vue -->
<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()
const layout = computed(() => {
  return route.meta.layout || MainLayout
})
</script>
