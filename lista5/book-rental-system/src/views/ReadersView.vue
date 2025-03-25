<template>
  <div class="container mx-auto py-8 px-4">
    <h2 class="text-3xl font-bold mb-6">Reader List</h2>

    <!-- Add New Reader Card -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Add New Reader</CardTitle>
        <CardDescription
          >Enter the details of the reader you want to add to your collection.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <form @submit.prevent="createReader" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">First Name</Label>
              <Input id="firstName" v-model="newReader.firstName" placeholder="Enter first name" />
            </div>
            <div class="space-y-2">
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" v-model="newReader.lastName" placeholder="Enter last name" />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="newReader.email" type="email" placeholder="Enter email" />
            </div>
          </div>
          <Button type="submit" class="w-full sm:w-auto">Add Reader</Button>
        </form>
      </CardContent>
    </Card>

    <!-- Readers Table -->
    <Card>
      <CardHeader>
        <CardTitle>Readers Collection</CardTitle>
        <CardDescription>Manage your readers with ease.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableCaption>List of Readers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[15%]">First Name</TableHead>
                <TableHead class="w-[15%]">Last Name</TableHead>
                <TableHead class="w-[20%]">Email</TableHead>
                <TableHead class="text-right w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="reader in readers" :key="reader.id">
                <TableCell>
                  <Input v-if="reader.isEditing" v-model="reader.firstName" class="w-full" />
                  <span v-else>{{ reader.firstName }}</span>
                </TableCell>
                <TableCell>
                  <Input v-if="reader.isEditing" v-model="reader.lastName" class="w-full" />
                  <span v-else>{{ reader.lastName }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    v-if="reader.isEditing"
                    v-model="reader.email"
                    type="email"
                    class="w-full"
                  />
                  <span v-else>{{ reader.email }}</span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="reader.isEditing"
                      variant="outline"
                      size="sm"
                      @click="saveReader(reader)"
                    >
                      Save
                    </Button>
                    <Button v-else variant="outline" size="sm" @click="editReader(reader)">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" @click="confirmDelete(reader)">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="readers.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  No readers found. Add your first reader above.
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
            This action cannot be undone. This will permanently delete the reader "{{
              readerToDelete?.firstName
            }}
            {{ readerToDelete?.lastName }}" from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deleteReader(readerToDelete?.id!)"> Delete </AlertDialogAction>
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

interface Reader {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  isEditing: boolean
}

const readers = ref<Reader[]>([])
const newReader = ref({
  firstName: '',
  lastName: '',
  email: '',
})
const showDeleteDialog = ref(false)
const readerToDelete: Ref<Reader | null> = ref(null)

const fetchReaders = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/readers', {
      // Add cache-busting headers
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    readers.value = await response.json()
    readers.value.forEach((reader) => (reader.isEditing = false))
  } catch (error) {
    console.error('Error fetching readers:', error)
  }
}

const createReader = async () => {
  if (!newReader.value.firstName || !newReader.value.lastName || !newReader.value.email) return

  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/readers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReader.value),
    })
    const createdReader = await response.json()
    readers.value.push({ ...createdReader, isEditing: false })
    newReader.value = {
      firstName: '',
      lastName: '',
      email: '',
    }
  } catch (error) {
    console.error('Error creating reader:', error)
  }
}

const editReader = (reader: Reader) => {
  reader.isEditing = true
}

const saveReader = async (reader: Reader) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/readers/${reader.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: reader.firstName,
        lastName: reader.lastName,
        email: reader.email,
      }),
    })
    reader.isEditing = false
  } catch (error) {
    console.error('Error saving reader:', error)
  }
}

const confirmDelete = (reader: Reader) => {
  readerToDelete.value = reader
  showDeleteDialog.value = true
}

const deleteReader = async (id: string) => {
  if (!id) return

  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/readers/${id}`, { method: 'DELETE' })
    readers.value = readers.value.filter((reader) => reader.id !== id)
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Error deleting reader:', error)
  }
}

onMounted(fetchReaders)
</script>
