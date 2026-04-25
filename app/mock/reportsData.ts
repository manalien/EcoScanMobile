export type ReportStatus = 'ready' | 'generating' | 'failed';
export type ReportFormat = 'PDF' | 'XLS';
export type ReportType = 'Monthly NDVI Summary' | 'Change Detection Data' | 'Alert Summary Report' | 'District Report';

export interface ReportItem {
  report_id: string;
  title: string;
  format: ReportFormat;
  type: ReportType;
  region: string;
  period: string;
  generated_at: string;
  size_mb: number;
  status: ReportStatus;
  progress?: number;
}

export const mockReports: ReportItem[] = [
  {
    report_id: '1',
    title: 'Monthly NDVI Summary',
    format: 'PDF',
    type: 'Monthly NDVI Summary',
    region: 'National',
    period: 'Apr 2025',
    generated_at: 'Apr 24, 2025',
    size_mb: 2.4,
    status: 'ready',
  },
  {
    report_id: '2',
    title: 'Change Detection Data',
    format: 'XLS',
    type: 'Change Detection Data',
    region: 'Rajasthan',
    period: 'Mar–Apr 2025',
    generated_at: 'Apr 20, 2025',
    size_mb: 1.1,
    status: 'ready',
  },
  {
    report_id: '3',
    title: 'Alert Summary Report',
    format: 'PDF',
    type: 'Alert Summary Report',
    region: 'National',
    period: 'Q1 2025',
    generated_at: 'Apr 25, 2025',
    size_mb: 0,
    status: 'generating',
    progress: 65,
  },
  {
    report_id: '4',
    title: 'District Report',
    format: 'PDF',
    type: 'District Report',
    region: 'Kerala',
    period: 'Mar 2025',
    generated_at: 'Apr 15, 2025',
    size_mb: 1.8,
    status: 'ready',
  },
  {
    report_id: '5',
    title: 'Change Detection Data',
    format: 'XLS',
    type: 'Change Detection Data',
    region: 'Assam',
    period: 'Feb–Mar 2025',
    generated_at: 'Apr 10, 2025',
    size_mb: 0.9,
    status: 'ready',
  },
];

export const REGIONS = ['All regions', 'National', 'Rajasthan', 'Kerala', 'Assam', 'Madhya Pradesh'];
export const REPORT_TYPES = ['All types', 'Monthly NDVI Summary', 'Change Detection Data', 'Alert Summary Report', 'District Report'];
export const PERIODS = ['All periods', 'Apr 2025', 'Mar 2025', 'Q1 2025', 'Feb 2025'];