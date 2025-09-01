# AI Roadmap Test Scenarios for Small Businesses

## Overview

This test suite provides **very specific, niche small business scenarios** designed to thoroughly test your AI roadmap generation capabilities. Unlike generic test cases, these scenarios focus on real pain points that small businesses face in specialized industries.

## What Makes These Test Cases Special

### 1. **Hyper-Specific Industry Challenges**
- **Veterinary clinic** with appointment no-shows costing $180 per slot
- **Food truck** with 20% waste and manual inventory guesswork  
- **Mobile pet grooming** with 150+ daily driving miles
- **Escape room business** with inconsistent game resets
- **Specialty coffee roastery** with paper roasting logs
- **Wedding photographer** editing 40+ hours per wedding

### 2. **Realistic Financial Metrics**
Each scenario includes:
- Actual dollar amounts of current losses
- Specific time waste (e.g., "2 hours daily on reminder calls")
- Realistic ROI expectations
- Implementation cost ranges appropriate for small businesses

### 3. **Niche Pain Points**
- **Craft brewery**: Multi-format inventory (kegs, cans, growlers) + TTB compliance
- **Specialty pharmacy**: Prior authorization delays affecting patient outcomes
- **HVAC dispatch**: Technicians waste 3-4 hours daily driving between jobs
- **Law firm**: Attorneys spending 40% of time on document review

## How to Use

### Option 1: Manual Testing
1. Open your AI assessment tool
2. Use the test inputs from `test-cases-small-business.json`
3. Compare AI output against expected outcomes

### Option 2: Automated Testing
1. Navigate to `/test-scenarios` in your app
2. Run individual tests or the full suite
3. Get scored results with specific feedback

### Option 3: API Testing
```typescript
import { nicheBusinessScenarios, validateAIResponse } from '@/test-data/niche-business-scenarios'

// Test a specific scenario
const scenario = nicheBusinessScenarios[0] // Coffee roastery
const aiResponse = await yourAIFunction(scenario)
const validation = validateAIResponse(scenario, aiResponse)
console.log(`Score: ${validation.score}%`, validation.feedback)
```

## Test Categories

### High-Waste Scenarios
Perfect for testing waste reduction and inventory optimization:
- Veterinary appointment no-shows
- Food truck inventory waste  
- Bakery daily waste

### Route Optimization
Test logistics and scheduling AI:
- HVAC dispatch chaos
- Mobile pet grooming routes
- Cleaning service inefficiency

### Document-Heavy Processes  
Test document automation capabilities:
- Dental insurance verification
- Law firm document review
- Specialty pharmacy prior auths

### Manual Tracking Issues
Test process automation:
- Landscaping crew scheduling
- Auto repair parts lookup
- Craft brewery inventory

## Validation Criteria

The AI should:

### ✅ **Identify Specific Pain Points**
- Recognize the exact problem (e.g., "appointment no-shows" not just "scheduling")
- Understand industry context (veterinary vs. general medical)
- Quantify the impact correctly

### ✅ **Recommend Appropriate Tools**
- Suggest tools sized for small businesses (not enterprise solutions)
- Stay within realistic budget ranges
- Consider implementation complexity

### ✅ **Provide Realistic ROI**
- Conservative estimates that account for small business constraints
- Reasonable payback periods (typically 3-12 months)
- Factor in training and adoption time

### ✅ **Prioritize Correctly**
- Address the "most urgent" problem first
- Identify genuine quick wins
- Sequence implementation logically

## Expected AI Performance

### Excellent (80-100%)
- Identifies all key pain points
- Recommends perfectly sized solutions
- ROI calculations within expected range
- Clear implementation priorities

### Good (60-79%)
- Catches most pain points
- Some tool recommendations appropriate
- ROI in reasonable ballpark
- Generally logical priorities

### Needs Work (<60%)
- Misses key pain points
- Recommends oversized/undersized solutions
- ROI calculations way off
- Poor prioritization

## Real-World Validation

These scenarios are based on actual small businesses. The AI should:

1. **Understand Context**: A food truck's inventory needs are different from a restaurant's
2. **Scale Appropriately**: Don't recommend $50K enterprise software for a 5-person business
3. **Consider Constraints**: Small businesses have limited training time and budgets
4. **Be Practical**: Solutions must work with existing staff and processes

## Integration with Your App

### Quick Integration
Add this to your existing InlineAIAudit component:
```tsx
import { nicheBusinessScenarios } from '@/test-data/niche-business-scenarios'

// Add test case buttons
{process.env.NODE_ENV === 'development' && (
  <div className="test-cases">
    {nicheBusinessScenarios.slice(0, 3).map(scenario => (
      <button key={scenario.id} onClick={() => loadTestCase(scenario)}>
        Test: {scenario.businessName}
      </button>
    ))}
  </div>
)}
```

### Full Test Suite
Visit `/test-scenarios` for the complete testing interface with:
- Automated test running
- Scoring and feedback
- Performance metrics
- Batch testing capabilities

## Why These Tests Matter

Generic test cases like "reduce costs" or "improve efficiency" don't reveal if your AI truly understands business contexts. These niche scenarios test:

- **Domain Knowledge**: Does the AI understand industry-specific challenges?
- **Scale Sensitivity**: Can it distinguish between startup and enterprise needs?
- **Practical Wisdom**: Does it recommend realistic, implementable solutions?
- **ROI Accuracy**: Are financial projections grounded in reality?

Your AI should excel at helping a mobile pet groomer optimize routes, not just suggest "use scheduling software."

## Contributing New Scenarios

To add new test scenarios:

1. Focus on **very specific** business contexts
2. Include **real financial metrics** 
3. Describe **niche pain points** unique to that industry
4. Set **realistic expectations** for outcomes
5. Consider **small business constraints** (time, money, expertise)

The goal is to create scenarios so specific that only truly intelligent AI can provide valuable recommendations.

