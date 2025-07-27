// Test file to check authStore and orderStore imports
import { useAuthStore } from './store/authStore'
import { useOrderStore } from './store/orderStore'

console.log('AuthStore imported successfully:', typeof useAuthStore)
console.log('AuthStore methods:', Object.keys(useAuthStore.getState()))

console.log('OrderStore imported successfully:', typeof useOrderStore)
console.log('OrderStore methods:', Object.keys(useOrderStore.getState()))

export const testAuthStore = () => {
    console.log('Auth State:', useAuthStore.getState())
    console.log('Order State:', useOrderStore.getState())
}
