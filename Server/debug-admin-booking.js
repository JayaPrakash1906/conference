// Debug script to test admin booking creation
// Run this to see what's happening with admin bookings

const axios = require('axios');

async function debugAdminBooking() {
  try {
    console.log('🔍 Debugging admin booking creation...');
    
    // Test data that matches what frontend sends
    const adminBookingData = {
      name: 'Admin Test User',
      meeting_name: 'Admin Test Meeting',
      start_time: '14:00',
      end_time: '15:00',
      date: '2025-01-01',
      meeting_purpose: 'Testing admin auto-confirmation',
      contact_number: '9876543210',
      email: 'admin-test@example.com',
      team_category: '1',
      team_sub_category: 'Admin Team',
      room_id: '1',
      nirmaan_text: '',
      status: 'confirmed'  // This should make it auto-confirm
    };
    
    console.log('📤 Sending admin booking data:');
    console.log(JSON.stringify(adminBookingData, null, 2));
    
    console.log('\n🌐 Making request to server...');
    const response = await axios.post('http://13.127.171.141:5000/api/create_browseroom', adminBookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📥 Server response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.status === 'confirmed') {
      console.log('\n✅ SUCCESS: Admin booking was auto-confirmed!');
      console.log('🎉 The system is working correctly.');
    } else {
      console.log('\n❌ FAILED: Admin booking was not auto-confirmed.');
      console.log('📊 Actual status:', response.data?.status);
      console.log('🔧 This means the backend is not processing the status correctly.');
    }
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

debugAdminBooking();








