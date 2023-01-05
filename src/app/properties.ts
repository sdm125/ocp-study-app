import { environment } from 'src/environments/environment';

export class Properties {
  // QUESTION ENDPOINTS
  public static get QUESTIONS_ENDPOINT(): string {
    return environment.apiBaseUrl + '/questions';
  }

  public static get QUESTION_ENDPOINT(): string {
    return environment.apiBaseUrl + '/question';
  }

  public static get DELETE_QUESTION_ENDPOINT(): string {
    return environment.apiBaseUrl + '/question/id';
  }

  public static get QUESTIONS_CHAPTER_ENDPOINT(): string {
    return environment.apiBaseUrl + '/questions/chapter';
  }

  public static get CHAPTERS_ENDPOINT(): string {
    return environment.apiBaseUrl + '/chapters';
  }

  // USER ENDPOINTS
  public static get LOGIN_ENDPOINT(): string {
    return environment.apiBaseUrl + '/login';
  }

  public static get REFRESH_TOKEN_ENDPOINT(): string {
    return environment.apiBaseUrl + '/token/refresh';
  }
}
