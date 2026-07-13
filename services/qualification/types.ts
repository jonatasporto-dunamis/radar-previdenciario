import type {
  NotificationPriority,
  NotificationProvider,
  ResultClassification,
} from "@/types/database";

export type LeadQualification = {
  classification: ResultClassification;
  priority: NotificationPriority;
  shouldNotify: boolean;
  reason: string;
  providers: NotificationProvider[];
};
