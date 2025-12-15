<script setup lang="ts">
// Sample data for testing your blueprint component
const sampleData = {
  title: "Component Assembly",
  subtitle: "Primary structural element with integrated mounting system",
  content: "All dimensions in millimeters. Material: 6061-T6 aluminum alloy. Surface finish: Type II anodized. Tolerances: ±0.1mm unless otherwise specified. Assembly requires standard M6 hex bolts and washers."
}

// Set page metadata
useSeoMeta({
  title: 'MyCustomBlock Test Page',
  description: 'Testing the blueprint-style custom block component'
})
</script>

<template>
  <div>
    <PageContainer>
      <div class="py-12">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-2">MyCustomBlock Component Test</h1>
          <p class="text-gray-600 mb-8">Testing the blueprint/technical manual style component</p>
          
          <!-- Your custom block component -->
          <BlocksMyCustomBlock :data="sampleData" />
          
          <!-- Additional test data -->
          <div class="mt-12">
            <h2 class="text-2xl font-bold mb-4">Different Content Test</h2>
            <BlocksMyCustomBlock :data="{
              title: 'Control Panel Interface',
              subtitle: 'Digital interface module with touch-sensitive controls',
              content: 'Operating voltage: 12-24V DC. Input resistance: 10kΩ. Response time: <50ms. Environmental rating: IP65. Certified to UL 508A standards.'
            }" />
          </div>
          
          <div class="mt-12">
            <h2 class="text-2xl font-bold mb-4">Minimal Content Test</h2>
            <BlocksMyCustomBlock :data="{
              title: 'Basic Component',
              content: 'Simple test with minimal data to check layout behavior.'
            }" />
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
</template>