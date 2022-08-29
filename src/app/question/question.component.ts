import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { Question } from '../model/Question';
import { map, Observable, Subscription, take, tap } from 'rxjs';
import { Response } from '../model/Response';
import { Router } from '@angular/router';
import { NgxEditorModel, EditorComponent } from 'ngx-monaco-editor';
import { Editor } from '../model/Editor';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit, OnDestroy {
  public questions: Question[] = [];
  public questionIndex: number = 0;
  public showAnswer: boolean = false;
  public chapters: number[];
  public activeChapter: string = 'all';
  private subs = new Subscription();
  public edit: boolean = false;
  public currentQuestion: Question;
  public isReview: boolean = false;

  public editorOptions = { theme: 'vs-dark', language: 'java' };
  public editorHeight: Map<Editor, number> = new Map();

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

  get Editor() {
    return Editor;
  }

  public getChapterQuestions(chapter: string): void {
    this.activeChapter = chapter;
    this.questionIndex = 0;
    this.isReview = false;
    this.getQuestions(chapter)
      ?.pipe(
        take(1)
        // tap((questions) => this.shuffleQuestions(questions.data))
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

  public updateQuestion(): void {
    this.questionService.setEditQuestion(this.currentQuestion);
    this.router.navigate(['/add-question']);
  }

  public showNextQuestion(): void {
    if (this.questionIndex + 1 <= this.questions.length) {
      this.questionIndex++;
    } else {
      this.questionIndex = 0;
    }
    this.showQuestion();
  }

  public showPrevQuestion(): void {
    if (this.questionIndex > 0) {
      this.questionIndex--;
    } else {
      this.questionIndex = this.questions.length - 1;
    }
    this.showQuestion();
  }

  private showQuestion(): void {
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

  public markQuestionWrong(): void {
    this.currentQuestion.answeredCorrect = false;
    this.showNextQuestion();
  }

  public markQuestionRight(): void {
    this.currentQuestion.answeredCorrect = true;
    this.showNextQuestion();
  }

  public getNumberQuestionsWrong(): number {
    return this.questions?.filter((q) => !q.answeredCorrect).length;
  }

  public reviewMissedQuestions(): void {
    this.questions = this.questions.filter((q) => !q.answeredCorrect);
    this.isReview = true;
    this.showNextQuestion();
  }

  get questionStatus() {
    return !this.currentQuestion?.question ? true : null;
  }
}
