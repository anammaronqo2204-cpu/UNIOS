import { useAuthStore } from '@/store/authStore';
import { User, Shield, CreditCard, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const sections = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { label: 'Name', value: user?.name },
        { label: 'Email', value: user?.email },
      ],
    },
    {
      title: 'Plan',
      icon: CreditCard,
      items: [
        { label: 'Current Plan', value: user?.planTier === 'premium' ? 'Premium' : 'Free' },
        { label: 'Status', value: 'Active' },
      ],
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { label: 'Theme', value: 'Light' },
        { label: 'Font Size', value: 'Medium' },
      ],
    },
  ];

  return (
    <div className="page-container animate-fade-up max-w-2xl">
      <h1 className="text-3xl font-bold text-near-black mb-8">Settings</h1>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-light-gray">
              <div className="flex items-center gap-2">
                <section.icon size={18} className="text-dark-gray" />
                <h2 className="font-semibold text-near-black">{section.title}</h2>
              </div>
            </div>
            <div className="divide-y divide-light-gray">
              {section.items.map((item) => (
                <div key={item.label} className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-dark-gray">{item.label}</span>
                  <span className="text-sm font-medium text-near-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}