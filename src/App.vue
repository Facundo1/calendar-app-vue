<script setup lang="ts">
import Calendar from './components/Calendar.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>REMINDERS APP</h1>
    </header>
    <main class="app-main">
      <Calendar />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  margin-bottom: 20px;
}

.app-header h1 {
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: 300;
}

.app-main {
  padding: 0 20px;
}
</style>
