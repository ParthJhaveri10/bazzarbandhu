// Test file to check authStore import
import { useAuthStore } from './store/authStore'

console.log('AuthStore imported successfully:', typeof useAuthStore)
console.log('AuthStore methods:', Object.keys(useAuthStore.getState()))

export const testAuthStore = () => {
    console.log('Current state:', useAuthStore.getState())
}
