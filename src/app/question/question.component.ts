import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { Question } from '../model/Question';
import {
  isEmpty,
  map,
  mergeMap,
  Observable,
  of,
  Subscription,
  take,
} from 'rxjs';
import { Response } from '../model/Response';
import { Router } from '@angular/router';
import { NgxEditorModel, EditorComponent } from 'ngx-monaco-editor';
import { Editor } from '../model/Editor';
import { UserService } from '../service/user.service';
import { QuestionState } from '../model/QuestionState';
import { Status } from '../model/Status';

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
  public isAdmin: boolean;
  private questionState: QuestionState = new QuestionState();
  private isQuestionStateEmpty: boolean = true;

  public editorOptions = { theme: 'vs-dark', language: 'java' };
  public editorHeight: Map<Editor, number> = new Map();

  constructor(
    private questionService: QuestionService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const chaptersSub = this.questionService.getChapters().subscribe(
      (res) => {
        this.chapters = res.data;
      },
      (error) => {}
    );

    const isEmptySub = this.questionService
      .getQuestionState()
      .pipe(
        isEmpty(),
        map((isEmpty) => {
          this.isQuestionStateEmpty = isEmpty;
        })
      )
      .subscribe();

    const questionStateSub = this.questionService
      .getQuestionState()
      .pipe(
        mergeMap((state) => {
          const { questionIndex, activeChapter } = state;
          this.questionIndex = questionIndex;
          this.activeChapter = activeChapter;
          this.setQuestionState();
          return this.getQuestions(this.activeChapter);
        })
      )
      .subscribe((res) => {
        this.questions = res.data;
        this.currentQuestion = this.questions[this.questionIndex];
      });

    if (this.isQuestionStateEmpty) {
      this.getQuestions('all')?.subscribe((res) => {
        this.questions = res.data;
        this.currentQuestion = this.questions[0];
        this.activeChapter = 'all';
        this.setQuestionState();
      });
    }

    this.subs.add(chaptersSub);
    this.subs.add(questionStateSub);
    this.subs.add(isEmptySub);
    this.isAdmin = this.userService.hasAdminAccess();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    console.log(this.questionState);
    this.questionService.setQuestionState(this.questionState);
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
        this.setQuestionState();
      });
    this.showAnswer = false;
  }

  private setQuestionState(): void {
    this.questionState.activeChapter = this.activeChapter;
    this.questionState.questionIndex = this.questionIndex;
  }

  private getQuestions(chapter: string): Observable<Response<Question[]>> {
    return (
      chapter === 'all'
        ? this.questionService.getQuestions()
        : this.questionService.getQuestionByChapter(chapter)
    ).pipe(
      map((res) => {
        res.data.sort((a, b) => (a?.id || 0) - (b?.id || 0));
        return res;
      })
    );
  }

  public deleteQuestion(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this question?')) {
      this.questionService
        .deleteQuestion(id)
        .pipe(
          take(1),
          mergeMap((res) => {
            if (res.status === Status.SUCCESS) {
              return this.questionService.getQuestionByChapter(
                this.activeChapter
              );
            }
            return of();
          })
        )
        .subscribe((res) => {
          this.questions = res.data;
          this.questionIndex = 0;
          this.currentQuestion = this.questions[this.questionIndex];
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
    this.setQuestionState();
    this.showQuestion();
  }

  public showPrevQuestion(): void {
    if (this.questionIndex > 0) {
      this.questionIndex--;
    } else {
      this.questionIndex = this.questions.length - 1;
    }
    this.setQuestionState();
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
