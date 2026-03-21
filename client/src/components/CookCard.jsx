import { useState } from 'react';
import { MapPin, Utensils, DollarSign, Phone, Star } from 'lucide-react';
import ReviewModal from './ReviewModal';

export default function CookCard({ cook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
          {cook.name}
        </h3>
        
        <div className="space-y-3 flex-1">
          <div className="flex items-center text-gray-600">
            <Utensils className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm">{cook.cuisine}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm">{cook.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm font-medium">{cook.price_range}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Star className={`w-4 h-4 mr-3 ${cook.averageRating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            <span className="text-sm font-medium">
              {cook.averageRating > 0 ? `${cook.averageRating} (${cook.reviewCount} reviews)` : 'No reviews yet'}
            </span>
          </div>

          {cook.contact && (
            <div className="flex items-center text-gray-600 pt-3 mt-3 border-t border-gray-50">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              {/^[+\d\s\-()]+$/.test(cook.contact) ? (
                <a href={`tel:${cook.contact.replace(/[^\d+]/g, '')}`} className="text-sm text-primary-600 hover:underline">
                  {cook.contact}
                </a>
              ) : (
                <span className="text-sm text-gray-500">{cook.contact}</span>
              )}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-5 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Read Reviews & Rate
        </button>
      </div>
      
      {isModalOpen && (
        <ReviewModal cook={cook} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
