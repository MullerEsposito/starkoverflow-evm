import { ethers } from "hardhat";

// Deployed contract addresses on Base Sepolia
const STARK_TOKEN_ADDRESS = "0xDFdD3aC93A78c03C1F04f3E939E745756B4643d7";
const STARK_OVERFLOW_ADDRESS = "0x4A1058b3E8EDd3De25C7D35558176b102217EA22";

async function main() {
    console.log("🧪 Starting comprehensive tests on Base Sepolia deployment...\n");

    const [deployer] = await ethers.getSigners();

    console.log("📋 Test Account:");
    console.log("Deployer:", deployer.address);
    console.log();

    // Connect to deployed contracts
    const starkToken = await ethers.getContractAt("MockStarkToken", STARK_TOKEN_ADDRESS);
    const starkOverflow = await ethers.getContractAt("StarkOverflow", STARK_OVERFLOW_ADDRESS);

    console.log("✅ Connected to deployed contracts");
    console.log("StarkToken:", STARK_TOKEN_ADDRESS);
    console.log("StarkOverflow:", STARK_OVERFLOW_ADDRESS);
    console.log();

    // Check initial balances
    console.log("💰 Initial Token Balances:");
    const deployerBalance = await starkToken.balanceOf(deployer.address);
    console.log("Deployer:", ethers.formatEther(deployerBalance), "STARK");
    console.log();

    // Approve spending
    console.log("✅ Approving token spending...");
    await starkToken.connect(deployer).approve(STARK_OVERFLOW_ADDRESS, ethers.MaxUint256);
    console.log("✅ Approval complete\n");

    // Test 1: Create Forum
    console.log("📁 Test 1: Creating Forum...");
    try {
        const tx1 = await starkOverflow.createForum("Solidity Development", "QmSolidityIconCid");
        await tx1.wait();

        const forum = await starkOverflow.getForum(1);
        console.log("✅ Forum created successfully!");
        console.log("   Name:", forum.name);
        console.log("   Icon CID:", forum.iconCid);
        console.log("   Deleted:", forum.deleted);
    } catch (error: any) {
        console.log("⚠️  Forum may already exist or error:", error.message);
    }
    console.log();

    // Test 2: Get Forums with Pagination
    console.log("📄 Test 2: Getting Forums (Pagination)...");
    try {
        const [forums, total, hasNext] = await starkOverflow.getForums(10, 1);
        console.log("✅ Retrieved forums:");
        console.log("   Total forums:", total.toString());
        console.log("   Has next page:", hasNext);
        console.log("   Forums on this page:", forums.length);
        forums.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f.name} (ID: ${f.id})`);
        });
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
    console.log();

    // Test 3: Ask Question
    console.log("❓ Test 3: Asking Question...");
    try {
        const questionAmount = ethers.parseEther("50");
        const tx2 = await starkOverflow.connect(deployer).askQuestion(
            1, // forumId
            "How to optimize gas in Solidity?",
            "QmQuestionDescriptionCid",
            "https://github.com/example/repo",
            ["solidity", "optimization", "gas"],
            questionAmount
        );
        await tx2.wait();

        const question = await starkOverflow.getQuestion(1);
        console.log("✅ Question created successfully!");
        console.log("   Title:", question.title);
        console.log("   Author:", question.author);
        console.log("   Amount:", ethers.formatEther(question.amount), "STARK");
        console.log("   Status:", question.status === 0 ? "Open" : "Resolved");
    } catch (error: any) {
        console.log("⚠️  Question may already exist or error:", error.message);
    }
    console.log();

    // Test 4: Stake on Question (Skipped for single account)
    console.log("💎 Test 4: Staking on Question...");
    console.log("⚠️  Skipped (requires multiple accounts for realistic testing)");
    console.log();

    // Test 5: Submit Answer
    console.log("💬 Test 5: Submitting Answer...");
    try {
        // For simplicity in this test, we'll use the deployer as the answerer.
        const tx4 = await starkOverflow.connect(deployer).submitAnswer(
            1,
            "QmAnswerDescriptionCid"
        );
        await tx4.wait();

        const answer = await starkOverflow.getAnswer(1);
        console.log("✅ Answer submitted successfully!");
        console.log("   Author:", answer.author);
        console.log("   Question ID:", answer.questionId.toString());
        console.log("   Upvotes:", answer.upvotes.toString());
        console.log("   Downvotes:", answer.downvotes.toString());
    } catch (error: any) {
        console.log("⚠️  Answer may already exist or error:", error.message);
    }
    console.log();

    // Test 6: Vote on Answer (Skipped - cannot vote on own answer)
    console.log("👍 Test 6: Voting on Answer...");
    console.log("⚠️  Skipped (cannot vote on own answer with single account)");
    console.log();

    // Test 7: Get Answers with Pagination
    console.log("📝 Test 7: Getting Answers (Pagination)...");
    try {
        const [answers, totalAnswers, hasNextPage] = await starkOverflow.getAnswers(1, 10, 1);
        console.log("✅ Retrieved answers:");
        console.log("   Total answers:", totalAnswers.toString());
        console.log("   Has next page:", hasNextPage);
        console.log("   Answers on this page:", answers.length);
        answers.forEach((a, i) => {
            console.log(`   ${i + 1}. Author: ${a.author.slice(0, 10)}... (Upvotes: ${a.upvotes}, Downvotes: ${a.downvotes})`);
        });
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
    console.log();

    // Test 8: Mark Answer as Correct (Skipped - would send rewards to self)
    console.log("✅ Test 8: Marking Answer as Correct...");
    console.log("⚠️  Skipped (deployer is both question and answer author)");
    console.log("   Note: This would work but rewards would go to the same account");
    console.log();

    // Test 9: Get User Info
    console.log("👤 Test 9: Getting User Information...");
    try {
        const answer = await starkOverflow.getAnswer(1);
        const user = await starkOverflow.getUser(answer.author);

        console.log("✅ User information:");
        console.log("   Address:", user.walletAddress);
        console.log("   Reputation:", user.reputation.toString());
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
    console.log();

    // Test 10: Get Questions with Pagination
    console.log("📋 Test 10: Getting Questions (Pagination)...");
    try {
        const [questions, totalQuestions, hasNextPage] = await starkOverflow.getQuestions(1, 10, 1);
        console.log("✅ Retrieved questions:");
        console.log("   Total questions:", totalQuestions.toString());
        console.log("   Has next page:", hasNextPage);
        console.log("   Questions on this page:", questions.length);
        questions.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q.title} (Amount: ${ethers.formatEther(q.amount)} STARK)`);
        });
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
    console.log();

    console.log("🎉 All tests completed!\n");

    // Final Summary
    console.log("=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log("Network: Base Sepolia");
    console.log("StarkToken:", STARK_TOKEN_ADDRESS);
    console.log("StarkOverflow:", STARK_OVERFLOW_ADDRESS);
    console.log("Deployer:", deployer.address);
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
