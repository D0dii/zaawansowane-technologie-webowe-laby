<template>
  <div class="books-view">
    <h1>Books</h1>
    <ul>
      <li v-for="book in books" :key="book.id">{{ book.title }} by {{ book.author }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BooksView',
  data() {
    return {
      books: [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
        { id: 2, title: '1984', author: 'George Orwell' },
        { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
      ],
    }
  },
}
</script>

<style scoped>
.books-view {
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
</style>
