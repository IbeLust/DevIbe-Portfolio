// API Test Suite for Discord Admin Panel
// Run tests using: node lib/test-suite.js

const BASE_URL = 'http://localhost:3000/api'

interface TestResult {
  name: string
  endpoint: string
  status: 'passed' | 'failed'
  statusCode?: number
  error?: string
  response?: any
}

const results: TestResult[] = []

async function testEndpoint(
  name: string,
  method: string,
  endpoint: string,
  body?: any,
  expectedStatus: number = 200
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    const passed = response.status === expectedStatus || (response.status >= 200 && response.status < 300)

    results.push({
      name,
      endpoint,
      status: passed ? 'passed' : 'failed',
      statusCode: response.status,
      response: data,
    })

    console.log(`${passed ? '✓' : '✗'} ${name} (${response.status})`)
    return passed
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    results.push({
      name,
      endpoint,
      status: 'failed',
      error: errorMsg,
    })

    console.log(`✗ ${name} - ${errorMsg}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting API Test Suite\n')

  // Test infrastructure
  console.log('=== Infrastructure Tests ===')
  await testEndpoint('Server Health', 'GET', '/audit/logs?serverId=test', undefined, 401) // Should be unauthorized without auth

  // Test audit endpoints
  console.log('\n=== Audit & Access Logs ===')
  await testEndpoint(
    'Audit Logs - Unauthorized',
    'GET',
    '/audit/logs?serverId=test',
    undefined,
    401
  )

  await testEndpoint(
    'Detailed Audit Logs - Unauthorized',
    'GET',
    '/audit/detailed?serverId=test',
    undefined,
    401
  )

  // Test infraction endpoints
  console.log('\n=== Infractions ===')
  await testEndpoint(
    'Search Infractions - No Auth',
    'GET',
    '/infractions/search?serverId=test&q=test',
    undefined,
    401
  )

  await testEndpoint(
    'Get Infraction - No Auth',
    'GET',
    '/infractions/test-id?serverId=test',
    undefined,
    401
  )

  // Test reports
  console.log('\n=== Reports ===')
  await testEndpoint(
    'Get Report - No Auth',
    'GET',
    '/reports/test-id?serverId=test',
    undefined,
    401
  )

  // Test appeals
  console.log('\n=== Appeals ===')
  await testEndpoint(
    'Get Appeal - No Auth',
    'GET',
    '/appeals/test-id?serverId=test',
    undefined,
    401
  )

  // Test staff
  console.log('\n=== Staff Management ===')
  await testEndpoint(
    'Get Staff Member - No Auth',
    'GET',
    '/staff/test-id?serverId=test',
    undefined,
    401
  )

  await testEndpoint(
    'Get Staff Stats - No Auth',
    'GET',
    '/staff/stats?serverId=test',
    undefined,
    401
  )

  // Test members
  console.log('\n=== Members ===')
  await testEndpoint(
    'Get Member Profile - No Auth',
    'GET',
    '/members/test-id?serverId=test',
    undefined,
    401
  )

  await testEndpoint(
    'Get User History - No Auth',
    'GET',
    '/users/test-id/history?serverId=test',
    undefined,
    401
  )

  // Test analytics
  console.log('\n=== Analytics ===')
  await testEndpoint(
    'Infraction Analytics - No Auth',
    'GET',
    '/analytics/infractions?serverId=test',
    undefined,
    401
  )

  await testEndpoint(
    'Dashboard Overview - No Auth',
    'GET',
    '/dashboard/overview?serverId=test',
    undefined,
    401
  )

  await testEndpoint(
    'Comprehensive Analytics - No Auth',
    'GET',
    '/analytics/comprehensive?serverId=test',
    undefined,
    401
  )

  // Test export
  console.log('\n=== Export ===')
  await testEndpoint(
    'Export Data - No Auth',
    'GET',
    '/export?serverId=test&type=infractions&format=json',
    undefined,
    401
  )

  // Test templates
  console.log('\n=== Templates ===')
  await testEndpoint(
    'Get Templates - No Auth',
    'GET',
    '/templates?serverId=test',
    undefined,
    401
  )

  // Test scheduled actions
  console.log('\n=== Scheduled Actions ===')
  await testEndpoint(
    'Get Scheduled Actions - No Auth',
    'GET',
    '/scheduled-actions?serverId=test',
    undefined,
    401
  )

  // Test permissions
  console.log('\n=== Permissions ===')
  await testEndpoint(
    'Check Permissions - No Auth',
    'GET',
    '/permissions/check?serverId=test',
    undefined,
    401
  )

  // Test notifications
  console.log('\n=== Notifications ===')
  await testEndpoint(
    'Get Notification Settings',
    'GET',
    '/notifications/settings?serverId=test'
  )

  // Test bulk operations (validation only)
  console.log('\n=== Bulk Operations ===')
  await testEndpoint(
    'Bulk Infractions - Missing Fields',
    'POST',
    '/infractions/bulk',
    {},
    400
  )

  await testEndpoint(
    'Bulk Role Assignment - Missing Fields',
    'POST',
    '/roles/bulk-assign',
    {},
    400
  )

  // Print summary
  console.log('\n' + '='.repeat(50))
  const passed = results.filter((r) => r.status === 'passed').length
  const failed = results.filter((r) => r.status === 'failed').length
  const total = results.length

  console.log(`\n📊 Test Results`)
  console.log(`   Passed: ${passed}/${total}`)
  console.log(`   Failed: ${failed}/${total}`)
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log(`\n⚠️  Failed Tests:`)
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error || r.statusCode}`)
      })
  }

  console.log('\n✅ Test Suite Complete')
}

// Export for use in other modules
export { testEndpoint, runTests, TestResult }

// Run tests if this is the main module
if (require.main === module) {
  runTests().catch(console.error)
}
