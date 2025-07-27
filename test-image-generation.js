// Simple test for image generation API
const testCakeSpecs = {
  flavor: "Chocolate",
  size: "8\"",
  shape: "Round",
  layers: 2,
  tiers: 1,
  occasion: "birthday"
}

const testPayload = {
  cakeSpecs: testCakeSpecs,
  style: "classic"
}

console.log('Test payload for image generation:')
console.log(JSON.stringify(testPayload, null, 2))

console.log('\nGenerated prompt would be something like:')
console.log('A beautiful perfectly round 8" rich dark chocolate cake with glossy chocolate ganache with 2 distinct layers visible decorated with colorful birthday decorations, candles, festive elements, professional food photography, elegant presentation, clean background, high quality, appetizing, Instagram-worthy food photography, soft natural lighting, artisanal bakery quality, homemade with love, African bakery style')

console.log('\nTo test the API, use:')
console.log('curl -X POST http://localhost:3001/api/generate-cake-image \\')
console.log('  -H "Content-Type: application/json" \\')
console.log('  -d \'' + JSON.stringify(testPayload) + '\'')