// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PersonalityCalculator {
    enum Attribute {Quickness, Strength, Focus, Intelligence}

    enum Personality {
        Naive, Rash, Hasty, QuickWitted, // 천진난만한, 덜렁대는, 성급한, 눈치빠른
        Brave, Quirky, Adamant, Bold,   // 용감한, 변덕쟁이, 고집있는, 대담한
        Quiet, Calm, Careful, Hardy,    // 냉정한, 차분한, 신중한, 노력하는
        Docile, Bashful, Lax, Smart     // 온순한, 수줍은, 촐랑대는, 똑똑한
    }

    struct Attributes {
        uint256 quickness;
        uint256 strength;
        uint256 focus;
        uint256 intelligence;
    }

    struct TrainingData {
        uint256 lastTrainingDate;
        uint256 trainingCount;
    }

    mapping(uint256 => Attributes) internal attributes;
    mapping(uint256 => TrainingData) internal trainingData;

    uint256 private constant MAX_DAILY_TRAINING = 3;

    function trainAttribute(uint256 tokenId, Attribute attribute) external {
        uint256 currentDate = block.timestamp / 1 days;

        if(trainingData[tokenId].lastTrainingDate < currentDate) {
            trainingData[tokenId].lastTrainingDate = currentDate;
            trainingData[tokenId].trainingCount = 0;
        }

        require(trainingData[tokenId].trainingCount < MAX_DAILY_TRAINING, "Training limit reached for today");
        trainingData[tokenId].trainingCount += 1;
        
        if(attribute == Attribute.Quickness) {
            attributes[tokenId].quickness++;
        } else if(attribute == Attribute.Strength) {
            attributes[tokenId].strength;
        } else if(attribute == Attribute.Focus) {
            attributes[tokenId].focus;
        } else if(attribute == Attribute.Intelligence) {
            attributes[tokenId].intelligence++;
        }
    }

    function determinePersonality(uint256 tokenId) internal view returns (Personality){
        uint256 quickness = attributes[tokenId].quickness;
        uint256 strength = attributes[tokenId].strength;
        uint256 focus = attributes[tokenId].focus;
        uint256 intelligence = attributes[tokenId].intelligence;

        uint256[] memory values = new uint256[](4);
        values[0] = quickness;
        values[1] = strength;
        values[2] = focus;
        values[3] = intelligence;

        (uint256 maxCount, uint256 minCount, uint256[] memory maxIndices, uint256[] memory minIndices) = _getMaxMinIndices(values);

        if(maxCount > 1) {
            return _randomPersonality(maxIndices);
        }

        if(maxIndices[0] == uint256(Attribute.Quickness)) {
            return _personalityForQuicknessMin(minIndices,minCount);
        } else if(maxIndices[1] == uint256(Attribute.Strength)) {
            return _personalityForStrengthMin(minIndices, minCount);
        } else if(maxIndices[2] == uint256(Attribute.Focus)) {
            return _personalityForFocusMin(minIndices, minCount);
        } else if(maxIndices[3] == uint256(Attribute.Intelligence)) {
            return _personalityForIntelligenceMin(minIndices, minCount);
        }
        revert("No personality found");
    }

    function _getMaxMinIndices(uint256[] memory values) internal pure returns (uint256 maxCount, uint256 minCount, uint256[] memory maxIndices, uint256[] memory minIndices) {
        uint256 maxValue = 0;
        uint256 minValue = type(uint256).max;

        maxIndices = new uint256[](4);
        minIndices = new uint256[](4);

        for(uint i = 0; i < values.length; i++) {
            if(values[i] > maxValue) {
                maxValue = values[i];
                maxCount = 1;
                maxIndices[0] = i;
            } else if(values[i] == maxValue){
                maxIndices[maxCount] = i;
                maxCount++;
            }

            if(values[i] < minValue) {
                minValue = values[i];
                minCount = 1;
                minIndices[0] = i;
            } else if(values[i] == minValue) {
                minIndices[minCount] = i;
                minCount++;
            }
        }
    }

    function _randomPersonality(uint256[] memory indices) internal view returns (Personality) {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % indices.length;
        uint256 selected = indices[rand];

        if (selected == uint256(Attribute.Quickness)) {
            return Personality.QuickWitted;
        } else if (selected == uint256(Attribute.Strength)) {
            return Personality.Bold;
        } else if (selected == uint256(Attribute.Focus)) {
            return Personality.Hardy;
        } else {
            return Personality.Smart;
        }
    }

    function _personalityForQuicknessMin(uint256[] memory minIndices, uint256 minCount) internal pure returns(Personality) {
        if(minCount > 1) return Personality.QuickWitted;

        if(minIndices[0] == uint256(Attribute.Strength)) return Personality.Naive;
        if(minIndices[0] == uint256(Attribute.Focus)) return Personality.Rash;
        if(minIndices[0] == uint256(Attribute.Intelligence)) return Personality.Hasty;

        revert("Invalid min index");
    }

    function _personalityForStrengthMin(uint256[] memory minIndices, uint256 minCount) internal pure returns(Personality) {
        if (minCount > 1) return Personality.Bold;

        if (minIndices[0] == uint256(Attribute.Quickness)) return Personality.Brave;
        if (minIndices[0] == uint256(Attribute.Focus)) return Personality.Quirky;
        if (minIndices[0] == uint256(Attribute.Intelligence)) return Personality.Adamant;

        revert("Invalid min index");
    }

    function _personalityForFocusMin(uint256[] memory minIndices, uint256 minCount) internal pure returns (Personality) {
        if (minCount > 1) return Personality.Hardy;

        if (minIndices[0] == uint256(Attribute.Quickness)) return Personality.Quiet;
        if (minIndices[0] == uint256(Attribute.Strength)) return Personality.Calm;
        if (minIndices[0] == uint256(Attribute.Intelligence)) return Personality.Careful;

        revert("Invalid min index");
    }

    function _personalityForIntelligenceMin(uint256[] memory minIndices, uint256 minCount) internal pure returns (Personality) {
        if (minCount > 1) return Personality.Smart;

        if (minIndices[0] == uint256(Attribute.Quickness)) return Personality.Docile;
        if (minIndices[0] == uint256(Attribute.Strength)) return Personality.Bashful;
        if (minIndices[0] == uint256(Attribute.Focus)) return Personality.Lax;

        revert("Invalid min index");
    }
}
