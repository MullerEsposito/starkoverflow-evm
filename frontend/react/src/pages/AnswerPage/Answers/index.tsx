import { CheckCircle, ThumbsDown, ThumbsUp } from "phosphor-react"
import { UserAvatar } from "../styles"
import { AnswerContent, AnswerDivider, AnswerFooter, AnswerHeader, AnswerItem, AnswersContainer, AnswersList, CorrectAnswerBadge, MarkCorrectButton, PaginationButton, PaginationContainer, SortingOptions, SortOption, VoteButton, VoteContainer, VoteCount } from "./styles"
import * as React from "react"
import { useContext, useState, Suspense, useEffect } from "react"

import { shortenAddress } from "@utils/shortenAddress"

import { AnswersContext } from "../hooks/useAnswers/answersContext"

import type { Question, Answer } from "@app-types/index"
import { useWallet } from "@hooks/useWallet"
import { useStatusMessage } from "@hooks/useStatusMessage"
import { useContract } from "@hooks/useContract"

const ReactMarkdown = React.lazy(() => import("react-markdown"))
const remarkGfm = await import("remark-gfm").then((mod) => mod.default || mod)

interface AnswerRowProps {
  answer: Answer
  isQuestionAuthor: boolean
  questionIsOpen: boolean
  handleVote: (answerId: string, direction: "up" | "down") => void
  handleMarkCorrect: (answerId: string) => void
}

function AnswerRow({ answer, isQuestionAuthor, questionIsOpen, handleVote, handleMarkCorrect }: AnswerRowProps) {
  const [content, setContent] = useState<string>("")

  useEffect(() => {
    const fetchContent = async () => {
      if (!answer.content) {
        setContent("")
        return
      }

      if (answer.content.startsWith("http")) {
        try {
          const response = await fetch(answer.content)
          const contentType = response.headers.get("content-type")

          if (contentType && contentType.startsWith("image/")) {
            // If it's an image, render it as an image
            setContent(`![Answer Image](${answer.content})`)
          } else if (response.ok) {
            const text = await response.text()
            setContent(text)
          } else {
            setContent(answer.content)
          }
        } catch (error) {
          console.error("Failed to fetch answer content:", error)
          setContent(answer.content)
        }
      } else {
        setContent(answer.content)
      }
    }

    fetchContent()
  }, [answer.content])

  return (
    <AnswerItem $isCorrect={answer.isCorrect}>
      <AnswerHeader>
        <UserAvatar
          src={`https://avatars.dicebear.com/api/identicon/${answer.authorAddress}.svg`}
          alt={answer.authorName}
        />
        <div>
          <span>{answer.authorName}</span>
          <small>{shortenAddress(answer.authorAddress)}</small>
          <time>{answer.timestamp}</time>
        </div>
        {answer.isCorrect && (
          <CorrectAnswerBadge>
            <CheckCircle size={16} weight="fill" />
            Correct Answer
          </CorrectAnswerBadge>
        )}
      </AnswerHeader>

      <AnswerContent>
        <Suspense fallback={<p>Loading content...</p>}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ ...props }) => (
                <img
                  src={props.src || "/placeholder.svg"}
                  alt={props.alt || ""}
                  style={{ maxWidth: "100%", borderRadius: "4px", margin: "8px 0" }}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </Suspense>
      </AnswerContent>
      <AnswerFooter>
        <VoteContainer>
          <VoteButton onClick={() => handleVote(answer.id, "up")}>
            <ThumbsUp size={16} />
          </VoteButton>
          <VoteCount>{answer.votes}</VoteCount>
          <VoteButton onClick={() => handleVote(answer.id, "down")}>
            <ThumbsDown size={16} />
          </VoteButton>
        </VoteContainer>

        {isQuestionAuthor && questionIsOpen && !answer.isCorrect && (
          <MarkCorrectButton onClick={() => handleMarkCorrect(answer.id)}>Mark as Correct</MarkCorrectButton>
        )}
      </AnswerFooter>
      <AnswerDivider />
    </AnswerItem>
  )
}

interface AnswersProps {
  question: Question
  setQuestion: React.Dispatch<React.SetStateAction<Question | null>>
}

export function Answers({ question, setQuestion }: AnswersProps) {
  const [sortBy, setSortBy] = useState<"votes" | "date">("votes")
  const [currentPage, setCurrentPage] = useState(1)
  const { isConnected, address, openConnectModal } = useWallet()

  const { answers, setAnswers } = useContext(AnswersContext)
  const { setStatusMessage } = useStatusMessage()
  const { markAnswerAsCorrect } = useContract()

  // Sort answers based on selected option
  const sortedAnswers = [...answers].sort((a, b) => {
    if (sortBy === "votes") {
      return b.votes - a.votes
    } else {
      // Simple date sorting for mock data
      return a.timestamp.includes("Today") && !b.timestamp.includes("Today") ? -1 : 1
    }
  })

  const handleMarkCorrect = async (answerId: string) => {
    if (!isConnected) {
      openConnectModal()
      return
    }

    // Check if user is the question author
    const isQuestionAuthor = address && address.toLowerCase() === question.authorAddress.toLowerCase()
    if (!isQuestionAuthor) {
      setStatusMessage({
        type: "error",
        message: "Only the question author can mark an answer as correct.",
      })
      return
    }

    // Check if question is still open
    if (!question.isOpen) {
      setStatusMessage({
        type: "error",
        message: "This question has already been resolved.",
      })
      return
    }

    // Check if any answer is already marked as correct
    const hasCorrectAnswer = answers.some((answer) => answer.isCorrect)
    if (hasCorrectAnswer) {
      setStatusMessage({
        type: "error",
        message: "An answer has already been marked as correct for this question.",
      })
      return
    }

    setStatusMessage({ type: "info", message: "Processing transaction..." })

    try {
      const response = await markAnswerAsCorrect(question.id, answerId)

      if (response) {
        // Update answers state to mark the correct answer
        setAnswers(
          answers.map((answer) => ({
            ...answer,
            isCorrect: answer.id === answerId,
          })),
        )

        setStatusMessage({
          type: "success",
          message: "Answer marked as correct! Funds have been transferred to the responder.",
        })

        // Update question with new status 
        setQuestion(prevQuestion => {
          if (!prevQuestion) return null
          return {
            ...prevQuestion,
            isOpen: false,
          }
        })
      }
    } catch (error) {
      console.error("Transaction error:", error)

      let errorMessage = "Failed to mark answer as correct. Please try again."

      // Handle specific contract errors
      if (error instanceof Error) {
        if (error.message.includes("Only the author of the question can mark the answer as correct")) {
          errorMessage = "Only the question author can mark an answer as correct."
        } else if (error.message.includes("The question is already resolved")) {
          errorMessage = "This question has already been resolved."
        } else if (error.message.includes("The specified answer does not exist for this question")) {
          errorMessage = "The selected answer is not valid for this question."
        }
      }

      setStatusMessage({
        type: "error",
        message: errorMessage,
      })
    } finally {
      // Clear status message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: "" })
      }, 5000)
    }
  }

  const handleVote = async (answerId: string, direction: "up" | "down") => {
    if (!isConnected) {
      openConnectModal()
      return
    }

    setAnswers(
      answers.map((answer) => {
        if (answer.id === answerId) {
          return {
            ...answer,
            votes: direction === "up" ? answer.votes + 1 : answer.votes - 1,
          }
        }
        return answer
      }),
    )
  }

  const isQuestionAuthor = address && address.toLowerCase() === question.authorAddress.toLowerCase()

  return (
    <AnswersContainer>
      <h2>Answers</h2>
      <SortingOptions>
        <SortOption $active={sortBy === "votes"} onClick={() => setSortBy("votes")}>
          Votes
        </SortOption>
        <SortOption $active={sortBy === "date"} onClick={() => setSortBy("date")}>
          Date
        </SortOption>
      </SortingOptions>

      <AnswersList>
        {sortedAnswers.length === 0 ? (
          <p>No answers yet. Be the first to answer!</p>
        ) : (
          sortedAnswers.map((answer) => (
            <AnswerRow
              key={answer.id}
              answer={answer}
              isQuestionAuthor={!!isQuestionAuthor}
              questionIsOpen={question.isOpen}
              handleVote={handleVote}
              handleMarkCorrect={handleMarkCorrect}
            />
          ))
        )}
      </AnswersList>

      {answers.length > 5 && (
        <PaginationContainer>
          <PaginationButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </PaginationButton>
          <span>
            Page {currentPage} of {Math.ceil(answers.length / 5)}
          </span>
          <PaginationButton
            disabled={currentPage === Math.ceil(answers.length / 5)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </PaginationButton>
        </PaginationContainer>
      )}
    </AnswersContainer>
  )
}