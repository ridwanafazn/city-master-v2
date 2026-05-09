<template>
  <div class="max-w-6xl mx-auto p-4 md:p-8 min-h-screen">
    
    <header class="mb-8 border-b-4 border-slate-900 pb-4">
      <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter">
        Engine <span class="text-blue-600">Parameters</span>
      </h1>
      <p class="text-slate-600 mt-2 font-mono text-sm">
        [SYS_MSG]: Initialize user biometrics and algorithmic constraints before optimization.
      </p>
    </header>

    <form @submit.prevent="startEngine" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div class="space-y-6">
          <PixelCard title="1. BIOMETRICS">
            <template #action>
              <span class="px-2 py-1 text-xs font-bold border-2 border-slate-900" :class="bmiCategory.class">
                BMI: {{ store.currentBmi.toFixed(1) }} ({{ bmiCategory.label }})
              </span>
            </template>
            
            <div class="space-y-4 font-mono text-sm">
              <div class="flex flex-col">
                <label class="font-bold mb-1 uppercase">Gender (Priority Gen)</label>
                <select v-model="store.userProfile.gender" class="pixel-input">
                  <option value="male">Male (Upper Focus Default)</option>
                  <option value="female">Female (Lower Focus Default)</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label class="font-bold mb-1 uppercase">Height (cm)</label>
                  <input type="number" v-model.number="store.userProfile.height_cm" min="100" max="250" step="0.5" required class="pixel-input">
                </div>
                <div class="flex flex-col">
                  <label class="font-bold mb-1 uppercase">Weight (kg)</label>
                  <input type="number" v-model.number="store.userProfile.weight_kg" min="30" max="200" step="0.5" required class="pixel-input">
                </div>
              </div>

              <div class="flex flex-col pt-2">
                <label class="font-bold mb-1 uppercase">Available Days / Week</label>
                <input type="range" v-model.number="store.userProfile.available_days" min="1" max="5" class="w-full accent-slate-900">
                <div class="text-right font-bold mt-1 text-blue-600">
                  {{ store.userProfile.available_days }} Days
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        <div class="space-y-6">
          <PixelCard title="2. CONSTRAINTS">
            <div class="space-y-6 font-mono text-sm">
              
              <div class="flex flex-col">
                <label class="font-bold mb-1 uppercase text-red-600">Injury Constraints</label>
                <p class="text-xs text-slate-500 mb-2">Klik untuk memilih (hindari area ini)</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="bp in BODY_PARTS" :key="'inj-'+bp" type="button"
                    @click="toggleSelection(store.userProfile.injuries, bp)"
                    class="border-2 border-slate-900 px-2 py-1 text-xs font-bold uppercase transition-all"
                    :class="store.userProfile.injuries.includes(bp.toLowerCase()) ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'bg-white text-slate-600 hover:bg-slate-100'"
                  >
                    {{ bp }}
                  </button>
                </div>
              </div>

              <div class="flex flex-col">
                <label class="font-bold mb-1 uppercase text-blue-600">Target Focus</label>
                <p class="text-xs text-slate-500 mb-2">Klik untuk memprioritaskan area ini</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="bp in BODY_PARTS" :key="'foc-'+bp" type="button"
                    @click="toggleSelection(store.userProfile.preferred_body_part, bp)"
                    class="border-2 border-slate-900 px-2 py-1 text-xs font-bold uppercase transition-all"
                    :class="store.userProfile.preferred_body_part.includes(bp.toLowerCase()) ? 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'bg-white text-slate-600 hover:bg-slate-100'"
                  >
                    {{ bp }}
                  </button>
                </div>
              </div>

              <div class="flex flex-col">
                <label class="font-bold mb-1 uppercase">Equipment Available</label>
                <div class="flex flex-wrap gap-2 mt-1">
                  <button 
                    v-for="eq in EQUIPMENTS" :key="'eq-'+eq" type="button"
                    @click="toggleSelection(store.userProfile.preferred_equipment, eq)"
                    class="border-2 border-slate-900 px-2 py-1 text-xs font-bold uppercase transition-all"
                    :class="store.userProfile.preferred_equipment.includes(eq.toLowerCase()) ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'bg-white text-slate-600 hover:bg-slate-100'"
                  >
                    {{ eq }}
                  </button>
                </div>
              </div>

            </div>
          </PixelCard>
        </div>
      </div>

      <div class="flex items-center justify-between mt-8 border-t-4 border-slate-900 pt-6">
        <div class="font-mono text-sm hidden md:block"><strong>Status:</strong> Awaiting Initialization...</div>
        <PixelButton type="submit" class="px-8 py-3 text-lg w-full md:w-auto">INITIALIZE OPTIMIZATION ></PixelButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFitnessStore } from '../stores/fitnessStore'
import PixelCard from '../components/ui/PixelCard.vue'
import PixelButton from '../components/ui/PixelButton.vue'

const router = useRouter()
const store = useFitnessStore()

const BODY_PARTS = ["Neck", "Shoulders", "Chest", "Back", "Abs", "Biceps", "Triceps", "Forearms", "Glutes", "Quadriceps", "Hamstrings", "Calves", "Cardio"]
const EQUIPMENTS = ["dumbbell", "barbell", "body weight", "cable", "smith machine", "leverage machine", "weighted", "kettlebell", "treadmill", "chest press machine", "exercise bike", "trap bar", "wheel roller", "ez barbell", "sled machine", "rope", "elliptical machine"]

const bmiCategory = computed(() => {
  const bmi = store.currentBmi
  if (bmi < 18.5) return { label: 'Underweight', class: 'bg-yellow-200 text-yellow-900' }
  if (bmi < 25) return { label: 'Normal', class: 'bg-green-200 text-green-900' }
  if (bmi < 30) return { label: 'Overweight', class: 'bg-orange-200 text-orange-900' }
  return { label: 'Obese', class: 'bg-red-200 text-red-900' }
})

// Fungsi untuk menggantikan select multiple
const toggleSelection = (array: string[], item: string) => {
  const val = item.toLowerCase()
  const index = array.indexOf(val)
  if (index > -1) array.splice(index, 1) // Hapus jika sudah ada (Undo)
  else array.push(val) // Tambah jika belum ada
}

const startEngine = () => {
  router.push('/process')
  store.generateWeeklySchedule()
}
</script>

<style scoped>
.pixel-input {
  @apply border-3 border-slate-900 p-2 bg-white focus:outline-none focus:ring-0 focus:bg-blue-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)];
}
</style>