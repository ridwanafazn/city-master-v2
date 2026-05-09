<template>
  <div class="max-w-6xl mx-auto p-4 md:p-8 min-h-screen">
    
    <header class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b-4 border-slate-900 pb-4">
      <div>
        <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Optimization <span class="text-blue-600">Dashboard</span>
        </h1>
      </div>
      <div class="mt-4 md:mt-0 font-mono font-bold bg-slate-900 text-green-400 px-4 py-2 border-3 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" title="Waktu eksekusi algoritma di server">
        API RESPONSE TIME: {{ store.processTime }}
      </div>
    </header>

    <div v-if="result" class="space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PixelCard title="PHYSICAL PROFILE">
          <div class="flex flex-col h-full justify-center items-center text-center py-4">
            <div class="text-6xl font-black tracking-tighter">{{ result.bmi.toFixed(1) }}</div>
            <div class="font-mono font-bold mt-4 px-3 py-1 border-3 border-slate-900 uppercase" :class="bmiColorClass(result.bmi_category)">
              {{ result.bmi_category }}
            </div>
          </div>
        </PixelCard>

        <PixelCard title="ENGINE DECISION" class="md:col-span-2">
          <div class="flex flex-col h-full justify-center">
            <div class="text-sm font-mono text-slate-500 uppercase mb-1">Selected Split Strategy</div>
            <div class="text-4xl font-black tracking-tight uppercase">{{ result.split_type.replace('+', ' + ') }}</div>
            <div class="mt-4 p-3 bg-slate-100 border-l-4 border-slate-900 font-mono text-sm text-slate-700 leading-relaxed">
              > Expert System (Experta) set rules based on {{ result.days.length }} available days.<br>
              > Genetic Algorithm (PyGAD) converged to minimize injury penalties.
            </div>
          </div>
        </PixelCard>
      </div>

      <PixelCard title="WEEKLY BLUEPRINT (CLICK TO VIEW SCHEDULE)">
        <div class="flex flex-wrap gap-4">
          <button 
            v-for="day in result.days" :key="'tab-'+day.day"
            @click="activeDayIndex = day.day"
            class="border-3 border-slate-900 p-3 flex flex-col items-start transition-all"
            :class="activeDayIndex === day.day ? 'bg-slate-900 text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'"
          >
            <span class="font-mono text-xs font-bold uppercase" :class="activeDayIndex === day.day ? 'text-slate-300' : 'text-slate-500'">
              DAY {{ day.day }}
            </span>
            <span class="font-black uppercase text-lg leading-tight mt-1">
              {{ day.day_focus }}
            </span>
          </button>
        </div>
      </PixelCard>

      <div class="space-y-4 pt-4" v-if="activeDayData">
        <h2 class="text-2xl font-black uppercase border-l-8 border-slate-900 pl-3">
          Daily Operations : Day {{ activeDayData?.day }}
        </h2>
        
        <PixelCard>
          <div class="overflow-x-auto">
            <table class="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr class="bg-slate-900 text-white">
                  <th class="p-3 border-3 border-slate-900">EXERCISE</th>
                  <th class="p-3 border-3 border-slate-900">TARGET</th>
                  <th class="p-3 border-3 border-slate-900">EQUIPMENT</th>
                  <th class="p-3 border-3 border-slate-900 w-24">PREVIEW</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ex, idx) in activeDayData?.exercises" :key="idx" class="hover:bg-blue-50 transition-colors">
                  <td class="p-3 border-3 border-slate-900 font-bold text-base">{{ ex.exercise_name.toUpperCase() }}</td>
                  <td class="p-3 border-3 border-slate-900"><span class="bg-slate-200 px-2 py-1 text-xs border-2 border-slate-900">{{ ex.body_part.toUpperCase() }}</span></td>
                  <td class="p-3 border-3 border-slate-900">
                    <div class="flex flex-wrap gap-2">
                      <span v-for="eq in ex.equipment" :key="eq" class="border-2 border-slate-900 bg-white px-2 py-1 text-xs">{{ eq.toUpperCase() }}</span>
                    </div>
                  </td>
                  <td class="p-3 border-3 border-slate-900 text-center">
                    <img v-if="ex.exercise_image" :src="ex.exercise_image" class="w-16 h-16 object-cover border-2 border-slate-900 bg-white inline-block" loading="lazy">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PixelCard>
      </div>

      <div class="pt-8 flex justify-center pb-12">
        <PixelButton @click="recalibrate" class="px-8 py-3 text-lg">< RECALIBRATE ENGINE</PixelButton>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFitnessStore } from '../stores/fitnessStore'
import PixelCard from '../components/ui/PixelCard.vue'
import PixelButton from '../components/ui/PixelButton.vue'

const router = useRouter()
const store = useFitnessStore()
const result = computed(() => store.recommendationResult)

// State untuk menyimpan ID hari mana yang sedang diklik/dilihat
const activeDayIndex = ref(1)

// Computed untuk mengambil data exercises hanya pada hari yang aktif
const activeDayData = computed(() => {
  if (!result.value) return null
  return result.value.days.find(d => d.day === activeDayIndex.value)
})

// Jika result baru masuk, otomatis reset view ke Day 1
watch(result, (newVal) => {
  if (newVal && newVal.days.length > 0) {
    activeDayIndex.value = newVal.days[0].day
  }
})

const bmiColorClass = (category: string) => {
  const cat = category.toLowerCase()
  if (cat.includes('underweight')) return 'bg-yellow-300 text-yellow-900'
  if (cat.includes('normal')) return 'bg-green-400 text-green-900'
  if (cat.includes('overweight')) return 'bg-orange-400 text-orange-900'
  return 'bg-red-500 text-white'
}

const recalibrate = () => router.push('/')

onMounted(() => {
  if (!result.value) router.push('/')
  else if (result.value.days.length > 0) activeDayIndex.value = result.value.days[0].day
})
</script>

<style scoped>
table { border: 3px solid #0f172a; }
</style>