export interface Question {
  id?: number;
  question: string;
  questionSnippet?: string;
  answer: string;
  answerSnippet?: string;
  chapter: number;
  answeredCorrect?: boolean;
}
