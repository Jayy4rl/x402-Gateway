import {
  DollarSign,
  Cloud,
  Users,
  MessageSquare,
  Database,
  Brain,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Image,
  Shield,
  Code,
  Box,
  type LucideIcon,
} from 'lucide-react';

/**
 * Returns the appropriate icon component for a given API category
 *
 * @param category - The API category
 * @returns Lucide icon component
 */
export function getCategoryIcon(category: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    Payment: DollarSign,
    Weather: Cloud,
    Social: Users,
    Communication: MessageSquare,
    Data: Database,
    'AI/ML': Brain,
    Mapping: MapPin,
    'E-commerce': ShoppingCart,
    Finance: TrendingUp,
    Media: Image,
    Authentication: Shield,
    Development: Code,
    Other: Box,
  };

  return iconMap[category] || Box;
}

/**
 * Returns the appropriate color class for a given API category
 *
 * @param category - The API category
 * @returns Tailwind color classes
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    Payment: 'from-green-500 to-emerald-600',
    Weather: 'from-blue-500 to-cyan-600',
    Social: 'from-purple-500 to-pink-600',
    Communication: 'from-indigo-500 to-blue-600',
    Data: 'from-gray-500 to-slate-600',
    'AI/ML': 'from-violet-500 to-purple-600',
    Mapping: 'from-red-500 to-orange-600',
    'E-commerce': 'from-yellow-500 to-amber-600',
    Finance: 'from-teal-500 to-green-600',
    Media: 'from-pink-500 to-rose-600',
    Authentication: 'from-cyan-500 to-blue-600',
    Development: 'from-orange-500 to-red-600',
    Other: 'from-gray-500 to-gray-600',
  };

  return colorMap[category] || 'from-gray-500 to-gray-600';
}
