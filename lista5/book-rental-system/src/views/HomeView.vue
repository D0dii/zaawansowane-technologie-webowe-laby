<!-- src/views/HomeView.vue -->
<template>
  <div class="home-page">
    <h1>Welcome to Book App!</h1>
    <p>Proszę przejść do <RouterLink to="/books">książek</RouterLink></p>
  </div>
</template>

<style scoped>
.home-page {
  text-align: center;
  padding: 2rem;
}
</style>
