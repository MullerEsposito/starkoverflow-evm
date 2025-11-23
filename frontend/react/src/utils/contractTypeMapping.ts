import { formatters } from "./formatters"
import { Question, Answer, Forum } from "@app-types/index"
import { ContractQuestion, ContractAnswer, ContractForum } from "../types/contract-types"
import { cidToUrl } from "./ipfs"


const generateMockTimestamp = (): string => {
  const randomHours = Math.floor(Math.random() * 48) // 0-48 hours ago

  if (randomHours < 1) {
    return "Just now"
  } else if (randomHours < 24) {
    return `${randomHours} hours ago`
  } else {
    const days = Math.floor(randomHours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

const generateMockRepository = (): string => {
  const repos = [
    "https://github.com/starkware-libs/cairo",
    "https://github.com/starknet-community/starknet-js",
    "https://github.com/xJonathanLEI/starkli",
    "https://github.com/MullerEsposito/stark_overflow",
    "",
  ]
  return repos[Math.floor(Math.random() * repos.length)]
}

const generateMockAuthorName = (address: string): string => {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"]
  const surnames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

  // Use address to generate consistent name for same address
  const nameIndex = parseInt(address.slice(-2), 16) % names.length
  const surnameIndex = parseInt(address.slice(-4, -2), 16) % surnames.length

  return `${names[nameIndex]} ${surnames[surnameIndex]}`
}

export const contractQuestionToFrontend = (contractQuestion: ContractQuestion): Question => {
  const authorAddress = contractQuestion.author
  const status = contractQuestion.status === 0 ? "Open" : "Resolved"
  const authorName = generateMockAuthorName(authorAddress)
  const decimalValue = formatters.weiToEther(contractQuestion.amount)

  return {
    id: contractQuestion.id.toString(),
    title: contractQuestion.title,
    content: cidToUrl(contractQuestion.descriptionCid),
    authorAddress: authorAddress,
    authorAvatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${authorAddress}`,
    authorName,
    timestamp: generateMockTimestamp(),
    stakeAmount: decimalValue,
    tags: contractQuestion.tags || [],
    repositoryUrl: contractQuestion.repositoryUrl || generateMockRepository(),
    isOpen: status === "Open",
  }
}

export const contractAnswerToFrontend = (contractAnswer: ContractAnswer, isCorrect = false): Answer => {
  const authorAddress = contractAnswer.author
  const authorName = generateMockAuthorName(authorAddress)

  return {
    id: contractAnswer.id.toString(),
    authorAddress: authorAddress,
    authorName,
    content: cidToUrl(contractAnswer.descriptionCid),
    timestamp: generateMockTimestamp(),
    isCorrect,
    votes: Number(contractAnswer.upvotes) - Number(contractAnswer.downvotes),
  }
}

export const contractForumToFrontend = (contractForum: ContractForum): Forum => {
  return {
    id: contractForum.id.toString(),
    name: contractForum.name,
    icon_url: cidToUrl(contractForum.iconCid),
    amount: formatters.weiToEther(contractForum.amount),
    total_questions: Number(contractForum.totalQuestions),
  }
}
