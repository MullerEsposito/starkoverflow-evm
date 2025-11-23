import { createContext } from 'react'
import { Question, Answer, Forum } from '@app-types/index'

interface ContractContextType {
  contract: any | undefined
  contractReady: boolean
  isConnected: boolean | undefined
  address: string | undefined
  questionsLoading: boolean
  questionsError: string | null
  questionLoading: boolean
  answersLoading: boolean
  questionError: string | null
  answersError: string | null
  markCorrectLoading: boolean
  markCorrectError: string | null
  stakingLoading: boolean
  stakingError: string | null

  // Forum functions
  forumsLoading: boolean
  forumsError: string | null
  ownerLoading: boolean
  ownerError: string | null

  // Question functions
  fetchQuestions: (forumId: string, page: number, pageSize: number) => Promise<{
    questions: Question[],
    totalQuestions: number,
    hasNextPage: boolean
  }>
  fetchQuestion: (questionId: number) => Promise<Question | null>
  fetchAnswers: (questionId: number) => Promise<Answer[]>
  fetchForums: () => Promise<Forum[]>
  fetchForum: (forumId: string) => Promise<Forum | null>
  createForum: (name: string, iconUrl: string) => Promise<string | null>
  updateForum: (forumId: string, name: string, iconUrl: string) => Promise<string | null>
  deleteForum: (forumId: string) => Promise<string | null>
  checkIsOwner: () => Promise<boolean>
  clearQuestionError: () => void
  clearAnswersError: () => void
  markAnswerAsCorrect: (questionId: string, answerId: string) => Promise<boolean>
  getCorrectAnswer: (questionId: string) => Promise<string | null>
  addFundsToQuestion: (questionId: number, amount: bigint) => Promise<boolean>
  getTotalStakedOnQuestion: (questionId: number) => Promise<number>
  clearStakingError: () => void
  clearForumsError: () => void
  clearOwnerError: () => void
  askQuestion: (forumId: number, title: string, description: string, tags: string[], amount: bigint, repositoryUrl: string) => Promise<string | null>
  submitAnswer: (questionId: number, description: string) => Promise<string | null>
}

export const ContractContext = createContext<ContractContextType | undefined>(undefined)