export interface User {
  userId?: string;
  name?: string;
  walletPublicKey?: string;
  signatureValue?: string;

  quizSessions?: string[];
  points?: number;
  avgAnswerTime?: number;
}

export interface Question {
  title?: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  type?: "mcq" | "type";
  questionId?: string;
  questionSetId?: string;
}

export interface Responce {
  responceId?: string;
  sessionId?: string;
  userId?: string;
  answers?: string[];
  pointsGiven?: number;
  startTime?: string;
  endTime?: string;
  questions?: string[];
  correctAnswers?: string[];
}

export interface QuizSession {
    quizSessionId?: string;
    userId?: string;
    questionIds?: string [];
    answerIds?: string [];
    currentIndex?: number;
    totalPoints?: number;
    ended?: boolean;
    startTime?: string;
    endTime?: string;
    responceId?: string;
    setId?: string;
    setTitle?: string;
    time?: string;
    imageUrl?: string;
}

export interface QuestionSetData {
  setId?:string;
  setTitle?:string;
  questionIds?: string [];
  approved?: boolean;
  imageUrl?: string;
  category?: string;
  byUserId?: string;
}
