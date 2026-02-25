<template>
  <div v-if="needRefresh" class="fixed bottom-4 right-4 p-4 bg-zinc-800 text-white rounded-lg shadow-lg border border-zinc-700 z-50 flex flex-col gap-3">
    <p class="text-sm font-medium">A new version of CostNotes is available!</p>
    <div class="flex gap-2">
      <button 
        @click="updateSW()" 
        class="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
        Refresh App
      </button>
      <button 
        @click="closePrompt" 
        class="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
        Later
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const closePrompt = () => {
  needRefresh.value = false
}

const updateSW = () => {
  updateServiceWorker()
}
</script>
