import type { QuizAnswer, QuizResult, QuizSession } from "@/types/database";

export type CreateQuizSessionInput = Pick<QuizSession, "lead_id"> &
  Partial<Pick<QuizSession, "completed_at" | "started_at" | "status">>;

export type SaveQuizAnswerInput = Omit<QuizAnswer, "created_at" | "id">;

export type SaveQuizResultInput = Omit<QuizResult, "created_at" | "id">;

export async function createQuizSession(
  input: CreateQuizSessionInput,
): Promise<QuizSession> {
  void input;
  throw new Error("Not implemented yet");
}

export async function saveQuizAnswer(
  input: SaveQuizAnswerInput,
): Promise<QuizAnswer> {
  void input;
  throw new Error("Not implemented yet");
}

export async function saveQuizResult(
  input: SaveQuizResultInput,
): Promise<QuizResult> {
  void input;
  throw new Error("Not implemented yet");
}
