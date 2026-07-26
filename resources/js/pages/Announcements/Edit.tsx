import AnnouncementForm from '@/components/forms/AnnouncementForm';
import type { Announcement } from '@/types';

interface AnnouncementEditPageProps {
    announcement: Announcement;
    formOptions: Record<string, never>;
    readOnly?: boolean;
}

export default function AnnouncementEditPage({
    announcement,
    readOnly = false,
}: AnnouncementEditPageProps) {
    return <AnnouncementForm announcement={announcement} readOnly={readOnly} />;
}
