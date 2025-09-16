<template>
    <div class="day-cell-content" @click="handleDayClick">
      <div class="reminders" :class="{ 'has-overflow': reminders.length > 3 }">
        <div 
          v-for="reminder in visibleReminders" 
          :key="reminder.id" 
          :style="{ backgroundColor: reminder.color }"
          class="reminder"
          @click.stop="editReminder(reminder)"
        >
          <div class="reminder-content">
            <span class="reminder-text">{{ reminder.time }} - {{ reminder.text }}</span>
            <span v-if="reminder.weather" class="weather-info">{{ reminder.weather }}</span>
          </div>
          <button 
            class="delete-btn" 
            @click.stop="deleteReminder(reminder.id)"
            title="Delete reminder"
            type="button"
          >
            ×
          </button>
        </div>
        <div v-if="reminders.length > 3" class="overflow-indicator">
          +{{ reminders.length - 3 }} more
        </div>
      </div>
          
      <button 
        v-if="reminders.length > 0" 
        @click.stop="deleteAllReminders" 
        class="delete-all-btn" 
        :title="`delete all ${reminders.length} reminders for this day`"
        type="button"
      >
        🗑
      </button>
      
      <ReminderModal 
        v-if="showModal" 
        :day="day" 
        :editing-reminder="editingReminder"
        @close="showModal = false" 
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRemindersStore } from '../store/reminders'
  import ReminderModal from './ReminderModal.vue'
  
  const props = defineProps<{ day: Date }>()
  const store = useRemindersStore()
  const showModal = ref(false)
  const editingReminder = ref(null)
  
  const reminders = computed(() =>
    store.remindersByDate(props.day.toISOString().split('T')[0])
  )
  
  const visibleReminders = computed(() => reminders.value.slice(0, 3))
  
  function openModal() {
    editingReminder.value = null
    showModal.value = true
  }
  
  function editReminder(reminder: any) {
    editingReminder.value = reminder
    showModal.value = true
  }
  
  function deleteReminder(id: string) {
    console.log('Trying to delete reminder with ID:', id)
    if (confirm('Are you sure you want to delete this reminder?')) {
      store.deleteReminder(id)
    }
  }
  
  function handleDayClick() {
    openModal()
  }
  
  function deleteAllReminders() {
    const dateString = props.day.toISOString().split('T')[0]
    const count = reminders.value.length
    
    if (confirm(`Are you sure you want to delete all ${count} reminders for this day?\n\nThis action cannot be undone.`)) {
      store.deleteAllRemindersForDate(dateString)
    } else {
    }
  }
  </script>
  
  <style scoped>
  .day-cell-content {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    padding: 2px;
    overflow: hidden;
  }
  
  .reminders {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .reminders.has-overflow {
    max-height: 55px;
  }
  
  .reminder {
    font-size: 10px;
    color: white;
    margin: 10px;
    padding: 3px 6px;
    border-radius: 4px;
    cursor: pointer;
    word-wrap: break-word;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .reminder:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  .reminder-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  
  .reminder-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 9px;
  }
  
  .weather-info {
    font-size: 8px;
    opacity: 0.9;
    font-style: italic;
    margin-top: 1px;
  }
  
  .delete-btn {
    background-color: rgba(255, 255, 255, 0.2) !important;
    border: none !important;
    color: white !important;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    display: flex !important;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;
    z-index: 10;
    opacity: 0.7;
  }
  
  .delete-btn:hover {
    background-color: rgba(255, 68, 68, 0.9) !important;
    opacity: 1;
    transform: scale(1.1);
  }
  
  .add-reminder-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border: none;
    background-color: #347ac1;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .add-reminder-btn:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  .overflow-indicator {
    font-size: 8px;
    color: #666;
    background-color: rgba(240, 240, 240, 0.9);
    padding: 2px 6px;
    border-radius: 8px;
    text-align: center;
    margin-top: 2px;
    font-style: italic;
    font-weight: 500;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .delete-all-btn {
    position: absolute;
    bottom: 30px;
    right: 2px;
    width: 16px;
    height: 16px;
    border: none;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 8px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: all 0.2s ease;
    z-index: 50;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .delete-all-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    background-color: rgba(255, 68, 68, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  </style>
  