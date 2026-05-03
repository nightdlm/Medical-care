<script setup>
</script>

<template>
  <nav class="nav-bar">
    <router-link to="/" class="nav-link">🏥 AI问诊</router-link>
    <router-link to="/history" class="nav-link">📋 历史记录</router-link>
  </nav>
  
  <router-view />
</template>

<style>
.nav-bar {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  justify-content: center;
}

.nav-link {
  padding: 10px 20px;
  text-decoration: none;
  color: #666;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 600;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #667eea;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
