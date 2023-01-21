import { Question } from './Question';

export class QuizState {
  questionIndex: number;
  activeChapter: string;
  questions: Question[];
}
