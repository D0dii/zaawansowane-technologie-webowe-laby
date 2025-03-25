<template>
  <div class="container mx-auto py-8 px-4">
    <h2 class="text-3xl font-bold mb-6">Book Rentals</h2>

    <!-- Add New Rental Card -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Add New Rental</CardTitle>
        <CardDescription>Create a new book rental entry.</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="createRental" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="bookId">Book</Label>
              <Select v-model="newRental.bookId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="book in books" :key="book.id" :value="book.id">
                    {{ book.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="readerId">Reader</Label>
              <Select v-model="newRental.readerId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a reader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="reader in readers" :key="reader.id" :value="reader.id">
                    {{ reader.firstName }} {{ reader.lastName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" v-model="newRental.dueDate" />
            </div>
          </div>
          <Button type="submit" class="w-full sm:w-auto">Add Rental</Button>
        </form>
      </CardContent>
    </Card>

    <!-- Rentals Table -->
    <Card>
      <CardHeader>
        <CardTitle>Rental Collection</CardTitle>
        <CardDescription>Manage your book rentals.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableCaption>List of Book Rentals</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Reader</TableHead>
                <TableHead>Rental Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="rental in paginatedRentals" :key="rental.id">
                <TableCell>
                  <span>{{ rental.book.title }}</span>
                </TableCell>
                <TableCell>
                  <span>{{ rental.reader.firstName + ' ' + rental.reader.lastName }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-if="rental.isEditing"
                    type="date"
                    v-model="rental.rentalDate"
                    class="w-full"
                  />
                  <span v-else>{{ formatDate(rental.rentalDate) }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-if="rental.isEditing"
                    type="date"
                    v-model="rental.dueDate"
                    class="w-full"
                  />
                  <span v-else>{{ formatDate(rental.dueDate) }}</span>
                </TableCell>
                <TableCell>
                  <span>{{ rental.status }}</span>
                </TableCell>
                <TableCell class="text-right">
                  <Button @click="returnBook(rental)" v-if="rental.status !== 'zwrócona'"
                    >Return book</Button
                  >
                </TableCell>
                <!-- <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="rental.isEditing"
                      variant="outline"
                      size="sm"
                      @click="saveRental(rental)"
                    >
                      Save
                    </Button>
                    <Button v-else variant="outline" size="sm" @click="editRental(rental)">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" @click="confirmDelete(rental)">
                      Delete
                    </Button>
                  </div>
                </TableCell> -->
              </TableRow>
              <TableRow v-if="rentals.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  No rentals found. Add your first rental above.
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
            This action cannot be undone. This will permanently delete the rental for "{{
              rentalToDelete?.book.title
            }}" rented by "{{
              rentalToDelete?.reader.firstName + ' ' + rentalToDelete?.reader.lastName
            }}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deleteRental(rentalToDelete?.id!!)">
            Delete
          </AlertDialogAction>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { Ref } from 'vue'

// Interfaces for type safety
interface Rental {
  id: string
  bookId: string
  readerId: string
  rentalDate: string
  dueDate: string
  isEditing: boolean
  status: string
  book: Book
  reader: Reader
}

interface Author {
  id: string
  firstName: string
  lastName: string
}

interface Book {
  id: string
  title: string
  author: Author
}

interface Reader {
  id: string
  firstName: string
  lastName: string
}

// Reactive state variables
const rentals = ref<Rental[]>([])
const books = ref<Book[]>([])
const readers = ref<Reader[]>([])
const newRental = ref({
  bookId: '',
  readerId: '',
  dueDate: '',
})
const showDeleteDialog = ref(false)
const rentalToDelete: Ref<Rental | null> = ref(null)

const currentPage = ref(1)
const itemsPerPage = 5

// Computed property for paginated books
const paginatedRentals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return rentals.value.slice(start, end)
})

// Computed property for total pages
const totalPages = computed(() => Math.ceil(rentals.value.length / itemsPerPage))

// Fetch functions
const fetchRentals = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/rentals')
    rentals.value = await response.json()
    rentals.value.forEach((rental) => (rental.isEditing = false))
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
  } catch (error) {
    console.error('Error fetching rentals:', error)
  }
}

const fetchBooks = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/books')
    books.value = await response.json()
  } catch (error) {
    console.error('Error fetching books:', error)
  }
}

const fetchReaders = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/readers')
    readers.value = await response.json()
  } catch (error) {
    console.error('Error fetching readers:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// CRUD Operations
const createRental = async () => {
  if (!newRental.value.bookId || !newRental.value.readerId || !newRental.value.dueDate) return

  try {
    const rentalData = {
      ...newRental.value,
      dueDate: new Date(newRental.value.dueDate).toISOString(),
    }
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/rentals/rent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentalData),
    })
    const createdRental = await response.json()
    if (!response.ok) {
      alert(createdRental.message.message)
      return
    }
    rentals.value.push({ ...createdRental, isEditing: false })
    newRental.value = {
      bookId: '',
      readerId: '',
      dueDate: '',
    }
  } catch (error) {
    console.error('Error creating rental:', error)
  }
}

const returnBook = (rental: Rental) => {
  try {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/rentals/return/${rental.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
    rental.status = 'zwrócona'
  } catch (error) {
    console.error('Error returning book:', error)
  }
}

// const editRental = (rental: Rental) => {
//   rental.isEditing = true
// }

// const saveRental = async (rental: Rental) => {
//   try {
//     await fetch(`${import.meta.env.VITE_BACKEND_URL}/rentals/${rental.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         bookId: rental.bookId,
//         readerId: rental.readerId,
//         rentalDate: rental.rentalDate,
//         dueDate: rental.dueDate,
//       }),
//     })
//     rental.isEditing = false
//   } catch (error) {
//     console.error('Error saving rental:', error)
//   }
// }

// const confirmDelete = (rental: Rental) => {
//   rentalToDelete.value = rental
//   showDeleteDialog.value = true
// }

const deleteRental = async (id: string) => {
  if (!id) return

  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/rentals/${id}`, { method: 'DELETE' })
    rentals.value = rentals.value.filter((rental) => rental.id !== id)
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Error deleting rental:', error)
  }
}

// Fetch data when component is mounted
onMounted(() => {
  fetchRentals()
  fetchBooks()
  fetchReaders()
})
</script>
