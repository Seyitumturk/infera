import TestScenarioRunner from '@/components/TestScenarioRunner'

export default function TestScenariosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06080a] via-[#0a0c10] to-[#06080a]">
      <div className="container mx-auto py-8">
        <TestScenarioRunner />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'AI Test Scenarios - Infera',
  description: 'Test AI roadmap generation with realistic small business scenarios'
}

