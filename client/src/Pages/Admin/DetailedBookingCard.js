import React from 'react';
import { User, Clock, MapPin, Phone, Mail, Target, Check, X } from 'lucide-react';

const DetailedBookingCard = ({ booking, onUpdateStatus }) => (
  <div className={`p-4 rounded-lg border-l-4 ${
    booking.status.toLowerCase() === 'confirmed' ? 'border-green-500 bg-green-50' :
    booking.status.toLowerCase() === 'pending' ? 'border-yellow-500 bg-yellow-50' :
    'border-red-500 bg-red-50'
  } mb-4`}
  >
    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 break-words">{booking.title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex items-center text-gray-600 break-words">
            <User className="w-4 h-4 mr-2" />
            <span>{booking.user}</span>
          </div>
          <div className="flex items-center text-gray-600 break-words">
            <Clock className="w-4 h-4 mr-2" />
            <span>{booking.time}</span>
          </div>
          <div className="flex items-center text-gray-600 break-words">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{booking.room}</span>
          </div>
          <div className="flex items-center text-gray-600 break-words">
            <Phone className="w-4 h-4 mr-2" />
            <span>{booking.contactNumber}</span>
          </div>
          {/* Category - Team below contact number */}
          <div className="flex items-center text-gray-600 break-words">
            <Target className="w-4 h-4 mr-2" />
            <span>
              {booking.team}
              {booking.subTeam && booking.subTeam.trim() !== '' ? ` - ${booking.subTeam}` : ''}
            </span>
          </div>
          <div className="flex items-center text-gray-600 break-words">
            <Mail className="w-4 h-4 mr-2" />
            <span>{booking.email}</span>
          </div>
        </div>
        {booking.notes && (
          <div className="mt-3">
            <p className="text-xs sm:text-sm text-gray-700 break-words">
              <strong>Purpose:</strong> {booking.notes}
            </p>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className={`px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${
            booking.status.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {booking.status}
          </span>
          
          {onUpdateStatus && (
            <div className="flex gap-2">
              {booking.status.toLowerCase() === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                    className="flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Confirm
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'rejected')}
                    className="flex items-center px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </button>
                </>
              )}
              {booking.status.toLowerCase() === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'rejected')}
                  className="flex items-center px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default DetailedBookingCard; 