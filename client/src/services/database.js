import { supabase } from '../config/supabase'

// Orders service
export const ordersService = {
  // Get all orders with optional filters
  async getOrders(filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(name, phone, business_name),
        supplier:suppliers(name, business_name)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.vendor_phone) {
      query = query.eq('vendor_phone', filters.vendor_phone)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Create new order
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get orders for vendor
  async getVendorOrders(vendorPhone) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_phone', vendorPhone)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get orders for supplier (by location/pincode)
  async getSupplierOrders(supplierPincode) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors!inner(pincode)
      `)
      .eq('vendor.pincode', supplierPincode)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

// Vendors service
export const vendorsService = {
  // Get all vendors
  async getVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get vendor by ID
  async getVendor(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create vendor profile (called after auth signup)
  async createVendorProfile(userData) {
    const { data, error } = await supabase
      .from('vendors')
      .insert([{
        id: userData.id, // Use Supabase auth user ID
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        business_name: userData.businessName,
        address: userData.address,
        pincode: userData.pincode,
        type: 'vendor'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Suppliers service
export const suppliersService = {
  // Get all suppliers
  async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get supplier by ID
  async getSupplier(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create supplier profile (called after auth signup)
  async createSupplierProfile(userData) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        id: userData.id, // Use Supabase auth user ID
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        business_name: userData.businessName,
        address: userData.address,
        pincode: userData.pincode,
        type: 'supplier'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get suppliers by items
  async getSuppliersByItems(items) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .contains('items', items)

    if (error) throw error
    return data
  }
}

// Voice processing service
export const voiceService = {
  // Process voice order
  async processVoiceOrder(audioFile, vendorId) {
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('vendorId', vendorId)

    // This would call your Express backend endpoint
    const response = await fetch('/api/voice/process', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Voice processing failed')
    }

    return await response.json()
  }
}
