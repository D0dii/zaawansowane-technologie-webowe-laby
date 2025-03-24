<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <header>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/books">Books</RouterLink>
        <RouterLink to="/authors">Authors</RouterLink>
        <!-- Inne linki nawigacyjne -->
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer>
      <p>&copy; 2025 Book Catalog App</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// TypeScript jest włączony dzięki atrybutowi lang="ts"
</script>

<style scoped>
/* Stylizacja layoutu */
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  padding: 1rem;
  background-color: #f5f5f5;
}

nav {
  display: flex;
  gap: 1rem;
}

main {
  flex: 1;
  padding: 1rem;
}

footer {
  padding: 1rem;
  background-color: #f5f5f5;
  text-align: center;
}
</style>
