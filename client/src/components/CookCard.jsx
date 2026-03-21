import { MapPin, Utensils, DollarSign, Phone } from 'lucide-react';

export default function CookCard({ cook }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
          {cook.name}
        </h3>
        
        <div className="space-y-3">
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
      </div>
    </div>
  );
}
