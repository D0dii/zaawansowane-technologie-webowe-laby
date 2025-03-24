<template>
  <div class="relative w-full text-white bg-primary-foreground">
    <div
      @click="toggleDropdown"
      class="flex flex-wrap items-center gap-1 border rounded-md p-2 cursor-pointer min-h-[40px]"
    >
      <!-- Selected Items -->
      <template v-if="selectedOptions.length">
        <span
          v-for="option in selectedOptions"
          :key="option.value"
          class="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
        >
          {{ option.label }}
        </span>
      </template>
      <span v-else class="text-muted-foreground">{{ placeholder }}</span>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isDropdownOpen"
      class="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <!-- Search Input -->
      <input
        v-model="searchTerm"
        placeholder="Search..."
        class="w-full p-2 border-b bg-primary-foreground"
      />

      <!-- Options List -->
      <ul class="py-1 bg-primary-foreground">
        <li
          v-for="option in filteredOptions"
          :key="option.value"
          @click="toggleOption(option)"
          class="px-3 py-2 cursor-pointer flex items-center bg-primary-foreground z-50"
        >
          <input type="checkbox" :checked="isSelected(option)" class="mr-2" />
          {{ option.label }}
        </li>
        <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-muted-foreground">
          No options found
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Option {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    options: Option[]
    modelValue?: string[]
    placeholder?: string
  }>(),
  {
    modelValue: () => [],
    placeholder: 'Select options',
  },
)

const emit = defineEmits(['update:modelValue'])

const isDropdownOpen = ref(false)
const searchTerm = ref('')

const selectedOptions = computed(() =>
  props.options.filter((option) => props.modelValue.includes(option.value)),
)

const filteredOptions = computed(() =>
  props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      !props.modelValue.includes(option.value),
  ),
)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleOption = (option: Option) => {
  const currentValues = [...props.modelValue]
  const index = currentValues.indexOf(option.value)

  if (index > -1) {
    // Remove if already selected
    currentValues.splice(index, 1)
  } else {
    // Add if not selected
    currentValues.push(option.value)
  }

  emit('update:modelValue', currentValues)
}

const isSelected = (option: Option) => {
  return props.modelValue.includes(option.value)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown) {
    isDropdownOpen.value = false
  }
}

watch(isDropdownOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
