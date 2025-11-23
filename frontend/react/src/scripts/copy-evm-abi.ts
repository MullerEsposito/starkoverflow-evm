import fs from "fs";
import path from "path";

// Caminho da ABI gerada pelo Hardhat (a partir da raiz do projeto frontend)
const SOURCE_PATH = path.resolve("../../solidity/artifacts/src/StarkOverflow.sol/StarkOverflow.json");

// Caminho de destino dentro do frontend (usado pelo app React)
const DEST_PATH = path.resolve("./src/types/StarkOverflow.json");

function copyEvmAbi() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`❌ Arquivo de origem não encontrado em: ${SOURCE_PATH}`);
    process.exit(1);
  }

  const destDir = path.dirname(DEST_PATH);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(SOURCE_PATH, DEST_PATH);
  console.log(`✅ ABI EVM copiada para: ${DEST_PATH}`);
}

copyEvmAbi();
