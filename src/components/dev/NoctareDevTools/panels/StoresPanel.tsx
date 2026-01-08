import { JotaiViewer } from '@/components/dev/NoctareDevTools/JotaiViewer';
import { useCalendar } from '@/store/calendar/hooks';
import { useSidebar } from '@/store/sidebar/hooks';
import { useUserPreferences } from '@/store/userPreferences/hooks';

export function StoresPanel() {
  const calendarState = useCalendar();
  const sidebarState = useSidebar();
  const preferencesState = useUserPreferences();

  const stores = [
    { name: 'Calendar Store', state: calendarState },
    { name: 'Sidebar Store', state: sidebarState },
    { name: 'User Preferences Store', state: preferencesState },
  ];

  return <JotaiViewer stores={stores} />;
}
