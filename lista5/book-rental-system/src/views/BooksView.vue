<template>
  <div class="container mx-auto py-8 px-4">
    <h2 class="text-3xl font-bold mb-6">Book List</h2>

    <!-- Add New Book Card -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Add New Book</CardTitle>
        <CardDescription
          >Enter the details of the book you want to add to your collection.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <form @submit.prevent="createBook" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="title">Title</Label>
              <Input id="title" v-model="newBook.title" placeholder="Enter book title" />
            </div>
            <div class="space-y-2">
              <Label for="isbn">ISBN</Label>
              <Input id="isbn" v-model="newBook.isbn" placeholder="Enter ISBN" />
            </div>
            <div class="space-y-2">
              <Label for="publicationYear">Publication Year</Label>
              <Input
                id="publicationYear"
                v-model="newBook.publicationYear"
                type="number"
                placeholder="Enter publication year"
              />
            </div>
            <div class="space-y-2">
              <Label for="authors">Authors</Label>
              <MultiSelectCombobox
                :options="availableAuthors"
                v-model="newBook.authorIds"
                placeholder="Select authors"
              />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="newBook.description"
                placeholder="Enter book description"
                rows="3"
              />
            </div>
          </div>
          <Button type="submit" class="w-full sm:w-auto">Add Book</Button>
        </form>
      </CardContent>
    </Card>

    <!-- Books Table -->
    <Card>
      <CardHeader>
        <CardTitle>Books Collection</CardTitle>
        <CardDescription>Manage your book collection with ease.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableCaption>List of Books</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[15%]">Title</TableHead>
                <TableHead class="w-[15%]">Description</TableHead>
                <TableHead class="w-[10%]">ISBN</TableHead>
                <TableHead class="w-[10%]">Year</TableHead>
                <TableHead class="w-[10%]">IsRented</TableHead>
                <TableHead class="w-[20%]">Authors</TableHead>
                <TableHead class="text-right w-[20%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="book in paginatedBooks" :key="book.id">
                <TableCell>
                  <Input v-if="book.isEditing" v-model="book.title" class="w-full" />
                  <span v-else>{{ book.title }}</span>
                </TableCell>
                <TableCell>
                  <Textarea v-if="book.isEditing" v-model="book.description" class="w-full h-20" />
                  <span v-else class="truncate block max-w-xs">{{ book.description }}</span>
                </TableCell>
                <TableCell>
                  <Input v-if="book.isEditing" v-model="book.isbn" class="w-full" />
                  <span v-else>{{ book.isbn }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-if="book.isEditing"
                    v-model="book.publicationYear"
                    type="number"
                    class="w-full"
                  />
                  <span v-else>{{ book.publicationYear }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-if="book.isEditing"
                    :checked="book.isRented"
                    @change="book.isRented = $event.target.checked"
                    type="checkbox"
                    class="w-4 h-4"
                  />
                  <span v-else>{{ book.isRented ? 'Rented' : 'Available' }}</span>
                </TableCell>
                <TableCell>
                  <div v-if="book.isEditing" class="space-y-2">
                    <MultiSelectCombobox
                      :options="availableAuthors"
                      v-model="book.authorIds"
                      placeholder="Select authors"
                    />
                  </div>
                  <span v-else>{{
                    book.authors
                      ?.map((author: Author) => `${author.firstName} ${author.lastName}`)
                      .join(', ')
                  }}</span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="book.isEditing"
                      variant="outline"
                      size="sm"
                      @click="saveBook(book)"
                    >
                      Save
                    </Button>
                    <Button v-else variant="outline" size="sm" @click="editBook(book)">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" @click="confirmDelete(book)">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="paginatedBooks.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  No books found. Add your first book above.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-center items-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
          >
            Previous
          </Button>
          <div class="flex space-x-1">
            <Button
              v-for="page in totalPages"
              :key="page"
              variant="outline"
              size="sm"
              :class="{ 'bg-primary text-primary-foreground': currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the book "{{
              bookToDelete?.title
            }}" from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deleteBook(bookToDelete?.id!)"> Delete </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import MultiSelectCombobox from '@/components/multi-select-combobox.vue'

import type { Ref } from 'vue'

interface Author {
  id: string
  firstName: string
  lastName: string
}

interface Book {
  id: string
  title: string
  description: string
  isbn: string
  publicationYear: string | number | undefined
  isRented: boolean
  authors: Author[]
  authorIds?: string[]
  isEditing: boolean
}

const books = ref<Book[]>([])
const availableAuthors = ref<Array<{ value: string; label: string }>>([])
const newBook = ref({
  title: '',
  description: '',
  isbn: '',
  publicationYear: undefined,
  isRented: false,
  authorIds: [] as string[],
})

const showDeleteDialog = ref(false)
const bookToDelete: Ref<Book | null> = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5

// Computed property for paginated books
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return books.value.slice(start, end)
})

// Computed property for total pages
const totalPages = computed(() => Math.ceil(books.value.length / itemsPerPage))

const fetchAuthors = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/author', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    const authors = await response.json()
    availableAuthors.value = authors.map((author: Author) => ({
      value: author.id,
      label: `${author.firstName} ${author.lastName}`,
    }))
  } catch (error) {
    console.error('Error fetching authors:', error)
  }
}

const fetchBooks = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/books', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    books.value = await response.json()
    books.value.forEach((book) => {
      book.isEditing = false
      book.authorIds = book.authors.map((author) => author.id)
    })

    // Reset current page if total pages reduced
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
  } catch (error) {
    console.error('Error fetching books:', error)
  }
}

const createBook = async () => {
  if (!newBook.value.title || !newBook.value.isbn) return

  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook.value),
    })
    const createdBook = await response.json()

    // Add authors to the book
    for (const authorId of newBook.value.authorIds) {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/books/${createdBook.id}/author/${authorId}`,
        {
          method: 'POST',
        },
      )
    }

    await Promise.all([fetchBooks(), fetchAuthors()])

    newBook.value = {
      title: '',
      description: '',
      isbn: '',
      publicationYear: undefined,
      isRented: false,
      authorIds: [],
    }
  } catch (error) {
    console.error('Error creating book:', error)
  }
}

const editBook = (book: Book) => {
  book.isEditing = true
}

const saveBook = async (book: Book) => {
  try {
    // Update book details
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        isRented: book.isRented,
      }),
    })

    // Add new authors
    for (const authorId of book.authorIds || []) {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/books/${book.id}/author/${authorId}`, {
        method: 'POST',
      })
    }

    await Promise.all([fetchBooks(), fetchAuthors()])
    book.isEditing = false
  } catch (error) {
    console.error('Error saving book:', error)
  }
}

const confirmDelete = (book: Book) => {
  bookToDelete.value = book
  showDeleteDialog.value = true
}

const deleteBook = async (id: string) => {
  if (!id) return
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/books/${id}`, {
      method: 'DELETE',
    })
    if (response.statusText !== 'OK') {
      const data = await response.json()
      alert(data.message)
      return
    }
    await Promise.all([fetchBooks(), fetchAuthors()])
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Error deleting book:', error)
  }
}

onMounted(() => {
  fetchBooks()
  fetchAuthors()
})
</script>
