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

  public chapterNames: Map<number, string> = new Map<number, string>([
    [1, 'Chapter 1 Welcome to Java'],
    [2, 'Chapter 2 Java Building Blocks'],
    [3, 'Chapter 3 Operators'],
    [4, 'Chapter 4 Making Decisions'],
    [5, 'Chapter 5 Core Java APIs'],
    [6, 'Chapter 6 Lambdas and Functional Interfaces'],
    [7, 'Chapter 7 Methods and Encapsulation'],
    [8, 'Chapter 8 Class Design'],
    [9, 'Chapter 9 Advanced Class Design'],
    [10, 'Chapter 10 Exceptions'],
    [11, 'Chapter 11 Modules'],
    [12, 'Chapter 12 Java Fundamentals'],
    [13, 'Chapter 13 Annotations'],
    [14, 'Chapter 14 Generics and Collections'],
    [15, 'Chapter 15 Functional Programming'],
    [16, 'Chapter 16 Exceptions, Assertions, and Localization'],
    [17, 'Chapter 17 Modular Applications'],
    [18, 'Chapter 18 Concurrency'],
    [19, 'Chapter 19 I/O'],
    [20, 'Chapter 20 NIO.2'],
    [21, 'Chapter 21 JDBC'],
    [22, 'Chapter 22 Security'],
  ]);

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
        const chapters = res.data.reduce(
          (chapters: any, question: Question) => {
            const chapterStr = question.chapter + '';
            if (!chapters.hasOwnProperty(chapterStr)) {
              chapters[chapterStr] = [];
            }

            chapters[chapterStr].push(question);

            return chapters;
          },
          {}
        );
        res.data = Object.keys(chapters).reduce(
          (questions: Question[], chapter) => {
            (chapters[chapter] as Question[]).sort(
              (a, b) => (a?.id || 0) - (b?.id || 0)
            );
            return [...questions, ...chapters[chapter]];
          },
          []
        );
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

  get showCurrentQuestion(): boolean {
    return this.currentQuestion?.question !== undefined;
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
    return !this.currentQuestion?.question &&
      this.currentQuestion?.question === undefined
      ? true
      : null;
  }
}
