// Test script to verify frontend booking data
// This simulates what the frontend sends

const axios = require('axios');

async function testFrontendBooking() {
  try {
    console.log('🧪 Testing frontend booking data...');
    
    const bookingData = {
      name: 'Test Admin User',
      meeting_name: 'Test Admin Meeting',
      start_time: '10:00',
      end_time: '11:00',
      date: '2025-01-01',
      meeting_purpose: 'Testing admin booking',
      contact_number: '1234567890',
      email: 'admin-test@example.com',
      team_category: '1',
      team_sub_category: 'Test Team',
      room_id: '1',
      nirmaan_text: '',
      status: 'confirmed'  // This is what frontend should send
    };
    
    console.log('📤 Sending booking data:', bookingData);
    
    const response = await axios.post('http://13.127.171.141:5000/api/create_browseroom', bookingData);
    
    console.log('📥 Server response:', response.data);
    
    if (response.data && response.data.status === 'confirmed') {
      console.log('✅ SUCCESS: Booking created with confirmed status!');
    } else {
      console.log('❌ FAILED: Booking status is:', response.data?.status);
    }
    
    // Clean up
    if (response.data && response.data.id) {
      console.log('🧹 Cleaning up test booking...');
      // You might need to delete the test booking manually from database
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend booking:', error.response?.data || error.message);
  }
}

testFrontendBooking();








