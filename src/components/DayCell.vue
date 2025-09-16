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
        <div v-if="reminders.length > 3" class="overflow-indicator">
          +{{ reminders.length - 3 }} more
        </div>
      </div>
          
      <button 
        v-if="reminders.length > 0" 
        @click.stop="deleteAllReminders" 
        class="delete-all-btn" 
        :title="`delete all reminders for this day`"
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
  }
  
  .reminders {
    flex: 1;
    overflow-y: auto;
    max-height: 60px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  
  .reminders.has-overflow {
    max-height: 50px;
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
    background-color: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    text-align: center;
    margin-top: 2px;
    font-style: italic;
  }
  
  .delete-all-btn {
    position: absolute;
    bottom: 6px;
    left: 6px;
    width: 22px;
    height: 22px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background-color: rgba(255, 68, 68, 0.9);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 11px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: all 0.2s ease;
    z-index: 50;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .delete-all-btn:hover {
    opacity: 1;
    transform: scale(1.05);
    background-color: rgba(255, 68, 68, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  </style>
  