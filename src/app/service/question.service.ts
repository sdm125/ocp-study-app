import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../model/Response';
import { Question } from '../model/Question';
import { QuizState as QuizState } from '../model/QuizState';
import { Properties } from '../properties';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private editQuestion: Question | null;
  private quizState: QuizState;

  constructor(private httpClient: HttpClient) {}

  public getQuestions(): Observable<Response<Question[]>> {
    return this.httpClient.get<Response<Question[]>>(
      Properties.QUESTIONS_ENDPOINT,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public getQuestionByChapter(
    chapter: string
  ): Observable<Response<Question[]>> {
    return this.httpClient.get<Response<Question[]>>(
      `${Properties.QUESTIONS_CHAPTER_ENDPOINT}/${chapter}`,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public getChapters(): Observable<Response<number[]>> {
    return this.httpClient.get<Response<number[]>>(
      Properties.CHAPTERS_ENDPOINT,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public addQuestion(question: Question): Observable<Response<Question>> {
    return this.httpClient.post<Response<Question>>(
      Properties.QUESTION_ENDPOINT,
      question,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public updateQuestion(question: Question): Observable<Response<Question[]>> {
    return this.httpClient.put<Response<Question[]>>(
      Properties.QUESTION_ENDPOINT,
      question,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public deleteQuestion(id: number): Observable<Response<Question>> {
    return this.httpClient.delete<Response<Question>>(
      `${Properties.DELETE_QUESTION_ENDPOINT}/${id}`,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public getEditQuestion(): Question | null {
    return this.editQuestion;
  }

  public setEditQuestion(question: Question): void {
    this.editQuestion = question;
  }

  public resetEditQuestion(): void {
    this.editQuestion = null;
  }

  public setQuizState(quizState: QuizState): void {
    this.quizState = {
      ...quizState,
      questions: [...quizState.questions],
    };
    localStorage.setItem('quizState', JSON.stringify(this.quizState));
  }

  public getQuizState(): QuizState {
    const quizState = localStorage.getItem('quizState');
    if (quizState) {
      this.quizState = JSON.parse(quizState);
      return {
        ...this.quizState,
        questions: [...this.quizState.questions],
      };
    }
    return this.quizState;
  }
}
