import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddQuestionComponent } from './add-question/add-question.component';
import { QuestionComponent } from './question/question.component';
import { Question } from './model/Question';

const routes: Routes = [
  { path: '', redirectTo: 'quiz', pathMatch: 'full' },
  {
    path: 'quiz',
    component: QuestionComponent,
  },
  {
    path: 'add-question',
    component: AddQuestionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
