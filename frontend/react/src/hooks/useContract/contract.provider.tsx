import { useState, ReactNode, useCallback } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { ContractContext } from './contract.context'
import { formatters } from '@utils/formatters'
import { contractAnswerToFrontend, contractQuestionToFrontend, contractForumToFrontend } from '@utils/contractTypeMapping'
import { uploadText } from '@utils/ipfsUpload'
import { ERROR_MESSAGES } from './errors'
import { ContractState, Question, Answer, Forum } from '@app-types/index'
import { ContractQuestion, ContractAnswer, ContractForum } from '@app-types/contract-types'
import StarkOverflowArtifact from '@app-types/StarkOverflow.json'

// Define the ABI type
const ABI = StarkOverflowArtifact.abi

interface ContractProviderProps {
  children: ReactNode
}

export function ContractProvider({ children }: ContractProviderProps) {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [questionState, setQuestionState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [questionsState, setQuestionsState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [answersState, setAnswersState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [markCorrectState, setMarkCorrectState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [stakingState, setStakingState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [forumsState, setForumsState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const [ownerState, setOwnerState] = useState<ContractState>({
    isLoading: false,
    error: null,
    transactionHash: null
  })

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`

  // Helper to handle transaction execution and state updates
  const executeTransaction = async (
    action: () => Promise<`0x${string}`>,
    setState: (state: ContractState) => void,
    errorMessage: string
  ): Promise<string | null> => {
    if (!isConnected) {
      setState({ isLoading: false, error: "Wallet not connected", transactionHash: null })
      return null
    }

    setState({ isLoading: true, error: null, transactionHash: null })
    try {
      const hash = await action()
      setState({ isLoading: false, error: null, transactionHash: hash })
      return hash
    } catch (error) {
      const msg = error instanceof Error ? error.message : errorMessage
      setState({ isLoading: false, error: msg, transactionHash: null })
      return null
    }
  }

  // Question functions
  const fetchQuestions = useCallback(async (forumId: string, page: number, pageSize: number): Promise<{
    questions: Question[],
    totalQuestions: number,
    hasNextPage: boolean
  }> => {
    if (!publicClient || !contractAddress) {
      setQuestionsState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return { questions: [], totalQuestions: 0, hasNextPage: false }
    }

    setQuestionsState({ isLoading: true, error: null, transactionHash: null })
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'getQuestions',
        args: [BigInt(forumId), BigInt(pageSize), BigInt(page)]
      }) as [ContractQuestion[], bigint, boolean]

      const [contractQuestions, totalQuestions, hasNextPage] = result

      const questions = contractQuestions.map(contractQuestion => contractQuestionToFrontend(contractQuestion))

      setQuestionsState({ isLoading: false, error: null, transactionHash: null })
      return { questions, totalQuestions: Number(totalQuestions), hasNextPage }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch questions"
      setQuestionsState({ isLoading: false, error: errorMessage, transactionHash: null })
      return { questions: [], totalQuestions: 0, hasNextPage: false }
    }
  }, [publicClient, contractAddress])

  const fetchQuestion = useCallback(async (questionId: number): Promise<Question | null> => {
    if (!publicClient || !contractAddress) {
      setQuestionState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return null
    }

    setQuestionState({ isLoading: true, error: null, transactionHash: null })

    try {
      const [contractQuestion, totalStaked] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: ABI,
          functionName: 'getQuestion',
          args: [BigInt(questionId)]
        }) as Promise<ContractQuestion>,
        publicClient.readContract({
          address: contractAddress,
          abi: ABI,
          functionName: 'getTotalStakedOnQuestion',
          args: [BigInt(questionId)]
        }) as Promise<bigint>
      ])

      if (!contractQuestion.descriptionCid || !contractQuestion.id) {
        setQuestionState({ isLoading: false, error: ERROR_MESSAGES.QUESTION_NOT_FOUND, transactionHash: null })
        return null
      }

      const question = contractQuestionToFrontend(contractQuestion)
      question.stakeAmount = formatters.weiToEther(totalStaked)
      setQuestionState({ isLoading: false, error: null, transactionHash: null })
      return question
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_QUESTION_FAILED
      setQuestionState({ isLoading: false, error: errorMessage, transactionHash: null })
      return null
    }
  }, [publicClient, contractAddress])

  const fetchAnswers = useCallback(async (questionId: number): Promise<Answer[]> => {
    if (!publicClient || !contractAddress) {
      setAnswersState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return []
    }

    setAnswersState({ isLoading: true, error: null, transactionHash: null })

    try {
      const [result, correctAnswerId] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: ABI,
          functionName: 'getAnswers',
          args: [BigInt(questionId), BigInt(100), BigInt(1)] // Assuming pagination, fetching first 100
        }) as Promise<[ContractAnswer[], bigint, boolean]>,
        publicClient.readContract({
          address: contractAddress,
          abi: ABI,
          functionName: 'getCorrectAnswer',
          args: [BigInt(questionId)]
        }).catch(() => BigInt(0)) as Promise<bigint>
      ])

      const [contractAnswers] = result

      const answers = contractAnswers.map((contractAnswer) =>
        contractAnswerToFrontend(
          contractAnswer,
          contractAnswer.id === correctAnswerId
        )
      )

      setAnswersState({ isLoading: false, error: null, transactionHash: null })
      return answers
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_ANSWERS_FAILED
      setAnswersState({ isLoading: false, error: errorMessage, transactionHash: null })
      return []
    }
  }, [publicClient, contractAddress])

  const markAnswerAsCorrect = useCallback(async (questionId: string, answerId: string): Promise<boolean> => {
    const hash = await executeTransaction(
      () => writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: 'markAnswerAsCorrect',
        args: [BigInt(questionId), BigInt(answerId)]
      }),
      setMarkCorrectState,
      "Failed to mark answer as correct"
    )
    return !!hash
  }, [writeContractAsync, contractAddress, isConnected])

  // Add funds to question
  const addFundsToQuestion = useCallback(async (questionId: number, amount: bigint): Promise<boolean> => {
    if (!isConnected) {
      setStakingState({ isLoading: false, error: "Wallet not connected", transactionHash: null })
      return false
    }

    setStakingState({ isLoading: true, error: null, transactionHash: null })

    try {
      // Approve
      const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`
      const erc20Abi = [{
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
        outputs: [{ name: '', type: 'bool' }]
      }]

      // 1. Approve
      await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractAddress, amount]
      })

      // 2. Stake
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: 'stakeOnQuestion',
        args: [BigInt(questionId), amount]
      })

      setStakingState({ isLoading: false, error: null, transactionHash: hash })
      return true
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add funds"
      setStakingState({ isLoading: false, error: msg, transactionHash: null })
      return false
    }
  }, [writeContractAsync, contractAddress, isConnected])

  // Get total staked amount on question
  const getTotalStakedOnQuestion = useCallback(async (questionId: number): Promise<number> => {
    if (!publicClient || !contractAddress) return 0

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'getTotalStakedOnQuestion',
        args: [BigInt(questionId)]
      }) as bigint
      return formatters.weiToEther(result)
    } catch (error) {
      console.error("Error fetching total staked amount:", error)
      return 0
    }
  }, [publicClient, contractAddress])

  // Check if an answer has already been marked as correct for a question
  const getCorrectAnswer = useCallback(async (questionId: string): Promise<string | null> => {
    if (!publicClient || !contractAddress) return null

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'getCorrectAnswer',
        args: [BigInt(questionId)]
      }) as bigint
      return result && result !== BigInt(0) ? result.toString() : null
    } catch (error) {
      console.error("Error fetching correct answer:", error)
      return null
    }
  }, [publicClient, contractAddress])

  // Forum functions
  const fetchForums = useCallback(async (): Promise<Forum[]> => {
    if (!publicClient || !contractAddress) {
      setForumsState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return []
    }

    setForumsState({ isLoading: true, error: null, transactionHash: null })

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'getForums',
        args: [BigInt(100), BigInt(1)] // Pagination args
      }) as [ContractForum[], bigint, boolean]

      const [contractForums] = result

      const forums = contractForums.map(contractForum => contractForumToFrontend(contractForum))

      setForumsState({ isLoading: false, error: null, transactionHash: null })
      return forums
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch forums"
      setForumsState({ isLoading: false, error: errorMessage, transactionHash: null })
      return []
    }
  }, [publicClient, contractAddress])

  const fetchForum = useCallback(async (forumId: string): Promise<Forum | null> => {
    if (!publicClient || !contractAddress) {
      setForumsState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return null
    }

    setForumsState({ isLoading: true, error: null, transactionHash: null })

    try {
      const contractForum = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'getForum',
        args: [BigInt(forumId)]
      }) as ContractForum

      if (!contractForum.id) {
        setForumsState({ isLoading: false, error: "Forum not found", transactionHash: null })
        return null
      }

      const forum = contractForumToFrontend(contractForum)
      setForumsState({ isLoading: false, error: null, transactionHash: null })
      return forum
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch forum"
      setForumsState({ isLoading: false, error: errorMessage, transactionHash: null })
      return null
    }
  }, [publicClient, contractAddress])

  const createForum = useCallback(async (name: string, iconUrl: string): Promise<string | null> => {
    return executeTransaction(
      () => writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: 'createForum',
        args: [name, iconUrl]
      }),
      setForumsState,
      "Failed to create forum"
    )
  }, [writeContractAsync, contractAddress, isConnected])

  const updateForum = useCallback(async (forumId: string, name: string, iconUrl: string): Promise<string | null> => {
    return executeTransaction(
      () => writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: 'updateForum',
        args: [BigInt(forumId), name, iconUrl]
      }),
      setForumsState,
      "Failed to update forum"
    )
  }, [writeContractAsync, contractAddress, isConnected])

  const deleteForum = useCallback(async (forumId: string): Promise<string | null> => {
    return executeTransaction(
      () => writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: 'deleteForum',
        args: [BigInt(forumId)]
      }),
      setForumsState,
      "Failed to delete forum"
    )
  }, [writeContractAsync, contractAddress, isConnected])

  const askQuestion = useCallback(async (forumId: number, title: string, description: string, tags: string[], amount: bigint, repositoryUrl: string): Promise<string | null> => {
    try {
      // Upload description to IPFS first
      setQuestionState({ isLoading: true, error: null, transactionHash: null })
      const descriptionCid = await uploadText(description, `question-${Date.now()}.md`)

      // Then send transaction with CID
      return executeTransaction(
        () => writeContractAsync({
          address: contractAddress,
          abi: ABI,
          functionName: 'askQuestion',
          args: [BigInt(forumId), title, descriptionCid, repositoryUrl, tags, amount]
        }),
        setQuestionState,
        "Failed to ask question"
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to upload question to IPFS"
      setQuestionState({ isLoading: false, error: msg, transactionHash: null })
      return null
    }
  }, [writeContractAsync, contractAddress, isConnected])

  const submitAnswer = useCallback(async (questionId: number, description: string): Promise<string | null> => {
    try {
      // Upload answer content to IPFS first
      setAnswersState({ isLoading: true, error: null, transactionHash: null })
      const contentCid = await uploadText(description, `answer-${Date.now()}.md`)

      // Then send transaction with CID
      return executeTransaction(
        () => writeContractAsync({
          address: contractAddress,
          abi: ABI,
          functionName: 'submitAnswer',
          args: [BigInt(questionId), contentCid]
        }),
        setAnswersState,
        "Failed to submit answer"
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to upload answer to IPFS"
      setAnswersState({ isLoading: false, error: msg, transactionHash: null })
      return null
    }
  }, [writeContractAsync, contractAddress, isConnected])

  const checkIsOwner = useCallback(async (): Promise<boolean> => {
    if (!publicClient || !contractAddress || !address) {
      setOwnerState({ isLoading: false, error: ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED, transactionHash: null })
      return false
    }

    setOwnerState({ isLoading: true, error: null, transactionHash: null })

    try {
      const ownerAddress = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'owner',
      }) as string

      const isOwner = ownerAddress.toLowerCase() === address.toLowerCase()

      setOwnerState({ isLoading: false, error: null, transactionHash: null })
      return isOwner
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check owner"
      setOwnerState({ isLoading: false, error: errorMessage, transactionHash: null })
      return false
    }
  }, [publicClient, contractAddress, address])

  const clearQuestionError = () => setQuestionState(prev => ({ ...prev, error: null }))
  const clearAnswersError = () => setAnswersState(prev => ({ ...prev, error: null }))
  const clearStakingError = () => setStakingState(prev => ({ ...prev, error: null }))
  const clearForumsError = () => setForumsState(prev => ({ ...prev, error: null }))
  const clearOwnerError = () => setOwnerState(prev => ({ ...prev, error: null }))

  return (
    <ContractContext.Provider value={{
      contract: null,
      contractReady: !!publicClient,
      isConnected,
      address,
      questionsLoading: questionsState.isLoading,
      questionsError: questionsState.error,
      questionLoading: questionState.isLoading,
      answersLoading: answersState.isLoading,
      questionError: questionState.error,
      answersError: answersState.error,
      markCorrectLoading: markCorrectState.isLoading,
      markCorrectError: markCorrectState.error,
      stakingLoading: stakingState.isLoading,
      stakingError: stakingState.error,
      forumsLoading: forumsState.isLoading,
      forumsError: forumsState.error,
      ownerLoading: ownerState.isLoading,
      ownerError: ownerState.error,
      fetchQuestions,
      fetchQuestion,
      fetchAnswers,
      fetchForums,
      fetchForum,
      createForum,
      updateForum,
      deleteForum,
      checkIsOwner,
      clearQuestionError,
      clearAnswersError,
      markAnswerAsCorrect,
      getCorrectAnswer,
      addFundsToQuestion,
      getTotalStakedOnQuestion,
      clearStakingError,
      clearForumsError,
      clearOwnerError,
      askQuestion,
      submitAnswer
    }}>
      {children}
    </ContractContext.Provider>
  )
}