<template>
    <div class="calendar">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-button">&lt;</button>
        <h2>{{ monthName }} {{ year }}</h2>
        <button @click="nextMonth" class="nav-button">&gt;</button>
      </div>
      
      <div class="calendar-grid">
        <div class="weekday-header">
          <div v-for="dayName in weekDays" :key="dayName" class="weekday-cell">
            {{ dayName }}
          </div>
        </div>
        
        <div class="days-grid">
          <div 
            v-for="dayData in calendarDays" 
            :key="dayData.date.toISOString()" 
            class="day-cell"
            :class="{
              'other-month': !dayData.isCurrentMonth,
              'today': dayData.isToday,
              'weekend': dayData.isWeekend && dayData.isCurrentMonth
            }"
          >
            <div class="day-number">{{ dayData.date.getDate() }}</div>
            <div class="day-content">
              <DayCell 
                v-if="dayData.isCurrentMonth" 
                :day="dayData.date" 
                :is-weekend="dayData.isWeekend"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCurrentMonthDays, getMonthName, getWeekDays } from '../utils/date'
import { COLORS } from '../constants/colors'
import DayCell from './DayCell.vue'

const currentDate = ref(new Date())
const currentMonth = ref(currentDate.value.getMonth())
const currentYear = ref(currentDate.value.getFullYear())

const monthName = computed(() => getMonthName(currentMonth.value))
const weekDays = computed(() => getWeekDays())
const calendarDays = computed(() => getCurrentMonthDays(currentYear.value, currentMonth.value))

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
  </script>
  
  <style scoped>
  .calendar {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .calendar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: v-bind('COLORS.textPrimary');
  }
  
  .nav-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    color: v-bind('COLORS.textMuted');
    transition: background-color 0.2s;
  }
  
  .nav-button:hover {
    background-color: v-bind('COLORS.backgroundHover');
  }
  
  
  .calendar-grid {
    border: 1px solid v-bind('COLORS.borderDefault');
    border-radius: 8px;
    overflow: hidden;
    box-shadow: v-bind('COLORS.shadowStrong');
  }
  
  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: v-bind('COLORS.primary');
  }
  
  .weekday-cell {
    padding: 6px 8px;
    text-align: center;
    font-weight: bold;
    color: white;
    font-size: 14px;
    border-right: 1px solid v-bind('COLORS.borderTransparent');
  }
  
  .weekday-cell:last-child {
    border-right: none;
  }
  
  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(100px, auto);
    background-color: v-bind('COLORS.backgroundPrimary');
  }
  
  .day-cell {
    min-height: 100px;
    border-right: 1px solid v-bind('COLORS.borderDefault');
    border-bottom: 1px solid v-bind('COLORS.borderDefault');
    position: relative;
    background-color: v-bind('COLORS.backgroundPrimary');
  }
  
  .day-cell:not(.other-month) {
    cursor: pointer;
  }
  
  .day-cell:not(.other-month):hover {
    background-color: v-bind('COLORS.backgroundHover');
  }
  
  .day-cell:nth-child(7n) {
    border-right: none;
  }
  
  .day-cell:last-child {
    border-bottom: none;
  }
  
  .day-number {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 14px;
    font-weight: bold;
    color: v-bind('COLORS.textPrimary');
  }
  
  .day-content {
    padding: 24px 8px 8px 8px;
    height: 100%;
  }
  
  .day-cell.weekend .day-number {
    color: v-bind('COLORS.primary');
  }
  
  .day-cell.other-month .day-number {
    color: v-bind('COLORS.textDisabled');
    font-weight: normal;
  }
  
  .day-cell.other-month {
    background-color: v-bind('COLORS.backgroundMuted');
    pointer-events: none;
  }
  
  .day-cell.other-month .day-content {
    pointer-events: none;
  }
  
  
  .day-cell.today .day-number {
    background-color: v-bind('COLORS.primary');
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  </style>
  