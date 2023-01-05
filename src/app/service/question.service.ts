import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { Response } from '../model/Response';
import { Question } from '../model/Question';
import { QuestionState } from '../model/QuestionState';
import { Properties } from '../properties';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private editQuestion$: ReplaySubject<Question> = new ReplaySubject(1);
  private questionState$: ReplaySubject<QuestionState> = new ReplaySubject(1);

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

  public getEditQuestion(): ReplaySubject<Question> {
    return this.editQuestion$;
  }

  public setEditQuestion(question: Question): void {
    this.editQuestion$.next(question);
  }

  public resetEditQuestion(): void {
    this.editQuestion$ = new ReplaySubject(1);
  }

  public setQuestionState(questionState: QuestionState): void {
    this.questionState$.next(questionState);
  }

  public getQuestionState(): ReplaySubject<QuestionState> {
    return this.questionState$;
  }
}
