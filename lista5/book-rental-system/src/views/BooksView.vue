<template>
  <div>
    <h2>Book List</h2>

    <!-- Formularz do dodawania nowej książki -->
    <div>
      <h3>Add New Book</h3>
      <input v-model="newBook.title" placeholder="Title" />
      <input v-model="newBook.author" placeholder="Author" />
      <button @click="createBook">Create Book</button>
    </div>

    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.id">
          <td>{{ book.id }}</td>
          <td v-if="!book.isEditing">{{ book.title }}</td>
          <td v-if="book.isEditing"><input v-model="book.title" /></td>

          <td v-if="!book.isEditing">{{ book.authors.join(' ') }}</td>
          <td v-if="book.isEditing"><input v-model="book.author" /></td>

          <td>
            <button v-if="!book.isEditing" @click="editBook(book)">Edit</button>
            <button v-if="book.isEditing" @click="saveBook(book)">Save</button>
            <button @click="deleteBook(book.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const books = ref([])
    const newBook = ref({ title: '', author: '' })

    const fetchBooks = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/books')
        books.value = await response.json()
        books.value.forEach((book) => (book.isEditing = false))
      } catch (error) {
        console.error('Error fetching books:', error)
      }
    }

    const createBook = async () => {
      if (!newBook.value.title || !newBook.value.author) return

      try {
        const response = await fetch('https://api.example.com/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBook.value),
        })
        const createdBook = await response.json()
        books.value.push({ ...createdBook, isEditing: false })

        newBook.value = { title: '', author: '' } // Resetowanie formularza
      } catch (error) {
        console.error('Error creating book:', error)
      }
    }

    const editBook = (book) => {
      book.isEditing = true
    }

    const saveBook = async (book) => {
      try {
        await fetch(`https://api.example.com/books/${book.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: book.title, author: book.author }),
        })
        book.isEditing = false
      } catch (error) {
        console.error('Error saving book:', error)
      }
    }

    const deleteBook = async (id) => {
      try {
        await fetch(`https://api.example.com/books/${id}`, { method: 'DELETE' })
        books.value = books.value.filter((book) => book.id !== id)
      } catch (error) {
        console.error('Error deleting book:', error)
      }
    }

    onMounted(fetchBooks)

    return { books, newBook, createBook, editBook, saveBook, deleteBook }
  },
}
</script>
