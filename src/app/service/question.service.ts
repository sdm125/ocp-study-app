import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../model/Response';
import { Question } from '../model/Question';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private httpClient: HttpClient) {}

  private questions: Observable<Response<Question[]>> | null;
  private chapterQuestions: Map<string, Observable<Response<Question[]>>> =
    new Map();

  public getQuestions(): Observable<Response<Question[]>> {
    if (!this.questions) {
      this.questions = this.httpClient.get<Response<Question[]>>(
        'http://localhost:8080/ocp/questions',
        {
          observe: 'body',
          responseType: 'json',
        }
      );
    }
    return this.questions;
  }

  public getQuestionByChapter(
    chapter: string
  ): Observable<Response<Question[]>> | undefined {
    if (!this.chapterQuestions.has(chapter)) {
      this.chapterQuestions.set(
        chapter,
        this.httpClient.get<Response<Question[]>>(
          `http://localhost:8080/ocp/questions/chapter/${chapter}`,
          {
            observe: 'body',
            responseType: 'json',
          }
        )
      );
    }
    return this.chapterQuestions.get(chapter);
  }

  public getChapters(): Observable<Response<number[]>> {
    return this.httpClient.get<Response<number[]>>(
      'http://localhost:8080/ocp/chapters',
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public addQuestion(question: Question): Observable<Response<Question>> {
    this.clearQuestionsCache();
    return this.httpClient.post<Response<Question>>(
      'http://localhost:8080/ocp/question',
      question,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public updateQuestion(question: Question): Observable<Response<Question[]>> {
    this.clearQuestionsCache();
    return this.httpClient.put<Response<Question[]>>(
      'http://localhost:8080/ocp/question',
      question,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  public deleteQuestion(id: number): Observable<Response<Question>> {
    this.clearQuestionsCache();
    return this.httpClient.delete<Response<Question>>(
      `http://localhost:8080/ocp/question/id/${id}`,
      {
        observe: 'body',
        responseType: 'json',
      }
    );
  }

  private clearQuestionsCache(): void {
    this.questions = null;
    this.chapterQuestions.clear();
  }
}
