export interface ContractForum {
  id: bigint;
  name: string;
  iconCid: string;
  amount: bigint;
  totalQuestions: bigint;
  deleted: boolean;
}

export interface ContractQuestion {
  id: bigint;
  forumId: bigint;
  title: string;
  author: string;
  descriptionCid: string;
  amount: bigint;
  repositoryUrl: string;
  tags: string[];
  status: number; // 0 for Open, 1 for Resolved
}

export interface ContractAnswer {
  id: bigint;
  author: string;
  descriptionCid: string;
  questionId: bigint;
  upvotes: bigint;
  downvotes: bigint;
}

export type Uint256 = bigint;
