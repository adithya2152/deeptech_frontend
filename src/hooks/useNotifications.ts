import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Real notification counts hook.
 * Fetches counts from backend: pending proposals, pending contracts, etc.
 */
export function useNotificationCounts() {
    const { token, profile, isAuthenticated } = useAuth();
    const role = profile?.role;

    return useQuery({
        queryKey: ['notificationCounts', role],
        queryFn: async () => {
            if (!token) return {};

            const response = await fetch(`${API_BASE_URL}/profile/notifications/counts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notification counts');
            }

            const data = await response.json();
            return data.data || {};
        },
        enabled: !!token && isAuthenticated,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
        refetchOnWindowFocus: true,
    });
}
