import { create } from 'zustand'
import { type Tables, type Enums } from '@/lib/database.types'

type Item = Tables<'items'>
type ItemType = Enums<'item_type'>
type TaskStatus = Enums<'task_status'>

interface ItemState {
  items: Item[]
  isLoading: boolean
  selectedItemId: string | null
  filters: {
    type: ItemType | 'all'
    status: TaskStatus | 'all'
    projectId: string | 'all'
    searchQuery: string
  }
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (itemId: string, updates: Partial<Item>) => void
  deleteItem: (itemId: string) => void
  setSelectedItem: (itemId: string | null) => void
  setLoading: (loading: boolean) => void
  setFilters: (filters: Partial<ItemState['filters']>) => void
  getFilteredItems: () => Item[]
  getItemsByProject: (projectId: string) => Item[]
  getTasksByStatus: (status: TaskStatus) => Item[]
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,
  selectedItemId: null,
  filters: {
    type: 'all',
    status: 'all',
    projectId: 'all',
    searchQuery: ''
  },
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  updateItem: (itemId, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    )
  })),
  deleteItem: (itemId) => set((state) => ({
    items: state.items.filter(item => item.id !== itemId),
    selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId
  })),
  setSelectedItem: (selectedItemId) => set({ selectedItemId }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  getFilteredItems: () => {
    const { items, filters } = get()
    return items.filter(item => {
      const matchesType = filters.type === 'all' || item.type === filters.type
      const matchesStatus = filters.status === 'all' || item.status === filters.status
      const matchesProject = filters.projectId === 'all' || item.project_id === filters.projectId
      const matchesSearch = filters.searchQuery === '' || 
        item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(filters.searchQuery.toLowerCase())
      
      return matchesType && matchesStatus && matchesProject && matchesSearch
    })
  },
  getItemsByProject: (projectId) => {
    const { items } = get()
    return items.filter(item => item.project_id === projectId)
  },
  getTasksByStatus: (status) => {
    const { items } = get()
    return items.filter(item => item.type === 'task' && item.status === status)
  }
})) 