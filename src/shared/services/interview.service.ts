import { InterviewRepository, InterviewMemoryItem } from "../repositories/InterviewRepository";

export class InterviewService {
  static async listInterviews(userId: string): Promise<InterviewMemoryItem[]> {
    return InterviewRepository.listInterviews(userId);
  }

  static async createInterview(
    userId: string,
    data: Omit<InterviewMemoryItem, "id">
  ): Promise<InterviewMemoryItem> {
    return InterviewRepository.createInterview(userId, data);
  }
}
