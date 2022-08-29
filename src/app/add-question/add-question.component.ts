import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { Question } from '../model/Question';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss'],
})
export class AddQuestionComponent implements OnInit, OnDestroy {
  public addQuestionForm = new FormGroup({
    question: new FormControl(),
    answer: new FormControl(),
    chapter: new FormControl(),
  });
  private idToUpdate: number | null;
  public editorOptions = { theme: 'vs-dark', language: 'java' };
  private subs = new Subscription();
  public questionSnippet: string;
  public answerSnippet: string;
  private isUpdate: boolean = false;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.subs.add(
      this.questionService.editQuestion.subscribe((q: Question) => {
        if (Object.keys(q).length < 1) return;
        this.idToUpdate = q.id as number;
        this.addQuestionForm.setValue({
          question: q.question || '',
          answer: q.answer || '',
          chapter: q.chapter || '',
        });
        this.questionSnippet = q.questionSnippet || '';
        this.answerSnippet = q.answerSnippet || '';
        this.isUpdate = true;
      })
    );
  }

  public submitQuestion(): void {
    const question: Question = {
      question: this.addQuestionForm.get('question')?.value,
      questionSnippet: this.questionSnippet,
      answer: this.addQuestionForm.get('answer')?.value,
      answerSnippet: this.answerSnippet,
      chapter: this.addQuestionForm.get('chapter')?.value,
    };

    if (this.isUpdate) {
      question.id = this.idToUpdate as number;
      this.updateQuestion(question);
    } else {
      this.addQuestion(question);
    }

    this.addQuestionForm.reset();
    this.questionSnippet = '';
    this.answerSnippet = '';
    this.idToUpdate = null;
  }

  private addQuestion(question: Question): void {
    this.subs.add(
      this.questionService
        .addQuestion(question)
        .pipe(take(1))
        .subscribe(
          (res) => {
            console.log(res);
          },
          (error) => {
            alert('Error question not added');
          }
        )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public updateQuestion(question: Question | undefined): void {
    if (question) {
      this.questionService
        .updateQuestion(question)
        .pipe(take(1))
        .subscribe(
          (res) => {
            console.log(res);
          },
          (error) => {
            alert('Error question not added');
          }
        );
    }
  }
}
