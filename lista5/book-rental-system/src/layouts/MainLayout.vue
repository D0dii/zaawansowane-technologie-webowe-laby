<!-- src/layouts/MainLayout.vue -->
<template>
  <div>
    <header>
      <nav class="flex justify-end gap-4 p-4 font-semibold bg-primary-foreground bg-opacity-10">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/books">Books</RouterLink>
        <RouterLink to="/authors">Authors</RouterLink>
        <RouterLink to="/readers">Readers</RouterLink>
        <RouterLink to="/rentals">Rentals</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="text-center bg-primary-foreground bg-opacity-10 p-4">
      <p>&copy; 2025 Book Catalog App</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// TypeScript jest włączony dzięki atrybutowi lang="ts"
</script>
