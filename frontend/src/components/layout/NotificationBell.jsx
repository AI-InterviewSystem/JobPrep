import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { notificationApi } from '../../services/api';
import { storage } from '../../services/storage';

export default function NotificationBell() {
    const [count, setCount] = useState(0);

    const fetchCount = async () => {
        if (!storage.getToken()) {
            setCount(0);
            return;
        }
        try {
            const res = await notificationApi.getUnreadCount();
            setCount(res.data?.count ?? 0);
        } catch {
            setCount(0);
        }
    };

    useEffect(() => {
        fetchCount();
        window.addEventListener('jobprep:notifications-updated', fetchCount);
        return () => window.removeEventListener('jobprep:notifications-updated', fetchCount);
    }, []);

    if (!storage.getToken()) return null;

    return (
        <Link
            to="/notifications"
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Thông báo"
        >
            <FiBell className="text-xl" />
            {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black px-1">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
