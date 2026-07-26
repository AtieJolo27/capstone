import ReportForm from '@/components/forms/ReportForm';
import type { Report } from '@/types';

interface ReportEditPageProps {
    report: Report;
    formOptions: Record<string, never>;
    readOnly?: boolean;
}

export default function ReportEditPage({
    report,
    readOnly = false,
}: ReportEditPageProps) {
    return <ReportForm report={report} readOnly={readOnly} />;
}
