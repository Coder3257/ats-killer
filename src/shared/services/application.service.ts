import { ApplicationRepository, ApplicationTrackerItem } from "../repositories/ApplicationRepository";

export class ApplicationService {
  static async listApplications(userId: string): Promise<ApplicationTrackerItem[]> {
    return ApplicationRepository.listApplications(userId);
  }

  static async createApplication(
    userId: string,
    data: Omit<ApplicationTrackerItem, "id">
  ): Promise<ApplicationTrackerItem> {
    return ApplicationRepository.createApplication(userId, data);
  }

  static async updateApplication(
    userId: string,
    id: string,
    data: Partial<ApplicationTrackerItem>
  ): Promise<void> {
    return ApplicationRepository.updateApplication(userId, id, data);
  }

  static async deleteApplication(userId: string, id: string): Promise<void> {
    return ApplicationRepository.deleteApplication(userId, id);
  }
}
