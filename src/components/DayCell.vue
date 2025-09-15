<template>
    <div class="day-cell-content" @click="handleDayClick">
      <div class="reminders">
        <div 
          v-for="reminder in reminders" 
          :key="reminder.id" 
          :style="{ backgroundColor: reminder.color }"
          class="reminder"
          @click.stop="editReminder(reminder)"
        >
          <span class="reminder-text">{{ reminder.time }} - {{ reminder.text }}</span>
          <button 
            class="delete-btn" 
            @click.stop="deleteReminder(reminder.id)"
            title="Delete reminder"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
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
      console.log('Reminder deleted')
    }
  }
  
  function handleDayClick() {
    // Si no hay recordatorios, abrir modal para crear uno
    if (reminders.value.length === 0) {
      openModal()
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
  }
  
  .reminders {
    flex: 1;
    overflow-y: auto;
    max-height: 60px;
  }
  
  .reminder {
    font-size: 10px;
    color: white;
    margin: 1px 0;
    padding: 2px 4px;
    border-radius: 3px;
    cursor: pointer;
    word-wrap: break-word;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 18px;
  }
  
  .reminder:hover {
    opacity: 0.8;
  }
  
  .reminder-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 9px;
  }
  
  .delete-btn {
    background-color: rgba(255, 0, 0, 0.8) !important;
    border: none !important;
    color: white !important;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    display: flex !important;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;
    z-index: 10;
  }
  
  .delete-btn:hover {
    background-color: rgba(255, 0, 0, 1);
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
    opacity: 0.7;
    transition: all 0.2s ease;
  }
  
  .add-reminder-btn:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  </style>
  