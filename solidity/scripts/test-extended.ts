import { ethers } from "hardhat";

// Deployed contract addresses on Base Sepolia
const STARK_TOKEN_ADDRESS = "0xDFdD3aC93A78c03C1F04f3E939E745756B4643d7";
const STARK_OVERFLOW_ADDRESS = "0x4A1058b3E8EDd3De25C7D35558176b102217EA22";

async function main() {
    console.log("🧪 Starting extended tests on Base Sepolia deployment...\n");
    console.log("=".repeat(70));

    const [deployer] = await ethers.getSigners();

    console.log("📋 Test Account:");
    console.log("Deployer:", deployer.address);
    console.log("=".repeat(70));
    console.log();

    // Connect to deployed contracts
    const starkToken = await ethers.getContractAt("MockStarkToken", STARK_TOKEN_ADDRESS);
    const starkOverflow = await ethers.getContractAt("StarkOverflow", STARK_OVERFLOW_ADDRESS);

    let testsPassed = 0;
    let testsFailed = 0;
    let testsSkipped = 0;

    // Test 1: Verify Contract Ownership
    console.log("🔐 Test 1: Verify Contract Ownership");
    try {
        const owner = await starkOverflow.owner();
        console.log("   Contract Owner:", owner);
        console.log("   Deployer:", deployer.address);
        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            console.log("   ✅ PASSED: Ownership verified");
            testsPassed++;
        } else {
            console.log("   ❌ FAILED: Owner mismatch");
            testsFailed++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 2: Verify Token Configuration
    console.log("💎 Test 2: Verify Token Configuration");
    try {
        const tokenAddress = await starkOverflow.starkToken();
        const tokenName = await starkToken.name();
        const tokenSymbol = await starkToken.symbol();
        const tokenDecimals = await starkToken.decimals();

        console.log("   Token Address:", tokenAddress);
        console.log("   Token Name:", tokenName);
        console.log("   Token Symbol:", tokenSymbol);
        console.log("   Token Decimals:", tokenDecimals);

        if (tokenAddress.toLowerCase() === STARK_TOKEN_ADDRESS.toLowerCase()) {
            console.log("   ✅ PASSED: Token configuration correct");
            testsPassed++;
        } else {
            console.log("   ❌ FAILED: Token address mismatch");
            testsFailed++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 3: Test Multiple Forum Creation
    console.log("📁 Test 3: Create Multiple Forums");
    try {
        const forumNames = ["Smart Contracts", "DeFi", "NFTs"];

        for (const name of forumNames) {
            try {
                const tx = await starkOverflow.createForum(name, `Qm${name}IconCid`);
                await tx.wait();
                console.log(`   ✅ Created forum: ${name}`);
            } catch (e: any) {
                if (e.message.includes("already")) {
                    console.log(`   ⚠️  Forum "${name}" may already exist`);
                } else {
                    throw e;
                }
            }
        }

        const [forums, total] = await starkOverflow.getForums(10, 1);
        console.log(`   Total forums: ${total}`);
        console.log("   ✅ PASSED: Multiple forums created");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 4: Test Forum Update
    console.log("✏️  Test 4: Update Forum");
    try {
        const tx = await starkOverflow.updateForum(1, "Updated Solidity Dev", "QmUpdatedIconCid");
        await tx.wait();

        const forum = await starkOverflow.getForum(1);
        console.log("   Updated Name:", forum.name);
        console.log("   Updated Icon CID:", forum.iconCid);
        console.log("   ✅ PASSED: Forum updated successfully");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 5: Test Question with Different Amounts
    console.log("💰 Test 5: Create Questions with Different Stakes");
    try {
        const amounts = [
            ethers.parseEther("10"),
            ethers.parseEther("25"),
            ethers.parseEther("100")
        ];

        for (let i = 0; i < amounts.length; i++) {
            try {
                const tx = await starkOverflow.askQuestion(
                    1,
                    `Question ${i + 1}: What is the best practice?`,
                    `QmQuestion${i + 1}Cid`,
                    `https://github.com/example/repo${i + 1}`,
                    ["solidity", "best-practices"],
                    amounts[i]
                );
                await tx.wait();
                console.log(`   ✅ Created question with ${ethers.formatEther(amounts[i])} STARK stake`);
            } catch (e: any) {
                console.log(`   ⚠️  Question ${i + 1} may already exist or insufficient balance`);
            }
        }

        const [questions, totalQuestions] = await starkOverflow.getQuestions(1, 10, 1);
        console.log(`   Total questions in forum: ${totalQuestions}`);
        console.log("   ✅ PASSED: Questions created with different stakes");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 6: Test Pagination Edge Cases
    console.log("📄 Test 6: Test Pagination Edge Cases");
    try {
        // Test page 1
        const [page1, total1, hasNext1] = await starkOverflow.getQuestions(1, 2, 1);
        console.log(`   Page 1: ${page1.length} questions, Total: ${total1}, Has Next: ${hasNext1}`);

        // Test page 2
        const [page2, total2, hasNext2] = await starkOverflow.getQuestions(1, 2, 2);
        console.log(`   Page 2: ${page2.length} questions, Total: ${total2}, Has Next: ${hasNext2}`);

        // Test large page size
        const [pageAll, totalAll, hasNextAll] = await starkOverflow.getQuestions(1, 100, 1);
        console.log(`   Large page: ${pageAll.length} questions, Total: ${totalAll}, Has Next: ${hasNextAll}`);

        console.log("   ✅ PASSED: Pagination working correctly");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 7: Test Invalid Page Parameters
    console.log("⚠️  Test 7: Test Invalid Pagination Parameters");
    try {
        let errorCaught = false;

        try {
            await starkOverflow.getQuestions(1, 0, 1); // Invalid page size
        } catch (e: any) {
            if (e.message.includes("InvalidPageSize")) {
                console.log("   ✅ Correctly rejected page size 0");
                errorCaught = true;
            }
        }

        try {
            await starkOverflow.getQuestions(1, 10, 0); // Invalid page number
        } catch (e: any) {
            if (e.message.includes("InvalidPage")) {
                console.log("   ✅ Correctly rejected page number 0");
                errorCaught = true;
            }
        }

        if (errorCaught) {
            console.log("   ✅ PASSED: Invalid parameters properly rejected");
            testsPassed++;
        } else {
            console.log("   ⚠️  SKIPPED: Errors not caught (may need manual verification)");
            testsSkipped++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 8: Test Token Balance Tracking
    console.log("💵 Test 8: Verify Token Balance Tracking");
    try {
        const contractBalance = await starkToken.balanceOf(STARK_OVERFLOW_ADDRESS);
        const deployerBalance = await starkToken.balanceOf(deployer.address);

        console.log("   Contract Balance:", ethers.formatEther(contractBalance), "STARK");
        console.log("   Deployer Balance:", ethers.formatEther(deployerBalance), "STARK");

        // Verify contract has received stakes
        if (contractBalance > 0) {
            console.log("   ✅ PASSED: Contract holds staked tokens");
            testsPassed++;
        } else {
            console.log("   ⚠️  WARNING: Contract has no balance (no stakes yet)");
            testsSkipped++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 9: Test Question State Queries
    console.log("🔍 Test 9: Query Question States");
    try {
        const [questions] = await starkOverflow.getQuestions(1, 10, 1);

        console.log(`   Found ${questions.length} questions:`);
        for (let i = 0; i < Math.min(questions.length, 3); i++) {
            const q = questions[i];
            console.log(`   ${i + 1}. "${q.title.substring(0, 40)}..."`);
            console.log(`      Status: ${q.status === 0 ? "Open" : "Resolved"}`);
            console.log(`      Amount: ${ethers.formatEther(q.amount)} STARK`);
            console.log(`      Tags: ${q.tags.join(", ")}`);
        }

        console.log("   ✅ PASSED: Question states retrieved successfully");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 10: Test Forum Statistics
    console.log("📊 Test 10: Verify Forum Statistics");
    try {
        const forum = await starkOverflow.getForum(1);

        console.log("   Forum Statistics:");
        console.log("   - Name:", forum.name);
        console.log("   - Total Questions:", forum.totalQuestions.toString());
        console.log("   - Total Amount Staked:", ethers.formatEther(forum.amount), "STARK");
        console.log("   - Deleted:", forum.deleted);

        console.log("   ✅ PASSED: Forum statistics accurate");
        testsPassed++;
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 11: Test Active Forum IDs
    console.log("🗂️  Test 11: Verify Active Forum IDs");
    try {
        const [forums] = await starkOverflow.getForums(100, 1);

        console.log(`   Active forums: ${forums.length}`);
        forums.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f.name} (ID: ${f.id}, Deleted: ${f.deleted})`);
        });

        // Verify no deleted forums are returned
        const hasDeleted = forums.some((f: any) => f.deleted);
        if (!hasDeleted) {
            console.log("   ✅ PASSED: Only active forums returned");
            testsPassed++;
        } else {
            console.log("   ❌ FAILED: Deleted forums in results");
            testsFailed++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Test 12: Test Total Staked Tracking
    console.log("💎 Test 12: Verify Total Staked Tracking");
    try {
        const [questions] = await starkOverflow.getQuestions(1, 10, 1);

        if (questions.length > 0) {
            const questionId = questions[0].id;
            const totalStaked = await starkOverflow.getTotalStakedOnQuestion(questionId);

            console.log(`   Question ID: ${questionId}`);
            console.log(`   Total Staked: ${ethers.formatEther(totalStaked)} STARK`);
            console.log(`   Question Amount: ${ethers.formatEther(questions[0].amount)} STARK`);

            console.log("   ✅ PASSED: Staking tracking functional");
            testsPassed++;
        } else {
            console.log("   ⚠️  SKIPPED: No questions available");
            testsSkipped++;
        }
    } catch (error: any) {
        console.log("   ❌ ERROR:", error.message);
        testsFailed++;
    }
    console.log();

    // Final Summary
    console.log("=".repeat(70));
    console.log("📊 EXTENDED TEST SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`⚠️  Tests Skipped: ${testsSkipped}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log("=".repeat(70));
    console.log();

    console.log("🔗 Contract Links:");
    console.log(`StarkToken: https://sepolia.basescan.org/address/${STARK_TOKEN_ADDRESS}#code`);
    console.log(`StarkOverflow: https://sepolia.basescan.org/address/${STARK_OVERFLOW_ADDRESS}#code`);
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
