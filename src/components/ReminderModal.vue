<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingReminder ? 'Edit Reminder' : 'New Reminder' }}</h3>
        </div>
        <form @submit.prevent="save" class="modal-form">
          <div class="form-group">
            <label for="text">Reminder:</label>
            <input 
              id="text"
              v-model="text" 
              maxlength="30" 
              placeholder="What do you want to remember?" 
              required 
            />
          </div>
          <div class="form-group">
            <label for="time">Time:</label>
            <input 
              id="time"
              v-model="time" 
              type="time" 
              required 
            />
          </div>
          <div class="form-group">
            <label for="city">City:</label>
            <input 
              id="city"
              v-model="city" 
              placeholder="City" 
              required 
            />
          </div>
          <div class="form-group">
            <label for="color">Color:</label>
            <input 
              id="color"
              v-model="color" 
              type="color" 
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-save">
              {{ editingReminder ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRemindersStore } from '../store/reminders'
  import { useWeather } from '../composables/useWeather'
  
  const props = defineProps<{ 
    day: Date
    editingReminder?: any
  }>()
  const emit = defineEmits<{ close: [] }>()
  const store = useRemindersStore()
  const { getWeatherWithCache } = useWeather()
  
  const text = ref('')
  const time = ref('')
  const city = ref('')
  const color = ref('#2196f3')
  
  // If we are editing, load the reminder data
  if (props.editingReminder) {
    text.value = props.editingReminder.text
    time.value = props.editingReminder.time
    city.value = props.editingReminder.city
    color.value = props.editingReminder.color
  }
  
  async function save() {
    const reminderData = {
      text: text.value,
      time: time.value,
      city: city.value,
      color: color.value,
    }
    
    const weather = await getWeatherWithCache(reminderData.city)
    
    if (props.editingReminder) {
      const shouldUpdateWeather = props.editingReminder.city !== reminderData.city
      
      store.editReminder(props.editingReminder.id, {
        ...reminderData,
        ...(shouldUpdateWeather && { weather })
      })
    } else {
      store.addReminder({
        ...reminderData,
        date: props.day.toISOString().split('T')[0],
        weather
      })
    }
    
    text.value = ''
    time.value = ''
    city.value = ''
    color.value = '#2196f3'
    emit('close')
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    padding: 20px 20px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .modal-header h3 {
    margin: 0 0 20px 0;
    color: #333;
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
    color: #555;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
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
    background-color: #f5f5f5;
    color: #666;
  }
  
  .btn-cancel:hover {
    background-color: #e0e0e0;
  }
  
  .btn-save {
    background-color: #2196f3;
    color: white;
  }
  
  .btn-save:hover {
    background-color: #1976d2;
  }
  </style>
  