<template>
  <div class="container mx-auto py-8 px-4">
    <h2 class="text-3xl font-bold mb-6">Author List</h2>

    <!-- Add New Author Card -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Add New Author</CardTitle>
        <CardDescription
          >Enter the details of the author you want to add to your collection.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <form @submit.prevent="createAuthor" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">First Name</Label>
              <Input id="firstName" v-model="newAuthor.firstName" placeholder="Enter first name" />
            </div>
            <div class="space-y-2">
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" v-model="newAuthor.lastName" placeholder="Enter last name" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="bio">Biography</Label>
              <Textarea
                id="bio"
                v-model="newAuthor.bio"
                placeholder="Enter author biography"
                rows="3"
              />
            </div>
          </div>
          <Button type="submit" class="w-full sm:w-auto">Add Author</Button>
        </form>
      </CardContent>
    </Card>

    <!-- Authors Table -->
    <Card>
      <CardHeader>
        <CardTitle>Authors Collection</CardTitle>
        <CardDescription>Manage your authors with ease.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableCaption>List of Authors</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[25%]">First Name</TableHead>
                <TableHead class="w-[25%]">Last Name</TableHead>
                <TableHead class="w-[35%]">Biography</TableHead>
                <TableHead class="text-right w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="author in authors" :key="author.id">
                <TableCell>
                  <Input v-if="author.isEditing" v-model="author.firstName" class="w-full" />
                  <span v-else>{{ author.firstName }}</span>
                </TableCell>
                <TableCell>
                  <Input v-if="author.isEditing" v-model="author.lastName" class="w-full" />
                  <span v-else>{{ author.lastName }}</span>
                </TableCell>
                <TableCell>
                  <Textarea v-if="author.isEditing" v-model="author.bio" class="w-full h-20" />
                  <span v-else class="truncate block max-w-xs">{{ author.bio }}</span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="author.isEditing"
                      variant="outline"
                      size="sm"
                      @click="saveAuthor(author)"
                    >
                      Save
                    </Button>
                    <Button v-else variant="outline" size="sm" @click="editAuthor(author)">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" @click="confirmDelete(author)">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="authors.length === 0">
                <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
                  No authors found. Add your first author above.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the author "{{
              authorToDelete?.firstName
            }}
            {{ authorToDelete?.lastName }}" from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deleteAuthor(authorToDelete?.id!)"> Delete </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

import type { Ref } from 'vue'

interface Author {
  id: string
  firstName: string
  lastName: string
  bio: string
  isEditing: boolean
}

const authors = ref<Author[]>([])
const newAuthor = ref({
  firstName: '',
  lastName: '',
  bio: '',
})
const showDeleteDialog = ref(false)
const authorToDelete: Ref<Author | null> = ref(null)

const fetchAuthors = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/author', {
      // Add cache-busting headers
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    authors.value = await response.json()
    authors.value.forEach((author) => (author.isEditing = false))
  } catch (error) {
    console.error('Error fetching authors:', error)
  }
}

const createAuthor = async () => {
  if (!newAuthor.value.firstName || !newAuthor.value.lastName) return

  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAuthor.value),
    })
    const createdAuthor = await response.json()
    authors.value.push({ ...createdAuthor, isEditing: false })
    newAuthor.value = {
      firstName: '',
      lastName: '',
      bio: '',
    }
  } catch (error) {
    console.error('Error creating author:', error)
  }
}

const editAuthor = (author: Author) => {
  author.isEditing = true
}

const saveAuthor = async (author: Author) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/author/${author.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: author.firstName,
        lastName: author.lastName,
        bio: author.bio,
      }),
    })
    author.isEditing = false
  } catch (error) {
    console.error('Error saving author:', error)
  }
}

const confirmDelete = (author: Author) => {
  authorToDelete.value = author
  showDeleteDialog.value = true
}

const deleteAuthor = async (id: string) => {
  if (!id) return

  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/author/${id}`, { method: 'DELETE' })
    authors.value = authors.value.filter((author) => author.id !== id)
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Error deleting author:', error)
  }
}

onMounted(fetchAuthors)
</script>
