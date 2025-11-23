import { SubmitButtonContainer } from "./styles"
import { useWallet } from "@hooks/useWallet";
import { shortenAddress } from "@utils/shortenAddress";
import { useAnswerEditor } from "../useAnswerEditor";
import { useContract } from "@hooks/useContract";
import { useState } from "react";

interface SubmitButtonProps {
  questionId: number;
}

export function SubmitButton({ questionId }: SubmitButtonProps) {
  const { openConnectModal, isConnected } = useWallet()
  const { submitAnswer, answersLoading, answersError } = useContract()
  const [txHash, setTxHash] = useState<string | null>(null)

  const {
    content,
    setContent,
    setActiveTab,
    setUploadedFiles,
    setError
  } = useAnswerEditor()

  const onAnswerSubmitted = (hash: string) => {
    setTxHash(hash)
    setContent("")
    setActiveTab("write")
    setUploadedFiles([])

    // Clear success message after 5 seconds
    setTimeout(() => {
      setTxHash(null)
    }, 5000)
  }

  const handleSubmit = async () => {
    // Validate content
    if (!content.trim()) {
      setError("Answer cannot be empty")
      return
    }

    // Check if user is connected
    if (!isConnected) {
      openConnectModal()
      return
    }

    setError(null)
    setTxHash(null)

    try {
      // Submit answer to contract
      const hash = await submitAnswer(questionId, content)

      if (hash) {
        onAnswerSubmitted(hash)
      } else {
        setError("Failed to submit answer. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err)
      setError("Failed to submit answer. Please try again")
    }
  }

  return (
    <SubmitButtonContainer
      onClick={handleSubmit}
      disabled={answersLoading}
    >
      {answersLoading ? "Submitting..." : "Submit Answer"}
      {answersError && (
        <span style={{ color: 'red', marginLeft: '10px', fontSize: '12px' }}>
          Error: {answersError}
        </span>
      )}
      {txHash && (
        <span style={{ color: 'green', marginLeft: '10px', fontSize: '12px' }}>
          Submitted! Tx: {shortenAddress(txHash)}
        </span>
      )}
    </SubmitButtonContainer>
  )
}