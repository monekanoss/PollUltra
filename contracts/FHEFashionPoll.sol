// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHEVM çekirdek importları (ad alanları sürüme göre değişebilir)
import { FHE, euint8, euint64, ebool, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEFashionPoll is SepoliaConfig {
    // Şifreli sayaçlar
    euint64 private yesCount;
    euint64 private noCount;

    // Sybil/çoklu oy engeli (public, şeffaf olabilir)
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter);

    /// @notice Oy ver (choice: 0=No, 1=Yes). İstemcide şifrelenmiş external giriş ve attestation gönderilir.
    function vote(externalEuint8 encChoice, bytes calldata attestation) external {
        require(!hasVoted[msg.sender], "Already voted");

        // Dış (frontend) şifreli girdiyi sözleşme içinde doğrulanmış euint8'e çevir
        euint8 choice = FHE.fromExternal(encChoice, attestation);

        // choice == 1 ? yes++ : no++ (şifreli koşullu seçim)
        ebool isYes = FHE.eq(choice, FHE.asEuint8(1));

        // CMUX / select benzeri koşullu toplama
        // yesCount += isYes ? 1 : 0
        yesCount = FHE.add(yesCount, FHE.select(isYes, FHE.asEuint64(1), FHE.asEuint64(0)));
        // Bir sonraki işlem çağrılarında bu ciphertext üzerinde homomorfik işlem yapma izni
        FHE.allow(yesCount, address(this));

        // noCount += isYes ? 0 : 1
        noCount = FHE.add(noCount, FHE.select(isYes, FHE.asEuint64(0), FHE.asEuint64(1)));
        FHE.allow(noCount, address(this));

        hasVoted[msg.sender] = true;
        emit Voted(msg.sender);
    }

    /// @notice Şifreli toplamları döndür (UI tarafında reencrypt veya açığa alma akışı kullanılabilir)
    function getTallies() external view returns (euint64 yes, euint64 no) {
        return (yesCount, noCount);
    }

    // İsteğe bağlı: Asenkron decryption isteği akışı (Relayer/KMS ile)
    // function requestReveal() external { ... }
}

    


