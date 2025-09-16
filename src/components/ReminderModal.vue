<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
        </div>
        
        <form @submit.prevent="save" class="modal-form" novalidate>
          <div v-if="errors.general" class="error-message error-general">
            {{ errors.general }}
          </div>

          <div class="form-group">
            <label for="text">
              Reminder:
              <span class="character-counter" :class="{ 'over-limit': characterCount > 30 }">
                {{ characterCount }}/30
              </span>
            </label>
            <input 
              id="text"
              v-model="text" 
              maxlength="30" 
              placeholder="What do you want to remember?" 
              required 
              :class="{ 'error': errors.text }"
              :disabled="isLoading"
            />
            <div v-if="errors.text" class="error-message">{{ errors.text }}</div>
          </div>

          <div class="form-group">
            <label for="time">Time:</label>
            <input 
              id="time"
              v-model="time" 
              type="time" 
              required 
              :class="{ 'error': errors.time }"
              :disabled="isLoading"
            />
            <div v-if="errors.time" class="error-message">{{ errors.time }}</div>
          </div>

          <div class="form-group">
            <label for="city">City:</label>
            <input 
              id="city"
              v-model="city" 
              placeholder="Enter city name" 
              required 
              :class="{ 'error': errors.city }"
              :disabled="isLoading"
            />
            <div v-if="errors.city" class="error-message">{{ errors.city }}</div>
          </div>

          <div class="form-group">
            <label for="color">Color:</label>
            <div class="color-input-wrapper">
              <input 
                id="color"
                v-model="color" 
                type="color" 
                :class="{ 'error': errors.color }"
                :disabled="isLoading"
              />
              <span class="color-preview" :style="{ backgroundColor: color }"></span>
            </div>
            <div v-if="errors.color" class="error-message">{{ errors.color }}</div>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="btn-cancel"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-save"
              :disabled="!isFormValid || isLoading"
              :class="{ 'loading': isLoading }"
            >
              <span v-if="isLoading">Saving...</span>
              <span v-else>{{ submitButtonText }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRemindersStore } from '../store/reminders'
import { useWeather } from '../composables/useWeather'
import { COLORS } from '../constants/colors'
import { formatDateToISO } from '../utils/date'
import type { Props, Emits } from '../types'


const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const store = useRemindersStore()
const { getWeatherWithCache } = useWeather()

const text = ref('')
const time = ref('')
const city = ref('')
const color = ref(COLORS.defaultReminderColor)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.editingReminder)
const modalTitle = computed(() => isEditing.value ? 'Edit Reminder' : 'New Reminder')
const submitButtonText = computed(() => isEditing.value ? 'Update' : 'Save')

const characterCount = computed(() => text.value.length)
const isTextValid = computed(() => {
  const trimmedText = text.value.trim()
  return trimmedText.length > 0 && trimmedText.length <= 30
})

const isFormValid = computed(() => {
  return isTextValid.value && 
         time.value.trim() && 
         city.value.trim() && 
         color.value &&
         Object.keys(errors.value).length === 0
})

function validateText(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Reminder text is required'
  if (trimmed.length > 30) return 'Reminder text must be 30 characters or less'
  return null
}

function validateTime(value: string): string | null {
  if (!value.trim()) return 'Time is required'
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(value)) return 'Invalid time format'
  return null
}

function validateCity(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'City is required'
  if (trimmed.length > 100) return 'City name is too long'
  return null
}

function validateColor(value: string): string | null {
  if (!value) return 'Color is required'
  const hexRegex = /^#[0-9A-Fa-f]{6}$/
  if (!hexRegex.test(value)) return 'Invalid color format'
  return null
}

watch(text, (value) => {
  const error = validateText(value)
  if (error) {
    errors.value.text = error
  } else {
    delete errors.value.text
  }
})

watch(time, (value) => {
  const error = validateTime(value)
  if (error) {
    errors.value.time = error
  } else {
    delete errors.value.time
  }
})

watch(city, (value) => {
  const error = validateCity(value)
  if (error) {
    errors.value.city = error
  } else {
    delete errors.value.city
  }
})

watch(color, (value) => {
  const error = validateColor(value)
  if (error) {
    errors.value.color = error
  } else {
    delete errors.value.color
  }
})

function initializeForm() {
  if (props.editingReminder) {
    text.value = props.editingReminder.text
    time.value = props.editingReminder.time
    city.value = props.editingReminder.city
    color.value = props.editingReminder.color as typeof COLORS.defaultReminderColor
  } else {
    resetForm()
  }
}

function resetForm() {
  text.value = ''
  time.value = ''
  city.value = ''
  color.value = COLORS.defaultReminderColor
  errors.value = {}
}

async function save() {
  if (!isFormValid.value || isLoading.value) return

  isLoading.value = true
  
  try {
    const textError = validateText(text.value)
    const timeError = validateTime(time.value)
    const cityError = validateCity(city.value)
    const colorError = validateColor(color.value)

    if (textError || timeError || cityError || colorError) {
      errors.value = {
        ...(textError && { text: textError }),
        ...(timeError && { time: timeError }),
        ...(cityError && { city: cityError }),
        ...(colorError && { color: colorError }),
      }
      return
    }

    const reminderData = {
      text: text.value.trim(),
      time: time.value,
      city: city.value.trim(),
      color: color.value,
    }

    let weather: string | undefined
    try {
      weather = await getWeatherWithCache(reminderData.city)
    } catch (error) {
      console.warn('Failed to fetch weather data:', error)
    }

    if (isEditing.value && props.editingReminder) {
      const shouldUpdateWeather = props.editingReminder.city !== reminderData.city
      
      const success = store.editReminder(props.editingReminder.id, {
        ...reminderData,
        ...(shouldUpdateWeather && weather && { weather })
      })

      if (!success) {
        throw new Error('Failed to update reminder')
      }
    } else {
      const dateString = formatDateToISO(props.day)
      
      store.addReminder({
        ...reminderData,
        date: dateString,
        ...(weather && { weather })
      })
    }

    resetForm()
    emit('close')

  } catch (error) {
    console.error('Error saving reminder:', error)
    
    if (error instanceof Error) {
      errors.value.general = error.message
    } else {
      errors.value.general = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  initializeForm()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.editingReminder, () => {
  initializeForm()
}, { deep: true })
</script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: v-bind('COLORS.backgroundOverlay');
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: v-bind('COLORS.backgroundPrimary');
    border-radius: 8px;
    box-shadow: v-bind('COLORS.shadowModal');
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    padding: 20px 20px 0;
    border-bottom: 1px solid v-bind('COLORS.borderLight');
    margin-bottom: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .modal-header h3 {
    margin: 0 0 20px 0;
    color: v-bind('COLORS.textPrimary');
    font-size: 1.5rem;
  }
  
  .modal-form {
    padding: 0 20px 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: v-bind('COLORS.textSecondary');
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid v-bind('COLORS.borderDefault');
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: v-bind('COLORS.secondary');
    box-shadow: v-bind('COLORS.shadowFocus');
  }
  
  .form-group input[type="color"] {
    width: 60px;
    height: 40px;
    padding: 0;
    cursor: pointer;
  }
  
  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .btn-cancel {
    background-color: v-bind('COLORS.buttonCancel');
    color: v-bind('COLORS.buttonCancelText');
  }
  
  .btn-cancel:hover {
    background-color: v-bind('COLORS.buttonCancelHover');
  }
  
  .btn-save {
    background-color: v-bind('COLORS.secondary');
    color: white;
  }
  
  .btn-save:hover:not(:disabled) {
    background-color: v-bind('COLORS.primaryDark');
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-save.loading {
    opacity: 0.8;
  }

  .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    color: v-bind('COLORS.error');
    font-size: 12px;
    margin-top: 4px;
    display: block;
  }

  .error-general {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid v-bind('COLORS.error');
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 16px;
  }

  .form-group input.error {
    border-color: v-bind('COLORS.error');
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
  }

  .character-counter {
    float: right;
    font-size: 12px;
    color: v-bind('COLORS.textMuted');
    font-weight: normal;
  }

  .character-counter.over-limit {
    color: v-bind('COLORS.error');
    font-weight: bold;
  }

  .color-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid v-bind('COLORS.borderDefault');
    flex-shrink: 0;
  }

  .form-group input[type="color"] {
    width: 60px;
    height: 40px;
    padding: 0;
    cursor: pointer;
    border: 1px solid v-bind('COLORS.borderDefault');
  }

  .form-group input[type="color"]:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .form-group input:focus:not(.error) {
    border-color: v-bind('COLORS.secondary');
    box-shadow: v-bind('COLORS.shadowFocus');
  }

  @media (max-width: 480px) {
    .modal {
      width: 95%;
      margin: 20px;
    }

    .modal-header h3 {
      font-size: 1.3rem;
    }

    .form-actions {
      flex-direction: column-reverse;
      gap: 8px;
    }

    .btn-cancel,
    .btn-save {
      width: 100%;
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn-cancel,
    .btn-save {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .modal {
      border: 2px solid;
    }

    .form-group input {
      border-width: 2px;
    }
  }
  </style>
  