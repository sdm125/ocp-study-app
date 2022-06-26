import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { Question } from '../model/Question';
import { map, Observable, Subscription, take, tap } from 'rxjs';
import { Response } from '../model/Response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit, OnDestroy {
  public questions: Question[];
  public questionIndex: number = 0;
  public showAnswer: boolean = false;
  public chapters: number[];
  public activeChapter: string = 'all';
  private subs = new Subscription();
  public edit: boolean = false;
  public currentQuestion: Question;

  public editorOptions = { theme: 'vs-dark', language: 'java' };

  constructor(
    private questionService: QuestionService,
    private router: Router
  ) {}

  ngOnInit() {
    const chaptersSub = this.questionService.getChapters().subscribe((res) => {
      this.chapters = res.data;
    });

    const questionSub = this.getQuestions('all')
      ?.pipe(take(1))
      .subscribe((res) => {
        this.questions = res.data;
        this.currentQuestion = this.questions[0];
      });

    this.subs.add(chaptersSub);
    this.subs.add(questionSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onChapterChange(chapter: string): void {
    this.activeChapter = chapter;
    this.questionIndex = 0;
    this.getQuestions(chapter)
      ?.pipe(
        take(1),
        tap((questions) => this.shuffleQuestions(questions.data))
      )
      .subscribe((res) => {
        this.questions = res.data;
        this.currentQuestion = this.questions[this.questionIndex];
      });
    this.showAnswer = false;
  }

  private getQuestions(
    chapter: string
  ): Observable<Response<Question[]>> | undefined {
    return chapter === 'all'
      ? this.questionService.getQuestions()
      : this.questionService.getQuestionByChapter(chapter);
  }

  public deleteQuestion(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this question?')) {
      this.questionService
        .deleteQuestion(id)
        .pipe(take(1))
        .subscribe((res) => {
          console.log(res);
        });
    }
  }

  public showNextQuestion(): void {
    if (this.questionIndex + 1 <= this.questions.length) {
      this.questionIndex++;
    } else {
      this.questionIndex = 0;
    }
    this.currentQuestion = this.questions[this.questionIndex];
    this.edit = false;
    this.showAnswer = false;
  }

  public shuffleQuestions(questions: Question[]): void {
    for (let i = questions.length - 1; i > 0; i--) {
      let randomIndex = Math.floor(Math.random() * (i + 1));
      let currentQuestion = questions[i];
      questions[i] = questions[randomIndex];
      questions[randomIndex] = currentQuestion;
    }
  }
}
